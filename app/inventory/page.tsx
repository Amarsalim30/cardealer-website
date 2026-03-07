import Link from "next/link";
import type { Metadata } from "next";

import { JsonLd } from "@/components/layout/json-ld";
import { SectionHeading } from "@/components/marketing/section-heading";
import { InventoryFilterBar } from "@/components/inventory/inventory-filter-bar";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { Button } from "@/components/ui/button";
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildMetadata,
} from "@/lib/seo";
import { listInventory } from "@/lib/data/repository";
import { parseInventoryQuery } from "@/lib/validation/inventory";

export const metadata: Metadata = buildMetadata({
  title: "Inventory",
  description:
    "Browse all available used, new, imported, and traded-in vehicles in Nairobi.",
  path: "/inventory",
});

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseInventoryQuery(await searchParams);
  const result = await listInventory(query);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Inventory", path: "/inventory" },
  ]);
  const itemListJsonLd = buildItemListJsonLd(result.items, "All inventory");

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />
      <section className="section-shell">
        <div className="container-shell space-y-10">
          <SectionHeading
            eyebrow="Inventory"
            title="Browse current stock and search by the filters buyers use most"
            description="The inventory view stays server-rendered and mobile-friendly, with practical search options instead of heavy interface chrome."
          />
          <InventoryFilterBar query={query} facets={result.facets} />

          <div className="grid gap-6 lg:grid-cols-3">
            {result.items.length ? (
              result.items.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-border bg-white/60 p-8 text-stone-600 lg:col-span-3">
                No vehicles matched those filters. Clear a few fields and try again.
              </div>
            )}
          </div>

          {result.totalPages > 1 ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: result.totalPages }, (_, index) => {
                const page = index + 1;
                const params = new URLSearchParams();

                Object.entries(query).forEach(([key, value]) => {
                  if (value !== undefined && value !== null && value !== "") {
                    params.set(key, String(value));
                  }
                });

                params.set("page", String(page));

                return (
                  <Button
                    key={page}
                    asChild
                    variant={page === result.page ? "primary" : "secondary"}
                    size="sm"
                  >
                    <Link href={`/inventory?${params.toString()}`}>{page}</Link>
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
