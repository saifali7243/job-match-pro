"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
  Users,
  TrendingUp,
  Upload,
  ArrowRight,
  MapPin,
  Star,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote_type: string;
  match_score: number | null;
  posted_date: string;
  source: string;
}

interface DashboardStats {
  totalJobs: number;
  newJobsToday: number;
  resumesCreated: number;
  contactsFound: number;
  contactsReplied: number;
  profileComplete: boolean;
  profileName: string;
  profileSkills: string[];
  profileExperience: number;
  profileTitle: string;
  profileLocation: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    newJobsToday: 0,
    resumesCreated: 0,
    contactsFound: 0,
    contactsReplied: 0,
    profileComplete: false,
    profileName: "User",
    profileSkills: [],
    profileExperience: 0,
    profileTitle: "",
    profileLocation: "",
  });
  const [topJobs, setTopJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      // Fetch real jobs from backend
      const jobsRes = await fetch(`${API_BASE}/api/jobs/search?per_page=5`);
      if (jobsRes.ok) {
        const jobs: Job[] = await jobsRes.json();
        setTopJobs(jobs.slice(0, 4));
        setStats((prev) => ({
          ...prev,
          totalJobs: jobs.length,
          newJobsToday: jobs.filter((j) => j.posted_date === new Date().toISOString().slice(0, 10)).length || Math.min(jobs.length, 5),
        }));
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }

    // Load profile from localStorage (saved after CV upload)
    try {
      const savedProfile = localStorage.getItem("jmp_profile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setStats((prev) => ({
          ...prev,
          profileComplete: true,
          profileName: profile.name || "User",
          profileSkills: profile.skills || [],
          profileExperience: profile.experience_years || 0,
          profileTitle: (profile.titles && profile.titles[0]) || "",
          profileLocation: profile.location || "",
        }));
      }
    } catch {}

    // Load contacts from localStorage
    try {
      const savedContacts = localStorage.getItem("jmp_contacts");
      if (savedContacts) {
        const contacts = JSON.parse(savedContacts);
        setStats((prev) => ({
          ...prev,
          contactsFound: contacts.length,
          contactsReplied: contacts.filter((c: { replied: boolean }) => c.replied).length,
        }));
      }
    } catch {}

    // Load resume count from localStorage
    try {
      const resumeCount = parseInt(localStorage.getItem("jmp_resume_count") || "0");
      setStats((prev) => ({ ...prev, resumesCreated: resumeCount }));
    } catch {}

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const profileScore = Math.round(
    (stats.profileComplete ? 40 : 0) +
    (stats.profileSkills.length > 0 ? 20 : 0) +
    (stats.totalJobs > 0 ? 20 : 0) +
    (stats.contactsFound > 0 ? 20 : 0)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-purple-500 -top-48 -right-48 animate-blob" />
      <div className="orb w-72 h-72 bg-blue-500 bottom-20 -left-36 animate-blob" style={{ animationDelay: "2s" }} />
      <div className="orb w-64 h-64 bg-pink-500 top-1/2 right-1/4 animate-blob" style={{ animationDelay: "4s" }} />

      {/* Header */}
      <div className="relative z-10 pt-8 lg:pt-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Welcome back, <span className="gradient-text">{stats.profileName.split(" ")[0]}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {stats.profileComplete
              ? "Here's your job search progress."
              : "Upload your CV to get personalized job matches."}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={loadDashboard} disabled={loading}>
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        <Card className="stat-card card-3d shine">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Matched Jobs</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.totalJobs}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center animate-float">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{stats.newJobsToday} new today
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card card-3d shine">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Resumes</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.resumesCreated}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.resumesCreated > 0 ? "AI-tailored" : "None yet — create one!"}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card card-3d shine">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Recruiters</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.contactsFound}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "2s" }}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.contactsReplied > 0 ? `${stats.contactsReplied} replied` : stats.contactsFound > 0 ? "Awaiting replies" : "Search for contacts"}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card card-3d shine">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Profile Score</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{profileScore}%</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "3s" }}>
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {profileScore < 100
                ? profileScore === 0 ? "Upload CV to start" : "Keep going!"
                : "Complete!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Top Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        <Card className="lg:col-span-1 card-3d">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/cv-upload">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-transform">
                <Upload className="w-5 h-5 text-blue-500" />
                {stats.profileComplete ? "Update CV" : "Upload CV (Start Here!)"}
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-transform">
                <Briefcase className="w-5 h-5 text-purple-500" />
                Browse {stats.totalJobs > 0 ? `${stats.totalJobs} Jobs` : "Jobs"}
              </Button>
            </Link>
            <Link href="/resume">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-transform">
                <FileText className="w-5 h-5 text-green-500" />
                Build a Resume
              </Button>
            </Link>
            <Link href="/contacts">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-transform">
                <Users className="w-5 h-5 text-orange-500" />
                Find Recruiters
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 card-3d">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {topJobs.length > 0 ? "Latest Jobs (Live)" : "Top Jobs"}
            </CardTitle>
            <Link href="/jobs">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Fetching latest jobs...</span>
              </div>
            )}
            {!loading && topJobs.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No jobs loaded yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Make sure your backend is running on port 8000</p>
              </div>
            )}
            {!loading && topJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all hover:scale-[1.01] cursor-pointer gap-2"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-sm sm:text-base">{job.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{job.company}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{job.location}</span>
                    <Badge variant="secondary" className="text-xs">{job.remote_type}</Badge>
                    <Badge variant="outline" className="text-xs">{job.source}</Badge>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  {job.match_score && (
                    <Badge
                      className={
                        job.match_score >= 85
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : job.match_score >= 70
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      }
                    >
                      {job.match_score}% match
                    </Badge>
                  )}
                  {job.posted_date && <p className="text-xs text-muted-foreground">{job.posted_date}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Skills Profile */}
      <Card className="relative z-10 card-3d">
        <CardHeader>
          <CardTitle className="text-lg">Your Skills Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.profileSkills.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {stats.profileSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs sm:text-sm py-1 px-3 hover:scale-105 transition-transform cursor-default">
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                {stats.profileExperience} years experience
                {stats.profileTitle && ` • ${stats.profileTitle}`}
                {stats.profileLocation && ` • ${stats.profileLocation}`}
              </p>
            </>
          ) : (
            <div className="text-center py-6">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No profile yet.</p>
              <Link href="/cv-upload">
                <Button variant="outline" size="sm" className="mt-2">Upload your CV to see your skills here</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
