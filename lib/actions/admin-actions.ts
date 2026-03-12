"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession, signInDemoAdmin, signOutAdmin } from "@/lib/auth";
import { allowDemoAdmin, hasCloudinaryConfig, hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteCloudinaryAssets,
  uploadVehicleImage,
  uploadVehicleImageFromUrl,
} from "@/lib/cloudinary";
import { mapVehicleFormData } from "@/lib/vehicle-form";
import {
  deleteVehicle,
  getVehicleById,
  saveVehicle,
  syncVehicleImagesFromCloudinary,
  toggleVehicleFeatured,
  updateVehicleStatus,
} from "@/lib/data/repository";
import type { ActionState, VehicleFormInput } from "@/types/dealership";

function validationErrorState(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): ActionState {
  return {
    success: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

class VehicleSaveActionError extends Error {}

async function cleanupUploadedVehicleImages(publicIds: string[]) {
  if (!publicIds.length) {
    return;
  }

  try {
    await deleteCloudinaryAssets(publicIds);
  } catch (error) {
    console.warn(
      "[cloudinary] Unable to clean up uploaded vehicle images after a failed save.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function finalizeVehicleImages(
  input: VehicleFormInput,
  pendingFiles: File[],
  uploadedPublicIds: string[],
  options: { canUploadToCloudinary: boolean; sessionMode: "demo" | "supabase" },
) {
  const finalizedImages: VehicleFormInput["images"] = [];

  for (const image of input.images) {
    if (image.uploadState === "pending_url") {
      if (!image.sourceUrl) {
        throw new VehicleSaveActionError(
          "One staged image URL is missing. Add it again and save.",
        );
      }

      if (!options.canUploadToCloudinary) {
        finalizedImages.push({
          ...image,
          imageUrl: image.sourceUrl,
          cloudinaryPublicId: null,
          uploadState: "uploaded",
          sourceUrl: null,
          pendingFileId: null,
          pendingFileOrder: null,
        });
        continue;
      }

      try {
        const uploaded = await uploadVehicleImageFromUrl(image.sourceUrl, {
          stockCode: input.stockCode,
        });

        uploadedPublicIds.push(uploaded.publicId);
        finalizedImages.push({
          ...image,
          imageUrl: uploaded.secureUrl,
          cloudinaryPublicId: uploaded.publicId,
          uploadState: "uploaded",
          sourceUrl: null,
          pendingFileId: null,
          pendingFileOrder: null,
        });
      } catch (error) {
        throw new VehicleSaveActionError(
          error instanceof Error ? error.message : "Image upload failed.",
        );
      }

      continue;
    }

    if (image.uploadState === "pending_file") {
      if (options.sessionMode === "demo") {
        throw new VehicleSaveActionError(
          "File uploads are unavailable in demo mode. Use image URLs instead.",
        );
      }

      if (!hasCloudinaryConfig) {
        throw new VehicleSaveActionError(
          "Cloudinary is not configured for file uploads. Add image URLs instead.",
        );
      }

      if (!image.pendingFileId || typeof image.pendingFileOrder !== "number") {
        throw new VehicleSaveActionError(
          "One staged file is incomplete. Add it again and save.",
        );
      }

      const file = pendingFiles[image.pendingFileOrder];

      if (!file) {
        throw new VehicleSaveActionError(
          "One of the staged files is missing. Add it again and save.",
        );
      }

      try {
        const uploaded = await uploadVehicleImage(file, {
          stockCode: input.stockCode,
        });

        uploadedPublicIds.push(uploaded.publicId);
        finalizedImages.push({
          ...image,
          imageUrl: uploaded.secureUrl,
          cloudinaryPublicId: uploaded.publicId,
          uploadState: "uploaded",
          sourceUrl: null,
          pendingFileId: null,
          pendingFileOrder: null,
        });
      } catch (error) {
        throw new VehicleSaveActionError(
          error instanceof Error ? error.message : "Image upload failed.",
        );
      }

      continue;
    }

    if (image.uploadState !== "uploaded") {
      throw new VehicleSaveActionError(
        "One image is still unresolved. Add it again and save.",
      );
    }

    finalizedImages.push({
      ...image,
      uploadState: "uploaded",
      sourceUrl: null,
      pendingFileId: null,
      pendingFileOrder: null,
    });
  }

  return {
    finalizedImages,
  };
}

function revalidateVehiclePaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/inventory/new");
  revalidatePath("/inventory/used");
  revalidatePath("/inventory/imported");
  revalidatePath("/inventory/traded-in");

  if (slug) {
    revalidatePath(`/cars/${slug}`);
  }
}

export async function loginAdminAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return {
      success: false,
      message: "Enter both email and password.",
    };
  }

  if (allowDemoAdmin) {
    const demoResult = await signInDemoAdmin(email, password);

    if (demoResult.success) {
      redirect("/admin/vehicles");
    }
  }

  if (!hasSupabaseConfig) {
    return {
      success: false,
      message: allowDemoAdmin
        ? "Use the documented demo admin credentials."
        : "Supabase auth is not configured.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase!.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      success: false,
      message: allowDemoAdmin
        ? "Login failed. Use the local demo admin credentials or finish Supabase admin setup."
        : "Login failed. Check the credentials and try again.",
    };
  }

  const {
    data: { user },
  } = await supabase!.auth.getUser();

  const { data: profile, error: profileError } = await supabase!
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  if (profileError || !profile) {
    await supabase!.auth.signOut();

    return {
      success: false,
      message: profileError
        ? "Supabase admin access is not ready yet. Use the local demo admin or complete the admin_profiles setup."
        : "This account does not have admin access.",
    };
  }

  redirect("/admin/vehicles");
}

export async function logoutAdminAction() {
  await signOutAdmin();
  redirect("/admin/login");
}

export async function saveVehicleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  const uploadedPublicIds: string[] = [];
  let vehicle: Awaited<ReturnType<typeof saveVehicle>>;

  try {
    const input = mapVehicleFormData(formData);
    const pendingFiles = formData.getAll("pendingFiles").filter(
      (entry): entry is File => entry instanceof File,
    );
    const finalized = await finalizeVehicleImages(
      input,
      pendingFiles,
      uploadedPublicIds,
      {
        canUploadToCloudinary: session.mode !== "demo" && hasCloudinaryConfig,
        sessionMode: session.mode,
      },
    );

    const inputWithUploadedImages = {
      ...input,
      images: finalized.finalizedImages,
    };
    vehicle = await saveVehicle(inputWithUploadedImages, {
      forceDemo: session.mode === "demo",
    });
  } catch (error) {
    await cleanupUploadedVehicleImages(uploadedPublicIds);

    if (error instanceof Error && "flatten" in error) {
      return validationErrorState(
        error as unknown as { flatten: () => { fieldErrors: Record<string, string[]> } },
      );
    }

    if (error instanceof VehicleSaveActionError) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "We could not save the vehicle right now.",
    };
  }

  revalidateVehiclePaths(vehicle.slug);
  revalidatePath("/admin/vehicles");
  redirect("/admin/vehicles");
}

