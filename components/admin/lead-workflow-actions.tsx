"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

const statusOptions: Array<{
  label: string;
  value: LeadWorkflowStatus;
}> = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Follow up", value: "follow_up" },
  { label: "Closed", value: "closed" },
];

export function LeadWorkflowActions({
  sourceId,
  sourceType,
  status,
}: {
  sourceId: string;
  sourceType: LeadInboxSourceType;
  status: LeadWorkflowStatus;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<LeadWorkflowStatus>(status);
  const [state, formAction] = useActionState(
    updateLeadInboxStateAction,
    initialState,
  );

  useEffect(() => {
    setNextStatus(status);
  }, [status]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <div className="space-y-2">
      {status !== "contacted" ? (
        <form action={formAction}>
          <input type="hidden" name="sourceId" value={sourceId} />
          <input type="hidden" name="sourceType" value={sourceType} />
          <input type="hidden" name="status" value="contacted" />
          <SubmitButton size="sm" className="rounded-full">
            Mark contacted
          </SubmitButton>
        </form>
      ) : null}

      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="sourceId" value={sourceId} />
        <input type="hidden" name="sourceType" value={sourceType} />
        <input type="hidden" name="status" value={nextStatus} />
        <select
          className={selectClassName}
          value={nextStatus}
          onChange={(event) =>
            setNextStatus(event.target.value as LeadWorkflowStatus)
          }
          aria-label="Lead status"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SubmitButton
          size="sm"
          variant="secondary"
          className={cn("rounded-full", nextStatus === status ? "opacity-80" : "")}
        >
          Update
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
