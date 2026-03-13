import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { requireAdminSession } from "@/lib/auth";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getAdminLocations } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "Create vehicle",
  description: "Create a new vehicle listing for the admin inventory workspace.",
};

export default async function AdminNewVehiclePage() {
  const session = await requireAdminSession();
  let locations: Awaited<ReturnType<typeof getAdminLocations>> = [];
  let unavailableDescription: string | null = null;

  try {
    locations = await getAdminLocations({
      forceDemo: session.mode === "demo",
    });
  } catch (error) {
    if (isRepositoryUnavailableError(error)) {
      unavailableDescription = error.message;
    } else {
      throw error;
    }
  }

  if (unavailableDescription) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Inventory authoring"
          title="Create vehicle"
          description="Start with the core listing details, then stage the gallery before the first save."
          backHref="/admin/vehicles"
          backLabel="Back to inventory"
        />
        <AdminUnavailableState
          title="Vehicle form is unavailable"
          description={unavailableDescription}
          retryHref="/admin/vehicles/new"
          backHref="/admin/vehicles"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Inventory authoring"
        title="Create vehicle"
        description="Build the listing in one pass, keep the gallery in order, and use the sticky save bar to commit the first draft without losing context."
        backHref="/admin/vehicles"
        backLabel="Back to inventory"
      />
      <VehicleForm locations={locations} />
    </div>
  );
}
