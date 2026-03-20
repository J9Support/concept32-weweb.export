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

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = roles.some((r) => allowedRoles.includes(r));
      if (!hasAccess) {
        router.replace("/home");
        return;
      }
    }

    // Redirect incomplete onboarding (customers/partners only)
    const currentPath = window.location.pathname;
    const isOnboardingPage =
      currentPath.includes("customer-onboarding") ||
      currentPath.includes("welcome") ||
      currentPath.includes("sign-up");

    if (profile && !profile.onboarding_completed && !isOnboardingPage) {
      const isCustomerOrPartner = roles.includes(1) || roles.includes(4);
      if (isCustomerOrPartner) {
        // If they have a linked contact, send to welcome (confirm details)
        // Otherwise, send to full onboarding
        if (profile.contact_id) {
          router.replace("/welcome");
        } else {
          router.replace("/customer-onboarding");
        }
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
