import type { Metadata } from "next";
import Link from "next/link";

import { AdminVehicleInventoryTable } from "@/components/admin/admin-vehicle-inventory-table";
import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { Button } from "@/components/ui/button";
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
import { humanizeStatus, humanizeStockCategory } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Manage published, draft, and sold vehicles from the admin inventory workspace.",
};

const selectClassName =
  "h-9 w-full rounded-md border border-border bg-white px-2 text-sm text-stone-900 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

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
      fuelType: typeof params.fuelType === "string" ? params.fuelType : undefined,
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
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-stone-950">Inventory</h1>
          <Button asChild size="sm">
            <Link href="/admin/vehicles/new">Add vehicle</Link>
          </Button>
        </div>
        <AdminUnavailableState
          title="Vehicle inventory is unavailable"
          description={unavailableDescription}
          retryHref="/admin/vehicles"
          backHref="/admin/leads"
        />
      </div>
    );
  }

  const hasFilters =
    Boolean(workspace!.filters.q) ||
    workspace!.filters.status !== "all" ||
    workspace!.filters.category !== "all" ||
    workspace!.filters.featured !== "all" ||
    Boolean(workspace!.filters.fuelType);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-stone-950">Inventory</h1>
        <Button asChild size="sm">
          <Link href="/admin/vehicles/new">Add vehicle</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {[
          { label: "Total", value: workspace!.summary.total },
          { label: "Published", value: workspace!.summary.published },
          { label: "Draft", value: workspace!.summary.draft },
          { label: "Sold", value: workspace!.summary.sold },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-border bg-white px-3 py-2">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-500">{item.label}</p>
            <p className="text-lg font-semibold text-stone-950">{item.value}</p>
          </div>
        ))}
      </div>

      <form className="grid gap-2 rounded-md border border-border bg-white p-3 md:grid-cols-[minmax(0,2fr)_repeat(5,minmax(0,1fr))_auto] md:items-end">
        <div className="md:col-span-2">
          <label htmlFor="inventory-search" className="text-xs text-stone-600">
            Search
          </label>
          <Input
            id="inventory-search"
            name="q"
            defaultValue={workspace!.filters.q}
            placeholder="Title, stock code, make, model"
            className="mt-1 h-9"
          />
        </div>

        <div>
          <label htmlFor="status" className="text-xs text-stone-600">Status</label>
          <select id="status" name="status" defaultValue={workspace!.filters.status} className={selectClassName}>
            <option value="all">All</option>
            {vehicleStatuses.map((status) => (
              <option key={status} value={status}>{humanizeStatus(status)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="text-xs text-stone-600">Category</label>
          <select id="category" name="category" defaultValue={workspace!.filters.category} className={selectClassName}>
            <option value="all">All</option>
            {stockCategories.map((category) => (
              <option key={category} value={category}>{humanizeStockCategory(category)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="featured" className="text-xs text-stone-600">Featured</label>
          <select id="featured" name="featured" defaultValue={workspace!.filters.featured} className={selectClassName}>
            <option value="all">All</option>
            <option value="featured">Featured</option>
            <option value="standard">Standard</option>
          </select>
        </div>

        <div>
          <label htmlFor="fuelType" className="text-xs text-stone-600">Fuel</label>
          <select id="fuelType" name="fuelType" defaultValue={workspace!.filters.fuelType} className={selectClassName}>
            <option value="">All</option>
            {workspace!.fuelTypes.map((fuelType) => (
              <option key={fuelType} value={fuelType}>{fuelType}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="text-xs text-stone-600">Sort</label>
          <select id="sort" name="sort" defaultValue={workspace!.filters.sort} className={selectClassName}>
            <option value="updated-desc">Newest updated</option>
            <option value="price-desc">Price high to low</option>
            <option value="price-asc">Price low to high</option>
          </select>
        </div>

        <div className="flex gap-2 md:justify-end">
          <Button type="submit" size="sm">Apply</Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/vehicles">Clear</Link>
          </Button>
        </div>
      </form>

      {workspace!.items.length ? (
        <>
          <p className="text-sm text-stone-600">{workspace!.items.length} vehicles in current view</p>
          <AdminVehicleInventoryTable
            key={JSON.stringify(workspace!.filters)}
            items={workspace!.items}
            viewKey={JSON.stringify(workspace!.filters)}
          />
        </>
      ) : hasFilters ? (
        <div className="rounded-md border border-border bg-white px-4 py-6 text-center">
          <p className="text-base font-medium text-stone-900">No vehicles match current filters.</p>
          <div className="mt-3 flex justify-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/vehicles">Reset filters</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-white px-4 py-6 text-center">
          <p className="text-base font-medium text-stone-900">No vehicles in inventory yet.</p>
          <p className="mt-1 text-sm text-stone-600">Add your first vehicle listing to get started.</p>
          <div className="mt-3">
            <Button asChild size="sm">
              <Link href="/admin/vehicles/new">Add vehicle</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
