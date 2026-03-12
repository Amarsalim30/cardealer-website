import { afterEach, describe, expect, it, vi } from "vitest";

import { RepositoryUnavailableError } from "@/lib/data/errors";

async function loadRepositoryModule(options: {
  allowLocalDemoMode?: boolean;
  publicClient?: unknown;
  serverClient?: unknown;
} = {}) {
  vi.resetModules();

  vi.doMock("@/lib/env", () => ({
    allowLocalDemoMode: options.allowLocalDemoMode ?? false,
    env: {
      cloudinaryCloudName: "",
    },
    hasCloudinaryConfig: false,
  }));
  vi.doMock("@/lib/cloudinary", () => ({
    deleteCloudinaryAssets: vi.fn(),
    listCloudinaryVehicleAssets: vi.fn(),
  }));
  vi.doMock("@/lib/supabase/public", () => ({
    createSupabasePublicClient: vi.fn(() => options.publicClient ?? null),
  }));
  vi.doMock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(async () => options.serverClient ?? null),
  }));
  vi.doMock("@/lib/data/demo-store", () => ({
    getDemoState: vi.fn(() => ({
      leads: [],
      locations: [],
      reviews: [],
      testDriveRequests: [],
      tradeInRequests: [],
      vehicles: [],
    })),
  }));

  return import("@/lib/data/repository");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("repository fail-closed behavior", () => {
  it("returns empty public locations when Supabase is unavailable outside local demo mode", async () => {
    const repository = await loadRepositoryModule();

    await expect(repository.getLocations()).resolves.toEqual([]);
  });

  it("throws an admin availability error when admin inventory cannot load outside local demo mode", async () => {
    const repository = await loadRepositoryModule();

    await expect(repository.getAdminVehicles()).rejects.toMatchObject({
      code: "admin_unavailable",
      message: "Admin inventory is unavailable until Supabase is configured.",
    } satisfies Partial<RepositoryUnavailableError>);
  });

  it("rejects lead writes when persistence is unavailable outside local demo mode", async () => {
    const repository = await loadRepositoryModule();

    await expect(
      repository.saveLead({
        leadType: "quote",
        name: "Jane Doe",
        phone: "+254700000000",
      }),
    ).rejects.toMatchObject({
      code: "persistence_unavailable",
      message: "Lead capture is unavailable until Supabase is configured.",
    } satisfies Partial<RepositoryUnavailableError>);
  });
});
