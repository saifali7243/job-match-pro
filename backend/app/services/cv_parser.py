"""CV Parser - Extracts text from PDF/DOCX, uses Gemini AI to structure."""

import json
import re
from io import BytesIO
from app.models.schemas import ParsedProfile, Experience, Education
from app.config import get_settings

settings = get_settings()


async def parse_cv_file(contents: bytes, filename: str, content_type: str) -> ParsedProfile:
    if content_type == "application/pdf":
        text = extract_text_from_pdf(contents)
    else:
        text = extract_text_from_docx(contents)

    if not text.strip():
        raise ValueError("Could not extract text from the uploaded file")

    if settings.gemini_api_key:
        return await parse_with_gemini(text)
    return parse_with_regex(text)


def extract_text_from_pdf(contents: bytes) -> str:
    import pdfplumber
    with pdfplumber.open(BytesIO(contents)) as pdf:
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text


def extract_text_from_docx(contents: bytes) -> str:
    from docx import Document
    doc = Document(BytesIO(contents))
    return "\n".join(para.text for para in doc.paragraphs)


async def parse_with_gemini(text: str) -> ParsedProfile:
    import google.generativeai as genai
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""Parse the following resume text and extract structured information.
Return ONLY valid JSON with: name, email, phone, location, titles (list), skills (list),
experience_years (int), experience (list of {{company, role, duration, highlights[]}}),
education (list of {{degree, college, year}}), certifications (list), summary (2-3 sentences).

Resume text:
{text[:8000]}"""

    response = model.generate_content(prompt)
    response_text = response.text.strip()
    if response_text.startswith("```"):
        response_text = response_text.split("\n", 1)[1].rsplit("```", 1)[0]

    data = json.loads(response_text)

    # Safely parse experience (handle missing/null fields)
    experiences = []
    for exp in data.get("experience", []):
        if isinstance(exp, dict):
            experiences.append(Experience(
                company=exp.get("company") or "Unknown",
                role=exp.get("role") or exp.get("title") or "Unknown",
                duration=exp.get("duration") or exp.get("period") or exp.get("dates") or "N/A",
                highlights=exp.get("highlights") or exp.get("responsibilities") or exp.get("bullets") or [],
            ))

    # Safely parse education
    educations = []
    for edu in data.get("education", []):
        if isinstance(edu, dict):
            educations.append(Education(
                degree=edu.get("degree") or edu.get("qualification") or "Unknown",
                college=edu.get("college") or edu.get("university") or edu.get("institution") or "Unknown",
                year=edu.get("year") or edu.get("graduation_year") or None,
                gpa=edu.get("gpa") or edu.get("grade") or None,
            ))

    return ParsedProfile(
        name=data.get("name") or "Unknown",
        email=data.get("email"),
        phone=data.get("phone"),
        location=data.get("location"),
        titles=data.get("titles") or data.get("job_titles") or [],
        skills=data.get("skills") or data.get("technical_skills") or [],
        experience_years=data.get("experience_years") or data.get("years_of_experience") or 0,
        experience=experiences,
        education=educations,
        certifications=data.get("certifications") or data.get("certificates") or [],
        summary=data.get("summary") or data.get("professional_summary"),
    )


def parse_with_regex(text: str) -> ParsedProfile:
    """Fallback regex parsing when no AI key."""
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    phone_match = re.search(r"[\+]?[\d\s\-\(\)]{10,15}", text)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    name = lines[0] if lines else "Unknown"

    common_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java",
        "C++", "Go", "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Azure",
        "Docker", "Kubernetes", "Git", "FastAPI", "Django", "Next.js", "Vue.js",
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
    )
