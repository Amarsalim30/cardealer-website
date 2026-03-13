import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryFacets, InventoryQuery } from "@/types/dealership";

function SelectField({
  name,
  defaultValue,
  options,
  placeholder,
  className = "",
}: {
  name: string;
  defaultValue?: string;
  options: string[];
  placeholder: string;
  className?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      className={`h-12 w-full appearance-none bg-transparent px-4 py-2 text-[0.85rem] font-medium text-stone-700 outline-none transition-colors hover:text-stone-900 focus:text-stone-900 ${className}`}
    >
      <option value="" className="text-stone-400 font-normal">
        {placeholder}
      </option>
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
  const hasAdvancedFilters = Boolean(
    query.make ||
      query.location ||
      query.transmission ||
      query.fuelType ||
      (query.sort && query.sort !== "latest"),
  );
  const activeFilterCount = [
    query.make,
    query.location,
    query.transmission,
    query.fuelType,
    query.sort && query.sort !== "latest" ? query.sort : undefined,
  ].filter(Boolean).length;

  return (
    <form
      action={actionPath}
      className="flex flex-col gap-3 rounded-[24px] bg-white p-2.5 shadow-[0_8px_30px_rgba(28,25,23,0.06)] lg:flex-row lg:items-center lg:gap-0 lg:rounded-full lg:p-2"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[1.15rem] -translate-y-1/2 text-stone-400" />
        <Input
          name="q"
          defaultValue={query.q}
          placeholder="Search make, model, or keyword..."
          className="h-12 min-w-[240px] border-0 bg-transparent pl-11 text-[0.85rem] font-medium text-stone-700 placeholder:font-normal placeholder:text-stone-400 focus-visible:ring-0"
        />
      </div>

      <details
        open={hasAdvancedFilters}
        className="overflow-hidden rounded-[20px] border border-stone-100 bg-stone-50 lg:hidden"
      >
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-stone-900 [&::-webkit-details-marker]:hidden">
          {activeFilterCount
            ? `More filters (${activeFilterCount})`
            : "More filters"}
        </summary>
        <div className="grid border-t border-stone-200">
          <div className="border-t border-stone-100 first:border-t-0">
            <SelectField
              name="make"
              defaultValue={query.make}
              options={facets.makes}
              placeholder="Any make"
            />
          </div>
          <div className="border-t border-stone-100">
            <SelectField
              name="location"
              defaultValue={query.location}
              options={facets.locations}
              placeholder="Any location"
            />
          </div>
          <div className="border-t border-stone-100">
            <SelectField
              name="transmission"
              defaultValue={query.transmission}
              options={facets.transmissions}
              placeholder="Transmission"
            />
          </div>
          <div className="border-t border-stone-100">
            <SelectField
              name="fuelType"
              defaultValue={query.fuelType}
              options={facets.fuelTypes}
              placeholder="Fuel Type"
            />
          </div>
          <div className="border-t border-stone-100">
            <SelectField
              name="sort"
              defaultValue={query.sort}
              options={["latest", "price-asc", "price-desc", "year-desc", "mileage-asc"]}
              placeholder="Sort Order"
            />
          </div>
        </div>
      </details>

      <div className="hidden lg:flex lg:flex-row lg:items-center">
        <div className="border-t border-stone-100 lg:w-[160px] lg:border-l lg:border-t-0">
          <SelectField
            name="make"
            defaultValue={query.make}
            options={facets.makes}
            placeholder="Any make"
          />
        </div>
        <div className="border-t border-stone-100 lg:w-[150px] lg:border-l lg:border-t-0">
          <SelectField
            name="location"
            defaultValue={query.location}
            options={facets.locations}
            placeholder="Any location"
          />
        </div>
        <div className="border-t border-stone-100 lg:w-[160px] lg:border-l lg:border-t-0">
          <SelectField
            name="transmission"
            defaultValue={query.transmission}
            options={facets.transmissions}
            placeholder="Transmission"
          />
        </div>
        <div className="border-t border-stone-100 lg:w-[140px] lg:border-l lg:border-t-0">
          <SelectField
            name="fuelType"
            defaultValue={query.fuelType}
            options={facets.fuelTypes}
            placeholder="Fuel Type"
          />
        </div>
        <div className="border-t border-stone-100 lg:w-[150px] lg:border-l lg:border-t-0 lg:pr-3">
          <SelectField
            name="sort"
            defaultValue={query.sort}
            options={["latest", "price-asc", "price-desc", "year-desc", "mileage-asc"]}
            placeholder="Sort Order"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="h-12 rounded-xl bg-stone-950 px-8 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-stone-800 lg:rounded-full"
      >
        Search
      </Button>
    </form>
  );
}
