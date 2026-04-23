"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { updateLeadInboxStateAction } from "@/lib/actions/admin-actions";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-button";
import type {
  ActionState,
  LeadInboxSourceType,
  LeadWorkflowStatus,
} from "@/types/dealership";

const initialState: ActionState = {
  success: false,
  message: "",
};

const selectClassName =
  "h-10 rounded-2xl border border-border bg-white px-3 text-sm text-stone-900 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

function humanizeLeadStatus(status: LeadWorkflowStatus) {
  if (status === "follow_up") {
    return "Follow up";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getAllowedNextStatuses(
  currentStatus: LeadWorkflowStatus,
): LeadWorkflowStatus[] {
  if (currentStatus === "new") {
    return ["contacted"];
  }

  if (currentStatus === "contacted") {
    return ["follow_up", "closed"];
  }

  if (currentStatus === "follow_up") {
    return ["contacted", "closed"];
  }

  return ["contacted"];
}

function buildLeadWorkflowNotice(
  activeStatusFilter: string | null,
  nextStatus: LeadWorkflowStatus,
  actionMessage: string,
) {
  if (
    activeStatusFilter &&
    activeStatusFilter !== "all" &&
    activeStatusFilter !== nextStatus
  ) {
    return `${actionMessage} It may no longer appear because this view is filtered to ${humanizeLeadStatus(activeStatusFilter as LeadWorkflowStatus)}.`;
  }

  return actionMessage;
}

function getSubmitLabel(nextStatus: LeadWorkflowStatus) {
  if (nextStatus === "contacted") {
    return "Mark contacted";
  }

  if (nextStatus === "follow_up") {
    return "Move to follow up";
  }

  return "Close lead";
}

export function LeadWorkflowActions({
  sourceId,
  sourceType,
  status,
}: {
  sourceId: string;
  sourceType: LeadInboxSourceType;
  status: LeadWorkflowStatus;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const availableStatuses = useMemo(() => getAllowedNextStatuses(status), [status]);
  const [nextStatus, setNextStatus] = useState<LeadWorkflowStatus>(
    availableStatuses[0] || status,
  );
  const [state, formAction] = useActionState(
    updateLeadInboxStateAction,
    initialState,
  );

  useEffect(() => {
    setNextStatus(getAllowedNextStatuses(status)[0] || status);
  }, [status]);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set(
      "notice",
      buildLeadWorkflowNotice(
        params.get("status"),
        nextStatus,
        state.message || "Lead status updated.",
      ),
    );
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.location.assign(nextUrl);
  }, [nextStatus, pathname, searchParams, state.message, state.success]);

  return (
    <div className="space-y-2">
      <form action={formAction} className="space-y-2">
        <input type="hidden" name="sourceId" value={sourceId} />
        <input type="hidden" name="sourceType" value={sourceType} />
        <input type="hidden" name="status" value={nextStatus} />

        {availableStatuses.length > 1 ? (
          <div className="space-y-1">
            <label
              htmlFor={`lead-status-${sourceType}-${sourceId}`}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500"
            >
              Next step
            </label>
            <select
              id={`lead-status-${sourceType}-${sourceId}`}
              className={selectClassName}
              value={nextStatus}
              onChange={(event) =>
                setNextStatus(event.target.value as LeadWorkflowStatus)
              }
              aria-label="Next lead status"
            >
              {availableStatuses.map((option) => (
                <option key={option} value={option}>
                  {humanizeLeadStatus(option)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Next step
            </p>
            <p className="mt-1 text-sm font-medium text-stone-900">
              {humanizeLeadStatus(nextStatus)}
            </p>
          </div>
        )}

        <SubmitButton
          size="sm"
          className={cn(
            "rounded-full",
            availableStatuses.length === 1 ? "w-full justify-center" : "",
          )}
        >
          {getSubmitLabel(nextStatus)}
        </SubmitButton>
      </form>

      {state.message && !state.success ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
