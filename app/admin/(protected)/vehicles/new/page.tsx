import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getAdminLocations } from "@/lib/data/repository";

export default async function AdminNewVehiclePage() {
  let locations: Awaited<ReturnType<typeof getAdminLocations>> = [];
  let unavailableDescription: string | null = null;

  try {
    locations = await getAdminLocations();
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
        title="Vehicle form is unavailable"
        description={unavailableDescription}
      />
    );
  }

  return <VehicleForm locations={locations} />;
}
