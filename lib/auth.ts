import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminSession } from "@/types/dealership";

const DEMO_ADMIN_COOKIE = "demo-admin-session";

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();

  if (!hasSupabaseConfig) {
    const demoSession = cookieStore.get(DEMO_ADMIN_COOKIE)?.value;

    if (demoSession === "1") {
      return {
        mode: "demo",
        email: siteConfig.demoAdmin.email,
        name: "Demo Admin",
      };
    }

    return null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("email, full_name, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    mode: "supabase",
    email: profile.email || user.email || "",
    name: profile.full_name || user.email || "Admin",
    userId: user.id,
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function signInDemoAdmin(email: string, password: string) {
  const cookieStore = await cookies();

  if (
    email === siteConfig.demoAdmin.email &&
    password === siteConfig.demoAdmin.password
  ) {
    cookieStore.set(DEMO_ADMIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return { success: true as const };
  }

  return {
    success: false as const,
    message: "Use the documented demo admin credentials.",
  };
}

export async function signOutAdmin() {
  const cookieStore = await cookies();

  if (!hasSupabaseConfig) {
    cookieStore.delete(DEMO_ADMIN_COOKIE);
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
}
