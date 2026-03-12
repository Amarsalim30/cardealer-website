import { Card } from "@/components/ui/card";

export function AdminUnavailableState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-[24px] border border-red-200 bg-red-50/70 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
        Admin unavailable
      </p>
      <h3 className="mt-3 text-xl font-semibold text-stone-950">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700">
        {description}
      </p>
    </Card>
  );
}
