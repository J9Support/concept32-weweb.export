"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Project } from "@/lib/types/database";
import {
  Sparkles,
  Pencil,
  X,
  Check,
  Camera,
} from "lucide-react";

export default function HomePage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    display_name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileFormData({
        display_name: profile.display_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!profile) return;
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects((data as Project[]) || []);
      setIsLoading(false);
    };
    fetchProjects();
  }, [profile, supabase]);

  const handleProfileSave = async () => {
    if (!profile) return;
    await supabase
      .from("profiles")
      .update({
        display_name: profileFormData.display_name,
        phone: profileFormData.phone,
      })
      .eq("id", profile.id);
    await refreshProfile();
    setIsEditingProfile(false);
  };

  const handleProfilePicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    const ext = file.name.split(".").pop();
    const path = `profile-pics/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase
        .from("profiles")
        .update({ profile_pic_url: publicUrl })
        .eq("id", profile.id);
      await refreshProfile();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-100 shrink-0">
                {profile?.profile_pic_url ? (
                  <img
                    src={profile.profile_pic_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary text-2xl font-bold">
                    {profile?.display_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {isEditingProfile ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={profileFormData.display_name}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        display_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                    placeholder="Display name"
                  />
                  <input
                    type="tel"
                    value={profileFormData.phone}
                    onChange={(e) =>
                      setProfileFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                    placeholder="Phone number"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleProfileSave}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-primary/90"
                    >
                      <Check size={14} /> Save
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-text-primary rounded-md text-sm hover:bg-gray-200"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-text-primary">
                      {profile?.display_name || "Welcome"}
                    </h2>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="p-1 text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {profile?.email}
                  </p>
                  {profile?.phone && (
                    <p className="text-sm text-text-secondary">
                      {profile.phone}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">
            My Projects
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="No active projects yet"
              description="You don't have any active projects yet. Check out some inspiration for your next project!"
              actionLabel="Browse Inspiration"
              onAction={() => router.push("/inspiration")}
              icon={<Sparkles size={48} className="text-brand-accent/50" />}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
