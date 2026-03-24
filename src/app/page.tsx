"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Loader } from "@/components/ui/Loader";

export default function RootPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user || !profile) {
      router.replace("/sign-up");
      return;
    }

    // Employees go to admin
    if (profile.user_type === "employee") {
      router.replace("/admin-home");
      return;
    }

    // Incomplete onboarding
    if (!profile.onboarding_completed) {
      router.replace("/onboarding");
      return;
    }

    // Default: customer/partner home
    router.replace("/home");
  }, [user, profile, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <Loader size="lg" />
    </div>
  );
}
