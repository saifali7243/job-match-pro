"""Job Fetcher - Fetches from Adzuna, RemoteOK, Remotive with deduplication."""

import hashlib
import re
from typing import Optional
import httpx
from app.models.schemas import Job, JobSearchParams
from app.config import get_settings

settings = get_settings()


async def fetch_jobs(params: JobSearchParams) -> list[Job]:
    all_jobs: list[Job] = []

    if settings.adzuna_app_id and settings.adzuna_app_key:
        all_jobs.extend(await fetch_from_adzuna(params))

    all_jobs.extend(await fetch_from_remoteok(params))
    all_jobs.extend(await fetch_from_remotive(params))

    if not all_jobs:
        all_jobs = get_mock_jobs()

    all_jobs = deduplicate(all_jobs)
    for job in all_jobs:
        if job.match_score is None:
            job.match_score = calc_match(job)
    all_jobs.sort(key=lambda j: j.match_score or 0, reverse=True)

    start = (params.page - 1) * params.per_page
    return all_jobs[start : start + params.per_page]


async def fetch_from_adzuna(params: JobSearchParams) -> list[Job]:
    country = params.location or "in"
    query = params.query or "software developer"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://api.adzuna.com/v1/api/jobs/{country}/search/1",
                params={
                    "app_id": settings.adzuna_app_id,
                    "app_key": settings.adzuna_app_key,
                    "results_per_page": params.per_page,
                    "what": query,
                },
                timeout=10.0,
            )
            resp.raise_for_status()
            data = resp.json()

        currency = {"in": "INR", "my": "MYR", "sg": "SGD", "gb": "GBP", "us": "USD"}.get(country, "USD")
        jobs = []
        for r in data.get("results", []):
            desc = r.get("description", "")
            title = r.get("title", "")
            jobs.append(Job(
                id=gen_id(title, r.get("company", {}).get("display_name", "")),
                title=title,
                company=r.get("company", {}).get("display_name", "Unknown"),
                location=r.get("location", {}).get("display_name", country.upper()),
                remote_type=detect_remote(title + desc),
                salary_min=int(r["salary_min"]) if r.get("salary_min") else None,
                salary_max=int(r["salary_max"]) if r.get("salary_max") else None,
                salary_currency=currency,
                experience_level=detect_level(title),
                skills=extract_skills(desc),
                description=desc[:500],
                apply_url=r.get("redirect_url", ""),
                source="Adzuna",
                posted_date=r.get("created", "")[:10],
                match_score=None,
                recruiter_email=extract_email(desc),
            ))
        return jobs
    except Exception:
        return []


async def fetch_from_remoteok(params: JobSearchParams) -> list[Job]:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://remoteok.com/api", headers={"User-Agent": "JobMatchPro/1.0"}, timeout=10.0)
            resp.raise_for_status()
            data = resp.json()

        jobs = []
        for item in data[1:21]:
            if params.query and params.query.lower() not in (item.get("position", "") + item.get("description", "")).lower():
                continue
            jobs.append(Job(
                id=gen_id(item.get("position", ""), item.get("company", "")),
                title=item.get("position", ""),
                company=item.get("company", "Unknown"),
                location="Remote (Global)",
                remote_type="Remote",
                salary_min=item.get("salary_min"),
                salary_max=item.get("salary_max"),
                salary_currency="USD",
                experience_level=detect_level(item.get("position", "")),
                skills=item.get("tags", [])[:8],
                description=item.get("description", "")[:500].replace("<br>", " "),
                apply_url=item.get("url", ""),
                source="RemoteOK",
                posted_date=item.get("date", "")[:10],
                match_score=None,
                recruiter_email=None,
            ))
        return jobs
    except Exception:
        return []


async def fetch_from_remotive(params: JobSearchParams) -> list[Job]:
    try:
        request_params: dict = {"limit": 20}
        if params.query:
            request_params["search"] = params.query
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://remotive.com/api/remote-jobs", params=request_params, timeout=10.0)
            resp.raise_for_status()
            data = resp.json()

        jobs = []
        for item in data.get("jobs", [])[:20]:
            jobs.append(Job(
                id=gen_id(item.get("title", ""), item.get("company_name", "")),
                title=item.get("title", ""),
                company=item.get("company_name", "Unknown"),
                location=item.get("candidate_required_location", "Remote"),
                remote_type="Remote",
                skills=item.get("tags", [])[:8],
                description=item.get("description", "")[:500].replace("<br>", " "),
                apply_url=item.get("url", ""),
                source="Remotive",
                posted_date=item.get("publication_date", "")[:10],
                match_score=None,
                recruiter_email=None,
            ))
        return jobs
    except Exception:
        return []


def deduplicate(jobs: list[Job]) -> list[Job]:
    seen: set[str] = set()
    unique = []
    for job in jobs:
        key = f"{job.title.lower().strip()}|{job.company.lower().strip()}"
        if key not in seen:
            seen.add(key)
            unique.append(job)
    return unique


def calc_match(job: Job) -> int:
    user_skills = {"python", "react", "node.js", "typescript", "postgresql", "aws", "docker", "fastapi"}
    job_skills = {s.lower() for s in job.skills}
    if not job_skills:
        return 50
    return min(int((len(user_skills & job_skills) / max(len(job_skills), 1)) * 100), 99)


def gen_id(title: str, company: str) -> str:
    return hashlib.md5(f"{title.lower().strip()}-{company.lower().strip()}".encode()).hexdigest()[:12]


def detect_remote(text: str) -> str:
    t = text.lower()
    if "remote" in t: return "Remote"
    if "hybrid" in t: return "Hybrid"
    return "Onsite"


def detect_level(title: str) -> str:
    t = title.lower()
    if any(w in t for w in ["senior", "sr.", "lead", "principal"]): return "Senior"
    if any(w in t for w in ["junior", "jr.", "intern", "graduate"]): return "Junior"
    return "Mid"


def extract_skills(text: str) -> list[str]:
    skills = ["Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "Go", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "FastAPI", "Django", "Next.js", "Vue.js", "GraphQL", "CI/CD", "Terraform"]
    return [s for s in skills if s.lower() in text.lower()][:8]


def extract_email(text: str) -> Optional[str]:
    match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    return match.group(0) if match else None


def get_mock_jobs() -> list[Job]:
    return [
        Job(id="mock-1", title="Senior Full Stack Developer", company="Grab", location="Kuala Lumpur, Malaysia", remote_type="Hybrid", salary_min=8000, salary_max=15000, salary_currency="MYR", experience_level="Mid-Senior", skills=["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"], description="Looking for a Senior Full Stack Developer...", apply_url="https://grab.careers/example", source="Mock", posted_date="2026-05-30", match_score=92, recruiter_email="hiring@grab.com"),
        Job(id="mock-2", title="Python Backend Engineer", company="Razorpay", location="Bangalore, India", remote_type="Remote", salary_min=1800000, salary_max=3000000, salary_currency="INR", experience_level="Mid", skills=["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"], description="Build highly reliable backend systems...", apply_url="https://razorpay.com/careers/example", source="Mock", posted_date="2026-05-29", match_score=87, recruiter_email=None),
    ]
