import { afterEach, describe, expect, it, vi } from "vitest";

function createCookieStore() {
  const values = new Map<string, string>();

  return {
    values,
    delete: vi.fn((name: string) => {
      values.delete(name);
    }),
    get: vi.fn((name: string) => {
      const value = values.get(name);
      return value ? { name, value } : undefined;
    }),
    set: vi.fn((name: string, value: string) => {
      values.set(name, value);
    }),
  };
}

async function loadAuthModule(options: { allowDemoAdmin?: boolean } = {}) {
  vi.resetModules();

  const cookieStore = createCookieStore();
  const redirect = vi.fn();

  vi.doMock("next/headers", () => ({
    cookies: vi.fn(async () => cookieStore),
  }));
  vi.doMock("next/navigation", () => ({
    redirect,
  }));
  vi.doMock("@/lib/env", () => ({
    allowDemoAdmin: options.allowDemoAdmin ?? true,
    env: {
      demoAdminEmail: "demo@example.com",
      demoAdminPassword: "demo-password",
      demoAdminSessionSecret: "demo-session-secret",
      siteUrl: "http://localhost:3000",
    },
    hasSupabaseConfig: false,
  }));
  vi.doMock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(async () => null),
  }));

  const auth = await import("@/lib/auth");

  return {
    auth,
    cookieStore,
    redirect,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("demo admin auth", () => {
  it("creates a signed demo cookie and resolves the demo session", async () => {
    const { auth, cookieStore } = await loadAuthModule();

    const signInResult = await auth.signInDemoAdmin(
      "demo@example.com",
      "demo-password",
    );

    expect(signInResult).toEqual({ success: true });

    const storedCookie = cookieStore.values.get("demo-admin-session");
    expect(storedCookie).toMatch(/\./);

    const session = await auth.getAdminSession();

    expect(session).toEqual({
      mode: "demo",
      email: "demo@example.com",
      name: "Demo Admin",
    });
  });

  it("rejects tampered demo cookies", async () => {
    const { auth, cookieStore } = await loadAuthModule();

    await auth.signInDemoAdmin("demo@example.com", "demo-password");
    const storedCookie = cookieStore.values.get("demo-admin-session");

    cookieStore.values.set(
      "demo-admin-session",
      `${storedCookie?.slice(0, -1)}x`,
    );

    await expect(auth.getAdminSession()).resolves.toBeNull();
  });

  it("fails closed when local demo auth is disabled", async () => {
    const { auth, cookieStore } = await loadAuthModule({
      allowDemoAdmin: false,
    });

    const result = await auth.signInDemoAdmin(
      "demo@example.com",
      "demo-password",
    );

    expect(result).toEqual({
      success: false,
      message: "Demo admin is disabled in this environment.",
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});
