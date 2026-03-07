"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession, signInDemoAdmin, signOutAdmin } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapVehicleFormData } from "@/lib/vehicle-form";
import {
  deleteVehicle,
  getVehicleById,
  saveVehicle,
  toggleVehicleFeatured,
  updateVehicleStatus,
} from "@/lib/data/repository";
import type { ActionState } from "@/types/dealership";

function validationErrorState(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): ActionState {
  return {
    success: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: error.flatten().fieldErrors,
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

  if (!hasSupabaseConfig) {
    const result = await signInDemoAdmin(email, password);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    redirect("/admin/vehicles");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase!.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      success: false,
      message: "Login failed. Check the credentials and try again.",
    };
  }

  const {
    data: { user },
  } = await supabase!.auth.getUser();

  const { data: profile } = await supabase!
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  if (!profile) {
    await supabase!.auth.signOut();

    return {
      success: false,
      message: "This account does not have admin access.",
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
  await requireAdminSession();

  try {
    const input = mapVehicleFormData(formData);
    const vehicle = await saveVehicle(input);
    revalidateVehiclePaths(vehicle.slug);
    revalidatePath("/admin/vehicles");
    redirect("/admin/vehicles");
  } catch (error) {
    if (error instanceof Error && "flatten" in error) {
      return validationErrorState(
        error as unknown as { flatten: () => { fieldErrors: Record<string, string[]> } },
      );
    }

    return {
      success: false,
      message: "We could not save the vehicle right now.",
    };
  }
}

export async function setVehicleStatusAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as
    | "draft"
    | "published"
    | "sold"
    | "unpublished";

  const vehicle = await updateVehicleStatus(id, status);
  revalidateVehiclePaths(vehicle?.slug);
  revalidatePath("/admin/vehicles");
}

export async function toggleVehicleFeaturedAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "");
  const vehicle = await toggleVehicleFeatured(id);
  revalidateVehiclePaths(vehicle?.slug);
  revalidatePath("/admin/vehicles");
}

export async function deleteVehicleAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "");
  const vehicle = await getVehicleById(id);
  await deleteVehicle(id);
  revalidateVehiclePaths(vehicle?.slug);
  revalidatePath("/admin/vehicles");
}
