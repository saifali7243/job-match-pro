"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Bell,
  Globe,
  Shield,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  titles: string[];
  skills: string[];
  experience_years: number;
  summary: string;
  preferred_locations: string[];
  preferred_remote: string;
  salary_min: string;
  salary_currency: string;
}

interface NotificationPrefs {
  email_new_jobs: boolean;
  email_weekly_digest: boolean;
  email_recruiter_reply: boolean;
  email_resume_tips: boolean;
  job_alert_frequency: string;
  min_match_score: number;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    titles: [],
    skills: [],
    experience_years: 0,
    summary: "",
    preferred_locations: [],
    preferred_remote: "all",
    salary_min: "",
    salary_currency: "INR",
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email_new_jobs: true,
    email_weekly_digest: true,
    email_recruiter_reply: true,
    email_resume_tips: false,
    job_alert_frequency: "daily",
    min_match_score: 70,
  });

  const [newSkill, setNewSkill] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "notifications" | "danger">("profile");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("jmp_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile((prev) => ({
          ...prev,
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          location: parsed.location || "",
          titles: parsed.titles || [],
          skills: parsed.skills || [],
          experience_years: parsed.experience_years || 0,
          summary: parsed.summary || "",
        }));
      }

      const savedPrefs = localStorage.getItem("jmp_preferences");
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setProfile((prev) => ({
          ...prev,
          preferred_locations: parsed.preferred_locations || [],
          preferred_remote: parsed.preferred_remote || "all",
          salary_min: parsed.salary_min || "",
          salary_currency: parsed.salary_currency || "INR",
        }));
      }

      const savedNotifs = localStorage.getItem("jmp_notifications");
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
    } catch {}
  }, []);

  const saveProfile = () => {
    setSaveStatus("saving");
    try {
      // Save profile
      localStorage.setItem("jmp_profile", JSON.stringify({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        titles: profile.titles,
        skills: profile.skills,
        experience_years: profile.experience_years,
        summary: profile.summary,
      }));

      // Save preferences
      localStorage.setItem("jmp_preferences", JSON.stringify({
        preferred_locations: profile.preferred_locations,
        preferred_remote: profile.preferred_remote,
        salary_min: profile.salary_min,
        salary_currency: profile.salary_currency,
      }));

      // Save notifications
      localStorage.setItem("jmp_notifications", JSON.stringify(notifications));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const addTitle = () => {
    if (newTitle.trim() && !profile.titles.includes(newTitle.trim())) {
      setProfile({ ...profile, titles: [...profile.titles, newTitle.trim()] });
      setNewTitle("");
    }
  };

  const removeTitle = (title: string) => {
    setProfile({ ...profile, titles: profile.titles.filter((t) => t !== title) });
  };

  const addPreferredLocation = () => {
    if (newLocation.trim() && !profile.preferred_locations.includes(newLocation.trim())) {
      setProfile({ ...profile, preferred_locations: [...profile.preferred_locations, newLocation.trim()] });
      setNewLocation("");
    }
  };

  const removePreferredLocation = (loc: string) => {
    setProfile({ ...profile, preferred_locations: profile.preferred_locations.filter((l) => l !== loc) });
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure? This will delete all your saved data including your profile, contacts, and resumes.")) {
      localStorage.removeItem("jmp_profile");
      localStorage.removeItem("jmp_preferences");
      localStorage.removeItem("jmp_notifications");
      localStorage.removeItem("jmp_contacts");
      localStorage.removeItem("jmp_resume_count");
      window.location.href = "/";
    }
  };

  const handleRemoteChange = (value: string | null) => {
    if (value) setProfile({ ...profile, preferred_remote: value });
  };

  const handleFrequencyChange = (value: string | null) => {
    if (value) setNotifications({ ...notifications, job_alert_frequency: value });
  };

  const handleCurrencyChange = (value: string | null) => {
    if (value) setProfile({ ...profile, salary_currency: value });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="pt-8 lg:pt-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your profile, job preferences, and notifications.
          </p>
        </div>
        <Button onClick={saveProfile} disabled={saveStatus === "saving"} className="gap-2">
          {saveStatus === "saving" && <Save className="w-4 h-4 animate-spin" />}
          {saveStatus === "saved" && <CheckCircle className="w-4 h-4 text-green-500" />}
          {saveStatus === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
          {saveStatus === "idle" && <Save className="w-4 h-4" />}
          {saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Error" : "Save All"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {[
          { id: "profile" as const, label: "Profile", icon: User },
          { id: "preferences" as const, label: "Job Preferences", icon: Briefcase },
          { id: "notifications" as const, label: "Notifications", icon: Bell },
          { id: "danger" as const, label: "Data", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91-9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="Bangalore, India"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp">Years of Experience</Label>
                  <Input
                    id="exp"
                    type="number"
                    min="0"
                    max="50"
                    value={profile.experience_years}
                    onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profile.summary}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                placeholder="Brief professional summary (2-3 sentences about your experience and goals)"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Job Titles */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg">Target Job Titles</CardTitle>
              <p className="text-xs text-muted-foreground">Add roles you&apos;re interested in. These help match you with relevant jobs.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {profile.titles.map((title) => (
                  <Badge key={title} variant="secondary" className="py-1 px-3 gap-1">
                    {title}
                    <button onClick={() => removeTitle(title)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTitle())}
                  placeholder="e.g., Full Stack Developer"
                  className="max-w-xs"
                />
                <Button variant="outline" size="sm" onClick={addTitle} className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
              <p className="text-xs text-muted-foreground">Add your technical and soft skills. These are used for job matching.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="py-1 px-3 gap-1 hover:scale-105 transition-transform">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="e.g., React, Python, AWS"
                  className="max-w-xs"
                />
                <Button variant="outline" size="sm" onClick={addSkill} className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Job Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" /> Preferred Locations
              </CardTitle>
              <p className="text-xs text-muted-foreground">Where do you want to work? Jobs in these locations will be prioritized.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {profile.preferred_locations.map((loc) => (
                  <Badge key={loc} variant="secondary" className="py-1 px-3 gap-1">
                    <MapPin className="w-3 h-3" /> {loc}
                    <button onClick={() => removePreferredLocation(loc)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreferredLocation())}
                  placeholder="e.g., Bangalore, Kuala Lumpur, Remote"
                  className="max-w-xs"
                />
                <Button variant="outline" size="sm" onClick={addPreferredLocation} className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> Work Type & Salary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Work Type</Label>
                  <Select value={profile.preferred_remote} onValueChange={handleRemoteChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">No Preference</SelectItem>
                      <SelectItem value="remote">Remote Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={profile.salary_currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR (India)</SelectItem>
                      <SelectItem value="MYR">RM MYR (Malaysia)</SelectItem>
                      <SelectItem value="SGD">S$ SGD (Singapore)</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="GBP">£ GBP (UK)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Salary (Annual)</Label>
                  <Input
                    type="number"
                    value={profile.salary_min}
                    onChange={(e) => setProfile({ ...profile, salary_min: e.target.value })}
                    placeholder={profile.salary_currency === "INR" ? "e.g., 1500000" : "e.g., 80000"}
                  />
                  <p className="text-xs text-muted-foreground">
                    Jobs below this salary will be filtered out
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg">Match Score Threshold</CardTitle>
              <p className="text-xs text-muted-foreground">Only show jobs with a match score above this percentage</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={notifications.min_match_score}
                  onChange={(e) => setNotifications({ ...notifications, min_match_score: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">% minimum match</span>
                <Badge variant="secondary">{notifications.min_match_score}%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" /> Email Notifications
              </CardTitle>
              <p className="text-xs text-muted-foreground">Choose what emails you want to receive</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">New Job Matches</p>
                  <p className="text-xs text-muted-foreground">Get notified when new jobs match your profile</p>
                </div>
                <Checkbox
                  checked={notifications.email_new_jobs}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_new_jobs: !!checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Weekly Digest</p>
                  <p className="text-xs text-muted-foreground">Summary of top matched jobs every Monday</p>
                </div>
                <Checkbox
                  checked={notifications.email_weekly_digest}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_weekly_digest: !!checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Recruiter Replies</p>
                  <p className="text-xs text-muted-foreground">Get notified when a recruiter responds to your outreach</p>
                </div>
                <Checkbox
                  checked={notifications.email_recruiter_reply}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_recruiter_reply: !!checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Resume Tips & AI Suggestions</p>
                  <p className="text-xs text-muted-foreground">Get tips to improve your resume and profile</p>
                </div>
                <Checkbox
                  checked={notifications.email_resume_tips}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_resume_tips: !!checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg">Alert Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>How often should we send job alerts?</Label>
                <Select value={notifications.job_alert_frequency} onValueChange={handleFrequencyChange}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time (as they come in)</SelectItem>
                    <SelectItem value="daily">Daily digest (6 AM)</SelectItem>
                    <SelectItem value="weekly">Weekly (Monday morning)</SelectItem>
                    <SelectItem value="never">Never (I&apos;ll check manually)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === "danger" && (
        <div className="space-y-6">
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" /> Your Data
              </CardTitle>
              <p className="text-xs text-muted-foreground">Manage your stored data</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm mb-2">Stored locally on your device:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Profile information (name, skills, experience)</li>
                  <li>• Job preferences (location, salary, work type)</li>
                  <li>• Notification settings</li>
                  <li>• Found recruiter contacts</li>
                  <li>• Resume generation count</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Your data is stored in your browser&apos;s localStorage. It is not sent to any server unless you explicitly use features that require it (like CV parsing or job search).
              </p>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 card-3d">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your saved data from this browser. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={clearAllData} className="gap-2">
                <Trash2 className="w-4 h-4" /> Delete All My Data
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
