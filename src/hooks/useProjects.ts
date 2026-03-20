"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types/database";

interface ProjectFilters {
  status?: string;
  search?: string;
}

export function useProjects(filters?: ProjectFilters) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from("projects").select("*");

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setProjects((data || []) as Project[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch projects";
      setError(message);
      console.error("useProjects error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, filters?.status, filters?.search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const refetch = useCallback(() => {
    return fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, error, refetch };
}
