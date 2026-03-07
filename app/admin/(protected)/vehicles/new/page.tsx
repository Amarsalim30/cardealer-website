import { VehicleForm } from "@/components/admin/vehicle-form";
import { getLocations } from "@/lib/data/repository";

export default async function AdminNewVehiclePage() {
  const locations = await getLocations();

  return <VehicleForm locations={locations} />;
}
