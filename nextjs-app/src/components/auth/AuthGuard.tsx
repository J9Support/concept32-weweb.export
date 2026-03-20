"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Loader } from "@/components/ui/Loader";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, roles, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/sign-up");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = roles.some((r) => allowedRoles.includes(r));
      if (!hasAccess) {
        router.replace("/home");
        return;
      }
    }

    if (
      profile &&
      !profile.onboarding_completed &&
      !window.location.pathname.includes("customer-onboarding") &&
      !window.location.pathname.includes("sign-up")
    ) {
      const isCustomer = roles.includes(1);
      if (isCustomer) {
        router.replace("/customer-onboarding");
      }
    }
  }, [user, roles, profile, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = roles.some((r) => allowedRoles.includes(r));
    if (!hasAccess) return null;
  }

  return <>{children}</>;
}
