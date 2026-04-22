import type { Vehicle } from "@/types/dealership";

export function SpecGrid({ vehicle }: { vehicle: Vehicle }) {
  const specs = [
    { label: "Model year", value: vehicle.year },
    { label: "Distance driven", value: `${vehicle.mileage.toLocaleString()} km` },
    { label: "Drive style", value: vehicle.transmission },
    { label: "Fuel", value: vehicle.fuelType },
    { label: "Road setup", value: vehicle.driveType || "Not specified" },
    { label: "Body style", value: vehicle.bodyType || "Not specified" },
    { label: "Power", value: vehicle.engineCapacity || "Not specified" },
    { label: "Exterior colour", value: vehicle.color || "Not specified" },
  ];

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="rounded-[20px] border border-border/80 bg-[linear-gradient(180deg,_rgba(249,251,252,0.98),_rgba(241,244,247,0.94))] px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
        >
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            {spec.label}
          </p>
          <p className="mt-1.5 text-[0.98rem] font-semibold tracking-[-0.03em] text-text-primary">
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}
