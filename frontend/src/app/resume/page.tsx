"use client";

import { useState } from "react";
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
} from "lucide-react";
import { mockResume, mockJobs } from "@/lib/mock-data";

export default function ResumePage() {
  const [selectedJob, setSelectedJob] = useState(mockJobs[0]);
  const [resume, setResume] = useState(mockResume);
  const [template, setTemplate] = useState("modern");
  const [aiChat, setAiChat] = useState<{ role: string; content: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleJobChange = (value: string | null) => {
    if (value) setSelectedJob(mockJobs.find((j) => j.id === value) || mockJobs[0]);
  };
  const handleTemplateChange = (value: string | null) => {
    if (value) setTemplate(value);
  };

  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiChat((prev) => [...prev, { role: "user", content: userMsg }]);
    setAiInput("");
    setIsAiThinking(true);

    setTimeout(() => {
      let response = "";
      if (userMsg.toLowerCase().includes("summary")) {
        response = 'Here\'s an improved summary:\n\n"Innovative Full Stack Developer with 4+ years building high-scale distributed systems. Expert in React, TypeScript, and Python with proven ability to reduce system latency by 40% and mentor engineering teams."';
      } else if (userMsg.toLowerCase().includes("metric") || userMsg.toLowerCase().includes("number")) {
        response = "I suggest adding metrics:\n\n- Specify API request volume (e.g., '1.2M daily')\n- Add percentage improvements\n- Include team size\n- Revenue impact if available";
      } else {
        response = "I can help! Try asking me to:\n- Improve the summary\n- Add metrics to experience\n- Make a section more concise\n- Match keywords from the JD";
      }
      setAiChat((prev) => [...prev, { role: "assistant", content: response }]);
      setIsAiThinking(false);
    }, 1500);
  };

  const startEditing = (section: string, content: string) => { setEditingSection(section); setEditContent(content); };
  const saveEdit = () => {
    if (editingSection === "summary") setResume({ ...resume, sections: { ...resume.sections, summary: editContent } });
    setEditingSection(null);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">
            AI-tailored resume for: <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-base py-1 px-3">ATS Score: {resume.ats_score}%</Badge>
          <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> PDF</Button>
          <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> DOCX</Button>
          <Button variant="outline" className="gap-2"><Printer className="w-4 h-4" /> Print</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Tailoring for Job</Label>
            <Select value={selectedJob.id} onValueChange={handleJobChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {mockJobs.map((job) => (<SelectItem key={job.id} value={job.id}>{job.title} - {job.company}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
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
          <Button className="gap-2 mt-4"><Sparkles className="w-4 h-4" /> Regenerate with AI</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Professional Summary</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => startEditing("summary", resume.sections.summary)}>
                  <Wand2 className="w-3 h-3" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-purple-500">
                  <Sparkles className="w-3 h-3" /> Improve with AI
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Experience</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-purple-500"><Sparkles className="w-3 h-3" /> Add metrics to all</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {resume.sections.experience.map((exp, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex justify-between items-start mb-2">
                    <div><h4 className="font-semibold">{exp.role}</h4><p className="text-sm text-muted-foreground">{exp.company} &bull; {exp.duration}</p></div>
                    <Button variant="ghost" size="sm" className="text-xs text-purple-500 gap-1"><Sparkles className="w-3 h-3" /> Improve</Button>
                  </div>
                  <ul className="space-y-2">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2 group">
                        <span className="text-primary mt-1">&bull;</span>
                        <span className="flex-1">{bullet}</span>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-xs h-6 px-2"><Sparkles className="w-3 h-3" /></Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Skills</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-purple-500"><Sparkles className="w-3 h-3" /> Reorder for JD</Button>
            </CardHeader>
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
              <p className="text-xs text-muted-foreground mt-3"><span className="text-green-500">Green</span> = matches job description keywords</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Education</CardTitle></CardHeader>
              <CardContent>
                {resume.sections.education.map((edu, i) => (<div key={i}><h4 className="font-medium text-sm">{edu.degree}</h4><p className="text-xs text-muted-foreground">{edu.college} &bull; {edu.year} &bull; GPA: {edu.gpa}</p></div>))}
              </CardContent>
            </Card>
            <Card>
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
          <Card className="sticky top-8 h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> AI Resume Assistant
              </CardTitle>
              <p className="text-xs text-muted-foreground">Ask me to improve sections, add keywords, or suggest changes</p>
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
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Quick Actions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Improve summary", "Add numbers", "Make shorter", "Match JD"].map((a) => (
                        <Button key={a} variant="outline" size="sm" className="text-xs h-7" onClick={() => setAiInput(a)}>{a}</Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {aiChat.map((msg, i) => (
                <div key={i} className={`rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-accent mr-4"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2 gap-1"><Check className="w-3 h-3" /> Apply</Button>
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2 gap-1"><RotateCcw className="w-3 h-3" /> Retry</Button>
                    </div>
                  )}
                </div>
              ))}
              {isAiThinking && (
                <div className="bg-accent rounded-lg p-3 flex items-center gap-2 mr-4">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              )}
            </CardContent>
            <Separator />
            <div className="p-4">
              <div className="flex gap-2">
                <Input placeholder="Ask AI to improve your resume..." value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAiSend()} className="text-sm" />
                <Button size="icon" onClick={handleAiSend} disabled={!aiInput.trim()}><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
