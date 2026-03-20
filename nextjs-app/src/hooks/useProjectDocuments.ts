"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectDocument } from "@/lib/types/database";

export function useProjectDocuments(projectId: number) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("project_documents")
          .select("*")
          .eq("project_id", projectId);

        if (fetchError) throw fetchError;
        setDocuments((data || []) as ProjectDocument[]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch documents";
        setError(message);
        console.error("useProjectDocuments error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId, supabase]);

  const addDocument = useCallback(
    async (doc: Partial<ProjectDocument>) => {
      try {
        setError(null);
        const { data, error: insertError } = await supabase
          .from("project_documents")
          .insert({ ...doc, project_id: projectId })
          .select()
          .single();

        if (insertError) throw insertError;
        setDocuments((prev) => [...prev, data as ProjectDocument]);
        return data as ProjectDocument;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add document";
        setError(message);
        console.error("addDocument error:", err);
        throw err;
      }
    },
    [projectId, supabase]
  );

  const deleteDocument = useCallback(
    async (documentId: number) => {
      try {
        setError(null);
        const { error: deleteError } = await supabase
          .from("project_documents")
          .delete()
          .eq("id", documentId);

        if (deleteError) throw deleteError;
        setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete document";
        setError(message);
        console.error("deleteDocument error:", err);
        throw err;
      }
    },
    [supabase]
  );

  return { documents, isLoading, error, addDocument, deleteDocument };
}
