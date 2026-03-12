"use client";

import { useActionState } from "react";

import { submitLeadAction } from "@/lib/actions/public-actions";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getActionFieldState } from "@/components/forms/action-form-field-helpers";
import type { ActionState, LeadType } from "@/types/dealership";

const initialState: ActionState = { success: false, message: "" };

export function LeadCaptureForm({
  title,
  description,
  leadType,
  source,
  vehicleId,
  vehicleTitle,
  submitLabel,
  className = "",
}: {
  title: string;
  description: string;
  leadType: LeadType;
  source: string;
  vehicleId?: string;
  vehicleTitle?: string;
  submitLabel: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(submitLeadAction, initialState);
  const formId = `lead-capture-${leadType}`;
  const nameField = getActionFieldState(state, formId, "name");
  const phoneField = getActionFieldState(state, formId, "phone");
  const emailField = getActionFieldState(state, formId, "email");
  const messageField = getActionFieldState(state, formId, "message");

  return (
    <Card className={`rounded-[24px] p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="leadType" value={leadType} />
        <input type="hidden" name="source" value={source} />
        <input type="hidden" name="vehicleId" value={vehicleId || ""} />
        <input type="hidden" name="vehicleTitle" value={vehicleTitle || ""} />

        <div>
          <Label htmlFor={`${leadType}-name`}>Full name</Label>
          <Input
            id={`${leadType}-name`}
            name="name"
            placeholder="Your full name"
            required
            {...nameField.inputProps}
          />
          <FieldError id={nameField.errorId} error={nameField.error} />
        </div>

        <div>
          <Label htmlFor={`${leadType}-phone`}>Phone</Label>
          <Input
            id={`${leadType}-phone`}
            name="phone"
            placeholder="+254..."
            required
            {...phoneField.inputProps}
          />
          <FieldError id={phoneField.errorId} error={phoneField.error} />
        </div>

        <div>
          <Label htmlFor={`${leadType}-email`}>Email</Label>
          <Input
            id={`${leadType}-email`}
            name="email"
            type="email"
            placeholder="Optional email address"
            {...emailField.inputProps}
          />
          <FieldError id={emailField.errorId} error={emailField.error} />
        </div>

        <div>
          <Label htmlFor={`${leadType}-message`}>Message</Label>
          <Textarea
            id={`${leadType}-message`}
            name="message"
            placeholder="Tell us what you need and we will respond quickly."
            {...messageField.inputProps}
          />
          <FieldError id={messageField.errorId} error={messageField.error} />
        </div>

        {state.message ? (
          <p
            className={`text-sm ${
              state.success ? "text-emerald-700" : "text-red-600"
            }`}
            role={state.success ? undefined : "alert"}
          >
            {state.message}
          </p>
        ) : null}

        <SubmitButton className="w-full">{submitLabel}</SubmitButton>
      </form>
    </Card>
  );
}
