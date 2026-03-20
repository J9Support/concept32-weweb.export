"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectMessage } from "@/lib/types/database";

export function useProjectMessages(projectId: number) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("project_messages")
          .select("*")
          .eq("project_id", projectId)
          .order("timpstamp", { ascending: true });

        if (fetchError) throw fetchError;
        setMessages((data || []) as ProjectMessage[]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch messages";
        setError(message);
        console.error("useProjectMessages error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ProjectMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  const sendMessage = useCallback(
    async (msg: {
      senderId: number;
      recieverId: number;
      text: string;
      project_id: number;
    }) => {
      try {
        setError(null);
        const { data, error: insertError } = await supabase
          .from("project_messages")
          .insert({
            senderId: msg.senderId,
            recieverId: msg.recieverId,
            text: msg.text,
            project_id: msg.project_id,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return data as ProjectMessage;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to send message";
        setError(message);
        console.error("sendMessage error:", err);
        throw err;
      }
    },
    [supabase]
  );

  return { messages, isLoading, error, sendMessage };
}
