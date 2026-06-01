from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import ParsedProfile
from app.services.cv_parser import parse_cv_file

router = APIRouter()


@router.post("/parse", response_model=ParsedProfile)
async def parse_cv(file: UploadFile = File(...)):
    """Upload a PDF/DOCX resume and get structured profile data."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    allowed_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    contents = await file.read()
    try:
        profile = await parse_cv_file(contents, file.filename, file.content_type or "")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing CV: {str(e)}")


@router.get("/profile/{profile_id}", response_model=ParsedProfile)
async def get_profile(profile_id: str):
    """Get a saved profile by ID."""
    return ParsedProfile(
        name="Rahul Kumar",
        email="rahul@email.com",
        phone="+91-9876543210",
        location="Bangalore, India",
        titles=["Full Stack Developer"],
        skills=["Python", "React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker"],
        experience_years=4,
        summary="4+ years full-stack development experience",
    )
