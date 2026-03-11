import Image from "next/image";
import Link from "next/link";
import { CircleGauge, Cog, Fuel } from "lucide-react";

import { formatCurrency, formatMileage } from "@/lib/utils";
import { getCategorySummary } from "@/lib/data/filters";
import type { Vehicle } from "@/types/dealership";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const primaryImage = vehicle.heroImageUrl || vehicle.images[0]?.imageUrl;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_4px_20px_rgba(28,25,23,0.04)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(28,25,23,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={vehicle.title}
            fill
            sizes="(min-width: 1280px) 353px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-stone-400">
            Gallery coming soon
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {vehicle.featured ? (
             <span className="rounded-full bg-stone-900/90 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
                Featured
             </span>
          ) : null}
          {vehicle.negotiable ? (
             <span className="rounded-full bg-stone-900/90 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
                Negotiable
             </span>
          ) : null}
          {vehicle.status === "sold" ? (
             <span className="rounded-full bg-[#10b981]/95 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] backdrop-blur-md">
                Sold
             </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-stone-500">
              {vehicle.year} • {getCategorySummary(vehicle)}
            </p>
            <h3 className="mt-1 text-lg font-bold leading-tight text-stone-950 sm:text-xl line-clamp-2">
              {vehicle.title}
            </h3>
          </div>
          <p className="shrink-0 text-right text-lg font-black text-primary sm:text-xl">
             {formatCurrency(vehicle.price)}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 border-t border-stone-100 pt-5 text-sm font-medium text-stone-600">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <CircleGauge className="size-4 text-stone-400" />
            <span className="text-[0.75rem] leading-tight truncate w-full">
              {vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "0 km"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center border-l border-stone-100">
            <Cog className="size-4 text-stone-400" />
            <span className="text-[0.75rem] leading-tight truncate w-full">
              {vehicle.transmission}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center border-l border-stone-100">
            <Fuel className="size-4 text-stone-400" />
            <span className="text-[0.75rem] leading-tight truncate w-full">
              {vehicle.fuelType}
            </span>
          </div>
        </div>

        <div className="mt-auto flex pt-0.5">
          <Link
            href={`/cars/${vehicle.slug}`}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-stone-950 px-4 text-[0.85rem] font-semibold !text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors hover:bg-stone-800 hover:!text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
