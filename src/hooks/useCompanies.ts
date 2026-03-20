"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/types/database";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("*");

      if (fetchError) throw fetchError;
      setCompanies((data || []) as Company[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch companies";
      setError(message);
      console.error("useCompanies error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { companies, isLoading, error };
}
