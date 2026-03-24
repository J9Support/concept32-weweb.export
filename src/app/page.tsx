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

        // Fetch profile and roles in parallel
        const [profileResult, rolesResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("user_id", session.user.id)
            .single(),
          supabase
            .from("user_roles")
            .select("role_id")
            .eq("user_id", session.user.id),
        ]);

        const profile = profileResult.data;
        const roleIds = (rolesResult.data || []).map(
          (r: { role_id: number }) => r.role_id
        );

        // No profile yet - send through provisioning via sign-up
        if (!profile) {
          router.replace("/sign-up");
          return;
        }

        // Staff roles go to admin
        if (roleIds.includes(2) || roleIds.includes(3) || roleIds.includes(5)) {
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
