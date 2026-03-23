"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { TabBar } from "@/components/ui/TabBar";
import { ProgressDonut } from "@/components/ui/ProgressDonut";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Loader } from "@/components/ui/Loader";
import { Timeline } from "@/components/projects/Timeline";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { InspirationGrid } from "@/components/inspiration/InspirationGrid";
import {
  ArrowLeft,
  Clock,
  FileText,
  MessageSquare,
  Image,
  Receipt,
  Bell,
} from "lucide-react";
import type {
  Project,
  ProjectStage,
  ProjectUpdate,
  ProjectMessage,
  ProjectDocument,
  Invoice,
  InspirationPost,
} from "@/lib/types/database";

const TABS = [
  { key: "timeline", label: "Timeline", icon: <Clock size={16} /> },
  { key: "updates", label: "Updates", icon: <Bell size={16} /> },
  { key: "details", label: "Details", icon: <FileText size={16} /> },
  { key: "messages", label: "Messages", icon: <MessageSquare size={16} /> },
  { key: "documents", label: "Documents", icon: <Receipt size={16} /> },
  { key: "inspiration", label: "Inspiration", icon: <Image size={16} /> },
];

export default function ProjectDetailsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  const { profile } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");

  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projectManager, setProjectManager] = useState<{
    id: number;
    display_name: string | null;
    profile_pic_url?: string | null;
  } | null>(null);
  const [inspirationPosts, setInspirationPosts] = useState<InspirationPost[]>(
    []
  );
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());
  const [senderNames, setSenderNames] = useState<Record<number, string>>({});

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch project
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      setProject(projectData as Project | null);

      // Fetch stages
      const { data: stagesData } = await supabase
        .from("project_stages")
        .select("*")
        .eq("project_id", projectId)
        .order("stage_number");

      setStages((stagesData as ProjectStage[]) || []);

      // Fetch updates
      const { data: updatesData } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      setUpdates((updatesData as ProjectUpdate[]) || []);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from("project_messages")
        .select("*")
        .eq("project_id", projectId)
        .order("timpstamp", { ascending: true });

      setMessages((messagesData as ProjectMessage[]) || []);

      // Fetch documents
      const { data: documentsData } = await supabase
        .from("project_documents")
        .select("*")
        .eq("project_id", projectId);

      setDocuments((documentsData as ProjectDocument[]) || []);

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .eq("project_id", projectId);

      setInvoices((invoicesData as Invoice[]) || []);

      // Fetch project manager
      if (projectData?.project_manager_id) {
        const { data: pmData } = await supabase
          .from("v_profiles_public")
          .select("*")
          .eq("id", projectData.project_manager_id)
          .single();

        if (pmData) {
          setProjectManager(
            pmData as {
              id: number;
              display_name: string | null;
              profile_pic_url?: string | null;
            }
          );
        }
      }

      // Fetch related inspiration posts
      const { data: relatedPostRows } = await supabase
        .from("projects_posts")
        .select("post_id")
        .eq("project_id", projectId);

      const relatedPostIds = (relatedPostRows || [])
        .map((r: { post_id: number | null }) => r.post_id)
        .filter(Boolean) as number[];

      if (relatedPostIds.length > 0) {
        const { data: postsData } = await supabase
          .from("inspiration_posts")
          .select("*")
          .in("id", relatedPostIds);

        setInspirationPosts((postsData as InspirationPost[]) || []);
      }

      // Fetch favorited posts
      const { data: favoritedRows } = await supabase
        .from("favorited_posts")
        .select("post_id")
        .eq("profile_id", profile.id);

      const favSet = new Set<number>(
        (favoritedRows || [])
          .map((r: { post_id: number | null }) => r.post_id)
          .filter(Boolean) as number[]
      );
      setFavoritedIds(favSet);

      // Fetch sender profiles for chat
      const { data: profilesData } = await supabase
        .from("v_profiles_public")
        .select("*");

      const namesMap: Record<number, string> = {};
      (profilesData || []).forEach((p: { id: number; display_name: string | null }) => {
        if (p.display_name) {
          namesMap[p.id] = p.display_name;
        }
      });
      setSenderNames(namesMap);

      setLoading(false);
    };

    fetchData();
  }, [projectId, profile, supabase]);

  // ---------------------------------------------------------------------------
  // Realtime subscription for messages
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${projectId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as ProjectMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleMarkAsRead = useCallback(
    async (updateId: number) => {
      await supabase
        .from("project_updates")
        .update({ read: true })
        .eq("id", updateId);

      setUpdates((prev) =>
        prev.map((u) => (u.id === updateId ? { ...u, read: true } : u))
      );
    },
    [supabase]
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!profile || !project) return;

      await supabase.from("project_messages").insert({
        senderId: profile.id,
        recieverId: project.project_manager_id,
        text,
        project_id: Number(projectId),
      });
    },
    [profile, project, projectId, supabase]
  );

  const handleUploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      const filePath = `${projectId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("project-files")
        .upload(filePath, file);

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("project-files").getPublicUrl(filePath);

      return publicUrl;
    },
    [projectId, supabase]
  );

  const handleToggleFavorite = useCallback(
    async (postId: number) => {
      if (!profile) return;

      if (favoritedIds.has(postId)) {
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

        setFavoritedIds((prev) => {
          const next = new Set(prev);
          next.add(postId);
          return next;
        });
      }
    },
    [profile, favoritedIds, supabase]
  );

  // ---------------------------------------------------------------------------
  // Currency formatter
  // ---------------------------------------------------------------------------
  const formatCurrency = (value: number | null) => {
    if (value == null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-text-primary">
            Project not found
          </h2>
          <Link
            href="/home"
            className="mt-4 inline-flex items-center gap-2 text-brand-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back button */}
      <Link
        href="/home"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      {/* Project header */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary">
                {project.name || "Untitled Project"}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            {project.step_name && (
              <p className="text-sm text-text-secondary mt-1">
                Current Step: {project.step_name}
              </p>
            )}
            {projectManager && (
              <div className="flex items-center gap-2 mt-3">
                {projectManager.profile_pic_url ? (
                  <img
                    src={projectManager.profile_pic_url}
                    alt={projectManager.display_name || "PM"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-semibold">
                    {(projectManager.display_name || "PM")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-text-secondary">
                  Project Manager:{" "}
                  <span className="font-medium text-text-primary">
                    {projectManager.display_name || "—"}
                  </span>
                </span>
              </div>
            )}
          </div>

          <ProgressDonut progress={project.progress ?? 0} size={80} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6">
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab content */}
      <div>
        {/* ----------------------------------------------------------------- */}
        {/* Timeline Tab                                                       */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "timeline" && (
          <div className="bg-white rounded-lg border p-6">
            <Timeline stages={stages} currentStep={project.step} />
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Updates Tab                                                        */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "updates" && (
          <div className="space-y-4">
            {updates.length === 0 && (
              <p className="text-center text-text-secondary text-sm py-8">
                No updates yet.
              </p>
            )}
            {updates.map((update) => (
              <div
                key={update.id}
                className={`bg-white rounded-lg border p-5 ${
                  !update.read ? "border-l-4 border-l-brand-accent" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">
                      {update.title || "Update"}
                    </h3>
                    {update.message && (
                      <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
                        {update.message}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary mt-2">
                      {update.Last_update
                        ? new Date(update.Last_update).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {update.read ? (
                      <span className="text-xs text-green-600 font-medium">
                        Read
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAsRead(update.id)}
                        className="text-xs px-3 py-1.5 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Details Tab                                                        */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Name", value: project.name || "—" },
              {
                label: "Description",
                value: project.description || "—",
              },
              { label: "Status", value: project.status || "—" },
              {
                label: "Stage Name",
                value: project.stage_name || "—",
              },
              {
                label: "Step Name",
                value: project.step_name || "—",
              },
              {
                label: "Progress",
                value:
                  project.progress != null
                    ? `${project.progress}%`
                    : "—",
              },
              {
                label: "Value",
                value: formatCurrency(project.value),
              },
              {
                label: "Assigned To",
                value: project.assigned_to_name || "—",
              },
              {
                label: "Estimated Finish Date",
                value: project.estimated_step_finish_date
                  ? new Date(
                      project.estimated_step_finish_date
                    ).toLocaleDateString()
                  : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-lg border p-4"
              >
                <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-sm text-text-primary mt-1 font-medium">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Messages Tab                                                       */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "messages" && profile && (
          <ChatMessages
            messages={messages}
            currentProfileId={profile.id}
            recipientId={project.project_manager_id}
            projectId={Number(projectId)}
            onSendMessage={handleSendMessage}
            onUploadFile={handleUploadFile}
            senderNames={senderNames}
          />
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Documents Tab                                                      */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "documents" && (
          <div className="space-y-8">
            {/* Documents section */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Documents
              </h2>
              {documents.length === 0 ? (
                <p className="text-center text-text-secondary text-sm py-8">
                  No documents available.
                </p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-lg border p-4 flex items-center gap-4"
                    >
                      <div className="p-2 bg-blue-50 rounded-lg text-brand-primary shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-text-primary truncate">
                          {doc.title || "Untitled Document"}
                        </h4>
                        {doc.description && (
                          <p className="text-sm text-text-secondary truncate">
                            {doc.description}
                          </p>
                        )}
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline shrink-0"
                        >
                          <FileText size={14} />
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoices section */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Invoices
              </h2>
              {invoices.length === 0 ? (
                <p className="text-center text-text-secondary text-sm py-8">
                  No invoices available.
                </p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="bg-white rounded-lg border p-4 flex items-center gap-4"
                    >
                      <div className="p-2 bg-green-50 rounded-lg text-green-600 shrink-0">
                        <Receipt size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-text-primary">
                            {invoice.invoice_number || "—"}
                          </h4>
                          {invoice.status && (
                            <StatusBadge status={invoice.status} />
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">
                          {invoice.title || "Untitled Invoice"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-text-primary">
                          {formatCurrency(invoice.amount_due)}
                        </p>
                        {invoice.due_date && (
                          <p className="text-xs text-text-secondary">
                            Due:{" "}
                            {new Date(
                              invoice.due_date
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Inspiration Tab                                                    */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "inspiration" && (
          <div className="bg-white rounded-lg border p-6">
            <InspirationGrid
              posts={inspirationPosts}
              favoritedIds={favoritedIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
