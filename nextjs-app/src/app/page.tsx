"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader } from "@/components/ui/Loader";

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/sign-up");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", session.user.id);

      const roleIds = (roles || []).map((r) => r.role_id);

      if (roleIds.includes(2) || roleIds.includes(3) || roleIds.includes(5)) {
        router.replace("/admin-home");
      } else {
        router.replace("/home");
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <Loader size="lg" />
    </div>
  );
}
