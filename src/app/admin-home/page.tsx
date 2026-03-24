"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TabBar } from "@/components/ui/TabBar";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Loader } from "@/components/ui/Loader";
import { InspirationGrid } from "@/components/inspiration/InspirationGrid";
import { FileUpload } from "@/components/ui/FileUpload";
import { Modal } from "@/components/ui/Modal";
import {
  Users,
  Building2,
  Sparkles,
  FolderOpen,
  Search,
  Plus,
  Upload,
} from "lucide-react";
import type {
  Project,
  Contact,
  Company,
  InspirationPost,
} from "@/lib/types/database";

type AdminTab = "projects" | "contacts" | "partners" | "inspiration";
type ProjectsFilter = "active" | "all";

const cabinetTypes = [
  { label: "All", value: "Kitchen,Bathroom,Office,Living,null" },
  { label: "Kitchen", value: "Kitchen" },
  { label: "Bathroom", value: "Bathroom" },
  { label: "Office", value: "Office" },
  { label: "Living Room", value: "Living" },
];

export default function AdminHomePage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useAuth();

  // Tab state
  const [adminSelectedTab, setAdminSelectedTab] = useState<AdminTab>("projects");
  const [projectsFilter, setProjectsFilter] = useState<ProjectsFilter>("active");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(cabinetTypes[0].value);

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [inspirationPosts, setInspirationPosts] = useState<InspirationPost[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Partner modal state
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projectsRes, contactsRes, companiesRes, inspirationRes] =
          await Promise.all([
            supabase
              .from("projects")
              .select("*")
              .order("created_at", { ascending: false }),
            supabase
              .from("contacts")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(100),
            supabase.from("companies").select("*"),
            supabase
              .from("inspiration_posts")
              .select("*")
              .order("created_at", { ascending: false }),
          ]);

        if (projectsRes.data) setProjects(projectsRes.data as Project[]);
        if (contactsRes.data) setContacts(contactsRes.data as Contact[]);
        if (companiesRes.data) setCompanies(companiesRes.data as Company[]);
        if (inspirationRes.data)
          setInspirationPosts(inspirationRes.data as InspirationPost[]);

        // Fetch favorited posts for current profile
        if (profile?.id) {
          const { data: favData } = await supabase
            .from("favorited_posts")
            .select("post_id")
            .eq("profile_id", profile.id);
          if (favData) {
            setFavoritedIds(
              new Set(
                favData
                  .map((f: { post_id: number | null }) => f.post_id)
                  .filter((id: number | null): id is number => id !== null)
              )
            );
          }
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  // ---------- Projects ----------
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !adminSearchQuery ||
      (p.name || "").toLowerCase().includes(adminSearchQuery.toLowerCase());
    const matchesStatus =
      projectsFilter === "all" || p.status !== "Completed";
    return matchesSearch && matchesStatus;
  });

  const projectColumns = [
    { key: "name", label: "Project Name", sortable: true },
    { key: "assigned_to_name", label: "Client Name", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => <StatusBadge status={value || "Pending"} />,
    },
    {
      key: "progress",
      label: "Progress",
      sortable: true,
      render: (value: number | null) => `${value ?? 0}%`,
    },
    { key: "step_name", label: "Step", sortable: true },
    {
      key: "value",
      label: "Value",
      sortable: true,
      render: (value: number | null) =>
        value != null
          ? `$${value.toLocaleString()}`
          : "\u2014",
    },
  ];

  // ---------- Contacts ----------
  const filteredContacts = contacts.filter((c) => {
    if (!adminSearchQuery) return true;
    const q = adminSearchQuery.toLowerCase();
    return (
      (c.first_name || "").toLowerCase().includes(q) ||
      (c.last_name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const contactColumns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (_: any, row: Contact) =>
        `${row.first_name || ""} ${row.last_name || ""}`.trim() || "\u2014",
    },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "city", label: "City", sortable: true },
    { key: "source", label: "Source", sortable: true },
  ];

  // ---------- Partners ----------
  const handleAddPartner = async () => {
    if (!partnerForm.name.trim()) return;
    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: partnerForm.name,
        email: partnerForm.email || null,
        phone: partnerForm.phone || null,
        address: partnerForm.address || null,
      })
      .select()
      .single();

    if (!error && data) {
      setCompanies((prev) => [...prev, data as Company]);
      setPartnerForm({ name: "", email: "", phone: "", address: "" });
      setShowPartnerModal(false);
    } else {
      console.error("Error adding partner:", error);
    }
  };

  // ---------- Inspiration ----------
  const filteredInspirationPosts = inspirationPosts.filter((post) => {
    if (selectedType === cabinetTypes[0].value) return true;
    return post.type === selectedType;
  });

  const handleInspirationUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("inspiration")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("inspiration").getPublicUrl(fileName);

      const typeValue =
        selectedType === cabinetTypes[0].value ? "Kitchen" : selectedType;

      const { data: newPost, error: insertError } = await supabase
        .from("inspiration_posts")
        .insert({
          uploaded_by_id: "Admin",
          type: typeValue,
          url: publicUrl,
        })
        .select()
        .single();

      if (!insertError && newPost) {
        setInspirationPosts((prev) => [newPost as InspirationPost, ...prev]);
      }
    } catch (error) {
      console.error("Inspiration upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteInspirationPost = async (postId: number) => {
    const { error } = await supabase
      .from("inspiration_posts")
      .delete()
      .eq("id", postId);

    if (!error) {
      setInspirationPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleToggleFavorite = async (postId: number) => {
    if (!profile?.id) return;

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
      setFavoritedIds((prev) => new Set(prev).add(postId));
    }
  };

  // ---------- Tabs ----------
  const tabs = [
    {
      key: "projects",
      label: "Projects",
      icon: <FolderOpen size={16} />,
    },
    {
      key: "contacts",
      label: "Contacts",
      icon: <Users size={16} />,
    },
    {
      key: "partners",
      label: "Partners",
      icon: <Building2 size={16} />,
    },
    {
      key: "inspiration",
      label: "Inspiration",
      icon: <Sparkles size={16} />,
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Staff Dashboard
        </h1>

        <TabBar
          tabs={tabs}
          activeTab={adminSelectedTab}
          onTabChange={(key) => setAdminSelectedTab(key as AdminTab)}
        />

        {/* ===== Projects Tab ===== */}
        {adminSelectedTab === "projects" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setProjectsFilter("active")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    projectsFilter === "active"
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    projectsFilter === "active"
                      ? { backgroundColor: "#1B3A5C" }
                      : undefined
                  }
                >
                  Active Projects
                </button>
                <button
                  onClick={() => setProjectsFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    projectsFilter === "all"
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    projectsFilter === "all"
                      ? { backgroundColor: "#1B3A5C" }
                      : undefined
                  }
                >
                  All Projects
                </button>
              </div>
            </div>

            <DataTable
              columns={projectColumns}
              data={filteredProjects}
              onRowClick={(row) =>
                router.push(`/admin-project-edit/${row.id}`)
              }
              emptyMessage="No projects found."
            />
          </div>
        )}

        {/* ===== Contacts Tab ===== */}
        {adminSelectedTab === "contacts" && (
          <div className="space-y-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search contacts by name or email..."
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
              />
            </div>

            <DataTable
              columns={contactColumns}
              data={filteredContacts}
              emptyMessage="No contacts found."
            />
          </div>
        )}

        {/* ===== Partners Tab ===== */}
        {adminSelectedTab === "partners" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Partners
              </h2>
              <button
                onClick={() => setShowPartnerModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#1B3A5C" }}
              >
                <Plus size={16} />
                Add Partner
              </button>
            </div>

            {companies.length === 0 ? (
              <p className="text-center text-text-secondary text-sm py-8">
                No partners yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => {
                  const companyContacts = contacts.filter(
                    (c) => c.company_id === company.id
                  );
                  return (
                    <div
                      key={company.id}
                      className="bg-white rounded-lg border border-gray-200 p-5 space-y-3"
                    >
                      <h3 className="font-semibold text-text-primary">
                        {company.name || "Unnamed Company"}
                      </h3>
                      {company.email && (
                        <p className="text-sm text-text-secondary">
                          {company.email}
                        </p>
                      )}
                      {company.phone && (
                        <p className="text-sm text-text-secondary">
                          {company.phone}
                        </p>
                      )}
                      {company.address && (
                        <p className="text-sm text-text-secondary">
                          {company.address}
                        </p>
                      )}

                      {companyContacts.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                            Contacts
                          </p>
                          <div className="space-y-1">
                            {companyContacts.map((contact) => (
                              <p
                                key={contact.id}
                                className="text-sm text-text-primary"
                              >
                                {contact.first_name} {contact.last_name}
                                {contact.email && (
                                  <span className="text-text-secondary">
                                    {" "}
                                    &middot; {contact.email}
                                  </span>
                                )}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Partner Modal */}
            <Modal
              isOpen={showPartnerModal}
              onClose={() => setShowPartnerModal(false)}
              title="Add Partner"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={partnerForm.name}
                    onChange={(e) =>
                      setPartnerForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={partnerForm.email}
                    onChange={(e) =>
                      setPartnerForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                    placeholder="email@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={partnerForm.phone}
                    onChange={(e) =>
                      setPartnerForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={partnerForm.address}
                    onChange={(e) =>
                      setPartnerForm((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                    placeholder="Company address"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowPartnerModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPartner}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#1B3A5C" }}
                  >
                    Add Partner
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ===== Inspiration Tab ===== */}
        {adminSelectedTab === "inspiration" && (
          <div className="space-y-6">
            {/* Category filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Category
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                >
                  {cabinetTypes.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload section */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Upload size={16} />
                Upload Inspiration Image
              </h3>
              <FileUpload
                onUpload={handleInspirationUpload}
                accept="image/*"
                label="Upload an inspiration image"
                isLoading={isUploading}
              />
            </div>

            {/* Grid */}
            <InspirationGrid
              posts={filteredInspirationPosts}
              favoritedIds={favoritedIds}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteInspirationPost}
              showDelete
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
