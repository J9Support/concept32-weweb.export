"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { TabBar } from "@/components/ui/TabBar";
import { ProgressDonut } from "@/components/ui/ProgressDonut";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { FileUpload } from "@/components/ui/FileUpload";
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
  Pencil,
  Plus,
  Trash2,
  Save,
  X,
  Link2,
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

const STATUS_OPTIONS = ["Pending", "Active", "In Progress", "Completed", "Cancelled"];

export default function AdminProjectEditPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { profile } = useAuth();
  const supabase = createClient();
  const projectId = Number(params.projectId);

  // Data states
  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<InspirationPost[]>([]);
  const [allPosts, setAllPosts] = useState<InspirationPost[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());
  const [senderNames, setSenderNames] = useState<Record<number, string>>({});
  const [pmName, setPmName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // UI states
  const [activeTab, setActiveTab] = useState("details");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});

  // Stage editing
  const [showAddStage, setShowAddStage] = useState(false);
  const [editingStageId, setEditingStageId] = useState<number | null>(null);
  const [stageForm, setStageForm] = useState({
    stage_number: 1,
    stage_name: "",
    description: "",
    estimaed_days: "",
    project_status: "Pending",
  });

  // Update editing
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<number | null>(null);
  const [updateForm, setUpdateForm] = useState({ title: "", message: "" });

  // Document upload
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocDescription, setNewDocDescription] = useState("");

  // Inspiration linking
  const [showLinkInspiration, setShowLinkInspiration] = useState(false);
  const [relatedPostIds, setRelatedPostIds] = useState<number[]>([]);

  const fetchAll = useCallback(async () => {
    if (!profile) return;
    setIsLoading(true);

    const [
      projectRes,
      stagesRes,
      updatesRes,
      messagesRes,
      docsRes,
      invoicesRes,
      postsLinksRes,
      allPostsRes,
      favsRes,
      profilesRes,
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase.from("project_stages").select("*").eq("project_id", projectId).order("stage_number"),
      supabase.from("project_updates").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("project_messages").select("*").eq("project_id", projectId).order("timpstamp", { ascending: true }),
      supabase.from("project_documents").select("*").eq("project_id", projectId),
      supabase.from("invoices").select("*").eq("project_id", projectId),
      supabase.from("projects_posts").select("post_id").eq("project_id", projectId),
      supabase.from("inspiration_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("favorited_posts").select("post_id").eq("profile_id", profile.id),
      supabase.from("v_profiles_public").select("*"),
    ]);

    const proj = projectRes.data as Project | null;
    setProject(proj);
    if (proj) {
      setEditForm(proj);
    }

    setStages((stagesRes.data as ProjectStage[]) || []);
    setUpdates((updatesRes.data as ProjectUpdate[]) || []);
    setMessages((messagesRes.data as ProjectMessage[]) || []);
    setDocuments((docsRes.data as ProjectDocument[]) || []);
    setInvoices((invoicesRes.data as Invoice[]) || []);

    const linkedIds = ((postsLinksRes.data || []) as { post_id: number | null }[])
      .map((r) => r.post_id)
      .filter(Boolean) as number[];
    setRelatedPostIds(linkedIds);

    const allInspirationPosts = (allPostsRes.data as InspirationPost[]) || [];
    setAllPosts(allInspirationPosts);
    setRelatedPosts(allInspirationPosts.filter((p) => linkedIds.includes(p.id)));

    setFavoritedIds(
      new Set(
        ((favsRes.data || []) as { post_id: number | null }[])
          .map((f) => f.post_id)
          .filter(Boolean) as number[]
      )
    );

    const nameMap: Record<number, string> = {};
    ((profilesRes.data || []) as { id: number; display_name: string | null }[]).forEach(
      (p) => {
        nameMap[p.id] = p.display_name || "User";
      }
    );
    setSenderNames(nameMap);

    if (proj?.project_manager_id) {
      setPmName(nameMap[proj.project_manager_id] || "");
    }

    setIsLoading(false);
  }, [supabase, projectId, profile]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime messages
  useEffect(() => {
    const channel = supabase
      .channel(`admin-messages-${projectId}`)
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
  }, [supabase, projectId]);

  // ============ PROJECT EDIT ============
  const handleSaveProject = async () => {
    setIsSaving(true);
    await supabase
      .from("projects")
      .update({
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
        step_name: editForm.step_name,
        step: editForm.step,
        progress: editForm.progress,
        value: editForm.value,
        estimated_step_finish_date: editForm.estimated_step_finish_date,
        thumbnail_url: editForm.thumbnail_url,
      })
      .eq("id", projectId);
    await fetchAll();
    setIsEditMode(false);
    setIsSaving(false);
  };

  // ============ STAGES ============
  const handleSaveStage = async () => {
    if (editingStageId) {
      await supabase
        .from("project_stages")
        .update(stageForm)
        .eq("id", editingStageId);
    } else {
      await supabase
        .from("project_stages")
        .insert({ ...stageForm, project_id: projectId });
    }
    setShowAddStage(false);
    setEditingStageId(null);
    setStageForm({ stage_number: 1, stage_name: "", description: "", estimaed_days: "", project_status: "Pending" });
    await fetchAll();
  };

  const handleDeleteStage = async (id: number) => {
    if (!confirm("Delete this stage?")) return;
    await supabase.from("project_stages").delete().eq("id", id);
    await fetchAll();
  };

  const startEditStage = (stage: ProjectStage) => {
    setEditingStageId(stage.id);
    setStageForm({
      stage_number: stage.stage_number || 1,
      stage_name: stage.stage_name || "",
      description: stage.description || "",
      estimaed_days: stage.estimaed_days || "",
      project_status: stage.project_status || "Pending",
    });
    setShowAddStage(true);
  };

  // ============ UPDATES ============
  const handleSaveUpdate = async () => {
    if (editingUpdateId) {
      await supabase
        .from("project_updates")
        .update({ title: updateForm.title, message: updateForm.message })
        .eq("id", editingUpdateId);
    } else {
      await supabase
        .from("project_updates")
        .insert({ ...updateForm, project_id: projectId });
    }
    setShowAddUpdate(false);
    setEditingUpdateId(null);
    setUpdateForm({ title: "", message: "" });
    await fetchAll();
  };

  const handleDeleteUpdate = async (id: number) => {
    if (!confirm("Delete this update?")) return;
    await supabase.from("project_updates").delete().eq("id", id);
    await fetchAll();
  };

  const startEditUpdate = (update: ProjectUpdate) => {
    setEditingUpdateId(update.id);
    setUpdateForm({
      title: update.title || "",
      message: update.message || "",
    });
    setShowAddUpdate(true);
  };

  // ============ DOCUMENTS ============
  const handleUploadDoc = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `project-${projectId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("project-files")
      .upload(path, file);

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("project-files").getPublicUrl(path);

    await supabase.from("project_documents").insert({
      url: publicUrl,
      title: newDocTitle || file.name,
      description: newDocDescription,
      project_id: projectId,
    });

    setShowUploadDoc(false);
    setNewDocTitle("");
    setNewDocDescription("");
    await fetchAll();
  };

  const handleDeleteDoc = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    await supabase.from("project_documents").delete().eq("id", id);
    await fetchAll();
  };

  // ============ MESSAGES ============
  const handleSendMessage = async (text: string) => {
    if (!profile || !project) return;
    const recipientId = project.profile_id !== profile.id
      ? project.profile_id
      : project.project_manager_id;
    await supabase.from("project_messages").insert({
      senderId: profile.id,
      recieverId: recipientId,
      text,
      project_id: projectId,
    });
  };

  const handleUploadFile = async (file: File): Promise<string | null> => {
    const path = `project-${projectId}/chat/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("project-files")
      .upload(path, file);
    if (error) return null;
    return supabase.storage.from("project-files").getPublicUrl(path).data.publicUrl;
  };

  // ============ INSPIRATION ============
  const handleLinkPost = async (postId: number) => {
    if (relatedPostIds.includes(postId)) return;
    await supabase
      .from("projects_posts")
      .insert({ post_id: postId, project_id: projectId });
    await fetchAll();
  };

  const handleUnlinkPost = async (postId: number) => {
    await supabase
      .from("projects_posts")
      .delete()
      .eq("post_id", postId)
      .eq("project_id", projectId);
    await fetchAll();
  };

  const toggleFavorite = async (postId: number) => {
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
      setFavoritedIds((prev) => new Set([...prev, postId]));
    }
  };

  // ============ TABS ============
  const tabs = [
    { key: "details", label: "Details", icon: <FileText size={16} /> },
    { key: "timeline", label: "Timeline", icon: <Clock size={16} /> },
    { key: "updates", label: "Updates", icon: <Bell size={16} /> },
    { key: "messages", label: "Messages", icon: <MessageSquare size={16} /> },
    { key: "documents", label: "Documents", icon: <Receipt size={16} /> },
    { key: "inspiration", label: "Inspiration", icon: <Image size={16} /> },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-text-secondary">Project not found.</p>
          <Link href="/admin-home" className="text-brand-accent hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back */}
        <Link
          href="/admin-home"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {project.thumbnail_url ? (
                <img
                  src={project.thumbnail_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary text-xl font-bold">
                  {project.name?.[0] || "P"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-text-primary">
                  {project.name || "Untitled"}
                </h1>
                <StatusBadge status={project.status} />
              </div>
              {project.step_name && (
                <p className="text-sm text-brand-accent mt-1">{project.step_name}</p>
              )}
              {pmName && (
                <p className="text-xs text-text-secondary mt-1">PM: {pmName}</p>
              )}
            </div>
            <ProgressDonut progress={project.progress || 0} size={64} strokeWidth={6} />
          </div>
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ===== DETAILS TAB ===== */}
        {activeTab === "details" && (
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Project Details</h2>
              {!isEditMode ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
                >
                  <Pencil size={14} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save size={14} /> {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setEditForm(project);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <select
                    value={editForm.status || "Pending"}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Step Name</label>
                  <input
                    type="text"
                    value={editForm.step_name || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, step_name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Step #</label>
                  <input
                    type="number"
                    value={editForm.step ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, step: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Progress (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editForm.progress ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, progress: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Value ($)</label>
                  <input
                    type="number"
                    value={editForm.value ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, value: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Est. Finish Date</label>
                  <input
                    type="date"
                    value={editForm.estimated_step_finish_date || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, estimated_step_finish_date: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Thumbnail URL</label>
                  <input
                    type="text"
                    value={editForm.thumbnail_url || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, thumbnail_url: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Name", project.name],
                  ["Status", project.status],
                  ["Description", project.description],
                  ["Step Name", project.step_name],
                  ["Step #", project.step],
                  ["Progress", project.progress != null ? `${project.progress}%` : null],
                  ["Value", project.value != null ? `$${Number(project.value).toLocaleString()}` : null],
                  ["Assigned To", project.assigned_to_name],
                  ["Est. Finish", project.estimated_step_finish_date],
                  ["Project Manager", pmName || null],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-text-primary mt-0.5">{(value as string) || "—"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== TIMELINE TAB ===== */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Timeline</h2>
              <button
                onClick={() => {
                  setEditingStageId(null);
                  setStageForm({
                    stage_number: stages.length + 1,
                    stage_name: "",
                    description: "",
                    estimaed_days: "",
                    project_status: "Pending",
                  });
                  setShowAddStage(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
              >
                <Plus size={14} /> Add Stage
              </button>
            </div>

            <Timeline stages={stages} currentStep={project.step} />

            {/* Stage cards with edit/delete */}
            <div className="space-y-2 mt-4">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between bg-white border rounded-lg p-3"
                >
                  <div>
                    <span className="text-sm font-medium">
                      Stage {stage.stage_number}: {stage.stage_name}
                    </span>
                    <span className="ml-2 text-xs text-text-secondary">
                      ({stage.project_status})
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditStage(stage)}
                      className="p-1.5 text-text-secondary hover:text-brand-primary rounded"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteStage(stage.id)}
                      className="p-1.5 text-text-secondary hover:text-red-500 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Stage Modal */}
            <Modal
              isOpen={showAddStage}
              onClose={() => {
                setShowAddStage(false);
                setEditingStageId(null);
              }}
              title={editingStageId ? "Edit Stage" : "Add Stage"}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Stage #</label>
                    <input
                      type="number"
                      value={stageForm.stage_number}
                      onChange={(e) =>
                        setStageForm((p) => ({ ...p, stage_number: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                    <select
                      value={stageForm.project_status}
                      onChange={(e) =>
                        setStageForm((p) => ({ ...p, project_status: e.target.value }))
                      }
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Stage Name</label>
                  <input
                    type="text"
                    value={stageForm.stage_name}
                    onChange={(e) =>
                      setStageForm((p) => ({ ...p, stage_name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                  <textarea
                    value={stageForm.description}
                    onChange={(e) =>
                      setStageForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Estimated Days</label>
                  <input
                    type="text"
                    value={stageForm.estimaed_days}
                    onChange={(e) =>
                      setStageForm((p) => ({ ...p, estimaed_days: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <button
                  onClick={handleSaveStage}
                  className="w-full py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-primary/90"
                >
                  {editingStageId ? "Update Stage" : "Add Stage"}
                </button>
              </div>
            </Modal>
          </div>
        )}

        {/* ===== UPDATES TAB ===== */}
        {activeTab === "updates" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Updates</h2>
              <button
                onClick={() => {
                  setEditingUpdateId(null);
                  setUpdateForm({ title: "", message: "" });
                  setShowAddUpdate(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
              >
                <Plus size={14} /> Post Update
              </button>
            </div>

            {updates.length === 0 ? (
              <p className="text-center text-text-secondary text-sm py-8">No updates yet.</p>
            ) : (
              <div className="space-y-3">
                {updates.map((update) => (
                  <div key={update.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-text-primary">
                            {update.title || "Untitled"}
                          </h3>
                          {!update.read && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          {update.message}
                        </p>
                        <p className="text-xs text-text-secondary mt-2">
                          {update.Last_update
                            ? new Date(update.Last_update).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => startEditUpdate(update)}
                          className="p-1.5 text-text-secondary hover:text-brand-primary"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUpdate(update.id)}
                          className="p-1.5 text-text-secondary hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Update Modal */}
            <Modal
              isOpen={showAddUpdate}
              onClose={() => {
                setShowAddUpdate(false);
                setEditingUpdateId(null);
              }}
              title={editingUpdateId ? "Edit Update" : "Post Update"}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                  <input
                    type="text"
                    value={updateForm.title}
                    onChange={(e) =>
                      setUpdateForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Message</label>
                  <textarea
                    value={updateForm.message}
                    onChange={(e) =>
                      setUpdateForm((p) => ({ ...p, message: e.target.value }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                  />
                </div>
                <button
                  onClick={handleSaveUpdate}
                  className="w-full py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-primary/90"
                >
                  {editingUpdateId ? "Update" : "Post Update"}
                </button>
              </div>
            </Modal>
          </div>
        )}

        {/* ===== MESSAGES TAB ===== */}
        {activeTab === "messages" && (
          <ChatMessages
            messages={messages}
            currentProfileId={profile?.id || 0}
            recipientId={
              project.profile_id !== profile?.id
                ? project.profile_id
                : project.project_manager_id
            }
            projectId={projectId}
            onSendMessage={handleSendMessage}
            onUploadFile={handleUploadFile}
            senderNames={senderNames}
          />
        )}

        {/* ===== DOCUMENTS TAB ===== */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Documents</h2>
              <button
                onClick={() => setShowUploadDoc(!showUploadDoc)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
              >
                <Plus size={14} /> Upload Document
              </button>
            </div>

            {showUploadDoc && (
              <div className="bg-white border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                    <input
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Document title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <input
                      type="text"
                      value={newDocDescription}
                      onChange={(e) => setNewDocDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <FileUpload onUpload={handleUploadDoc} label="Drop document here or click to upload" />
              </div>
            )}

            {documents.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-6">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-white border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-brand-accent" />
                      <div>
                        <a
                          href={doc.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-brand-primary hover:underline"
                        >
                          {doc.title || "Untitled"}
                        </a>
                        {doc.description && (
                          <p className="text-xs text-text-secondary">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 text-text-secondary hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Invoices */}
            {invoices.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-text-primary mb-3">Invoices</h3>
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between bg-white border rounded-lg p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {inv.title || inv.name || `Invoice #${inv.invoice_number}`}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Due: {inv.due_date || "N/A"} · Amount Due:{" "}
                          {inv.amount_due != null
                            ? `$${Number(inv.amount_due).toLocaleString()}`
                            : "N/A"}
                        </p>
                      </div>
                      <StatusBadge status={inv.status || "Pending"} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== INSPIRATION TAB ===== */}
        {activeTab === "inspiration" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Linked Inspiration ({relatedPosts.length})
              </h2>
              <button
                onClick={() => setShowLinkInspiration(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
              >
                <Link2 size={14} /> Link Inspiration
              </button>
            </div>

            {relatedPosts.length === 0 ? (
              <p className="text-center text-text-secondary text-sm py-8">
                No inspiration images linked to this project.
              </p>
            ) : (
              <InspirationGrid
                posts={relatedPosts}
                favoritedIds={favoritedIds}
                onToggleFavorite={toggleFavorite}
                onDelete={handleUnlinkPost}
                showDelete
              />
            )}

            {/* Link Inspiration Modal */}
            <Modal
              isOpen={showLinkInspiration}
              onClose={() => setShowLinkInspiration(false)}
              title="Link Inspiration to Project"
              size="lg"
            >
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allPosts
                    .filter((p) => !relatedPostIds.includes(p.id))
                    .map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handleLinkPost(post.id)}
                        className="cursor-pointer rounded-lg overflow-hidden border hover:border-brand-accent transition-colors"
                      >
                        {post.url ? (
                          <img
                            src={post.url}
                            alt={post.title || ""}
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                            No image
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs font-medium truncate">{post.title || "Untitled"}</p>
                          {post.type && (
                            <p className="text-[10px] text-text-secondary">{post.type}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                {allPosts.filter((p) => !relatedPostIds.includes(p.id)).length === 0 && (
                  <p className="text-center text-text-secondary text-sm py-8">
                    All inspiration posts are already linked.
                  </p>
                )}
              </div>
            </Modal>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
