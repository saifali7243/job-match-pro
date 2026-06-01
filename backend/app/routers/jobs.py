from fastapi import APIRouter, Query
from app.models.schemas import Job, JobSearchParams
from app.services.job_fetcher import fetch_jobs

router = APIRouter()


@router.get("/search", response_model=list[Job])
async def search_jobs(
    query: str | None = Query(None),
    location: str | None = Query(None),
    remote_type: str | None = Query(None),
    experience_level: str | None = Query(None),
    salary_min: int | None = Query(None),
    salary_max: int | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
):
    """Search jobs from multiple sources (Adzuna, RemoteOK, Remotive)."""
    params = JobSearchParams(
        query=query, location=location, remote_type=remote_type,
        experience_level=experience_level, salary_min=salary_min,
        salary_max=salary_max, page=page, per_page=per_page,
    )
    return await fetch_jobs(params)


@router.get("/saved", response_model=list[Job])
async def get_saved_jobs():
    return []


@router.post("/save/{job_id}")
async def save_job(job_id: str):
    return {"message": f"Job {job_id} saved successfully"}


@router.delete("/save/{job_id}")
async def unsave_job(job_id: str):
    return {"message": f"Job {job_id} removed from saved"}
