"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Loader } from "@/components/ui/Loader";
import { User, Phone, MapPin, Camera, ArrowRight, ArrowLeft, Check } from "lucide-react";

export default function CustomerOnboardingPage() {
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    display_name: "",
    phone: "",
    address: "",
    user_type: "homeowner",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-up");
      return;
    }
    if (profile) {
      if (profile.onboarding_completed) {
        router.replace("/home");
        return;
      }
      setOnboardingData((prev) => ({
        ...prev,
        display_name: profile.display_name || "",
        phone: profile.phone || "",
      }));
    }
  }, [user, profile, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleComplete = async () => {
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
          display_name: onboardingData.display_name,
          phone: onboardingData.phone,
          profile_pic_url: profilePicUrl,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      // Update linked contact if exists
      if (profile.contact_id) {
        await supabase
          .from("contacts")
          .update({
            phone: onboardingData.phone,
            full_address: onboardingData.address,
          })
          .eq("id", profile.contact_id);
      }

      await refreshProfile();
      router.replace("/home");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader size="lg" />
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Profile" },
    { num: 2, label: "Details" },
    { num: 3, label: "Photo" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-primary to-brand-accent flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Welcome to Concept 32</h1>
          <p className="text-blue-200 text-sm mt-1">
            Let&apos;s set up your profile
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= s.num
                    ? "bg-white text-brand-primary"
                    : "bg-white/20 text-white/60"
                }`}
              >
                {currentStep > s.num ? <Check size={16} /> : s.num}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  currentStep >= s.num ? "text-white" : "text-white/40"
                }`}
              >
                {s.label}
              </span>
              {s.num < 3 && (
                <div
                  className={`w-8 h-0.5 ${
                    currentStep > s.num ? "bg-white" : "bg-white/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8">
          {/* Step 1: Name & Phone */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Basic Information
              </h2>
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
                    value={onboardingData.display_name}
                    onChange={(e) =>
                      setOnboardingData((prev) => ({
                        ...prev,
                        display_name: e.target.value,
                      }))
                    }
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                  />
                </div>
              </div>
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
                    value={onboardingData.phone}
                    onChange={(e) =>
                      setOnboardingData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="(555) 123-4567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address & User Type */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Additional Details
              </h2>
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
                    value={onboardingData.address}
                    onChange={(e) =>
                      setOnboardingData((prev) => ({
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
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "homeowner", label: "Homeowner" },
                    { value: "design_partner", label: "Design Partner" },
                    { value: "builder", label: "Builder" },
                    { value: "other", label: "Other" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setOnboardingData((prev) => ({
                          ...prev,
                          user_type: opt.value,
                        }))
                      }
                      className={`px-4 py-2.5 rounded-md text-sm font-medium border transition-colors ${
                        onboardingData.user_type === opt.value
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white text-text-primary border-gray-300 hover:border-brand-accent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Profile Picture */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Profile Picture (Optional)
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={40} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-brand-bg text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={
                  currentStep === 1 && !onboardingData.display_name.trim()
                }
                className="flex items-center gap-1 bg-brand-primary text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center gap-1 bg-green-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader size="sm" className="text-white" />
                ) : (
                  <>
                    Complete <Check size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
