"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { NavBar } from "@/components/layout/NavBar";

interface AppLayoutProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export function AppLayout({ children, allowedRoles }: AppLayoutProps) {
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-brand-bg">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
