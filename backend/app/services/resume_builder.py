"""Resume Builder - Generates AI-tailored resumes and improves sections."""

import uuid
from app.models.schemas import Resume, ResumeSections, ResumeExperience, ResumeEducation
from app.config import get_settings

settings = get_settings()


async def generate_tailored_resume(profile_id: str, job_id: str, template: str = "modern") -> Resume:
    if settings.gemini_api_key:
        return await _generate_with_gemini(profile_id, job_id, template)
    return _get_mock_resume(job_id, template)


async def _generate_with_gemini(profile_id: str, job_id: str, template: str) -> Resume:
    import google.generativeai as genai
    genai.configure(api_key=settings.gemini_api_key)
    # TODO: fetch actual profile/job from DB and generate tailored resume
    return _get_mock_resume(job_id, template)


async def improve_section(section: str, content: str, instruction: str, job_description: str | None = None) -> str:
    if settings.gemini_api_key:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"Improve the following resume {section}.\nInstruction: {instruction}\n{'JD: ' + job_description[:1000] if job_description else ''}\n\nCurrent:\n{content}\n\nReturn ONLY the improved text."
        response = model.generate_content(prompt)
        return response.text.strip()

    return f"[AI Improved] {content}"


def _get_mock_resume(job_id: str, template: str) -> Resume:
    return Resume(
        id=str(uuid.uuid4())[:8],
        template=template,
        job_id=job_id,
        sections=ResumeSections(
            summary="Results-driven Full Stack Developer with 4+ years specializing in React, Node.js, and cloud-native apps. Proven track record building scalable systems serving 1M+ users.",
            experience=[
                ResumeExperience(company="Infosys", role="Senior Software Engineer", duration="2022 - Present", bullets=[
                    "Architected microservices handling 1M+ daily API requests with 99.9% uptime",
                    "Reduced system latency by 40% through monolith to distributed architecture migration",
                    "Led cross-functional team of 4 engineers, improving sprint velocity by 25%",
                ]),
                ResumeExperience(company="TCS", role="Software Engineer", duration="2020 - 2022", bullets=[
                    "Developed React dashboards used by 500+ enterprise users",
                    "Automated CI/CD pipelines, reducing deployment from 2 hours to 15 minutes",
                    "Built RESTful APIs serving 100K+ requests/day with Node.js and PostgreSQL",
                ]),
            ],
            skills=["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "FastAPI"],
            education=[ResumeEducation(degree="B.Tech Computer Science", college="VIT University", year="2020", gpa="8.5/10")],
            certifications=["AWS Solutions Architect Associate", "Meta React Developer"],
        ),
        ats_score=87,
    )
