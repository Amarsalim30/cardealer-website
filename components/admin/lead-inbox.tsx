import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LeadWorkflowActions } from "@/components/admin/lead-workflow-actions";
import { buildWhatsAppUrl, cn } from "@/lib/utils";
import type { LeadInboxItem, LeadWorkflowStatus } from "@/types/dealership";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function humanizeLeadType(type: LeadInboxItem["type"]) {
  if (type === "test_drive") {
    return "Viewing";
  }

  if (type === "trade_in") {
    return "Trade-in";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function humanizeLeadStatus(status: LeadWorkflowStatus) {
  if (status === "follow_up") {
    return "Follow up";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusVariant(status: LeadWorkflowStatus) {
  if (status === "new") {
    return "accent";
  }

  if (status === "contacted") {
    return "success";
  }

  if (status === "closed") {
    return "default";
  }

  return "muted";
}

function buildLeadWhatsAppMessage(item: LeadInboxItem) {
  return `Hi ${item.name}, this is Ocean Motors following up on your ${
    item.vehicleTitle || "enquiry"
  }.`;
}

export function LeadInbox({ items }: { items: LeadInboxItem[] }) {
  if (!items.length) {
    return (
      <Card className="rounded-[30px] border border-border/70 bg-white/95 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          No leads in this view
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-stone-950">
          Nothing needs attention here right now.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
          Try a different lead type or workflow status to keep triage moving.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Card
          key={`${item.sourceType}-${item.sourceId}`}
          className="rounded-[30px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6"
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.95fr)]">
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{humanizeLeadType(item.type)}</Badge>
                <Badge variant={getStatusVariant(item.status)}>
                  {humanizeLeadStatus(item.status)}
                </Badge>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                  {formatDateTime(item.createdAt)}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div>
                  <h3 className="text-xl font-semibold text-stone-950">
                    {item.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full"
                    >
                      <Link href={`tel:${item.phone.replace(/\s+/g, "")}`}>Call</Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                    >
                      <Link
                        href={buildWhatsAppUrl(
                          buildLeadWhatsAppMessage(item),
                          item.phone,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </Link>
                    </Button>
                    {item.email ? (
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                      >
                        <Link href={`mailto:${item.email}`}>Email</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2 rounded-[24px] border border-border/70 bg-stone-50/90 p-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                      Vehicle
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-950">
                      {item.vehicleTitle || "General enquiry"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                      Contact
                    </p>
                    <p className="mt-1 text-sm text-stone-700">{item.phone}</p>
                    {item.email ? (
                      <p className="text-sm text-stone-700">{item.email}</p>
                    ) : null}
                  </div>
                  {item.lastContactedAt ? (
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                        Last contacted
                      </p>
                      <p className="mt-1 text-sm text-stone-700">
                        {formatDateTime(item.lastContactedAt)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {item.message ? (
                <div className="rounded-[24px] border border-border/70 bg-white px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Customer message
                  </p>
                  <p className="mt-2 text-sm leading-7 text-stone-700">
                    {item.message}
                  </p>
                </div>
              ) : null}

              {item.details.length ? (
                <dl className="grid gap-3 sm:grid-cols-2">
                  {item.details.map((detail) => (
                    <div
                      key={`${item.id}-${detail.label}`}
                      className="rounded-[22px] border border-border/70 bg-stone-50/80 px-4 py-3"
                    >
                      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {detail.label}
                      </dt>
                      <dd className={cn("mt-1 text-sm text-stone-800")}>
                        {detail.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            <aside className="rounded-[28px] border border-border/70 bg-stone-50/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Workflow
              </p>
              <h4 className="mt-2 text-lg font-semibold text-stone-950">
                Keep this enquiry moving
              </h4>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Update the triage state after each customer touchpoint so the
                inbox stays truthful.
              </p>
              <div className="mt-4">
                <LeadWorkflowActions
                  sourceId={item.sourceId}
                  sourceType={item.sourceType}
                  status={item.status}
                />
              </div>
            </aside>
          </div>
        </Card>
      ))}
    </div>
  );
}
