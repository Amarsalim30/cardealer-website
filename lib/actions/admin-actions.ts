"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  requireAdminSession,
  requireOwnerSession,
  signInDemoAdmin,
  signOutAdmin,
} from "@/lib/auth";
import {
  allowDemoAdmin,
  hasCloudinaryConfig,
  hasSupabaseConfig,
  hasSupabaseSecretConfig,
} from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteCloudinaryAssets,
  uploadVehicleImageFromUrl,
} from "@/lib/cloudinary";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { resolveVehicleIdentifiers } from "@/lib/data/filters";
import {
  deleteVehicle,
  getAdminVehicles,
  getVehicleById,
  saveVehicle,
  syncVehicleImagesFromCloudinary,
  toggleVehicleFeatured,
  updateLeadInboxState,
  updateVehicleStatus,
} from "@/lib/data/repository";
import { mapVehicleFormData } from "@/lib/vehicle-form";
import type {
  ActionState,
  LeadInboxSourceType,
  LeadWorkflowStatus,
  VehicleFormInput,
} from "@/types/dealership";

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

function validationErrorState(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): ActionState {
  return {
    success: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function actionFailure(message: string, fieldErrors?: Record<string, string[]>) {
  return {
    success: false,
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
  } satisfies ActionState;
}

function actionSuccess(message: string, redirectTo?: string) {
  return {
    success: true,
    message,
    ...(redirectTo ? { redirectTo } : {}),
  } satisfies ActionState;
}

class VehicleSaveActionError extends Error {}

function getSupabaseErrorLike(error: unknown): SupabaseErrorLike | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  return {
    code: "code" in error ? String(error.code) : undefined,
    message: "message" in error ? String(error.message) : undefined,
  };
}

function mapVehiclePersistenceFailure(error: unknown) {
  const supabaseError = getSupabaseErrorLike(error);
  const message = supabaseError?.message || "";

  if (supabaseError?.code === "23505") {
    if (message.includes("vehicles_stock_code_key")) {
      return actionFailure("Another vehicle already uses this stock code.", {
        stockCode: ["Another vehicle already uses this stock code."],
      });
    }

    if (message.includes("vehicles_slug_key")) {
      return actionFailure("Another vehicle already uses this listing URL.", {
        title: ["Another vehicle already uses this listing URL."],
      });
    }
  }

  return null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function findAuthUserByEmail(email: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return null;
  }

  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (match) {
      return match;
    }

    if (!data.nextPage) {
      return null;
    }

    page = data.nextPage;
  }
}

