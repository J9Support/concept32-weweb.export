"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Loader } from "@/components/ui/Loader";
import { User, Phone, MapPin, Camera, Check } from "lucide-react";

export default function WelcomePage() {
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(true);
  const [formData, setFormData] = useState({
    display_name: "",
    phone: "",
    address: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Redirect if not authenticated or already onboarded
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-up");
      return;
    }
    if (profile && profile.onboarding_completed) {
      router.replace("/home");
      return;
    }
  }, [user, profile, authLoading, router]);

  // Load existing contact data to pre-fill form
  useEffect(() => {
    if (!profile?.contact_id) {
      setContactLoading(false);
      return;
    }

    const loadContact = async () => {
      const { data: contact } = await supabase
        .from("contacts")
        .select("first_name, last_name, phone, full_address")
        .eq("id", profile.contact_id)
        .single();

      if (contact) {
        const contactName = [contact.first_name, contact.last_name]
          .filter(Boolean)
          .join(" ");

        setFormData({
          display_name: profile.display_name || contactName || "",
          phone: contact.phone || profile.phone || "",
          address: contact.full_address || "",
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          display_name: profile.display_name || "",
          phone: profile.phone || "",
        }));
      }
      setContactLoading(false);
    };

    loadContact();
  }, [profile, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleConfirm = async () => {
    if (!user || !profile) return;
    setIsLoading(true);

    try {
      let profilePicUrl = profile.profile_pic_url;

      // Upload profile picture if selected
      if (uploadedFile) {
        const ext = uploadedFile.name.split(".").pop();
        const path = `profile-pics/${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, uploadedFile, { upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(path);
          profilePicUrl = publicUrl;
        }
      }

      // Update profile
      await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          phone: formData.phone,
          profile_pic_url: profilePicUrl,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      // Update linked contact
      if (profile.contact_id) {
        await supabase
          .from("contacts")
          .update({
            phone: formData.phone,
            full_address: formData.address,
          })
          .eq("id", profile.contact_id);
      }

      await refreshProfile();
      router.replace("/home");
    } catch (error) {
      console.error("Welcome confirmation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || contactLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-primary to-brand-accent flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="text-blue-200 text-sm mt-1">
            Please confirm your details to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8">
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={32} className="text-gray-300" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-brand-bg text-text-primary px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors">
                Add Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_name: e.target.value,
                    }))
                  }
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Address
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-3 text-text-secondary"
                />
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="123 Main St, Denver, CO 80202"
                  rows={2}
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={handleConfirm}
              disabled={isLoading || !formData.display_name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader size="sm" className="text-white" />
              ) : (
                <>
                  Confirm &amp; Continue <Check size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
