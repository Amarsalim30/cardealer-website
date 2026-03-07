import { notFound } from "next/navigation";

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

  return <VehicleForm locations={locations} vehicle={vehicle} />;
}
