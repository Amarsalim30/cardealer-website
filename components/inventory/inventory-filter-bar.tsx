import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryFacets, InventoryQuery } from "@/types/dealership";

function SelectField({
  name,
  defaultValue,
  options,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-stone-900 outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function InventoryFilterBar({
  actionPath = "/inventory",
  query,
  facets,
}: {
  actionPath?: string;
  query: InventoryQuery;
  facets: InventoryFacets;
}) {
  return (
    <form
      action={actionPath}
      className="surface-card grid gap-4 rounded-[28px] border border-border bg-white/95 p-5 xl:grid-cols-[1.6fr_repeat(5,1fr)_auto]"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
        <Input
          name="q"
          defaultValue={query.q}
          placeholder="Search make, model, or keyword"
          className="pl-11"
        />
      </div>
      <SelectField
        name="make"
        defaultValue={query.make}
        options={facets.makes}
        placeholder="Any make"
      />
      <SelectField
        name="location"
        defaultValue={query.location}
        options={facets.locations}
        placeholder="Any location"
      />
      <SelectField
        name="transmission"
        defaultValue={query.transmission}
        options={facets.transmissions}
        placeholder="Transmission"
      />
      <SelectField
        name="fuelType"
        defaultValue={query.fuelType}
        options={facets.fuelTypes}
        placeholder="Fuel type"
      />
      <SelectField
        name="sort"
        defaultValue={query.sort}
        options={["latest", "price-asc", "price-desc", "year-desc", "mileage-asc"]}
        placeholder="Sort order"
      />
      <Button type="submit" className="h-12">
        Search
      </Button>
    </form>
  );
}
