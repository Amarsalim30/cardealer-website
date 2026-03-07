import type { Vehicle } from "@/types/dealership";

export function SpecGrid({ vehicle }: { vehicle: Vehicle }) {
  const specs = [
    { label: "Year", value: vehicle.year },
    { label: "Mileage", value: `${vehicle.mileage.toLocaleString()} km` },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Fuel type", value: vehicle.fuelType },
    { label: "Drive type", value: vehicle.driveType || "Not specified" },
    { label: "Body type", value: vehicle.bodyType || "Not specified" },
    { label: "Engine", value: vehicle.engineCapacity || "Not specified" },
    { label: "Color", value: vehicle.color || "Not specified" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {specs.map((spec) => (
        <div key={spec.label} className="rounded-3xl border border-border bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            {spec.label}
          </p>
          <p className="mt-2 text-sm font-medium text-stone-900">{spec.value}</p>
        </div>
      ))}
    </div>
  );
}
