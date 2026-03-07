import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { getCategorySummary } from "@/lib/data/filters";
import type { Vehicle } from "@/types/dealership";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card className="overflow-hidden rounded-[28px]">
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image
          src={vehicle.heroImageUrl || vehicle.images[0]?.imageUrl}
          alt={vehicle.title}
          fill
          className="object-cover"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {vehicle.featured ? <Badge variant="default">Featured</Badge> : null}
          {vehicle.negotiable ? <Badge variant="accent">Negotiable</Badge> : null}
          {vehicle.status === "sold" ? <Badge variant="success">Sold</Badge> : null}
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {getCategorySummary(vehicle)}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-stone-950">
              {vehicle.title}
            </h3>
          </div>
          <p className="text-right text-xl font-bold text-stone-950">
            {formatCurrency(vehicle.price)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-3xl bg-stone-100 p-4 text-sm text-stone-700">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Mileage</p>
            <p className="mt-1 font-medium">{formatMileage(vehicle.mileage)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
              Transmission
            </p>
            <p className="mt-1 font-medium">{vehicle.transmission}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Fuel</p>
            <p className="mt-1 font-medium">{vehicle.fuelType}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Year</p>
            <p className="mt-1 font-medium">{vehicle.year}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-stone-600">
          <MapPin className="size-4" />
          {vehicle.location?.name || "Nairobi"}
        </div>

        <Button asChild className="w-full">
          <Link href={`/cars/${vehicle.slug}`}>
            View Details
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
