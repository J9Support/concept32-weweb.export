"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/types/database";

export function useContacts(search?: string) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from("contacts").select("*");

      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      query = query.order("created_at", { ascending: false }).limit(100);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setContacts((data || []) as Contact[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch contacts";
      setError(message);
      console.error("useContacts error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, isLoading, error };
}
