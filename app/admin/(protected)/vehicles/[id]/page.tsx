import { notFound } from "next/navigation";

import { CloudinarySyncCard } from "@/components/admin/cloudinary-sync-card";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { getLocations, getVehicleById } from "@/lib/data/repository";

export default async function AdminEditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [locations, vehicle] = await Promise.all([
    getLocations(),
    getVehicleById(id),
  ]);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <CloudinarySyncCard vehicleId={vehicle.id} stockCode={vehicle.stockCode} />
      <VehicleForm locations={locations} vehicle={vehicle} />
    </div>
  );
}
