"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader } from "@/components/ui/Loader";
import { Mail, KeyRound, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCodeError, setSendingCodeError] = useState("");
  const [authVerifyError, setAuthVerifyError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await redirectByRole(session.user.id);
      }
      setCheckingAuth(false);
    };
    checkSession();
  }, []);

  const redirectByRole = async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId);

    const roleIds = (roles || []).map((r) => r.role_id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", userId)
      .single();

    if (profile && !profile.onboarding_completed && roleIds.includes(1)) {
      router.replace("/customer-onboarding");
      return;
    }

    if (roleIds.includes(2) || roleIds.includes(3) || roleIds.includes(5)) {
      router.replace("/admin-home");
    } else {
      router.replace("/home");
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingCodeError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          data: { user_role: "customer" },
        },
      });

      if (error) {
        setSendingCodeError(error.message);
      } else {
        setCodeSent(true);
      }
    } catch (err) {
      setSendingCodeError("Failed to send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthVerifyError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode.trim(),
        type: "email",
      });

      if (error) {
        setAuthVerifyError(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Call provision-customer edge function
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/provision-customer`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: email.trim().toLowerCase() }),
            }
          );
        } catch (provisionError) {
          console.error("Provision error:", provisionError);
        }

        await redirectByRole(data.session.user.id);
      }
    } catch (err) {
      setAuthVerifyError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent">
        <Loader size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary via-brand-primary to-brand-accent p-4">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Concept 32</h1>
          <p className="text-blue-200 text-sm">Closet &amp; Storage Concepts</p>
          <p className="text-blue-100 text-xs mt-1">Client Portal</p>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-text-primary text-center mb-6">
            {codeSent ? "Enter Verification Code" : "Sign In to Your Portal"}
          </h2>

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                  />
                </div>
              </div>

              {sendingCodeError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                  {sendingCodeError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2.5 rounded-md font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader size="sm" className="text-white" />
                ) : (
                  <>
                    Send Code <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-text-secondary text-center">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-text-primary">{email}</span>
              </p>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  Verification Code
                </label>
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    id="otp"
                    type="text"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 text-sm text-center tracking-widest font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
                  />
                </div>
              </div>

              {authVerifyError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                  {authVerifyError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2.5 rounded-md font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader size="sm" className="text-white" />
                ) : (
                  <>
                    Verify &amp; Sign In <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setOtpCode("");
                  setAuthVerifyError("");
                }}
                className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          © {new Date().getFullYear()} Concept 32 Designs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
