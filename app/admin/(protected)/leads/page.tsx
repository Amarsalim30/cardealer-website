import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { LeadInbox } from "@/components/admin/lead-inbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdminSession } from "@/lib/auth";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { getLeadInbox } from "@/lib/data/repository";
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

  let inbox: Awaited<ReturnType<typeof getLeadInbox>> | null = null;
  let unavailableDescription: string | null = null;

  try {
    inbox = await getLeadInbox({
      type: activeFilter,
      status: activeStatus,
    }, {
      forceDemo: session.mode === "demo",
    });
  } catch (error) {
    if (isRepositoryUnavailableError(error)) {
      unavailableDescription = error.message;
    } else {
      throw error;
    }
  }

  if (unavailableDescription) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Lead operations"
          title="Lead inbox"
          description="Respond to new customer intent quickly, keep the workflow truthful, and avoid losing warm enquiries."
        />
        <AdminUnavailableState
          title="Lead inbox is unavailable"
          description={unavailableDescription}
          retryHref={
            activeFilter === "all" && activeStatus === "all"
              ? "/admin/leads"
              : `/admin/leads?filter=${activeFilter}&status=${activeStatus}`
          }
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

  const summaryCards: Array<{
    label: string;
    value: LeadInboxStatusFilter;
  }> = [
    { label: "All leads", value: "all" },
    { label: "New", value: "new" },
    { label: "Follow up", value: "follow_up" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Lead operations"
        title="Lead inbox"
        description="Treat this like a lightweight CRM: triage fast, update status after each touchpoint, and keep the queue focused on what still needs action."
        actions={
          <Button asChild variant="secondary">
            <Link
              href={
                activeFilter === "all" && activeStatus === "all"
                  ? "/admin/leads"
                  : `/admin/leads?filter=${activeFilter}&status=${activeStatus}`
              }
            >
              Refresh view
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.value}
            className="rounded-[28px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
              {card.label}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold text-stone-950">
                {getStatusCount(inbox!.summary, card.value)}
              </p>
              {card.value === activeStatus ? (
                <Badge variant="accent">Active</Badge>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-[30px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Lead type
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  asChild
                  variant={filter === activeFilter ? "primary" : "secondary"}
                  size="sm"
                >
                  <Link
                    href={
                      filter === "all" && activeStatus === "all"
                        ? "/admin/leads"
                        : `/admin/leads?filter=${filter}&status=${activeStatus}`
                    }
                  >
                    {humanizeLeadFilter(filter)}
                    <span className="text-xs opacity-80">
                      {inbox!.typeCounts[filter]}
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Workflow status
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <Button
                  key={status.value}
                  asChild
                  variant={status.value === activeStatus ? "primary" : "secondary"}
                  size="sm"
                >
                  <Link
                    href={
                      activeFilter === "all" && status.value === "all"
                        ? "/admin/leads"
                        : `/admin/leads?filter=${activeFilter}&status=${status.value}`
                    }
                  >
                    {status.label}
                    <span className="text-xs opacity-80">
                      {getStatusCount(inbox!.summary, status.value)}
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold text-stone-950">
            {humanizeLeadFilter(activeFilter)}
          </p>
          <p className="text-sm text-stone-600">
            {humanizeWorkflowStatus(activeStatus)} view with {inbox!.items.length}{" "}
            enquiry
            {inbox!.items.length === 1 ? "" : "ies"}.
          </p>
        </div>
      </div>

      <LeadInbox items={inbox!.items} />
    </div>
  );
}
