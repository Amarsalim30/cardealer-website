"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Phone, X } from "lucide-react";

import { LeadWorkflowActions } from "@/components/admin/lead-workflow-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, cn } from "@/lib/utils";
import type { LeadInboxItem, LeadWorkflowStatus } from "@/types/dealership";

function formatRowTimestamp(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDetailTimestamp(value: string) {
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

function getStatusDotClass(status: LeadWorkflowStatus) {
  if (status === "new") {
    return "bg-accent";
  }

  if (status === "contacted") {
    return "bg-success";
  }

  if (status === "follow_up") {
    return "bg-amber-500";
  }

  return "bg-stone-300";
}

function getLeadKey(item: Pick<LeadInboxItem, "sourceId" | "sourceType">) {
  return `${item.sourceType}:${item.sourceId}`;
}

function getLeadSubject(item: LeadInboxItem) {
  if (item.vehicleTitle) {
    return item.vehicleTitle;
  }

  if (item.type === "quote") {
    return "General quote request";
  }

  if (item.type === "contact") {
    return "General enquiry";
  }

  if (item.type === "financing") {
    return "Financing enquiry";
  }

  if (item.type === "test_drive") {
    return "Viewing request";
  }

  return "Trade-in enquiry";
}

function getLeadPreview(item: LeadInboxItem) {
  const preview =
    item.message?.trim() || item.details[0]?.value || item.source?.trim();

  return preview || "No message added yet.";
}

function buildLeadWhatsAppMessage(item: LeadInboxItem) {
  return `Hi ${item.name}, this is Ocean Motors following up on your ${
    item.vehicleTitle || "enquiry"
  }.`;
}

function LeadPrimaryActions({
  item,
  mobile = false,
}: {
  item: LeadInboxItem;
  mobile?: boolean;
}) {
  return (
    <div
      className={cn(
        mobile ? "grid gap-2" : "flex flex-wrap gap-2",
        mobile && (item.email ? "grid-cols-3" : "grid-cols-2"),
      )}
    >
      <Button
        asChild
        size="sm"
        className={cn(mobile ? "w-full justify-center" : "rounded-full")}
      >
        <Link href={`tel:${item.phone.replace(/\s+/g, "")}`}>
          <Phone className="size-4" />
          Call
        </Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant="whatsapp"
        className={cn(mobile ? "w-full justify-center" : "rounded-full")}
      >
        <Link
          href={buildWhatsAppUrl(buildLeadWhatsAppMessage(item), item.phone)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </Link>
      </Button>
      {item.email ? (
        <Button
          asChild
          size="sm"
          variant={mobile ? "secondary" : "ghost"}
          className={cn(mobile ? "w-full justify-center" : "rounded-full")}
        >
          <Link href={`mailto:${item.email}`}>
            <Mail className="size-4" />
            Email
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function LeadEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[240px] flex-col justify-center px-5 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        Lead inbox
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-stone-950">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
        {description}
      </p>
    </div>
  );
}

function LeadDetailContent({
  item,
  mobile = false,
}: {
  item: LeadInboxItem;
  mobile?: boolean;
}) {
  const subject = getLeadSubject(item);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-5 p-4 sm:p-5">
          <section className="border-b border-border/70 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="accent"
                className="px-2.5 py-1 text-[0.64rem] tracking-[0.18em]"
              >
                {humanizeLeadType(item.type)}
              </Badge>
              <Badge
                variant={getStatusVariant(item.status)}
                className="px-2.5 py-1 text-[0.64rem] tracking-[0.18em]"
              >
                {humanizeLeadStatus(item.status)}
              </Badge>
              {item.status === "new" ? (
                <span className="rounded-full bg-accent/10 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-accent">
                  Needs first touch
                </span>
              ) : null}
            </div>

            <h2 className="mt-3 text-2xl font-semibold text-stone-950">
              {item.name}
            </h2>
            <p className="mt-1 text-sm text-stone-700">{subject}</p>

            {!mobile ? (
              <div className="mt-3">
                <LeadPrimaryActions item={item} />
              </div>
            ) : null}
          </section>

          <section className="grid gap-3 border-b border-border/70 pb-5 text-sm text-stone-700 sm:grid-cols-2">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                Phone
              </p>
              <p className="mt-1.5 text-base font-medium text-stone-950">
                {item.phone}
              </p>
            </div>

            {item.email ? (
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Email
                </p>
                <p className="mt-1.5 break-all text-base font-medium text-stone-950">
                  {item.email}
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                Received
              </p>
              <p className="mt-1.5 text-sm text-stone-700">
                {formatDetailTimestamp(item.createdAt)}
              </p>
            </div>

            {item.lastContactedAt ? (
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Last touch
                </p>
                <p className="mt-1.5 text-sm text-stone-700">
                  {formatDetailTimestamp(item.lastContactedAt)}
                </p>
              </div>
            ) : null}
          </section>

          <section className="border-b border-border/70 pb-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
              Vehicle or enquiry
            </p>
            <div className="mt-2.5 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-stone-950">
                  {subject}
                </p>
                {item.source ? (
                  <p className="mt-1.5 text-sm text-stone-600">{item.source}</p>
                ) : null}
              </div>

              {item.vehicleId ? (
                <Button asChild size="sm" variant="ghost" className="rounded-full">
                  <Link href={`/admin/vehicles/${item.vehicleId}`}>
                    Open listing
                  </Link>
                </Button>
              ) : null}
            </div>
          </section>

          {item.message ? (
            <section className="border-b border-border/70 pb-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                Customer message
              </p>
              <p className="mt-2.5 text-sm leading-6 text-stone-700">
                {item.message}
              </p>
            </section>
          ) : null}

          {item.details.length ? (
            <section className="border-b border-border/70 pb-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                Lead details
              </p>
              <dl className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                {item.details.map((detail) => (
                  <div
                    key={`${item.id}-${detail.label}`}
                    className="rounded-[18px] bg-stone-50 px-3 py-2.5"
                  >
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                      {detail.label}
                    </dt>
                    <dd className="mt-1.5 text-sm text-stone-800">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className={mobile ? "pb-2" : ""}>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
              Workflow
            </p>
            <div className="mt-3 max-w-xs">
              <LeadWorkflowActions
                sourceId={item.sourceId}
                sourceType={item.sourceType}
                status={item.status}
              />
            </div>
          </section>
        </div>
      </div>

      {mobile ? (
        <div className="border-t border-border/70 bg-white/95 px-4 py-3 backdrop-blur">
          <LeadPrimaryActions item={item} mobile />
        </div>
      ) : null}
    </div>
  );
}

export function LeadInbox({ items }: { items: LeadInboxItem[] }) {
  const firstLeadKey = items[0] ? getLeadKey(items[0]) : null;
  const [selectedLeadKey, setSelectedLeadKey] = useState<string | null>(
    firstLeadKey,
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const activeLeadKey =
    selectedLeadKey &&
    items.some((item) => getLeadKey(item) === selectedLeadKey)
      ? selectedLeadKey
      : firstLeadKey;
  const selectedItem =
    items.find((item) => getLeadKey(item) === activeLeadKey) || null;

  if (!items.length) {
    return (
      <div className="overflow-hidden rounded-[26px] border border-border/70 bg-white/95 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <LeadEmptyState
          title="No leads in this view"
          description="Try a different lead type, status, or search term to bring enquiries back into the inbox."
        />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[26px] border border-border/70 bg-white/95 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.88fr)]">
          <section className="min-w-0 lg:border-r lg:border-border/70">
            <ul className="divide-y divide-border/70">
              {items.map((item) => {
                const itemKey = getLeadKey(item);
                const isSelected = itemKey === activeLeadKey;

                return (
                  <li key={itemKey}>
                    <button
                      type="button"
                      className={cn(
                        "group flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors sm:px-4 sm:py-3",
                        isSelected ? "bg-[#f7f5ef]" : "bg-white hover:bg-stone-50",
                      )}
                      aria-label={`Open lead from ${item.name}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        const shouldOpenMobileDetail =
                          typeof window !== "undefined" &&
                          typeof window.matchMedia === "function" &&
                          window.matchMedia("(max-width: 1023px)").matches;

                        setSelectedLeadKey(itemKey);
                        setMobileDetailOpen(shouldOpenMobileDetail);
                      }}
                    >
                      <span
                        className={cn(
                          "mt-1.5 size-2.5 shrink-0 rounded-full",
                          getStatusDotClass(item.status),
                        )}
                        aria-hidden="true"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className={cn(
                              "truncate text-sm leading-5",
                              item.status === "new"
                                ? "font-semibold text-stone-950"
                                : "font-medium text-stone-900",
                            )}
                          >
                            {item.name}
                          </p>
                          <p className="shrink-0 text-xs font-medium text-stone-500">
                            {formatRowTimestamp(item.lastContactedAt || item.createdAt)}
                          </p>
                        </div>

                        <p className="mt-0.5 line-clamp-1 text-sm text-stone-600">
                          <span className="font-medium text-stone-800">
                            {getLeadSubject(item)}
                          </span>
                          {" - "}
                          {getLeadPreview(item)}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="accent"
                            className="px-2 py-0.5 text-[0.58rem] tracking-[0.14em]"
                          >
                            {humanizeLeadType(item.type)}
                          </Badge>
                          <Badge
                            variant={getStatusVariant(item.status)}
                            className="px-2 py-0.5 text-[0.58rem] tracking-[0.14em]"
                          >
                            {humanizeLeadStatus(item.status)}
                          </Badge>
                          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-stone-500">
                            {item.email ? "Call / WhatsApp / Email" : "Call / WhatsApp"}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="hidden min-h-[680px] bg-white lg:flex">
            {selectedItem ? (
              <LeadDetailContent item={selectedItem} />
            ) : (
              <LeadEmptyState
                title="Pick a lead to inspect"
                description="Select any row from the inbox to open the customer message, contact details, and next action."
              />
            )}
          </aside>
        </div>
      </div>

      {mobileDetailOpen && selectedItem ? (
        <div
          className="fixed inset-0 z-50 bg-stone-950/35 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Lead detail"
          onClick={() => setMobileDetailOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 top-14 overflow-hidden rounded-t-[24px] bg-white shadow-[0_-18px_42px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Lead detail
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-950">
                    {selectedItem.name}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
                  aria-label="Close lead detail"
                  onClick={() => setMobileDetailOpen(false)}
                >
                  <X className="size-4" />
                </button>
              </div>

              <LeadDetailContent item={selectedItem} mobile />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
