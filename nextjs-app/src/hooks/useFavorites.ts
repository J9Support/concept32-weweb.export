"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { FavoritedPost } from "@/lib/types/database";

export function useFavorites() {
  const { profile } = useAuth();
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!profile?.id) {
      setFavoritedIds(new Set());
      setIsLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("favorited_posts")
          .select("*")
          .eq("profile_id", profile.id);

        if (error) throw error;

        const ids = new Set(
          (data || [])
            .map((f: FavoritedPost) => f.post_id)
            .filter(Boolean) as number[]
        );
        setFavoritedIds(ids);
      } catch (err) {
        console.error("useFavorites error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [profile?.id, supabase]);

  const toggleFavorite = useCallback(
    async (postId: number) => {
      if (!profile?.id) return;

      try {
        if (favoritedIds.has(postId)) {
          // Remove favorite
          const { error } = await supabase
            .from("favorited_posts")
            .delete()
            .eq("profile_id", profile.id)
            .eq("post_id", postId);

          if (error) throw error;
          setFavoritedIds((prev) => {
            const next = new Set(prev);
            next.delete(postId);
            return next;
          });
        } else {
          // Add favorite
          const { error } = await supabase
            .from("favorited_posts")
            .insert({ profile_id: profile.id, post_id: postId });

          if (error) throw error;
          setFavoritedIds((prev) => {
            const next = new Set(prev);
            next.add(postId);
            return next;
          });
        }
      } catch (err) {
        console.error("toggleFavorite error:", err);
        throw err;
      }
    },
    [profile?.id, favoritedIds, supabase]
  );

  return { favoritedIds, isLoading, toggleFavorite };
}
