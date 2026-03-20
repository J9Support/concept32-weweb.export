"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/lib/types/database";

export function useInvoices(projectId?: number) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from("invoices").select("*");

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setInvoices((data || []) as Invoice[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch invoices";
      setError(message);
      console.error("useInvoices error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, projectId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, isLoading, error };
}
