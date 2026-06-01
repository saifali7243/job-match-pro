const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiCall(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  // CV Parser
  parseCV: (formData: FormData) =>
    fetch(`${API_BASE}/api/cv/parse`, { method: "POST", body: formData }).then((r) => r.json()),

  // Jobs
  searchJobs: (params: Record<string, string>) =>
    apiCall(`/api/jobs/search?${new URLSearchParams(params)}`),

  // Resume
  generateResume: (data: { profile_id: string; job_id: string }) =>
    apiCall("/api/resume/generate", { method: "POST", body: JSON.stringify(data) }),

  exportResume: (resumeId: string, format: "pdf" | "docx") =>
    fetch(`${API_BASE}/api/resume/export/${resumeId}?format=${format}`),

  improveSection: (data: { section: string; content: string; instruction: string }) =>
    apiCall("/api/resume/improve", { method: "POST", body: JSON.stringify(data) }),

  // Contacts
  findContacts: (companyDomain: string) =>
    apiCall(`/api/contacts/find?domain=${companyDomain}`),

  generateOutreach: (data: { contact_id: string; job_id: string; profile_id: string }) =>
    apiCall("/api/contacts/outreach", { method: "POST", body: JSON.stringify(data) }),
};
