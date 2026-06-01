"""Outreach Generator - AI-crafted cold outreach emails."""

from app.models.schemas import OutreachResponse
from app.config import get_settings

settings = get_settings()


async def generate_outreach_email(contact_id: str, job_id: str, profile_id: str) -> OutreachResponse:
    if settings.gemini_api_key:
        return await _generate_with_gemini(contact_id, job_id, profile_id)
    return _mock_outreach()


async def _generate_with_gemini(contact_id: str, job_id: str, profile_id: str) -> OutreachResponse:
    import json
    import google.generativeai as genai
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = """Write a short professional cold outreach email (3-4 sentences) from a job seeker to a recruiter.
Context: Full Stack Developer, 4 years, React + Python + AWS. Position: Senior developer role.
Return JSON: {"subject": "...", "body": "..."}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        data = json.loads(text)
        return OutreachResponse(subject=data.get("subject", "Interest in Open Position"), body=data.get("body", _mock_outreach().body))
    except Exception:
        return _mock_outreach()


def _mock_outreach() -> OutreachResponse:
    return OutreachResponse(
        subject="Experienced Full Stack Developer - Interested in Open Role",
        body="""Hi,

I came across the Senior Full Stack Developer position and I'm excited about the opportunity.

With 4+ years building scalable systems with React, Node.js, and AWS - including microservices handling 1M+ daily requests - I believe I'd be a strong fit.

Would you be open to a quick 15-minute chat this week?

Best regards,
Rahul Kumar""",
    )
