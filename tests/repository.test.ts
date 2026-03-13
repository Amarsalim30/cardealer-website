import { afterEach, describe, expect, it, vi } from "vitest";

import { RepositoryUnavailableError } from "@/lib/data/errors";

async function loadRepositoryModule(options: {
  allowLocalDemoMode?: boolean;
  demoState?: Record<string, unknown>;
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
      leadWorkflowStates: [],
      leads: [],
      locations: [],
      reviews: [],
      testDriveRequests: [],
      tradeInRequests: [],
      vehicles: [],
      ...options.demoState,
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

  it("merges lead workflow state into the inbox in local demo mode", async () => {
    const repository = await loadRepositoryModule({
      allowLocalDemoMode: true,
      demoState: {
        leadWorkflowStates: [
          {
            id: "workflow-1",
            sourceType: "lead",
            sourceId: "lead-1",
            status: "follow_up",
            lastContactedAt: "2026-03-10T10:00:00.000Z",
            updatedAt: "2026-03-10T10:00:00.000Z",
          },
        ],
        leads: [
          {
            id: "lead-1",
            leadType: "quote",
            name: "Jane Doe",
            phone: "+254700000000",
            email: "jane@example.com",
            message: "Please share the cash price.",
            source: "Homepage",
            utmSource: "google",
            utmMedium: "cpc",
            utmCampaign: "march-sale",
            createdAt: "2026-03-10T09:00:00.000Z",
          },
        ],
      },
    });

    const result = await repository.getLeadInbox({
      type: "quote",
      status: "follow_up",
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      sourceType: "lead",
      sourceId: "lead-1",
      status: "follow_up",
      lastContactedAt: "2026-03-10T10:00:00.000Z",
    });
    expect(result.items[0].details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "UTM source", value: "google" }),
        expect.objectContaining({ label: "UTM campaign", value: "march-sale" }),
      ]),
    );
  });

  it("filters the admin vehicle workspace in local demo mode and keeps global summary counts", async () => {
    const repository = await loadRepositoryModule({
      allowLocalDemoMode: true,
      demoState: {
        vehicles: [
          {
            id: "vehicle-1",
            title: "2021 Toyota Corolla",
            stockCode: "COR-001",
            slug: "2021-toyota-corolla",
            make: "Toyota",
            model: "Corolla",
            year: 2021,
            condition: "Foreign used",
            price: 2150000,
            negotiable: false,
            mileage: 24000,
            transmission: "Automatic",
            fuelType: "Petrol",
            driveType: null,
            bodyType: "Sedan",
            engineCapacity: null,
            color: "White",
            locationId: "location-1",
            location: {
              id: "location-1",
              name: "Mombasa yard",
              addressLine: "Nyali",
              city: "Mombasa",
              phone: "+254700000000",
              email: null,
              hours: "8am - 6pm",
              mapUrl: null,
              isPrimary: true,
              createdAt: "2026-03-01T00:00:00.000Z",
            },
            featured: true,
            status: "published",
            stockCategory: "used",
            description: "Featured Corolla",
            heroImageUrl: null,
            images: [],
            createdAt: "2026-03-01T00:00:00.000Z",
            updatedAt: "2026-03-11T00:00:00.000Z",
          },
          {
            id: "vehicle-2",
            title: "2018 Mazda CX-5",
            stockCode: "CX5-001",
            slug: "2018-mazda-cx5",
            make: "Mazda",
            model: "CX-5",
            year: 2018,
            condition: "Locally used",
            price: 2650000,
            negotiable: false,
            mileage: 62000,
            transmission: "Automatic",
            fuelType: "Petrol",
            driveType: null,
            bodyType: "SUV",
            engineCapacity: null,
            color: "Grey",
            locationId: "location-2",
            location: {
              id: "location-2",
              name: "Nairobi yard",
              addressLine: "Westlands",
              city: "Nairobi",
              phone: "+254711111111",
              email: null,
              hours: "8am - 6pm",
              mapUrl: null,
              isPrimary: false,
              createdAt: "2026-03-01T00:00:00.000Z",
            },
            featured: false,
            status: "draft",
            stockCategory: "used",
            description: "Draft Mazda",
            heroImageUrl: null,
            images: [],
            createdAt: "2026-03-01T00:00:00.000Z",
            updatedAt: "2026-03-09T00:00:00.000Z",
          },
        ],
      },
    });

    const result = await repository.getAdminVehicleWorkspace({
      q: "corolla",
      featured: "featured",
      status: "published",
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("2021 Toyota Corolla");
    expect(result.summary).toEqual({
      total: 2,
      published: 1,
      draft: 1,
      sold: 0,
    });
  });
});
