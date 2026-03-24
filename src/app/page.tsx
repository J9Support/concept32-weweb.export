"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader } from "@/components/ui/Loader";

export default function RootPage() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    // Guard against double-firing (React strict mode / dependency instability)
    if (hasRun.current) return;
    hasRun.current = true;

    const supabase = createClient();

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/sign-up");
          return;
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, user_type")
          .eq("user_id", session.user.id)
          .single();

        // No profile yet - send through provisioning via sign-up
        if (!profile) {
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
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/sign-up");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <Loader size="lg" />
    </div>
  );
}
