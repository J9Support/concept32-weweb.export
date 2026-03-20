"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useRoles } from "@/hooks/useRoles";
import {
  Menu,
  X,
  Home,
  Sparkles,
  Shield,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

export function NavBar() {
  const { user, profile, signOut } = useAuth();
  const { isStaff } = useRoles();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-up");
  };

  const navLinks = [
    { href: "/home", label: "Home", icon: <Home size={18} /> },
    { href: "/inspiration", label: "Inspiration", icon: <Sparkles size={18} /> },
  ];

  if (isStaff) {
    navLinks.push({
      href: "/admin-home",
      label: "Admin",
      icon: <Shield size={18} />,
    });
  }

  if (!user) return null;

  return (
    <nav className="bg-brand-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 shrink-0">
            <div className="text-lg font-bold tracking-tight">Concept 32</div>
            <span className="hidden sm:inline text-xs text-blue-200 border-l border-blue-300/40 pl-2 ml-1">
              Closet &amp; Storage Concepts
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Profile Dropdown */}
          <div className="hidden md:flex items-center" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              {profile?.profile_pic_url ? (
                <img
                  src={profile.profile_pic_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-sm font-medium">
                  {profile?.display_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span className="text-sm font-medium max-w-[120px] truncate">
                {profile?.display_name || "User"}
              </span>
              <ChevronDown size={14} />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-4 top-14 bg-white rounded-lg shadow-xl border py-1 min-w-[180px] z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-text-primary">
                    {profile?.display_name}
                  </p>
                  <p className="text-xs text-text-secondary">{profile?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-white/10"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/20">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                  pathname.startsWith(link.href)
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex items-center gap-3 px-3 py-2">
                {profile?.profile_pic_url ? (
                  <img
                    src={profile.profile_pic_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-sm font-medium">
                    {profile?.display_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{profile?.display_name}</p>
                  <p className="text-xs text-blue-200">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-300 hover:bg-white/10"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
