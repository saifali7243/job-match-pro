"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  experience_level: string | null;
  skills: string[];
  description: string;
  apply_url: string;
  source: string;
  posted_date: string;
  match_score: number | null;
  recruiter_email: string | null;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (locationFilter !== "all") params.set("location", locationFilter);
      if (remoteFilter !== "all") params.set("remote_type", remoteFilter);
      if (experienceFilter !== "all") params.set("experience_level", experienceFilter);

      const response = await fetch(`${API_BASE}/api/jobs/search?${params.toString()}`);

      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);

      const data: Job[] = await response.json();
      setJobs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, locationFilter, remoteFilter, experienceFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter((job) => {
    if (sourceFilter !== "all" && job.source.toLowerCase() !== sourceFilter.toLowerCase()) return false;
    return true;
  });

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("all");
    setRemoteFilter("all");
    setExperienceFilter("all");
    setSourceFilter("all");
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null;
    const c = currency || "USD";
    const minVal = min || 0;
    const maxVal = max || 0;
    if (c === "INR") return `₹${(minVal / 100000).toFixed(0)}L - ₹${(maxVal / 100000).toFixed(0)}L`;
    if (c === "MYR") return `RM ${minVal.toLocaleString()} - RM ${maxVal.toLocaleString()}`;
    if (c === "SGD") return `S$${minVal.toLocaleString()} - S$${maxVal.toLocaleString()}`;
    if (c === "USD") return `$${minVal.toLocaleString()} - $${maxVal.toLocaleString()}`;
    return `${c} ${minVal} - ${maxVal}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between pt-8 lg:pt-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Job Matches</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {loading ? "Searching..." : `${filteredJobs.length} jobs found`}
            {!loading && jobs.length > 0 && ` from ${[...new Set(jobs.map(j => j.source))].join(", ")}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="w-4 h-4" /> {showFilters ? "Hide" : "Show"}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by job title, skill, or keyword... (press Enter)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </form>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <Card className="w-full lg:w-72 shrink-0 h-fit">
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
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="my">Malaysia</SelectItem>
                    <SelectItem value="sg">Singapore</SelectItem>
                    <SelectItem value="gb">United Kingdom</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
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
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
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
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
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
            </CardContent>
          </Card>
        )}

        {/* Job Listings */}
        <div className="flex-1 space-y-4">
          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin mb-4" />
                <h3 className="text-lg font-medium">Fetching jobs...</h3>
                <p className="text-sm text-muted-foreground mt-1">Searching Adzuna, RemoteOK, and Remotive</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Failed to load jobs</h3>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchJobs}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Job Cards */}
          {!loading && !error && filteredJobs.map((job) => (
            <Card key={job.id} className="card-3d shine hover:shadow-md transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">{job.title}</h3>
                        {job.match_score && (
                          <Badge className={job.match_score >= 85 ? "bg-green-500/10 text-green-500 border-green-500/20" : job.match_score >= 70 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"}>
                            {job.match_score}% match
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm"><Building2 className="w-4 h-4" /> {job.company}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 sm:w-4 sm:h-4" /> {job.location}</span>
                      <Badge variant="secondary" className="text-xs">{job.remote_type}</Badge>
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                      )}
                      {job.posted_date && <span className="flex items-center gap-1"><Clock className="w-3 h-3 sm:w-4 sm:h-4" /> {job.posted_date}</span>}
                    </div>
                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.map((skill) => (<Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>))}
                      </div>
                    )}
                    {job.description && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{job.description.replace(/<[^>]*>/g, "")}</p>}
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleSaveJob(job.id)} className={savedJobs.includes(job.id) ? "text-yellow-500" : ""}>
                      <Bookmark className="w-5 h-5" fill={savedJobs.includes(job.id) ? "currentColor" : "none"} />
                    </Button>
                    {job.apply_url && (
                      <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-xs">via {job.source}</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs sm:text-sm">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> Tailor Resume
                    </Button>
                    {job.apply_url && (
                      <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 text-xs sm:text-sm rounded-md h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" /> Apply
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {!loading && !error && filteredJobs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters or search query</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" /> Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
