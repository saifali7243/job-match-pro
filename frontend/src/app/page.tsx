"use client";

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
} from "lucide-react";
import Link from "next/link";
import { mockProfile, mockJobs } from "@/lib/mock-data";

export default function Dashboard() {
  const topJobs = mockJobs.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-purple-500 -top-48 -right-48 animate-blob" />
      <div className="orb w-72 h-72 bg-blue-500 bottom-20 -left-36 animate-blob" style={{ animationDelay: "2s" }} />
      <div className="orb w-64 h-64 bg-pink-500 top-1/2 right-1/4 animate-blob" style={{ animationDelay: "4s" }} />

      {/* Header */}
      <div className="relative z-10 pt-8 lg:pt-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Welcome back, <span className="gradient-text">{mockProfile.name.split(" ")[0]}</span>! 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Here&apos;s what&apos;s happening with your job search today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        <Card className="stat-card card-3d shine">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Matched Jobs</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{mockJobs.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center animate-float">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12 new today
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card card-3d shine">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Resumes</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">3</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last edited 2h ago</p>
          </CardContent>
        </Card>

        <Card className="stat-card card-3d shine">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Recruiters</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">8</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "2s" }}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">3 replied</p>
          </CardContent>
        </Card>

        <Card className="stat-card card-3d shine">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Profile Score</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">85%</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "3s" }}>
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Complete profile</p>
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
                Upload / Update CV
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-transform">
                <Briefcase className="w-5 h-5 text-purple-500" />
                Browse Jobs
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
            <CardTitle className="text-lg">Top Matched Jobs</CardTitle>
            <Link href="/jobs">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {topJobs.map((job) => (
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
                    <Badge variant="secondary" className="text-xs">
                      {job.remote_type}
                    </Badge>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <Badge
                    className={
                      job.match_score >= 85
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    }
                  >
                    {job.match_score}% match
                  </Badge>
                  <p className="text-xs text-muted-foreground">{job.posted_date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      <Card className="relative z-10 card-3d">
        <CardHeader>
          <CardTitle className="text-lg">Your Skills Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockProfile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs sm:text-sm py-1 px-3 hover:scale-105 transition-transform cursor-default">
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-4">
            {mockProfile.experience_years} years experience &bull;{" "}
            {mockProfile.titles[0]} &bull; {mockProfile.location}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
