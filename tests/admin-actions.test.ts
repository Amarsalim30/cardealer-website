import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    envState: {
      hasCloudinaryConfig: true,
    },
    requireAdminSession: vi.fn(),
    uploadVehicleImage: vi.fn(),
    uploadVehicleImageFromUrl: vi.fn(),
    deleteCloudinaryAssets: vi.fn(),
    mapVehicleFormData: vi.fn(),
    saveVehicle: vi.fn(),
    redirect: vi.fn(),
    revalidatePath: vi.fn(),
    isRedirectError: vi.fn(() => false),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/dist/client/components/redirect-error", () => ({
  isRedirectError: mocks.isRedirectError,
}));

vi.mock("@/lib/auth", () => ({
  requireAdminSession: mocks.requireAdminSession,
  signInDemoAdmin: vi.fn(),
  signOutAdmin: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  allowDemoAdmin: true,
  hasSupabaseConfig: true,
  get hasCloudinaryConfig() {
    return mocks.envState.hasCloudinaryConfig;
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/cloudinary", () => ({
  deleteCloudinaryAssets: mocks.deleteCloudinaryAssets,
  uploadVehicleImage: mocks.uploadVehicleImage,
  uploadVehicleImageFromUrl: mocks.uploadVehicleImageFromUrl,
}));

vi.mock("@/lib/vehicle-form", () => ({
  mapVehicleFormData: mocks.mapVehicleFormData,
}));

vi.mock("@/lib/data/repository", () => ({
  deleteVehicle: vi.fn(),
  getVehicleById: vi.fn(),
  saveVehicle: mocks.saveVehicle,
  syncVehicleImagesFromCloudinary: vi.fn(),
  toggleVehicleFeatured: vi.fn(),
  updateVehicleStatus: vi.fn(),
}));

import { saveVehicleAction } from "@/lib/actions/admin-actions";

function buildVehicleInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "2020 Toyota Prado",
    stockCode: "KDL-001",
    slug: "2020-toyota-prado",
    make: "Toyota",
    model: "Prado",
    year: 2020,
    condition: "Foreign used",
    price: 6500000,
    negotiable: false,
    mileage: 42000,
    transmission: "Automatic",
    fuelType: "Diesel",
    driveType: null,
    bodyType: "SUV",
    engineCapacity: "3000cc",
    color: "Black",
    locationId: null,
    featured: false,
    status: "published",
    stockCategory: "used",
    description: "A clean SUV with strong condition notes and ready availability.",
    images: [],
    ...overrides,
  };
}

describe("saveVehicleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.envState.hasCloudinaryConfig = true;
  });

  it("cleans up uploaded assets if a later staged file upload fails", async () => {
    mocks.requireAdminSession.mockResolvedValue({
      mode: "supabase",
      email: "admin@example.com",
      name: "Admin",
    });
    mocks.mapVehicleFormData.mockReturnValue(
      buildVehicleInput({
        images: [
          {
            imageUrl: "blob:first-preview",
            sortOrder: 0,
            isHero: true,
            uploadState: "pending_file",
            pendingFileId: "file-1",
            pendingFileOrder: 0,
          },
          {
            imageUrl: "blob:second-preview",
            sortOrder: 1,
            isHero: false,
            uploadState: "pending_file",
            pendingFileId: "file-2",
            pendingFileOrder: 1,
          },
        ],
      }),
    );
    mocks.uploadVehicleImage
      .mockResolvedValueOnce({
        secureUrl: "https://cdn.example.com/first.jpg",
        publicId: "cloudinary-first",
      })
      .mockRejectedValueOnce(new Error("Second upload failed."));

    const formData = new FormData();
    formData.append("pendingFiles", new File(["first"], "first.jpg"));
    formData.append("pendingFiles", new File(["second"], "second.jpg"));

    const result = await saveVehicleAction(
      { success: false, message: "" },
      formData,
    );

    expect(result).toEqual({
      success: false,
      message: "Second upload failed.",
    });
    expect(mocks.deleteCloudinaryAssets).toHaveBeenCalledWith([
      "cloudinary-first",
    ]);
    expect(mocks.saveVehicle).not.toHaveBeenCalled();
  });

  it("blocks staged file uploads in demo mode before any Cloudinary call", async () => {
    mocks.requireAdminSession.mockResolvedValue({
      mode: "demo",
      email: "demo@example.com",
      name: "Demo Admin",
    });
    mocks.mapVehicleFormData.mockReturnValue(
      buildVehicleInput({
        images: [
          {
            imageUrl: "blob:demo-preview",
            sortOrder: 0,
            isHero: true,
            uploadState: "pending_file",
            pendingFileId: "file-1",
            pendingFileOrder: 0,
          },
        ],
      }),
    );

    const result = await saveVehicleAction(
      { success: false, message: "" },
      new FormData(),
    );

    expect(result).toEqual({
      success: false,
      message: "File uploads are unavailable in demo mode. Use image URLs instead.",
    });
    expect(mocks.uploadVehicleImage).not.toHaveBeenCalled();
    expect(mocks.saveVehicle).not.toHaveBeenCalled();
  });

  it("saves staged image URLs directly when Cloudinary is unavailable", async () => {
    mocks.envState.hasCloudinaryConfig = false;
    mocks.requireAdminSession.mockResolvedValue({
      mode: "supabase",
      email: "admin@example.com",
      name: "Admin",
    });
    mocks.mapVehicleFormData.mockReturnValue(
      buildVehicleInput({
        images: [
          {
            imageUrl: "https://example.com/car.jpg",
            sourceUrl: "https://example.com/car.jpg",
            sortOrder: 0,
            isHero: true,
            uploadState: "pending_url",
          },
        ],
      }),
    );
    mocks.saveVehicle.mockResolvedValue({
      slug: "2020-toyota-prado",
    });

    await saveVehicleAction({ success: false, message: "" }, new FormData());

    expect(mocks.uploadVehicleImageFromUrl).not.toHaveBeenCalled();
    expect(mocks.saveVehicle).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [
          expect.objectContaining({
            imageUrl: "https://example.com/car.jpg",
            uploadState: "uploaded",
            cloudinaryPublicId: null,
          }),
        ],
      }),
      { forceDemo: false },
    );
  });
});
