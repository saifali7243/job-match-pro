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
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string | null;
  company: string;
  source: string;
  job_id: string | null;
  contacted: boolean;
  replied: boolean;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchDomain, setSearchDomain] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [outreachEmail, setOutreachEmail] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchContacts = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchDomain.trim()) return;

    setSearching(true);
    setSearchError("");
    setHasSearched(true);

    try {
      const domain = searchDomain.includes(".") ? searchDomain : `${searchDomain}.com`;
      const response = await fetch(`${API_BASE}/api/contacts/find?domain=${encodeURIComponent(domain)}`);

      if (!response.ok) throw new Error(`Search failed: ${response.status}`);

      const data: Contact[] = await response.json();
      setContacts((prev) => {
        const existingIds = new Set(prev.map((c) => c.email));
        const newContacts = data.filter((c) => !existingIds.has(c.email));
        const updated = [...prev, ...newContacts];
        // Save to localStorage so dashboard picks it up
        localStorage.setItem("jmp_contacts", JSON.stringify(updated));
        return updated;
      });
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "Failed to search contacts");
    } finally {
      setSearching(false);
    }
  };

  const generateOutreach = async (contact: Contact) => {
    setGeneratingEmail(true);
    setOutreachEmail("");

    try {
      const response = await fetch(`${API_BASE}/api/contacts/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: contact.id,
          job_id: contact.job_id || "general",
          profile_id: "current-user",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutreachEmail(`Subject: ${data.subject}\n\n${data.body}`);
      } else {
        setOutreachEmail(`Hi ${contact.name},\n\nI came across an open position at ${contact.company} and I'm very interested.\n\nWith my experience in full-stack development, I believe I'd be a strong fit. Would you be open to a quick chat?\n\nBest regards`);
      }
    } catch {
      setOutreachEmail(`Hi ${contact.name},\n\nI'm interested in opportunities at ${contact.company}. Would you be open to connecting?\n\nBest regards`);
    } finally {
      setGeneratingEmail(false);
    }
  };

  const copyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (contact: Contact) => {
    if (contact.replied) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1"><CheckCircle className="w-3 h-3" /> Replied</Badge>;
    if (contact.contacted) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1"><Clock className="w-3 h-3" /> Contacted</Badge>;
    return <Badge variant="secondary" className="gap-1"><Mail className="w-3 h-3" /> New</Badge>;
  };

  const contacted = contacts.filter((c) => c.contacted).length;
  const replied = contacts.filter((c) => c.replied).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="pt-8 lg:pt-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Recruiter Contacts</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Find hiring managers and recruiters safely via Hunter.io. Enter a company domain to search.
        </p>
      </div>

      {/* Stats */}
      {contacts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="stat-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{contacts.length}</p><p className="text-xs text-muted-foreground">Total Found</p></CardContent></Card>
          <Card className="stat-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-500">{contacted}</p><p className="text-xs text-muted-foreground">Contacted</p></CardContent></Card>
          <Card className="stat-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-500">{replied}</p><p className="text-xs text-muted-foreground">Replied</p></CardContent></Card>
          <Card className="stat-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-500">{contacts.length > 0 ? Math.round((replied / contacts.length) * 100) : 0}%</p><p className="text-xs text-muted-foreground">Response Rate</p></CardContent></Card>
        </div>
      )}

      {/* Search Box */}
      <Card className="card-3d">
        <CardContent className="p-6">
          <form onSubmit={searchContacts} className="space-y-4">
            <div className="text-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-medium">Find Recruiters by Company</h3>
              <p className="text-sm text-muted-foreground">Enter a company domain (e.g., grab.com, razorpay.com)</p>
            </div>
            <div className="flex max-w-lg mx-auto gap-2">
              <Input
                placeholder="e.g., grab.com or razorpay.com"
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                className="h-11"
              />
              <Button type="submit" className="gap-2 h-11" disabled={searching || !searchDomain.trim()}>
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {searching ? "Searching..." : "Find"}
              </Button>
            </div>
            {searchError && (
              <p className="text-center text-sm text-red-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> {searchError}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Contact Cards */}
      {contacts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Found Contacts ({contacts.length})</h2>
          {contacts.map((contact) => (
            <Card key={contact.id + contact.email} className="card-3d shine hover:shadow-md transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg">{contact.name}</h3>
                        {contact.role && <p className="text-sm text-muted-foreground">{contact.role}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="w-4 h-4" /> {contact.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" /> {contact.email}
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyEmail(contact.id, contact.email)}>
                            {copiedId === contact.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">via {contact.source}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                    {getStatusBadge(contact)}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => generateOutreach(contact)}>
                              <Sparkles className="w-4 h-4" /> Outreach
                            </Button>
                          }
                        />
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5" /> AI Outreach for {contact.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" /> To: {contact.email}
                            </div>
                            <Separator />
                            {generatingEmail ? (
                              <div className="flex items-center justify-center py-8 gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                                <span className="text-muted-foreground">AI is crafting your outreach email...</span>
                              </div>
                            ) : (
                              <>
                                <Textarea value={outreachEmail} onChange={(e) => setOutreachEmail(e.target.value)} rows={10} className="font-mono text-sm" />
                                <div className="flex flex-col sm:flex-row justify-between gap-2">
                                  <Button variant="outline" size="sm" className="gap-1" onClick={() => generateOutreach(contact)}>
                                    <Sparkles className="w-3 h-3" /> Regenerate
                                  </Button>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-1" onClick={() => navigator.clipboard.writeText(outreachEmail)}>
                                      <Copy className="w-3 h-3" /> Copy
                                    </Button>
                                    <a
                                      href={`mailto:${contact.email}?subject=Interest in Open Position&body=${encodeURIComponent(outreachEmail.split("\n\n").slice(1).join("\n\n"))}`}
                                      className="inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                      <Send className="w-3 h-3" /> Open in Mail
                                    </a>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => copyEmail(contact.id, contact.email)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state after search */}
      {hasSearched && !searching && contacts.length === 0 && !searchError && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No contacts found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try a different company domain</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
