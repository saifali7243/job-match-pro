from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from app.models.schemas import Resume, GenerateResumeRequest, ImproveSectionRequest
from app.services.resume_builder import generate_tailored_resume, improve_section
from app.services.resume_exporter import export_resume_pdf, export_resume_docx

router = APIRouter()


@router.post("/generate", response_model=Resume)
async def generate_resume(request: GenerateResumeRequest):
    """Generate an AI-tailored resume based on profile and job description."""
    return await generate_tailored_resume(request.profile_id, request.job_id, request.template)


@router.post("/improve")
async def improve_resume_section(request: ImproveSectionRequest):
    """Use AI to improve a specific section of the resume."""
    improved = await improve_section(
        request.section, request.content, request.instruction, request.job_description
    )
    return {"improved_content": improved}


@router.get("/export/{resume_id}")
async def export_resume(resume_id: str, format: str = Query("pdf")):
    """Export resume as PDF or DOCX file."""
    if format == "pdf":
        pdf_bytes = await export_resume_pdf(resume_id)
        return StreamingResponse(
            iter([pdf_bytes]), media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=resume_{resume_id}.pdf"},
        )
    elif format == "docx":
        docx_bytes = await export_resume_docx(resume_id)
        return StreamingResponse(
            iter([docx_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=resume_{resume_id}.docx"},
        )
    raise HTTPException(status_code=400, detail="Format must be 'pdf' or 'docx'")


@router.get("/list", response_model=list[Resume])
async def list_resumes():
    return []
