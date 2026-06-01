-- JobMatch Pro - Database Schema
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (parsed CV data)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    location TEXT,
    titles TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    certifications TEXT[] DEFAULT '{}',
    summary TEXT,
    raw_cv_text TEXT,
    cv_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs (fetched from APIs daily)
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    remote_type TEXT CHECK (remote_type IN ('Remote', 'Hybrid', 'Onsite')),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT,
    experience_level TEXT,
    skills TEXT[] DEFAULT '{}',
    description TEXT,
    apply_url TEXT,
    source TEXT NOT NULL,
    posted_date DATE,
    recruiter_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Saved jobs (user bookmarks)
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Resumes (AI-generated, tailored per job)
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
    template TEXT DEFAULT 'modern',
    sections JSONB NOT NULL,
    ats_score INTEGER,
    pdf_url TEXT,
    docx_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recruiter contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT,
    company TEXT NOT NULL,
    source TEXT NOT NULL,
    job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
    contacted BOOLEAN DEFAULT FALSE,
    contacted_at TIMESTAMP WITH TIME ZONE,
    replied BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outreach emails
CREATE TABLE outreach_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application tracker
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn')),
    applied_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_jobs_posted ON jobs(posted_date DESC);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own profile" ON profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own saved_jobs" ON saved_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own resumes" ON resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own outreach" ON outreach_emails FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own applications" ON applications FOR ALL USING (auth.uid() = user_id);

-- Jobs readable by all authenticated users
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users read jobs" ON jobs FOR SELECT TO authenticated USING (true);
