import type { Metadata } from "next";
import Link from "next/link";

import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { LeadInbox } from "@/components/admin/lead-inbox";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/auth";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getLeadInbox } from "@/lib/data/repository";
import { cn } from "@/lib/utils";
import {
  leadInboxFilters,
  leadWorkflowStatuses,
  type LeadInboxFilter,
  type LeadInboxStatusFilter,
} from "@/types/dealership";

export const metadata: Metadata = {
  title: "Lead inbox",
  description: "Triage customer enquiries, viewing requests, and trade-in conversations.",
};

const filters = leadInboxFilters;

function humanizeLeadFilter(filter: LeadInboxFilter) {
  if (filter === "all") {
    return "All leads";
  }

  if (filter === "test_drive") {
    return "Viewing";
  }

  if (filter === "trade_in") {
    return "Trade-in";
  }

  return filter.charAt(0).toUpperCase() + filter.slice(1);
}

function humanizeWorkflowStatus(status: LeadInboxStatusFilter) {
  if (status === "all") {
    return "All statuses";
  }

  if (status === "follow_up") {
    return "Follow up";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusCount(
  summary: Awaited<ReturnType<typeof getLeadInbox>>["summary"],
  status: LeadInboxStatusFilter,
) {
  if (status === "all") {
    return summary.total;
  }

  if (status === "new") {
    return summary.newCount;
  }

  if (status === "contacted") {
    return summary.contactedCount;
  }

  if (status === "follow_up") {
    return summary.followUpCount;
  }

  return summary.closedCount;
}

function buildLeadsHref(
  filter: LeadInboxFilter,
  status: LeadInboxStatusFilter,
) {
  if (filter === "all" && status === "all") {
    return "/admin/leads";
  }

  return `/admin/leads?filter=${filter}&status=${status}`;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const params = await searchParams;
  const activeFilter =
    typeof params.filter === "string" &&
    filters.includes(params.filter as LeadInboxFilter)
      ? (params.filter as LeadInboxFilter)
      : "all";
  const activeStatus =
    typeof params.status === "string" &&
    (["all", ...leadWorkflowStatuses] as const).includes(
      params.status as LeadInboxStatusFilter,
    )
      ? (params.status as LeadInboxStatusFilter)
      : "all";
  const notice = typeof params.notice === "string" ? params.notice : "";

  let inbox: Awaited<ReturnType<typeof getLeadInbox>> | null = null;
  let unavailableDescription: string | null = null;

  try {
    inbox = await getLeadInbox(
      {
        type: activeFilter,
        status: activeStatus,
      },
      {
        forceDemo: session.mode === "demo",
      },
    );
  } catch (error) {
    if (isRepositoryUnavailableError(error)) {
      unavailableDescription = error.message;
    } else {
      throw error;
    }
  }

  if (unavailableDescription) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Lead operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">
              Lead inbox
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-stone-600">
              Work the newest enquiries first, keep the queue truthful, and keep
              handoff friction low on mobile.
            </p>
          </div>
        </div>

        <AdminUnavailableState
          title="Lead inbox is unavailable"
          description={unavailableDescription}
          retryHref={buildLeadsHref(activeFilter, activeStatus)}
          backHref="/admin/vehicles"
        />
      </div>
    );
  }

  const statusFilters: Array<{
    label: string;
    value: LeadInboxStatusFilter;
  }> = [
    { label: "All", value: "all" },
    ...leadWorkflowStatuses.map((status) => ({
      label: humanizeWorkflowStatus(status),
      value: status,
    })),
  ];

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Lead operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">
              Lead inbox
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-stone-600">
              Scan the queue like an inbox: newest first, open one lead, update
              it, and move on.
            </p>
          </div>

          <Button asChild variant="secondary" size="sm">
            <Link href={buildLeadsHref(activeFilter, activeStatus)}>Refresh view</Link>
          </Button>
        </div>

        {notice ? (
          <div
            className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
            role="status"
          >
            {notice}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => {
            const isActive = status.value === activeStatus;

            return (
              <Link
                key={status.value}
                href={buildLeadsHref(activeFilter, status.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-stone-950 bg-stone-950 text-white"
                    : "border-border bg-white text-stone-700 hover:bg-stone-50",
                )}
              >
                <span>{status.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive ? "bg-white/15 text-white" : "bg-stone-100 text-stone-700",
                  )}
                >
                  {getStatusCount(inbox!.scopedSummary, status.value)}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = filter === activeFilter;

            return (
              <Link
                key={filter}
                href={buildLeadsHref(filter, activeStatus)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-stone-700 hover:bg-stone-50",
                )}
              >
                <span>{humanizeLeadFilter(filter)}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive ? "bg-white/15 text-white" : "bg-stone-100 text-stone-700",
                  )}
                >
                  {inbox!.typeCounts[filter]}
                </span>
              </Link>
            );
          })}
        </div>

        <p className="text-sm text-stone-600">
          {humanizeLeadFilter(activeFilter)} in {humanizeWorkflowStatus(activeStatus).toLowerCase()}
          {" "}
          with {inbox!.items.length} {inbox!.items.length === 1 ? "enquiry" : "enquiries"}.
        </p>
      </section>

      <LeadInbox items={inbox!.items} />
    </div>
  );
}
