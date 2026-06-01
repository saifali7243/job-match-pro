from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import cv, jobs, resume, contacts

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI-powered job matching, CV parsing, resume tailoring, and recruiter finder",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cv.router, prefix="/api/cv", tags=["CV Parser"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(contacts.router, prefix="/api/contacts", tags=["Contacts"])


@app.get("/")
async def root():
    return {"message": "JobMatch Pro API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
