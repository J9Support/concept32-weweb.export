import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    // Check if profile already exists for this user (returning user)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*, user_roles:user_roles!user_id(role_id)")
      .eq("user_id", user.id)
      .single();

    if (existingProfile) {
      // Returning user - route based on user_type
      if (existingProfile.user_type === "employee") {
        return NextResponse.json({ redirect: "/admin-home" });
      }

      if (!existingProfile.onboarding_completed) {
        return NextResponse.json({ redirect: "/onboarding" });
      }

      return NextResponse.json({ redirect: "/home" });
    }

    // New user - check employees and contacts tables
    const [employeeResult, contactResult] = await Promise.all([
      supabase
        .from("employees")
        .select("id, display_name")
        .ilike("email", normalizedEmail)
        .limit(1)
        .single(),
      supabase
        .from("contacts")
        .select("id, first_name, last_name, contact_type, phone")
        .ilike("email", normalizedEmail)
        .limit(1)
        .single(),
    ]);

    const employee = employeeResult.data;
    const contact = contactResult.data;

    // --- EMPLOYEE (or both) ---
    if (employee) {
      // Create profile linked to employee
      await supabase.from("profiles").insert({
        user_id: user.id,
        email: normalizedEmail,
        employee_id: employee.id,
        contact_id: contact?.id ?? null,
        display_name: employee.display_name,
        user_type: "employee",
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      });

      // Assign default employee role (3)
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: 3,
        granted_at: new Date().toISOString(),
      });

      return NextResponse.json({ redirect: "/admin-home" });
    }

    // --- EXISTING CONTACT (not employee) ---
    if (contact) {
      // Determine role: partner (4) or customer (1)
      const roleId = contact.contact_type === "partner" ? 4 : 1;

      // Build display name from contact
      const displayName = [contact.first_name, contact.last_name]
        .filter(Boolean)
        .join(" ") || null;

      // Create profile linked to contact
      await supabase.from("profiles").insert({
        user_id: user.id,
        email: normalizedEmail,
        contact_id: contact.id,
        display_name: displayName,
        phone: contact.phone ?? null,
        user_type: "customer",
        onboarding_completed: false,
      });

      // Assign role
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: roleId,
        granted_at: new Date().toISOString(),
      });

      return NextResponse.json({ redirect: "/onboarding" });
    }

    // --- NEW USER (not in employees or contacts) ---
    await supabase.from("profiles").insert({
      user_id: user.id,
      email: normalizedEmail,
      user_type: "customer",
      onboarding_completed: false,
    });

    await supabase.from("user_roles").insert({
      user_id: user.id,
      role_id: 1,
      granted_at: new Date().toISOString(),
    });

    return NextResponse.json({ redirect: "/onboarding" });
  } catch (error) {
    console.error("Provision error:", error);
    return NextResponse.json(
      { error: "Provisioning failed" },
      { status: 500 }
    );
  }
}
