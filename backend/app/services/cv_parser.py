"""CV Parser - Extracts text from PDF/DOCX with multiple fallback parsers."""

import json
import re
from io import BytesIO
from app.models.schemas import ParsedProfile, Experience, Education
from app.config import get_settings

settings = get_settings()


async def parse_cv_file(contents: bytes, filename: str, content_type: str) -> ParsedProfile:
    if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(contents)
    elif filename.lower().endswith((".doc", ".docx")) or "word" in (content_type or ""):
        text = extract_text_from_docx(contents)
    else:
        # Try PDF first, then DOCX
        text = extract_text_from_pdf(contents)
        if not text.strip():
            text = extract_text_from_docx(contents)

    if not text.strip():
        raise ValueError(
            "Could not extract text from the uploaded file. "
            "Try saving your resume as a new PDF from Google Docs or Word, "
            "or upload a DOCX file instead."
        )

    if settings.gemini_api_key:
        return await parse_with_gemini(text)
    return parse_with_regex(text)


def extract_text_from_pdf(contents: bytes) -> str:
    """Try multiple PDF parsers in order of reliability."""
    text = ""

    # Method 1: pdfplumber (best for text-based PDFs)
    try:
        import pdfplumber
        with pdfplumber.open(BytesIO(contents)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip():
            return text
    except Exception as e:
        print(f"pdfplumber failed: {e}")

    # Method 2: PyPDF2 / pypdf (handles more PDF formats)
    try:
        from pypdf import PdfReader
        reader = PdfReader(BytesIO(contents))
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        if text.strip():
            return text
    except ImportError:
        pass
    except Exception as e:
        print(f"pypdf failed: {e}")

    # Method 3: pdfminer (most robust, handles complex layouts)
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract
        text = pdfminer_extract(BytesIO(contents))
        if text.strip():
            return text
    except ImportError:
        pass
    except Exception as e:
        print(f"pdfminer failed: {e}")

    # Method 4: Read raw bytes and find text content
    try:
        raw_text = contents.decode("utf-8", errors="ignore")
        # Extract readable text between parentheses (PDF text objects)
        matches = re.findall(r'\(([^)]+)\)', raw_text)
        if matches:
            text = " ".join(m for m in matches if len(m) > 2 and any(c.isalpha() for c in m))
            if len(text) > 100:
                return text
    except Exception:
        pass

    return text


def extract_text_from_docx(contents: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    try:
        from docx import Document
        doc = Document(BytesIO(contents))
        text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
        return text
    except Exception as e:
        print(f"docx parsing failed: {e}")
        return ""


async def parse_with_gemini(text: str) -> ParsedProfile:
    """Use Gemini AI to structure raw CV text."""
    import google.generativeai as genai
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""Parse the following resume/CV text and extract structured information.
Return ONLY valid JSON (no markdown code blocks, no explanation) with this exact structure:
{{
    "name": "Full Name",
    "email": "email@example.com or null",
    "phone": "phone number or null",
    "location": "City, Country or null",
    "titles": ["Job Title 1", "Job Title 2"],
    "skills": ["skill1", "skill2", "skill3"],
    "experience_years": 4,
    "experience": [
        {{
            "company": "Company Name",
            "role": "Job Title",
            "duration": "Jan 2020 - Dec 2022",
            "highlights": ["Achievement 1", "Achievement 2"]
        }}
    ],
    "education": [
        {{
            "degree": "Degree Name",
            "college": "University Name",
            "year": "2020"
        }}
    ],
    "certifications": ["Cert 1", "Cert 2"],
    "summary": "Professional summary in 2-3 sentences"
}}

IMPORTANT: 
- All string fields must be strings (never null for required fields, use "N/A" instead)
- duration must always be a string like "2020 - 2022" or "N/A"
- highlights must always be a list of strings
- If information is not found, use empty list [] or "N/A"

Resume text:
{text[:10000]}"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean markdown code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if "```" in response_text:
                response_text = response_text.rsplit("```", 1)[0]

        data = json.loads(response_text)
    except json.JSONDecodeError as e:
        # Try to extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response_text if 'response_text' in dir() else "")
        if json_match:
            data = json.loads(json_match.group(0))
        else:
            # Fall back to regex parsing
            return parse_with_regex(text)
    except Exception:
        return parse_with_regex(text)

    # Safely parse experience (handle missing/null fields)
    experiences = []
    for exp in data.get("experience", []):
        if isinstance(exp, dict):
            highlights = exp.get("highlights") or exp.get("responsibilities") or exp.get("bullets") or []
            # Ensure highlights is a list of strings
            if isinstance(highlights, str):
                highlights = [highlights]
            highlights = [str(h) for h in highlights if h]

            experiences.append(Experience(
                company=str(exp.get("company") or exp.get("organization") or "Unknown"),
                role=str(exp.get("role") or exp.get("title") or exp.get("position") or "Unknown"),
                duration=str(exp.get("duration") or exp.get("period") or exp.get("dates") or "N/A"),
                highlights=highlights,
            ))

    # Safely parse education
    educations = []
    for edu in data.get("education", []):
        if isinstance(edu, dict):
            educations.append(Education(
                degree=str(edu.get("degree") or edu.get("qualification") or "Unknown"),
                college=str(edu.get("college") or edu.get("university") or edu.get("institution") or "Unknown"),
                year=str(edu.get("year") or edu.get("graduation_year") or "N/A") if edu.get("year") or edu.get("graduation_year") else None,
                gpa=str(edu.get("gpa") or edu.get("grade") or "") or None,
            ))

    # Parse certifications safely
    certs_raw = data.get("certifications") or data.get("certificates") or []
    certifications = [str(c) for c in certs_raw if c] if isinstance(certs_raw, list) else []

    # Parse skills safely
    skills_raw = data.get("skills") or data.get("technical_skills") or []
    skills = [str(s) for s in skills_raw if s] if isinstance(skills_raw, list) else []

    # Parse titles safely
    titles_raw = data.get("titles") or data.get("job_titles") or []
    titles = [str(t) for t in titles_raw if t] if isinstance(titles_raw, list) else []

    return ParsedProfile(
        name=str(data.get("name") or "Unknown"),
        email=data.get("email") if data.get("email") else None,
        phone=data.get("phone") if data.get("phone") else None,
        location=data.get("location") if data.get("location") else None,
        titles=titles,
        skills=skills,
        experience_years=int(data.get("experience_years") or data.get("years_of_experience") or 0),
        experience=experiences,
        education=educations,
        certifications=certifications,
        summary=str(data.get("summary") or data.get("professional_summary") or ""),
    )


def parse_with_regex(text: str) -> ParsedProfile:
    """Fallback regex parsing when no AI key or AI fails."""
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    phone_match = re.search(r"[\+]?[\d\s\-\(\)]{10,15}", text)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    name = lines[0] if lines else "Unknown"

    # Don't use email as name
    if name and "@" in name:
        name = lines[1] if len(lines) > 1 else "Unknown"

    common_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java",
        "C++", "C#", "Go", "Rust", "SQL", "PostgreSQL", "MongoDB", "Redis",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Linux",
        "FastAPI", "Django", "Flask", "Express", "Next.js", "Vue.js",
        "Angular", "Tailwind", "GraphQL", "REST", "CI/CD", "Terraform",
        "HTML", "CSS", "SASS", "Spring Boot", "Microservices", "Agile",
    ]
    skills = [s for s in common_skills if s.lower() in text.lower()]

    year_matches = re.findall(r"20\d{2}", text)
    years = [int(y) for y in year_matches if 2000 <= int(y) <= 2026]
    exp_years = max(years) - min(years) if len(years) >= 2 else 0

    return ParsedProfile(
        name=name,
        email=email_match.group(0) if email_match else None,
        phone=phone_match.group(0).strip() if phone_match else None,
        skills=skills,
        experience_years=exp_years,
        summary=f"Professional with {exp_years} years of experience. Skills include {', '.join(skills[:5])}." if skills else None,
    )
