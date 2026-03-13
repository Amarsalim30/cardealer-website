import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { VehicleRowActions } from "@/components/admin/vehicle-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdminSession } from "@/lib/auth";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getAdminVehicleWorkspace } from "@/lib/data/repository";
import {
  adminVehicleSortOptions,
  stockCategories,
  vehicleStatuses,
  type AdminVehicleSort,
  type StockCategory,
  type VehicleStatus,
} from "@/types/dealership";
import {
  formatCurrency,
  formatMileage,
  humanizeStatus,
  humanizeStockCategory,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Manage published, draft, and sold vehicles from the admin inventory workspace.",
};

const selectClassName =
  "mt-2 h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-stone-900 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

function getStatusVariant(status: "draft" | "published" | "sold" | "unpublished") {
  if (status === "published") {
    return "success";
  }

  if (status === "sold") {
    return "default";
  }

  return "muted";
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function parseVehicleStatus(
  value: string | string[] | undefined,
): VehicleStatus | "all" {
  return typeof value === "string" &&
    (["all", ...vehicleStatuses] as const).includes(value as VehicleStatus | "all")
    ? (value as VehicleStatus | "all")
    : "all";
}

function parseStockCategory(
  value: string | string[] | undefined,
): StockCategory | "all" {
  return typeof value === "string" &&
    (["all", ...stockCategories] as const).includes(value as StockCategory | "all")
    ? (value as StockCategory | "all")
    : "all";
}

function parseVehicleSort(
  value: string | string[] | undefined,
): AdminVehicleSort {
  return typeof value === "string" &&
    adminVehicleSortOptions.includes(value as AdminVehicleSort)
    ? (value as AdminVehicleSort)
    : "updated-desc";
}

function parseFeaturedFilter(value: string | string[] | undefined) {
  return typeof value === "string" &&
    (["all", "featured", "standard"] as const).includes(
      value as "all" | "featured" | "standard",
    )
    ? (value as "all" | "featured" | "standard")
    : "all";
}

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const params = await searchParams;
  let workspace: Awaited<ReturnType<typeof getAdminVehicleWorkspace>> | null = null;
  let unavailableDescription: string | null = null;

  try {
    workspace = await getAdminVehicleWorkspace({
      q: typeof params.q === "string" ? params.q : undefined,
      status: parseVehicleStatus(params.status),
      category: parseStockCategory(params.category),
      featured: parseFeaturedFilter(params.featured),
      location: typeof params.location === "string" ? params.location : undefined,
      sort: parseVehicleSort(params.sort),
    }, {
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
          eyebrow="Inventory workspace"
          title="Inventory"
          description="Search stock quickly, adjust publishing state with care, and keep destructive actions out of the main path."
        />
        <AdminUnavailableState
          title="Vehicle inventory is unavailable"
          description={unavailableDescription}
          retryHref="/admin/vehicles"
          backHref="/admin/leads"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Inventory workspace"
        title="Inventory"
        description="Search stock fast, review publishing state at a glance, and keep routine edits separate from high-risk actions."
        actions={
          <Button asChild>
            <Link href="/admin/vehicles/new">Add vehicle</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total stock", value: workspace!.summary.total },
          { label: "Published", value: workspace!.summary.published },
          { label: "Draft", value: workspace!.summary.draft },
          { label: "Sold", value: workspace!.summary.sold },
        ].map((item) => (
          <Card
            key={item.label}
            className="rounded-[28px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-stone-950">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-[30px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.72fr))_minmax(0,0.9fr)_auto] lg:items-end">
          <div className="lg:col-span-2">
            <label
              htmlFor="inventory-search"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500"
            >
              Search
            </label>
            <Input
              id="inventory-search"
              name="q"
              defaultValue={workspace!.filters.q}
              placeholder="Title, stock code, make, or model"
              className="mt-2"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={workspace!.filters.status}
              className={selectClassName}
            >
              <option value="all">All</option>
              {vehicleStatuses.map((status) => (
                <option key={status} value={status}>
                  {humanizeStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={workspace!.filters.category}
              className={selectClassName}
            >
              <option value="all">All</option>
              {stockCategories.map((category) => (
                <option key={category} value={category}>
                  {humanizeStockCategory(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="featured"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500"
            >
              Featured
            </label>
            <select
              id="featured"
              name="featured"
              defaultValue={workspace!.filters.featured}
              className={selectClassName}
            >
              <option value="all">All</option>
              <option value="featured">Featured</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="location"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500"
            >
              Location
            </label>
            <select
              id="location"
              name="location"
              defaultValue={workspace!.filters.location}
              className={selectClassName}
            >
              <option value="">All</option>
              {workspace!.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sort"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500"
            >
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={workspace!.filters.sort}
              className={selectClassName}
            >
              <option value="updated-desc">Newest updated</option>
              <option value="price-desc">Price high to low</option>
              <option value="price-asc">Price low to high</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              Apply
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/admin/vehicles">Clear</Link>
            </Button>
          </div>
        </form>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold text-stone-950">
            {workspace!.items.length} vehicle{workspace!.items.length === 1 ? "" : "s"} in
            this view
          </p>
          <p className="text-sm text-stone-600">
            Filters narrow the workspace without changing the live catalogue.
          </p>
        </div>
      </div>

      {workspace!.items.length ? (
        <div className="grid gap-4">
          {workspace!.items.map((vehicle) => {
            const previewImage =
              vehicle.heroImageUrl || vehicle.images[0]?.imageUrl || null;

            return (
              <Card
                key={vehicle.id}
                className="rounded-[30px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6"
              >
                <div className="grid gap-5 xl:grid-cols-[132px_minmax(0,1.45fr)_minmax(260px,0.95fr)]">
                  <div className="relative h-28 overflow-hidden rounded-[24px] bg-stone-100">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt={vehicle.title}
                        fill
                        sizes="132px"
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
                      <h2 className="truncate text-xl font-semibold text-stone-950">
                        {vehicle.title}
                      </h2>
                      <Badge variant={getStatusVariant(vehicle.status)}>
                        {humanizeStatus(vehicle.status)}
                      </Badge>
                      <Badge variant="accent">
                        {humanizeStockCategory(vehicle.stockCategory)}
                      </Badge>
                      {vehicle.featured ? <Badge variant="muted">Featured</Badge> : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      <span>{vehicle.stockCode}</span>
                      <span>{vehicle.location?.name || "No location"}</span>
                      <span>{vehicle.year}</span>
                      <span>{vehicle.transmission}</span>
                      <span>Updated {formatUpdatedAt(vehicle.updatedAt)}</span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[22px] border border-border/70 bg-stone-50/90 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                          Price
                        </p>
                        <p className="mt-1 text-base font-semibold text-stone-950">
                          {formatCurrency(vehicle.price)}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-border/70 bg-stone-50/90 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                          Mileage
                        </p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">
                          {formatMileage(vehicle.mileage)}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-border/70 bg-stone-50/90 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                          Fuel
                        </p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">
                          {vehicle.fuelType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-border/70 bg-stone-50/80 p-4">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                        Actions
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        Edit the listing directly, then open the overflow menu for publish,
                        feature, sold, or delete actions.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button asChild size="sm">
                        <Link href={`/admin/vehicles/${vehicle.id}`}>Edit listing</Link>
                      </Button>
                      <VehicleRowActions
                        vehicleId={vehicle.id}
                        featured={vehicle.featured}
                        status={vehicle.status}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-[30px] border border-border/70 bg-white/95 p-8 text-center shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            No results
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950">
            No vehicles match the current admin filters.
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Clear the search or filters, or create a fresh listing if this stock item
            does not exist yet.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/admin/vehicles/new">Create vehicle</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/vehicles">Reset filters</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
