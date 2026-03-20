"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, Profile } from "@/lib/types/database";

export function useProject(projectId: number) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectManager, setProjectManager] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setProjectManager(null);
      setIsLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData as Project);

        // Fetch project manager from v_profiles_public if assigned
        if (projectData?.project_manager_id) {
          const { data: pmData } = await supabase
            .from("v_profiles_public")
            .select("*")
            .eq("id", projectData.project_manager_id)
            .single();

          if (pmData) setProjectManager(pmData as Profile);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch project";
        setError(message);
        console.error("useProject error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, supabase]);

  const updateProject = useCallback(
    async (updates: Partial<Project>) => {
      if (!projectId) return;
      try {
        setError(null);
        const { data, error: updateError } = await supabase
          .from("projects")
          .update(updates)
          .eq("id", projectId)
          .select()
          .single();

        if (updateError) throw updateError;
        setProject(data as Project);
        return data as Project;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update project";
        setError(message);
        console.error("updateProject error:", err);
        throw err;
      }
    },
    [projectId, supabase]
  );

  return { project, projectManager, isLoading, error, updateProject };
}
