"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectStage } from "@/lib/types/database";

export function useProjectStages(projectId: number) {
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchStages = useCallback(async () => {
    if (!projectId) {
      setStages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("project_stages")
        .select("*")
        .eq("project_id", projectId)
        .order("stage_number", { ascending: true });

      if (fetchError) throw fetchError;
      setStages((data || []) as ProjectStage[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch stages";
      setError(message);
      console.error("useProjectStages error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, supabase]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const addStage = useCallback(
    async (stage: Partial<ProjectStage>) => {
      try {
        setError(null);
        const { data, error: insertError } = await supabase
          .from("project_stages")
          .insert({ ...stage, project_id: projectId })
          .select()
          .single();

        if (insertError) throw insertError;
        setStages((prev) => [...prev, data as ProjectStage]);
        return data as ProjectStage;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add stage";
        setError(message);
        console.error("addStage error:", err);
        throw err;
      }
    },
    [projectId, supabase]
  );

  const updateStage = useCallback(
    async (stageId: number, updates: Partial<ProjectStage>) => {
      try {
        setError(null);
        const { data, error: updateError } = await supabase
          .from("project_stages")
          .update(updates)
          .eq("id", stageId)
          .select()
          .single();

        if (updateError) throw updateError;
        setStages((prev) =>
          prev.map((s) => (s.id === stageId ? (data as ProjectStage) : s))
        );
        return data as ProjectStage;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update stage";
        setError(message);
        console.error("updateStage error:", err);
        throw err;
      }
    },
    [supabase]
  );

  const deleteStage = useCallback(
    async (stageId: number) => {
      try {
        setError(null);
        const { error: deleteError } = await supabase
          .from("project_stages")
          .delete()
          .eq("id", stageId);

        if (deleteError) throw deleteError;
        setStages((prev) => prev.filter((s) => s.id !== stageId));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete stage";
        setError(message);
        console.error("deleteStage error:", err);
        throw err;
      }
    },
    [supabase]
  );

  return { stages, isLoading, error, addStage, updateStage, deleteStage };
}
