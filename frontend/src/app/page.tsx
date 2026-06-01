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
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {mockProfile.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your job search today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matched Jobs</p>
                <p className="text-3xl font-bold mt-1">{mockJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12 new today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resumes Created</p>
                <p className="text-3xl font-bold mt-1">3</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last edited 2 hours ago</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recruiters Found</p>
                <p className="text-3xl font-bold mt-1">8</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">3 replied to outreach</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Score</p>
                <p className="text-3xl font-bold mt-1">85%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Complete your profile</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Top Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/cv-upload">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Upload className="w-5 h-5 text-blue-500" />
                Upload / Update CV
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Briefcase className="w-5 h-5 text-purple-500" />
                Browse Jobs
              </Button>
            </Link>
            <Link href="/resume">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <FileText className="w-5 h-5 text-green-500" />
                Build a Resume
              </Button>
            </Link>
            <Link href="/contacts">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Users className="w-5 h-5 text-orange-500" />
                Find Recruiters
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Top Matched Jobs</CardTitle>
            <Link href="/jobs">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {topJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                    <Badge variant="secondary" className="text-xs">
                      {job.remote_type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right space-y-2">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Skills Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockProfile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {mockProfile.experience_years} years experience &bull;{" "}
            {mockProfile.titles[0]} &bull; {mockProfile.location}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
