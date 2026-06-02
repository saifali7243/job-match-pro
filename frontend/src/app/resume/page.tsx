"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Sparkles,
  Send,
  RotateCcw,
  Check,
  X,
  Wand2,
  Loader2,
  FileDown,
  Printer,
  Download,
} from "lucide-react";
import { mockJobs, mockResume } from "@/lib/mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ResumeData {
  id: string;
  template: string;
  job_id: string;
  sections: {
    summary: string;
    experience: { company: string; role: string; duration: string; bullets: string[] }[];
    skills: string[];
    education: { degree: string; college: string; year: string; gpa: string | null }[];
    certifications: string[];
  };
  ats_score: number;
}

export default function ResumePage() {
  const [selectedJob, setSelectedJob] = useState(mockJobs[0]);
  const [resume, setResume] = useState<ResumeData>(mockResume as ResumeData);
  const [template, setTemplate] = useState("modern");
  const [aiChat, setAiChat] = useState<{ role: string; content: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleJobChange = (value: string | null) => {
    if (value) setSelectedJob(mockJobs.find((j) => j.id === value) || mockJobs[0]);
  };
  const handleTemplateChange = (value: string | null) => {
    if (value) setTemplate(value);
  };

  const generateResume = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/api/resume/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: "current-user",
          job_id: selectedJob.id,
          template: template,
        }),
      });

      if (response.ok) {
        const data: ResumeData = await response.json();
        setResume(data);
        // Track resume count for dashboard
        const count = parseInt(localStorage.getItem("jmp_resume_count") || "0") + 1;
        localStorage.setItem("jmp_resume_count", count.toString());
      }
    } catch (err) {
      console.error("Failed to generate resume:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiChat((prev) => [...prev, { role: "user", content: userMsg }]);
    setAiInput("");
    setIsAiThinking(true);

    try {
      const response = await fetch(`${API_BASE}/api/resume/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "summary",
          content: resume.sections.summary,
          instruction: userMsg,
          job_description: selectedJob.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiChat((prev) => [...prev, { role: "assistant", content: data.improved_content }]);
      } else {
        setAiChat((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request. Make sure the backend is running." }]);
      }
    } catch {
      setAiChat((prev) => [...prev, { role: "assistant", content: "Connection error. Make sure the backend is running on port 8000." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const applyAiSuggestion = (content: string) => {
    setResume({ ...resume, sections: { ...resume.sections, summary: content } });
  };

  const exportResume = async (format: "pdf" | "docx") => {
    setIsExporting(true);
    try {
      const response = await fetch(`${API_BASE}/api/resume/export/${resume.id}?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resume_${resume.id}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const startEditing = (section: string, content: string) => { setEditingSection(section); setEditContent(content); };
  const saveEdit = () => {
    if (editingSection === "summary") setResume({ ...resume, sections: { ...resume.sections, summary: editContent } });
    setEditingSection(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 lg:pt-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            AI-tailored resume for: <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 py-1 px-3">ATS: {resume.ats_score}%</Badge>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => exportResume("pdf")} disabled={isExporting}>
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => exportResume("docx")} disabled={isExporting}>
            <FileText className="w-4 h-4" /> DOCX
          </Button>
        </div>
      </div>

      {/* Job + Template Selector */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <Label className="text-xs text-muted-foreground">Tailoring for Job</Label>
            <Select value={selectedJob.id} onValueChange={handleJobChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {mockJobs.map((job) => (<SelectItem key={job.id} value={job.id}>{job.title} - {job.company}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Label className="text-xs text-muted-foreground">Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="clean">Clean (ATS-optimized)</SelectItem>
                <SelectItem value="modern">Modern (Two-column)</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={generateResume} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? "Generating..." : "Regenerate with AI"}
          </Button>
        </CardContent>
      </Card>

      {/* Main Content: Editor + AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <Card className="card-3d">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Professional Summary</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => startEditing("summary", resume.sections.summary)}>
                  <Wand2 className="w-3 h-3" /> Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingSection === "summary" ? (
                <div className="space-y-3">
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className="text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} className="gap-1"><Check className="w-3 h-3" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingSection(null)} className="gap-1"><X className="w-3 h-3" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{resume.sections.summary}</p>
              )}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="card-3d">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resume.sections.experience.map((exp, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex justify-between items-start mb-2">
                    <div><h4 className="font-semibold">{exp.role}</h4><p className="text-sm text-muted-foreground">{exp.company} &bull; {exp.duration}</p></div>
                  </div>
                  <ul className="space-y-2">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2 group">
                        <span className="text-primary mt-1">&bull;</span>
                        <span className="flex-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="card-3d">
            <CardHeader className="pb-3"><CardTitle className="text-base">Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resume.sections.skills.map((skill) => {
                  const isInJD = selectedJob.skills.includes(skill);
                  return (
                    <Badge key={skill} variant={isInJD ? "default" : "secondary"} className={isInJD ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                      {isInJD && <Check className="w-3 h-3 mr-1" />}{skill}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3"><span className="text-green-500">Green</span> = matches job description</p>
            </CardContent>
          </Card>

          {/* Education + Certs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="card-3d">
              <CardHeader className="pb-3"><CardTitle className="text-base">Education</CardTitle></CardHeader>
              <CardContent>
                {resume.sections.education.map((edu, i) => (<div key={i}><h4 className="font-medium text-sm">{edu.degree}</h4><p className="text-xs text-muted-foreground">{edu.college} &bull; {edu.year}{edu.gpa ? ` &bull; GPA: ${edu.gpa}` : ""}</p></div>))}
              </CardContent>
            </Card>
            <Card className="card-3d">
              <CardHeader className="pb-3"><CardTitle className="text-base">Certifications</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {resume.sections.certifications.map((cert, i) => (<li key={i} className="text-sm flex items-center gap-2"><Check className="w-3 h-3 text-green-500" />{cert}</li>))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Chat Panel */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-8 h-[500px] lg:h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> AI Resume Assistant
              </CardTitle>
              <p className="text-xs text-muted-foreground">Ask me to improve sections or match JD keywords</p>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              {aiChat.length === 0 && (
                <div className="space-y-3">
                  <div className="bg-accent rounded-lg p-3 text-sm">
                    <p className="font-medium mb-2">Hi! I can help you with:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>&bull; &quot;Improve my summary&quot;</li>
                      <li>&bull; &quot;Add metrics to my experience&quot;</li>
                      <li>&bull; &quot;Make it more concise&quot;</li>
                      <li>&bull; &quot;Match keywords from the JD&quot;</li>
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Improve summary", "Add numbers", "Make shorter", "Match JD"].map((a) => (
                      <Button key={a} variant="outline" size="sm" className="text-xs h-7" onClick={() => setAiInput(a)}>{a}</Button>
                    ))}
                  </div>
                </div>
              )}
              {aiChat.map((msg, i) => (
                <div key={i} className={`rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-accent mr-4"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2 gap-1" onClick={() => applyAiSuggestion(msg.content)}>
                        <Check className="w-3 h-3" /> Apply to Summary
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2 gap-1" onClick={() => { setAiInput("Try again differently"); }}>
                        <RotateCcw className="w-3 h-3" /> Retry
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {isAiThinking && (
                <div className="bg-accent rounded-lg p-3 flex items-center gap-2 mr-4">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              )}
            </CardContent>
            <Separator />
            <div className="p-4">
              <div className="flex gap-2">
                <Input placeholder="Ask AI to improve..." value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAiSend()} className="text-sm" />
                <Button size="icon" onClick={handleAiSend} disabled={!aiInput.trim() || isAiThinking}><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