function parseNewUploadPublicIds(formData: FormData) {
  const raw = String(formData.get("newUploadPublicIdsJson") || "[]");

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter((value): value is string => typeof value === "string"),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

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
  uploadedPublicIds: string[],
  options: { canUploadToCloudinary: boolean },
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

export async function cleanupUploadedVehicleImagesAction(publicIds: string[]) {
  await requireAdminSession();
  await cleanupUploadedVehicleImages(publicIds);
}

export async function loginAdminAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return actionFailure("Enter both email and password.");
  }

  if (allowDemoAdmin) {
    const demoResult = await signInDemoAdmin(email, password);

    if (demoResult.success) {
      redirect("/admin/vehicles");
    }
  }

  if (!hasSupabaseConfig) {
    return actionFailure(
      allowDemoAdmin
        ? "Local demo admin is enabled. Sign in with the configured local demo credentials."
        : "Supabase auth is not configured.",
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase!.auth.signInWithPassword({ email, password });

  if (error) {
    return actionFailure(
      allowDemoAdmin
        ? "Login failed. Use the configured local demo credentials or finish Supabase admin setup."
        : "Login failed. Check the credentials and try again.",
    );
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

    return actionFailure(
      profileError
        ? "Supabase admin access is not ready yet. Use the local demo admin or complete the admin_profiles setup."
        : "This account does not have admin access.",
    );
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
  const uploadedPublicIds = parseNewUploadPublicIds(formData);
  let vehicle: Awaited<ReturnType<typeof saveVehicle>>;
  let isEditing = false;

  try {
    const input = mapVehicleFormData(formData);
    isEditing = Boolean(input.id);
    const adminVehicles = await getAdminVehicles({
      forceDemo: session.mode === "demo",
    });
    const currentVehicle = adminVehicles.find((item) => item.id === input.id);
    const resolvedIdentifiers = resolveVehicleIdentifiers(
      {
        ...input,
        stockCode: currentVehicle?.stockCode || input.stockCode,
        slug: currentVehicle?.slug || input.slug,
      },
      adminVehicles,
    );
    const inputWithResolvedIdentifiers = {
      ...input,
      ...resolvedIdentifiers,
    };
    const finalized = await finalizeVehicleImages(
      inputWithResolvedIdentifiers,
      uploadedPublicIds,
      {
        canUploadToCloudinary: hasCloudinaryConfig,
      },
    );
    const inputWithUploadedImages = {
      ...inputWithResolvedIdentifiers,
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
      return actionFailure(error.message);
    }

    if (isRepositoryUnavailableError(error)) {
      return actionFailure(error.message);
    }

    const persistenceFailure = mapVehiclePersistenceFailure(error);

    if (persistenceFailure) {
      return persistenceFailure;
    }

    return actionFailure("We could not save the vehicle right now.");
  }

  revalidateVehiclePaths(vehicle.slug);
  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicle.id}`);
  return isEditing
    ? actionSuccess(
        "Vehicle saved successfully.",
        `/admin/vehicles/${vehicle.id}?notice=saved&saved=${encodeURIComponent(vehicle.updatedAt)}`,
      )
    : actionSuccess(
        "Vehicle created successfully.",
        `/admin/vehicles/${vehicle.id}?notice=created&saved=${encodeURIComponent(vehicle.updatedAt)}`,
      );
}

export async function setVehicleStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireAdminSession();
    const id = String(formData.get("id") || "");
    const status = String(formData.get("status") || "") as
      | "draft"
      | "published"
      | "sold"
      | "unpublished";

    if (!id || !status) {
      return actionFailure("Select a vehicle and status before trying again.");
    }

    const vehicle = await updateVehicleStatus(id, status, {
      forceDemo: session.mode === "demo",
    });
    revalidateVehiclePaths(vehicle?.slug);
    revalidatePath("/admin/vehicles");
    return actionSuccess("Vehicle status updated.");
  } catch (error) {
    return actionFailure(
      error instanceof Error ? error.message : "Vehicle status could not be updated.",
    );
  }
}

export async function toggleVehicleFeaturedAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireAdminSession();
    const id = String(formData.get("id") || "");

    if (!id) {
      return actionFailure("Vehicle id is required.");
    }

    const vehicle = await toggleVehicleFeatured(id, {
      forceDemo: session.mode === "demo",
    });
    revalidateVehiclePaths(vehicle?.slug);
    revalidatePath("/admin/vehicles");
    return actionSuccess("Vehicle featured state updated.");
  } catch (error) {
    return actionFailure(
      error instanceof Error
        ? error.message
        : "Vehicle featured state could not be updated.",
    );
  }
}

export async function deleteVehicleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireAdminSession();
    const id = String(formData.get("id") || "");

    if (!id) {
      return actionFailure("Vehicle id is required.");
    }

    const vehicle = await getVehicleById(id, {
      forceDemo: session.mode === "demo",
    });
    await deleteVehicle(id, {
      forceDemo: session.mode === "demo",
    });
    revalidateVehiclePaths(vehicle?.slug);
    revalidatePath("/admin/vehicles");
    return actionSuccess("Vehicle deleted.");
  } catch (error) {
    return actionFailure(
      error instanceof Error ? error.message : "Vehicle deletion failed.",
    );
  }
}

export async function syncVehicleImagesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  const id = String(formData.get("id") || "");

  if (!id) {
    return actionFailure("Vehicle id is required for image sync.");
  }

  try {
    const result = await syncVehicleImagesFromCloudinary(id, {
      forceDemo: session.mode === "demo",
    });

    revalidateVehiclePaths(result.vehicle.slug);
    revalidatePath("/admin/vehicles");
    revalidatePath(`/admin/vehicles/${id}`);

    return actionSuccess(
      `Synced ${result.syncedCount} image(s) from Cloudinary folder "${result.assetFolder}".`,
    );
  } catch (error) {
    return actionFailure(
      error instanceof Error ? error.message : "Cloudinary folder sync failed.",
    );
  }
}

export async function updateLeadInboxStateAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireAdminSession();
    const sourceId = String(formData.get("sourceId") || "");
    const sourceType = String(formData.get("sourceType") || "") as LeadInboxSourceType;
    const status = String(formData.get("status") || "") as LeadWorkflowStatus;

    if (!sourceId || !sourceType || !status) {
      return actionFailure("Select a lead status before trying again.");
    }

    await updateLeadInboxState(
      {
        sourceId,
        sourceType,
        status,
      },
      {
        forceDemo: session.mode === "demo",
      },
    );

    revalidatePath("/admin/leads");

    if (status === "contacted") {
      return actionSuccess("Lead marked as contacted.");
    }

    return actionSuccess("Lead status updated.");
  } catch (error) {
    return actionFailure(
      error instanceof Error ? error.message : "Lead status could not be updated.",
    );
  }
}

export async function createAdminAccessAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireOwnerSession();

    if (session.mode !== "supabase") {
      return actionFailure("Admin management is available only with Supabase auth.");
    }

    if (!hasSupabaseSecretConfig) {
      return actionFailure(
        "Supabase service-role access is required before admins can be managed here.",
      );
    }

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const fullName = String(formData.get("fullName") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!email || !isValidEmail(email)) {
      return actionFailure("Enter a valid email address for the admin account.");
    }

    const adminClient = createSupabaseAdminClient();
    const serverClient = await createSupabaseServerClient();

    if (!adminClient || !serverClient) {
      return actionFailure("Supabase admin access is not ready yet.");
    }

    let authUser = await findAuthUserByEmail(email);
    let createdNewUser = false;

    if (!authUser) {
      if (password.length < 8) {
        return actionFailure(
          "New admin accounts need a password with at least 8 characters.",
        );
      }

      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: fullName ? { full_name: fullName } : undefined,
      });

      if (error || !data.user) {
        return actionFailure(
          error?.message || "The admin user could not be created right now.",
        );
      }

      authUser = data.user;
      createdNewUser = true;
    }

    const { data: existingProfile, error: existingProfileError } = await serverClient
      .from("admin_profiles")
      .select("id, role")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (existingProfileError) {
      throw existingProfileError;
    }

    if (existingProfile) {
      return actionFailure(
        existingProfile.role === "owner"
          ? "This account already has owner access."
          : "This account already has admin access.",
      );
    }

    const { error: insertError } = await serverClient.from("admin_profiles").insert({
      user_id: authUser.id,
      email,
      full_name:
        fullName ||
        (typeof authUser.user_metadata?.full_name === "string"
          ? authUser.user_metadata.full_name
          : null),
      role: "admin",
    });

    if (insertError) {
      if (createdNewUser) {
        await adminClient.auth.admin.deleteUser(authUser.id).catch(() => undefined);
      }

      throw insertError;
    }

    revalidatePath("/admin/admins");
    return actionSuccess("Admin access granted.");
  } catch (error) {
    return actionFailure(
      error instanceof Error ? error.message : "Admin access could not be added.",
    );
  }
}

export async function removeAdminAccessAction(formData: FormData) {
  const session = await requireOwnerSession();

  if (session.mode !== "supabase") {
    return;
  }

  const userId = String(formData.get("userId") || "").trim();

  if (!userId || !session.userId || userId === session.userId) {
    return;
  }

  const serverClient = await createSupabaseServerClient();

  if (!serverClient) {
    return;
  }

  const { data: profile } = await serverClient
    .from("admin_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile || profile.role === "owner") {
    return;
  }

  await serverClient.from("admin_profiles").delete().eq("user_id", userId);
  revalidatePath("/admin/admins");
}
