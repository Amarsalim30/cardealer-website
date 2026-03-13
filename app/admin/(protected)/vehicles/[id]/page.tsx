import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { CloudinarySyncCard } from "@/components/admin/cloudinary-sync-card";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { Badge } from "@/components/ui/badge";
import { requireAdminSession } from "@/lib/auth";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getAdminLocations, getVehicleById } from "@/lib/data/repository";
import { humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Vehicle editor",
  description: "Edit an existing vehicle listing and keep the gallery, publishing state, and content in sync.",
};

export default async function AdminEditVehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const saved = resolvedSearchParams.saved === "1";
  let locations: Awaited<ReturnType<typeof getAdminLocations>> = [];
  let vehicle: Awaited<ReturnType<typeof getVehicleById>> = null;
  let unavailableDescription: string | null = null;

  try {
    [locations, vehicle] = await Promise.all([
      getAdminLocations({
        forceDemo: session.mode === "demo",
      }),
      getVehicleById(id, {
        forceDemo: session.mode === "demo",
      }),
    ]);
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
          title="Vehicle editor"
          description="Update listing content, gallery ordering, and stock state without leaving the admin workspace."
          backHref="/admin/vehicles"
          backLabel="Back to inventory"
        />
        <AdminUnavailableState
          title="Vehicle editor is unavailable"
          description={unavailableDescription}
          retryHref={`/admin/vehicles/${id}`}
          backHref="/admin/vehicles"
        />
      </div>
    );
  }

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Inventory authoring"
        title={vehicle.title}
        description={`Stock code ${vehicle.stockCode}. Keep the public listing accurate, stage gallery changes carefully, and save directly from the editor without losing your place.`}
        backHref="/admin/vehicles"
        backLabel="Back to inventory"
        actions={
          <>
            <Badge variant="accent">{humanizeStatus(vehicle.status)}</Badge>
            {vehicle.featured ? <Badge variant="muted">Featured</Badge> : null}
          </>
        }
      />
      <VehicleForm
        locations={locations}
        vehicle={vehicle}
        initialNotice={saved ? "Vehicle created successfully." : undefined}
      />
      <CloudinarySyncCard vehicleId={vehicle.id} stockCode={vehicle.stockCode} />
    </div>
  );
}
