"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Briefcase,
  FileText,
  Users,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cv-upload", icon: Upload, label: "Upload CV" },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/resume", icon: FileText, label: "Resume Builder" },
  { href: "/contacts", icon: Users, label: "Recruiters" },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2" onClick={onNavClick}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            JobMatch Pro
          </span>
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom section */}
      <div className="p-4 space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-xs font-bold">
              RK
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Rahul Kumar</p>
            <p className="text-xs text-muted-foreground truncate">rahul@email.com</p>
          </div>
        </div>
        <div className="space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-72 border-r border-border bg-card z-50 lg:hidden transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