export async function setVehicleStatusAction(formData: FormData) {
  const session = await requireAdminSession();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as
    | "draft"
    | "published"
    | "sold"
    | "unpublished";

  const vehicle = await updateVehicleStatus(id, status, {
    forceDemo: session.mode === "demo",
  });
  revalidateVehiclePaths(vehicle?.slug);
  revalidatePath("/admin/vehicles");
}

export async function toggleVehicleFeaturedAction(formData: FormData) {
  const session = await requireAdminSession();

  const id = String(formData.get("id") || "");
  const vehicle = await toggleVehicleFeatured(id, {
    forceDemo: session.mode === "demo",
  });
  revalidateVehiclePaths(vehicle?.slug);
  revalidatePath("/admin/vehicles");
}

export async function deleteVehicleAction(formData: FormData) {
  const session = await requireAdminSession();

  const id = String(formData.get("id") || "");
  const vehicle = await getVehicleById(id);
  await deleteVehicle(id, {
    forceDemo: session.mode === "demo",
  });
  revalidateVehiclePaths(vehicle?.slug);
  revalidatePath("/admin/vehicles");
}

export async function syncVehicleImagesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  const id = String(formData.get("id") || "");

  if (!id) {
    return {
      success: false,
      message: "Vehicle id is required for image sync.",
    };
  }

  try {
    const result = await syncVehicleImagesFromCloudinary(id, {
      forceDemo: session.mode === "demo",
    });

    revalidateVehiclePaths(result.vehicle.slug);
    revalidatePath("/admin/vehicles");
    revalidatePath(`/admin/vehicles/${id}`);

    return {
      success: true,
      message: `Synced ${result.syncedCount} image(s) from Cloudinary folder "${result.assetFolder}".`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Cloudinary folder sync failed.",
    };
  }
}
