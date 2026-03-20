"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { InspirationPost } from "@/lib/types/database";

interface InspirationFilters {
  type?: string;
}

export function useInspirationPosts(filters?: InspirationFilters) {
  const [posts, setPosts] = useState<InspirationPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from("inspiration_posts").select("*");

      if (filters?.type && filters.type !== "All") {
        const types = filters.type.split(",");
        query = query.in("type", types);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPosts((data || []) as InspirationPost[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch posts";
      setError(message);
      console.error("useInspirationPosts error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, filters?.type]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = useCallback(
    async (post: Partial<InspirationPost>) => {
      try {
        setError(null);
        const { data, error: insertError } = await supabase
          .from("inspiration_posts")
          .insert(post)
          .select()
          .single();

        if (insertError) throw insertError;
        setPosts((prev) => [data as InspirationPost, ...prev]);
        return data as InspirationPost;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add post";
        setError(message);
        console.error("addPost error:", err);
        throw err;
      }
    },
    [supabase]
  );

  const deletePost = useCallback(
    async (postId: number) => {
      try {
        setError(null);
        const { error: deleteError } = await supabase
          .from("inspiration_posts")
          .delete()
          .eq("id", postId);

        if (deleteError) throw deleteError;
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete post";
        setError(message);
        console.error("deletePost error:", err);
        throw err;
      }
    },
    [supabase]
  );

  const refetch = useCallback(() => {
    return fetchPosts();
  }, [fetchPosts]);

  return { posts, isLoading, error, addPost, deletePost, refetch };
}
