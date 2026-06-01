"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Briefcase, FileText, Users } from "lucide-react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">JobMatch Pro</h1>
          <p className="text-muted-foreground mt-2">AI-powered job matching &amp; resume builder</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-12 text-base gap-3" onClick={handleGoogleLogin}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">What you get</span></div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Briefcase className="w-4 h-4 text-blue-500" /></div>
                <span>AI-matched jobs from India, Malaysia &amp; Global</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center"><FileText className="w-4 h-4 text-purple-500" /></div>
                <span>Resume tailored to each job with AI editor</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><Users className="w-4 h-4 text-orange-500" /></div>
                <span>Find recruiter contacts &amp; generate outreach</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">Free forever. No credit card required.</p>
      </div>
    </div>
  );
}
