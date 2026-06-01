from fastapi import APIRouter, Query
from app.models.schemas import Contact, OutreachRequest, OutreachResponse
from app.services.contact_finder import find_contacts_by_domain
from app.services.outreach_generator import generate_outreach_email

router = APIRouter()


@router.get("/find", response_model=list[Contact])
async def find_contacts(domain: str = Query(..., description="Company domain")):
    """Find recruiter contacts for a company using Hunter.io."""
    return await find_contacts_by_domain(domain)


@router.post("/outreach", response_model=OutreachResponse)
async def generate_outreach(request: OutreachRequest):
    """Generate a personalized outreach email using AI."""
    return await generate_outreach_email(request.contact_id, request.job_id, request.profile_id)


@router.get("/list", response_model=list[Contact])
async def list_contacts():
    return []


@router.patch("/{contact_id}/status")
async def update_contact_status(contact_id: str, contacted: bool = False, replied: bool = False):
    return {"message": f"Contact {contact_id} status updated"}
