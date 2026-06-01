from pydantic import BaseModel
from typing import Optional


class Experience(BaseModel):
    company: str
    role: str
    duration: str
    highlights: list[str]


class Education(BaseModel):
    degree: str
    college: str
    year: str
    gpa: Optional[str] = None


class ParsedProfile(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    titles: list[str] = []
    skills: list[str] = []
    experience_years: int = 0
    experience: list[Experience] = []
    education: list[Education] = []
    certifications: list[str] = []
    summary: Optional[str] = None


class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str
    remote_type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = None
    experience_level: Optional[str] = None
    skills: list[str] = []
    description: str
    apply_url: str
    source: str
    posted_date: str
    match_score: Optional[int] = None
    recruiter_email: Optional[str] = None


class JobSearchParams(BaseModel):
    query: Optional[str] = None
    location: Optional[str] = None
    remote_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    page: int = 1
    per_page: int = 20


class ResumeExperience(BaseModel):
    company: str
    role: str
    duration: str
    bullets: list[str]


class ResumeEducation(BaseModel):
    degree: str
    college: str
    year: str
    gpa: Optional[str] = None


class ResumeSections(BaseModel):
    summary: str
    experience: list[ResumeExperience]
    skills: list[str]
    education: list[ResumeEducation]
    certifications: list[str] = []


class Resume(BaseModel):
    id: str
    template: str
    job_id: str
    sections: ResumeSections
    ats_score: int


class GenerateResumeRequest(BaseModel):
    profile_id: str
    job_id: str
    template: str = "modern"


class ImproveSectionRequest(BaseModel):
    section: str
    content: str
    instruction: str
    job_description: Optional[str] = None


class Contact(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = None
    company: str
    source: str
    job_id: Optional[str] = None
    contacted: bool = False
    replied: bool = False


class OutreachRequest(BaseModel):
    contact_id: str
    job_id: str
    profile_id: str


class OutreachResponse(BaseModel):
    subject: str
    body: str
