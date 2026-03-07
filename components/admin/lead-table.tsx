import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LeadInboxItem } from "@/types/dealership";

function humanizeLeadType(type: LeadInboxItem["type"]) {
  if (type === "test_drive") {
    return "Test Drive";
  }

  if (type === "trade_in") {
    return "Trade-In";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function LeadTable({ items }: { items: LeadInboxItem[] }) {
  return (
    <Card className="overflow-hidden rounded-[28px]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Lead</th>
              <th className="px-6 py-4 font-semibold">Vehicle</th>
              <th className="px-6 py-4 font-semibold">Message</th>
              <th className="px-6 py-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border/70 align-top">
                <td className="px-6 py-5">
                  <Badge variant="accent" className="mb-3">
                    {humanizeLeadType(item.type)}
                  </Badge>
                  <p className="font-semibold text-stone-950">{item.name}</p>
                  <p className="mt-1 text-stone-600">{item.phone}</p>
                  {item.email ? <p className="text-stone-600">{item.email}</p> : null}
                </td>
                <td className="px-6 py-5 text-stone-700">
                  {item.vehicleTitle || "General enquiry"}
                </td>
                <td className="px-6 py-5 text-stone-700">
                  <p>{item.message || "No message provided."}</p>
                  {Object.entries(item.meta).length ? (
                    <div className="mt-3 space-y-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                      {Object.entries(item.meta).map(([key, value]) =>
                        value ? (
                          <p key={key}>
                            {key}: {String(value)}
                          </p>
                        ) : null,
                      )}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-5 text-stone-600">
                  {new Date(item.createdAt).toLocaleString("en-KE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
