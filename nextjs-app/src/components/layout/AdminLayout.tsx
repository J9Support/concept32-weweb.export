"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { NavBar } from "@/components/layout/NavBar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard allowedRoles={[2, 3, 5]}>
      <div className="min-h-screen bg-brand-bg">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
