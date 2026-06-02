"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  CheckCircle,
  Loader2,
  Pencil,
  Save,
  X,
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ParseState = "idle" | "uploading" | "parsing" | "done" | "error";

interface ParsedProfile {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  titles: string[];
  skills: string[];
  experience_years: number;
  experience: { company: string; role: string; duration: string; highlights: string[] }[];
  education: { degree: string; college: string; year: string }[];
  certifications: string[];
  summary: string | null;
}

export default function CVUploadPage() {
  const [parseState, setParseState] = useState<ParseState>("idle");
  const [profile, setProfile] = useState<ParsedProfile | null>(null);
  const [fileName, setFileName] = useState("");
  const [editing, setEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileName(file.name);
    setParseState("uploading");
    setErrorMsg("");

    try {
      setParseState("parsing");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/api/cv/parse`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(error.detail || `Server error: ${response.status}`);
      }

      const data: ParsedProfile = await response.json();
      setProfile(data);
      setParseState("done");
    } catch (err: unknown) {
      setParseState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse CV");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="pt-8 lg:pt-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Upload Your CV</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Upload your resume and our AI will extract your skills, experience, and education
          automatically.
        </p>
      </div>

      <Card className="card-3d">
        <CardContent className="p-4 sm:p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            }`}
          >
            <input {...getInputProps()} />
            {parseState === "idle" && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-float">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop your CV here..." : "Drag & drop your CV here"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse &bull; PDF, DOC, DOCX (max 10MB)
                  </p>
                </div>
              </div>
            )}
            {(parseState === "uploading" || parseState === "parsing") && (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-purple-500 mx-auto animate-spin" />
                <div>
                  <p className="text-lg font-medium">
                    {parseState === "uploading" ? `Uploading ${fileName}...` : "AI is parsing your CV..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {parseState === "parsing" && "Extracting skills, experience, and education with Gemini AI"}
                  </p>
                </div>
              </div>
            )}
            {parseState === "done" && (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-green-500">CV Parsed Successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    {fileName} &bull; Click to upload a new version
                  </p>
                </div>
              </div>
            )}
            {parseState === "error" && (
              <div className="space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-red-500">Parsing Failed</p>
                  <p className="text-sm text-muted-foreground">{errorMsg}</p>
                  <p className="text-sm text-muted-foreground mt-1">Click to try again</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {parseState === "done" && profile && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Your Parsed Profile</h2>
            <Button
              variant={editing ? "default" : "outline"}
              onClick={() => setEditing(!editing)}
              className="gap-2"
            >
              {editing ? (
                <><Save className="w-4 h-4" /> Save Changes</>
              ) : (
                <><Pencil className="w-4 h-4" /> Edit Profile</>
              )}
            </Button>
          </div>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                  <div><Label>Location</Label><Input value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{profile.email}</span></div>}
                  {profile.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{profile.phone}</span></div>}
                  {profile.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{profile.location}</span></div>}
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-muted-foreground" /><span>{profile.experience_years} years experience</span></div>
                </div>
              )}
            </CardContent>
          </Card>

          {profile.summary && (
            <Card className="card-3d">
              <CardHeader><CardTitle className="text-lg">Professional Summary</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea value={profile.summary} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} rows={4} />
                ) : (
                  <p className="text-muted-foreground">{profile.summary}</p>
                )}
              </CardContent>
            </Card>
          )}

          {profile.skills.length > 0 && (
            <Card className="card-3d">
              <CardHeader><CardTitle className="text-lg">Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-sm py-1 px-3 hover:scale-105 transition-transform">
                      {skill}
                      {editing && (
                        <button className="ml-2 hover:text-destructive" onClick={() => setProfile({ ...profile, skills: profile.skills.filter((_, idx) => idx !== i) })}>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.experience.length > 0 && (
            <Card className="card-3d">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5" /> Experience</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {profile.experience.map((exp, i) => (
                  <div key={i} className="space-y-2">
                    {i > 0 && <Separator className="my-4" />}
                    <div><h3 className="font-semibold">{exp.role}</h3><p className="text-sm text-muted-foreground">{exp.company} &bull; {exp.duration}</p></div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                      {exp.highlights.map((h, j) => (<li key={j}>{h}</li>))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.education.length > 0 && (
              <Card className="card-3d">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Education</CardTitle></CardHeader>
                <CardContent>
                  {profile.education.map((edu, i) => (<div key={i} className="mb-2"><h3 className="font-medium">{edu.degree}</h3><p className="text-sm text-muted-foreground">{edu.college} &bull; {edu.year}</p></div>))}
                </CardContent>
              </Card>
            )}
            {profile.certifications.length > 0 && (
              <Card className="card-3d">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="w-5 h-5" /> Certifications</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {profile.certifications.map((cert, i) => (<li key={i} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm">{cert}</span></li>))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
