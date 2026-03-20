"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: number[];
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (data) setProfile(data as Profile);
      return data as Profile | null;
    },
    [supabase]
  );

  const fetchRoles = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", userId);
      const roleIds = (data || []).map((r) => r.role_id).filter(Boolean) as number[];
      setRoles(roleIds);
      return roleIds;
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
      await fetchRoles(user.id);
    }
  }, [user, fetchProfile, fetchRoles]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
          await fetchRoles(currentSession.user.id);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
        await fetchRoles(newSession.user.id);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile, fetchRoles]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, roles, isLoading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
