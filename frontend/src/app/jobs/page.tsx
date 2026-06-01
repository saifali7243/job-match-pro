"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  FileText,
  Filter,
  X,
} from "lucide-react";
import { mockJobs } from "@/lib/mock-data";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [remoteFilter, setRemoteFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const handleFilterChange = (setter: (v: string) => void) => (value: string | null) => {
    setter(value ?? "all");
  };

  const filteredJobs = mockJobs.filter((job) => {
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) && !job.company.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (locationFilter !== "all") {
      if (locationFilter === "india" && !job.location.toLowerCase().includes("india") && !job.location.toLowerCase().includes("bangalore")) return false;
      if (locationFilter === "malaysia" && !job.location.toLowerCase().includes("malaysia") && !job.location.toLowerCase().includes("kuala lumpur")) return false;
      if (locationFilter === "remote" && !job.location.toLowerCase().includes("remote")) return false;
      if (locationFilter === "singapore" && !job.location.toLowerCase().includes("singapore")) return false;
    }
    if (remoteFilter !== "all" && job.remote_type.toLowerCase() !== remoteFilter.toLowerCase()) return false;
    if (sourceFilter !== "all" && job.source.toLowerCase() !== sourceFilter.toLowerCase()) return false;
    return true;
  });

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]);
  };

  const clearFilters = () => { setSearchQuery(""); setLocationFilter("all"); setRemoteFilter("all"); setExperienceFilter("all"); setSourceFilter("all"); };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (currency === "INR") return `₹${(min / 100000).toFixed(0)}L - ₹${(max / 100000).toFixed(0)}L`;
    if (currency === "MYR") return `RM ${min.toLocaleString()} - RM ${max.toLocaleString()}`;
    if (currency === "SGD") return `S$${min.toLocaleString()} - S$${max.toLocaleString()}`;
    if (currency === "USD") return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    return `${currency} ${min} - ${max}`;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Matches</h1>
          <p className="text-muted-foreground mt-1">{filteredJobs.length} jobs matched to your profile</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="w-4 h-4" /> {showFilters ? "Hide" : "Show"} Filters
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search by job title, company, or skill..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 text-base" />
      </div>

      <div className="flex gap-6">
        {showFilters && (
          <Card className="w-72 shrink-0 h-fit">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">Clear all</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <Select value={locationFilter} onValueChange={handleFilterChange(setLocationFilter)}>
                  <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="malaysia">Malaysia</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                    <SelectItem value="remote">Remote (Global)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Work Type</Label>
                <Select value={remoteFilter} onValueChange={handleFilterChange(setRemoteFilter)}>
                  <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Experience Level</Label>
                <Select value={experienceFilter} onValueChange={handleFilterChange(setExperienceFilter)}>
                  <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="fresher">Fresher (0-1 yr)</SelectItem>
                    <SelectItem value="mid">Mid (3-5 yr)</SelectItem>
                    <SelectItem value="senior">Senior (5-10 yr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Source</Label>
                <Select value={sourceFilter} onValueChange={handleFilterChange(setSourceFilter)}>
                  <SelectTrigger><SelectValue placeholder="All sources" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="adzuna">Adzuna</SelectItem>
                    <SelectItem value="remoteok">RemoteOK</SelectItem>
                    <SelectItem value="remotive">Remotive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Required Skills</Label>
                <div className="space-y-2">
                  {["React", "Python", "TypeScript", "AWS", "Node.js", "Docker"].map((skill) => (
                    <div key={skill} className="flex items-center gap-2">
                      <Checkbox id={skill} />
                      <label htmlFor={skill} className="text-sm cursor-pointer">{skill}</label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex-1 space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge className={job.match_score >= 85 ? "bg-green-500/10 text-green-500 border-green-500/20" : job.match_score >= 70 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"}>
                          {job.match_score}% match
                        </Badge>
                      </div>
                      <p className="text-muted-foreground flex items-center gap-1 mt-1"><Building2 className="w-4 h-4" /> {job.company}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                      <Badge variant="secondary">{job.remote_type}</Badge>
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.posted_date}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => (<Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => toggleSaveJob(job.id)} className={savedJobs.includes(job.id) ? "text-yellow-500" : ""}>
                      <Bookmark className="w-5 h-5" fill={savedJobs.includes(job.id) ? "currentColor" : "none"} />
                    </Button>
                    <Button variant="ghost" size="icon" title="Generate tailored resume"><FileText className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" title="Apply externally"><ExternalLink className="w-5 h-5" /></Button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">via {job.source}</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1"><FileText className="w-4 h-4" /> Tailor Resume</Button>
                    <Button size="sm" className="gap-1"><ExternalLink className="w-4 h-4" /> Apply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredJobs.length === 0 && (
            <Card><CardContent className="p-12 text-center"><Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium">No jobs found</h3><p className="text-muted-foreground mt-1">Try adjusting your filters</p><Button variant="outline" className="mt-4" onClick={clearFilters}><X className="w-4 h-4 mr-2" /> Clear Filters</Button></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
