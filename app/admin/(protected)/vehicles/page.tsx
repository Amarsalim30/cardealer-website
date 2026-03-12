import Image from "next/image";
import Link from "next/link";

import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { VehicleRowActions } from "@/components/admin/vehicle-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getAdminVehicles } from "@/lib/data/repository";
import {
  formatCurrency,
  formatMileage,
  humanizeStatus,
  humanizeStockCategory,
} from "@/lib/utils";

function getStatusVariant(status: "draft" | "published" | "sold" | "unpublished") {
  if (status === "published") {
    return "success";
  }

  if (status === "sold") {
    return "default";
  }

  return "muted";
}

export default async function AdminVehiclesPage() {
  let vehicles: Awaited<ReturnType<typeof getAdminVehicles>> = [];
  let unavailableDescription: string | null = null;

  try {
    vehicles = await getAdminVehicles();
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
        title="Vehicle inventory is unavailable"
        description={unavailableDescription}
      />
    );
  }

  return (
    <Card className="overflow-hidden rounded-[28px]">
      <div className="flex flex-col gap-4 border-b border-border bg-stone-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-stone-950">Vehicles</h3>
          <p className="mt-1 text-sm text-stone-600">
            Scan the stock quickly, open the right listing, and use the compact
            actions only when you need them.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/vehicles/new">Add Vehicle</Link>
        </Button>
      </div>

      {vehicles.length ? (
        <div className="divide-y divide-border/70">
          {vehicles.map((vehicle) => {
            const previewImage =
              vehicle.heroImageUrl || vehicle.images[0]?.imageUrl || null;

            return (
              <div
                key={vehicle.id}
                className="grid gap-4 px-5 py-4 lg:grid-cols-[96px_minmax(0,1.6fr)_minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="relative h-24 overflow-hidden rounded-[22px] bg-stone-100">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt={vehicle.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-base font-semibold text-stone-950">
                      {vehicle.title}
                    </h4>
                    <Badge variant="accent">
                      {humanizeStockCategory(vehicle.stockCategory)}
                    </Badge>
                    {vehicle.featured ? (
                      <Badge variant="muted">Featured</Badge>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                    <span>{vehicle.stockCode}</span>
                    <span>{vehicle.location?.name || "No location"}</span>
                    <span>{vehicle.year}</span>
                    <span>{vehicle.transmission}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-semibold text-stone-950">
                    {formatCurrency(vehicle.price)}
                  </p>
                  <p className="text-sm text-stone-600">
                    {formatMileage(vehicle.mileage)} / {vehicle.fuelType}
                  </p>
                  <Badge variant={getStatusVariant(vehicle.status)}>
                    {humanizeStatus(vehicle.status)}
                  </Badge>
                </div>

                <div className="space-y-2 lg:justify-self-end">
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button asChild size="sm">
                      <Link href={`/admin/vehicles/${vehicle.id}`}>Edit</Link>
                    </Button>
                  </div>
                  <VehicleRowActions
                    vehicleId={vehicle.id}
                    featured={vehicle.featured}
                    status={vehicle.status}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-10 text-sm text-stone-600">
          No vehicles yet. Add the first listing to start building the admin
          stock view.
        </div>
      )}
    </Card>
  );
}
