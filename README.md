# JobMatch Pro

AI-powered job matching, resume tailoring, and recruiter contact finder. Built for India & Malaysia markets.

## Features

- **CV Upload + AI Parser** — Upload PDF, get structured profile via Gemini AI
- **Job Matching + Filters** — Fetch from Adzuna, RemoteOK, Remotive with smart filters
- **Resume Builder** — AI tailors resume per JD, edit with AI chat, export PDF/DOCX
- **Recruiter Finder** — Find hiring manager emails safely via Hunter.io

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | Google Gemini 2.5 Flash |
| Jobs API | Adzuna, RemoteOK, Remotive |
| Contacts | Hunter.io |
| Hosting | Vercel (frontend) + Render (backend) |

## Quick Start

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Backend

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Database

1. Create project at [supabase.com](https://supabase.com) (Singapore region)
2. Go to SQL Editor → run `supabase/migrations/001_initial_schema.sql`
3. Enable Google OAuth in Authentication → Providers

## API Keys Needed (All Free)

| Service | URL | Free Tier |
|---------|-----|-----------|
| Google Cloud | console.cloud.google.com | OAuth + Gemini (250 req/day) |
| Supabase | supabase.com | 500MB DB, 50K users |
| Adzuna | developer.adzuna.com | 250 req/day |
| Hunter.io | hunter.io | 25 searches/month |

## Deployment

**Frontend → Vercel**: Connect repo, set root to `frontend`, add env vars  
**Backend → Render**: Connect repo, set root to `backend`, start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
**Daily Scraping**: Add GitHub secrets, enable the workflow

## Project Structure

```
job-match-pro/
├── frontend/           # Next.js app
│   └── src/app/       # Pages: dashboard, jobs, resume, contacts, cv-upload
├── backend/           # FastAPI
│   └── app/
│       ├── routers/   # cv, jobs, resume, contacts
│       └── services/  # cv_parser, job_fetcher, resume_builder, contact_finder
├── supabase/          # Database migrations
├── scripts/           # Daily scrape cron
└── .github/workflows/ # CI/CD
```

## License

MIT
