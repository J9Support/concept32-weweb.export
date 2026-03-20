"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { Profile } from "@/lib/types/database";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchError) throw fetchError;
        setProfile(data as Profile);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch profile";
        setError(message);
        console.error("useProfile error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return;
      try {
        setError(null);
        const { data, error: updateError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setProfile(data as Profile);
        return data as Profile;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update profile";
        setError(message);
        console.error("updateProfile error:", err);
        throw err;
      }
    },
    [user, supabase]
  );

  return { profile, isLoading, error, updateProfile };
}
