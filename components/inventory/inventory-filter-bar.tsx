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
      <option value="" disabled className="text-stone-400 font-normal">
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
  return (
    <form
      action={actionPath}
      className="flex flex-col rounded-[24px] bg-white p-2.5 shadow-[0_8px_30px_rgba(28,25,23,0.06)] xl:flex-row xl:items-center xl:gap-0 xl:rounded-full xl:p-2"
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

      <div className="flex flex-col xl:flex-row xl:items-center">
        <div className="border-t border-stone-100 xl:border-l xl:border-t-0 xl:w-[160px]">
          <SelectField
            name="make"
            defaultValue={query.make}
            options={facets.makes}
            placeholder="Any make"
          />
        </div>
        <div className="border-t border-stone-100 xl:border-l xl:border-t-0 xl:w-[150px]">
          <SelectField
            name="location"
            defaultValue={query.location}
            options={facets.locations}
            placeholder="Any location"
          />
        </div>
        <div className="border-t border-stone-100 xl:border-l xl:border-t-0 xl:w-[160px]">
          <SelectField
            name="transmission"
            defaultValue={query.transmission}
            options={facets.transmissions}
            placeholder="Transmission"
          />
        </div>
        <div className="border-t border-stone-100 xl:border-l xl:border-t-0 xl:w-[140px]">
          <SelectField
            name="fuelType"
            defaultValue={query.fuelType}
            options={facets.fuelTypes}
            placeholder="Fuel Type"
          />
        </div>
        <div className="border-t border-stone-100 xl:border-l xl:border-t-0 xl:w-[150px] xl:pr-3">
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
        className="mt-2 h-12 rounded-xl xl:rounded-full bg-stone-950 px-8 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-stone-800 xl:mt-0"
      >
        Search
      </Button>
    </form>
  );
}
