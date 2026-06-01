"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Mail,
  Building2,
  User,
  Copy,
  Check,
  Sparkles,
  Send,
  Clock,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { mockContacts, mockJobs } from "@/lib/mock-data";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [outreachEmail, setOutreachEmail] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState(false);

  const filteredContacts = mockContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateOutreach = (contact: (typeof mockContacts)[0]) => {
    setGeneratingEmail(true);
    const job = mockJobs.find((j) => j.id === contact.job_id);
    setTimeout(() => {
      setOutreachEmail(`Hi ${contact.name},\n\nI came across the ${job?.title || "open position"} role at ${contact.company} and I'm very excited about the opportunity.\n\nWith 4+ years of experience in full-stack development, particularly with ${job?.skills?.slice(0, 3).join(", ")}, I believe I'd be a strong fit for this position.\n\nWould you be open to a quick 15-minute chat this week?\n\nBest regards,\nRahul Kumar`);
      setGeneratingEmail(false);
    }, 2000);
  };

  const getStatusBadge = (contact: (typeof mockContacts)[0]) => {
    if (contact.replied) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1"><CheckCircle className="w-3 h-3" /> Replied</Badge>;
    if (contact.contacted) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1"><Clock className="w-3 h-3" /> Contacted</Badge>;
    return <Badge variant="secondary" className="gap-1"><Mail className="w-3 h-3" /> New</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recruiter Contacts</h1>
        <p className="text-muted-foreground mt-1">Found {mockContacts.length} recruiters for your matched jobs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{mockContacts.length}</p><p className="text-xs text-muted-foreground">Total Contacts</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-500">{mockContacts.filter((c) => c.contacted && !c.replied).length}</p><p className="text-xs text-muted-foreground">Awaiting Reply</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-500">{mockContacts.filter((c) => c.replied).length}</p><p className="text-xs text-muted-foreground">Replied</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-500">{Math.round((mockContacts.filter((c) => c.replied).length / mockContacts.length) * 100)}%</p><p className="text-xs text-muted-foreground">Response Rate</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search by name, company, or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12" />
      </div>

      <div className="space-y-4">
        {filteredContacts.map((contact) => {
          const job = mockJobs.find((j) => j.id === contact.job_id);
          return (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div><h3 className="font-semibold text-lg">{contact.name}</h3><p className="text-sm text-muted-foreground">{contact.role}</p></div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground"><Building2 className="w-4 h-4" /> {contact.company}</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" /> {contact.email}
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyEmail(contact.id, contact.email)}>
                            {copiedId === contact.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </span>
                      </div>
                      {job && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">For: {job.title} at {job.company}</Badge>
                          <Badge variant="secondary" className="text-xs">via {contact.source}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(contact)}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => generateOutreach(contact)}>
                              <Sparkles className="w-4 h-4" /> Generate Outreach
                            </Button>
                          }
                        />
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5" /> AI Outreach Email for {contact.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-4 h-4" />To: {contact.email}</div>
                            <Separator />
                            {generatingEmail ? (
                              <div className="flex items-center justify-center py-8 gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                                <span className="text-muted-foreground">AI is crafting your outreach email...</span>
                              </div>
                            ) : (
                              <>
                                <Textarea value={outreachEmail} onChange={(e) => setOutreachEmail(e.target.value)} rows={10} className="font-mono text-sm" />
                                <div className="flex justify-between">
                                  <Button variant="outline" size="sm" className="gap-1" onClick={() => generateOutreach(contact)}><Sparkles className="w-3 h-3" /> Regenerate</Button>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-1" onClick={() => navigator.clipboard.writeText(outreachEmail)}><Copy className="w-3 h-3" /> Copy</Button>
                                    <Button size="sm" className="gap-1"><Send className="w-3 h-3" /> Open in Mail</Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => copyEmail(contact.id, contact.email)}><Copy className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium">Find More Recruiters</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Enter a company domain to search for hiring contacts</p>
          <div className="flex max-w-md mx-auto gap-2">
            <Input placeholder="e.g., grab.com or razorpay.com" />
            <Button className="gap-2"><Search className="w-4 h-4" /> Find</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
