"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { InspirationGrid } from "@/components/inspiration/InspirationGrid";
import { TabBar } from "@/components/ui/TabBar";
import { FileUpload } from "@/components/ui/FileUpload";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { InspirationPost } from "@/lib/types/database";
import { Images, Heart, Upload, Trash2 } from "lucide-react";

const CABINET_TYPES = [
  { label: "All", value: "Kitchen,Bathroom,Office,Living" },
  { label: "Kitchen", value: "Kitchen" },
  { label: "Bathroom", value: "Bathroom" },
  { label: "Office", value: "Office" },
  { label: "Living Room", value: "Living" },
];

export default function InspirationPage() {
  const { profile } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("gallery");
  const [selectedType, setSelectedType] = useState("All");
  const [posts, setPosts] = useState<InspirationPost[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [uploadCategory, setUploadCategory] = useState("Kitchen");
  const [isUploading, setIsUploading] = useState(false);

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from("inspiration_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as InspirationPost[]) || []);
  }, [supabase]);

  const fetchFavorites = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("favorited_posts")
      .select("post_id")
      .eq("profile_id", profile.id);
    setFavoritedIds(
      new Set((data || []).map((f: { post_id: number | null }) => f.post_id).filter(Boolean) as number[])
    );
  }, [supabase, profile]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchPosts(), fetchFavorites()]);
      setIsLoading(false);
    };
    load();
  }, [fetchPosts, fetchFavorites]);

  const toggleFavorite = async (postId: number) => {
    if (!profile) return;
    const isFav = favoritedIds.has(postId);

    if (isFav) {
      await supabase
        .from("favorited_posts")
        .delete()
        .eq("post_id", postId)
        .eq("profile_id", profile.id);
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      await supabase
        .from("favorited_posts")
        .insert({ post_id: postId, profile_id: profile.id });
      setFavoritedIds((prev) => new Set([...prev, postId]));
    }
  };

  const handleUpload = async (file: File) => {
    if (!profile) return;
    setIsUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `inspiration/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("inspiration")
        .upload(path, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("inspiration").getPublicUrl(path);

      await supabase.from("inspiration_posts").insert({
        url: publicUrl,
        uploaded_by_id: String(profile.id),
        type: uploadCategory,
        title: file.name.replace(/\.[^/.]+$/, ""),
      });

      await fetchPosts();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Delete this image?")) return;
    await supabase.from("inspiration_posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Filter logic
  const typeFilter = CABINET_TYPES.find((t) => t.label === selectedType);
  const typeValues = typeFilter?.value.split(",") || [];

  const filteredPosts =
    selectedType === "All"
      ? posts
      : posts.filter((p) => p.type && typeValues.includes(p.type));

  const favoritePosts = posts.filter((p) => favoritedIds.has(p.id));
  const myUploads = posts.filter(
    (p) => profile && p.uploaded_by_id === String(profile.id)
  );

  const tabs = [
    { key: "gallery", label: "Gallery", icon: <Images size={16} /> },
    { key: "favorites", label: "My Favorites", icon: <Heart size={16} /> },
    { key: "uploads", label: "My Uploads", icon: <Upload size={16} /> },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Inspiration</h1>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            {/* Gallery Tab */}
            {activeTab === "gallery" && (
              <div className="space-y-4">
                {/* Category filter */}
                <div className="flex flex-wrap gap-2">
                  {CABINET_TYPES.map((type) => (
                    <button
                      key={type.label}
                      onClick={() => setSelectedType(type.label)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        selectedType === type.label
                          ? "bg-brand-primary text-white"
                          : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {filteredPosts.length === 0 ? (
                  <EmptyState
                    title="No inspiration images"
                    description="No images found for this category."
                    icon={<Images size={48} className="text-gray-300" />}
                  />
                ) : (
                  <InspirationGrid
                    posts={filteredPosts}
                    favoritedIds={favoritedIds}
                    onToggleFavorite={toggleFavorite}
                  />
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <div>
                {favoritePosts.length === 0 ? (
                  <EmptyState
                    title="No favorites yet"
                    description="Heart some images in the gallery to see them here!"
                    icon={<Heart size={48} className="text-gray-300" />}
                    actionLabel="Browse Gallery"
                    onAction={() => setActiveTab("gallery")}
                  />
                ) : (
                  <InspirationGrid
                    posts={favoritePosts}
                    favoritedIds={favoritedIds}
                    onToggleFavorite={toggleFavorite}
                  />
                )}
              </div>
            )}

            {/* Uploads Tab */}
            {activeTab === "uploads" && (
              <div className="space-y-6">
                {/* Upload section */}
                <div className="bg-white rounded-lg border p-4 space-y-3">
                  <h3 className="font-medium text-text-primary">
                    Upload New Image
                  </h3>
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">
                        Category
                      </label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                      >
                        <option value="Kitchen">Kitchen</option>
                        <option value="Bathroom">Bathroom</option>
                        <option value="Office">Office</option>
                        <option value="Living">Living Room</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <FileUpload
                        onUpload={handleUpload}
                        accept="image/*"
                        label="Drop image here or click to upload"
                        isLoading={isUploading}
                      />
                    </div>
                  </div>
                </div>

                {myUploads.length === 0 ? (
                  <EmptyState
                    title="No uploads yet"
                    description="Upload your own inspiration images above!"
                    icon={<Upload size={48} className="text-gray-300" />}
                  />
                ) : (
                  <InspirationGrid
                    posts={myUploads}
                    favoritedIds={favoritedIds}
                    onToggleFavorite={toggleFavorite}
                    onDelete={handleDelete}
                    showDelete
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
