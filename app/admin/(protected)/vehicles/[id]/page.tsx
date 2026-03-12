import { notFound } from "next/navigation";

import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { CloudinarySyncCard } from "@/components/admin/cloudinary-sync-card";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getAdminLocations, getVehicleById } from "@/lib/data/repository";

export default async function AdminEditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let locations: Awaited<ReturnType<typeof getAdminLocations>> = [];
  let vehicle: Awaited<ReturnType<typeof getVehicleById>> = null;
  let unavailableDescription: string | null = null;

  try {
    [locations, vehicle] = await Promise.all([
      getAdminLocations(),
      getVehicleById(id),
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
      <AdminUnavailableState
        title="Vehicle editor is unavailable"
        description={unavailableDescription}
      />
    );
  }

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <VehicleForm locations={locations} vehicle={vehicle} />
      <CloudinarySyncCard vehicleId={vehicle.id} stockCode={vehicle.stockCode} />
    </div>
  );
}
