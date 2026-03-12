import Link from "next/link";

import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { LeadTable } from "@/components/admin/lead-table";
import { Button } from "@/components/ui/button";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getLeadInbox } from "@/lib/data/repository";
import type { LeadInboxFilter } from "@/types/dealership";

const filters: LeadInboxFilter[] = [
  "all",
  "quote",
  "contact",
  "financing",
  "test_drive",
  "trade_in",
];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const activeFilter =
    typeof params.filter === "string" &&
    filters.includes(params.filter as LeadInboxFilter)
      ? (params.filter as LeadInboxFilter)
      : "all";
  let items: Awaited<ReturnType<typeof getLeadInbox>> = [];
  let unavailableDescription: string | null = null;

  try {
    items = await getLeadInbox(activeFilter);
  } catch (error) {
    if (isRepositoryUnavailableError(error)) {
      unavailableDescription = error.message;
    } else {
      throw error;
    }
  }

  if (unavailableDescription) {
    return (
      <AdminUnavailableState
        title="Lead inbox is unavailable"
        description={unavailableDescription}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <Button
            key={filter}
            asChild
            variant={filter === activeFilter ? "primary" : "secondary"}
            size="sm"
          >
            <Link href={filter === "all" ? "/admin/leads" : `/admin/leads?filter=${filter}`}>
              {filter.replaceAll("_", " ")}
            </Link>
          </Button>
        ))}
      </div>
      <LeadTable items={items} />
    </div>
  );
}
