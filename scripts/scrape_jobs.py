"""Daily Job Scraping Script - runs via GitHub Actions cron."""

import os
import hashlib
import re
from datetime import datetime
import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "")


def gen_id(title: str, company: str) -> str:
    return hashlib.md5(f"{title.lower().strip()}-{company.lower().strip()}".encode()).hexdigest()[:12]


def detect_remote(text: str) -> str:
    t = text.lower()
    if "remote" in t: return "Remote"
    if "hybrid" in t: return "Hybrid"
    return "Onsite"


def extract_skills(text: str) -> list:
    skills = ["Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "Go", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "FastAPI", "Django", "Next.js", "Vue.js"]
    return [s for s in skills if s.lower() in text.lower()][:8]


def extract_email(text: str):
    match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    if match:
        email = match.group(0)
        if not any(x in email.lower() for x in ["noreply", "no-reply", "support", "admin"]):
            return email
    return None


def fetch_remoteok():
    print("Fetching from RemoteOK...")
    try:
        resp = httpx.get("https://remoteok.com/api", headers={"User-Agent": "JobMatchPro/1.0"}, timeout=15.0)
        resp.raise_for_status()
        data = resp.json()
        jobs = []
        for item in data[1:51]:
            jobs.append({
                "id": gen_id(item.get("position", ""), item.get("company", "")),
                "title": item.get("position", ""),
                "company": item.get("company", "Unknown"),
                "location": "Remote (Global)",
                "remote_type": "Remote",
                "salary_min": item.get("salary_min"),
                "salary_max": item.get("salary_max"),
                "salary_currency": "USD",
                "skills": item.get("tags", [])[:8],
                "description": item.get("description", "")[:500],
                "apply_url": item.get("url", ""),
                "source": "RemoteOK",
                "posted_date": item.get("date", "")[:10] or datetime.now().strftime("%Y-%m-%d"),
                "is_active": True,
            })
        print(f"  Found {len(jobs)} jobs")
        return jobs
    except Exception as e:
        print(f"  Error: {e}")
        return []


def fetch_remotive():
    print("Fetching from Remotive...")
    try:
        resp = httpx.get("https://remotive.com/api/remote-jobs", params={"limit": 50}, timeout=15.0)
        resp.raise_for_status()
        data = resp.json()
        jobs = []
        for item in data.get("jobs", [])[:50]:
            desc = item.get("description", "")
            jobs.append({
                "id": gen_id(item.get("title", ""), item.get("company_name", "")),
                "title": item.get("title", ""),
                "company": item.get("company_name", "Unknown"),
                "location": item.get("candidate_required_location", "Remote"),
                "remote_type": "Remote",
                "skills": item.get("tags", [])[:8],
                "description": desc[:500],
                "apply_url": item.get("url", ""),
                "source": "Remotive",
                "posted_date": item.get("publication_date", "")[:10] or datetime.now().strftime("%Y-%m-%d"),
                "recruiter_email": extract_email(desc),
                "is_active": True,
            })
        print(f"  Found {len(jobs)} jobs")
        return jobs
    except Exception as e:
        print(f"  Error: {e}")
        return []


def fetch_adzuna(country: str = "in"):
    if not ADZUNA_APP_ID:
        print(f"  Adzuna keys not set, skipping {country}")
        return []
    print(f"Fetching from Adzuna ({country.upper()})...")
    try:
        resp = httpx.get(
            f"https://api.adzuna.com/v1/api/jobs/{country}/search/1",
            params={"app_id": ADZUNA_APP_ID, "app_key": ADZUNA_APP_KEY, "results_per_page": 50, "what": "software developer"},
            timeout=15.0,
        )
        resp.raise_for_status()
        data = resp.json()
        currency = {"in": "INR", "my": "MYR", "sg": "SGD", "gb": "GBP", "us": "USD"}.get(country, "USD")
        jobs = []
        for r in data.get("results", []):
            desc = r.get("description", "")
            title = r.get("title", "")
            jobs.append({
                "id": gen_id(title, r.get("company", {}).get("display_name", "")),
                "title": title,
                "company": r.get("company", {}).get("display_name", "Unknown"),
                "location": r.get("location", {}).get("display_name", country.upper()),
                "remote_type": detect_remote(title + desc),
                "salary_min": int(r["salary_min"]) if r.get("salary_min") else None,
                "salary_max": int(r["salary_max"]) if r.get("salary_max") else None,
                "salary_currency": currency,
                "skills": extract_skills(desc),
                "description": desc[:500],
                "apply_url": r.get("redirect_url", ""),
                "source": "Adzuna",
                "posted_date": r.get("created", "")[:10],
                "recruiter_email": extract_email(desc),
                "is_active": True,
            })
        print(f"  Found {len(jobs)} jobs")
        return jobs
    except Exception as e:
        print(f"  Error: {e}")
        return []


def store_to_supabase(jobs: list):
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print(f"Supabase not configured. Would store {len(jobs)} jobs.")
        return
    print(f"Storing {len(jobs)} jobs to Supabase...")
    try:
        resp = httpx.post(
            f"{SUPABASE_URL}/rest/v1/jobs",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates",
            },
            json=jobs,
            timeout=30.0,
        )
        resp.raise_for_status()
        print("  Success!")
    except Exception as e:
        print(f"  Error: {e}")


def main():
    print(f"=== Job Scrape Started: {datetime.now().isoformat()} ===\n")
    all_jobs = []
    all_jobs.extend(fetch_remoteok())
    all_jobs.extend(fetch_remotive())
    for country in ["in", "my", "sg"]:
        all_jobs.extend(fetch_adzuna(country))

    seen = set()
    unique = [j for j in all_jobs if j["id"] not in seen and not seen.add(j["id"])]
    print(f"\n=== Total: {len(unique)} unique jobs ===\n")
    store_to_supabase(unique)
    print(f"\n=== Done: {datetime.now().isoformat()} ===")


if __name__ == "__main__":
    main()
