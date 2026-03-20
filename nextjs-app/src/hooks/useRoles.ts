"use client";

import { useAuth } from "@/providers/AuthProvider";

export function useRoles() {
  const { roles, isLoading } = useAuth();
  const isAdmin = roles.includes(2);
  const isEmployee = roles.includes(3);
  const isCustomer = roles.includes(1);
  const isPartner = roles.includes(4);
  const isProjectManager = roles.includes(5);
  const isStaff = isAdmin || isEmployee || isProjectManager;
  return { roles, isAdmin, isEmployee, isCustomer, isPartner, isProjectManager, isStaff, isLoading };
}
