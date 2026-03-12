import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { allowDemoAdmin, env, hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminSession } from "@/types/dealership";

const DEMO_ADMIN_COOKIE = "demo-admin-session";
const DEMO_ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

type DemoAdminCookiePayload = {
  email: string;
  exp: number;
  mode: "demo";
};

function createDemoSessionSignature(payload: string) {
  return createHmac("sha256", env.demoAdminSessionSecret)
    .update(payload)
    .digest("base64url");
}

function serializeDemoSession(payload: DemoAdminCookiePayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createDemoSessionSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function readDemoSessionPayload(cookieValue: string): DemoAdminCookiePayload | null {
  if (!allowDemoAdmin) {
    return null;
  }

  const [encodedPayload, signature] = cookieValue.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = createDemoSessionSignature(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as DemoAdminCookiePayload;

    if (
      parsed.mode !== "demo" ||
      parsed.email !== env.demoAdminEmail ||
      parsed.exp <= Date.now()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getDemoSessionValue(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const cookieValue = cookieStore.get(DEMO_ADMIN_COOKIE)?.value;
  const payload = cookieValue ? readDemoSessionPayload(cookieValue) : null;

  return payload
    ? {
        mode: "demo" as const,
        email: payload.email,
        name: "Demo Admin",
      }
    : null;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const demoSession = getDemoSessionValue(cookieStore);

  if (demoSession) {
    return demoSession;
  }

  if (!hasSupabaseConfig) {
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

  if (!allowDemoAdmin) {
    return {
      success: false as const,
      message: "Demo admin is disabled in this environment.",
    };
  }

  if (
    email === env.demoAdminEmail &&
    password === env.demoAdminPassword
  ) {
    cookieStore.set(
      DEMO_ADMIN_COOKIE,
      serializeDemoSession({
        email,
        exp: Date.now() + DEMO_ADMIN_SESSION_TTL_SECONDS * 1000,
        mode: "demo",
      }),
      {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: DEMO_ADMIN_SESSION_TTL_SECONDS,
      secure: env.siteUrl.startsWith("https://"),
    },
    );

    return { success: true as const };
  }

  return {
    success: false as const,
    message: "Use the configured local demo admin credentials.",
  };
}

export async function signOutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_ADMIN_COOKIE);

  if (!hasSupabaseConfig) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
}
