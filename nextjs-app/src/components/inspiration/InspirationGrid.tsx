"use client";

import { useState } from "react";
import type { InspirationPost } from "@/lib/types/database";
import { Heart, Trash2, X } from "lucide-react";

interface InspirationGridProps {
  posts: InspirationPost[];
  favoritedIds: Set<number>;
  onToggleFavorite?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  showDelete?: boolean;
}

export function InspirationGrid({
  posts,
  favoritedIds,
  onToggleFavorite,
  onDelete,
  showDelete = false,
}: InspirationGridProps) {
  const [selectedPost, setSelectedPost] = useState<InspirationPost | null>(null);

  if (!posts.length) {
    return (
      <p className="text-center text-text-secondary text-sm py-8">
        No images to display.
      </p>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => {
          const isFavorited = favoritedIds.has(post.id);
          return (
            <div
              key={post.id}
              className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {post.url ? (
                <img
                  src={post.url}
                  alt={post.title || "Inspiration"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

              {/* Heart */}
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(post.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Heart
                    size={18}
                    className={
                      isFavorited
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }
                  />
                </button>
              )}

              {/* Delete */}
              {showDelete && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(post.id);
                  }}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-white/80 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              )}

              {/* Type badge */}
              {post.type && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 rounded text-xs font-medium text-text-primary">
                  {post.type}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-10 p-1 bg-white/80 rounded-full hover:bg-white"
            >
              <X size={20} />
            </button>
            {selectedPost.url && (
              <img
                src={selectedPost.url}
                alt={selectedPost.title || ""}
                className="w-full max-h-[70vh] object-contain bg-gray-100"
              />
            )}
            <div className="p-4">
              {selectedPost.title && (
                <h3 className="font-semibold text-text-primary">
                  {selectedPost.title}
                </h3>
              )}
              {selectedPost.description && (
                <p className="text-sm text-text-secondary mt-1">
                  {selectedPost.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                {selectedPost.type && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">
                    {selectedPost.type}
                  </span>
                )}
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(selectedPost.id)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Heart
                      size={16}
                      className={
                        favoritedIds.has(selectedPost.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                    {favoritedIds.has(selectedPost.id)
                      ? "Favorited"
                      : "Add to favorites"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
