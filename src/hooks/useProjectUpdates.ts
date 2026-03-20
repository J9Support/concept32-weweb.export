"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectUpdate } from "@/lib/types/database";

export function useProjectUpdates(projectId: number) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchUpdates = useCallback(async () => {
    if (!projectId) {
      setUpdates([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setUpdates((data || []) as ProjectUpdate[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch updates";
      setError(message);
      console.error("useProjectUpdates error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, supabase]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const addUpdate = useCallback(
    async (update: Partial<ProjectUpdate>) => {
      try {
        setError(null);
        const { data, error: insertError } = await supabase
          .from("project_updates")
          .insert({ ...update, project_id: projectId })
          .select()
          .single();

        if (insertError) throw insertError;
        setUpdates((prev) => [data as ProjectUpdate, ...prev]);
        return data as ProjectUpdate;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add update";
        setError(message);
        console.error("addUpdate error:", err);
        throw err;
      }
    },
    [projectId, supabase]
  );

  const updateUpdate = useCallback(
    async (updateId: number, changes: Partial<ProjectUpdate>) => {
      try {
        setError(null);
        const { data, error: updateError } = await supabase
          .from("project_updates")
          .update(changes)
          .eq("id", updateId)
          .select()
          .single();

        if (updateError) throw updateError;
        setUpdates((prev) =>
          prev.map((u) => (u.id === updateId ? (data as ProjectUpdate) : u))
        );
        return data as ProjectUpdate;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update";
        setError(message);
        console.error("updateUpdate error:", err);
        throw err;
      }
    },
    [supabase]
  );

  const deleteUpdate = useCallback(
    async (updateId: number) => {
      try {
        setError(null);
        const { error: deleteError } = await supabase
          .from("project_updates")
          .delete()
          .eq("id", updateId);

        if (deleteError) throw deleteError;
        setUpdates((prev) => prev.filter((u) => u.id !== updateId));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete update";
        setError(message);
        console.error("deleteUpdate error:", err);
        throw err;
      }
    },
    [supabase]
  );

  const markAsRead = useCallback(
    async (updateId: number) => {
      try {
        setError(null);
        const { data, error: updateError } = await supabase
          .from("project_updates")
          .update({ read: true })
          .eq("id", updateId)
          .select()
          .single();

        if (updateError) throw updateError;
        setUpdates((prev) =>
          prev.map((u) => (u.id === updateId ? (data as ProjectUpdate) : u))
        );
        return data as ProjectUpdate;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to mark as read";
        setError(message);
        console.error("markAsRead error:", err);
        throw err;
      }
    },
    [supabase]
  );

  return { updates, isLoading, error, addUpdate, updateUpdate, deleteUpdate, markAsRead };
}
