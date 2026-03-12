"use client";

import { Phone } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  submitLeadAction,
  submitTestDriveAction,
} from "@/lib/actions/public-actions";
import { getActionFieldState } from "@/components/forms/action-form-field-helpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import type { ActionState, LeadType } from "@/types/dealership";
import { cn } from "@/lib/utils";

type VehicleIntent = "quote" | "viewing" | "financing";

const initialState: ActionState = { success: false, message: "" };

const intentMeta: Record<
  VehicleIntent,
  {
    label: string;
    title: string;
    description: string;
    submitLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    leadType?: LeadType;
  }
> = {
  quote: {
    label: "Price & Availability",
    title: "Get the best price and next step",
    description:
      "Ask for the best price, confirm availability, or request a walk-around video.",
    submitLabel: "Send to Sales",
    messageLabel: "How can we help?",
    messagePlaceholder:
      "Ask for the best price, confirm availability, or request a quick walk-around video.",
    leadType: "quote",
  },
  viewing: {
    label: "Book a Visit",
    title: "Book your viewing",
    description:
      "Share the day and time that suit you and sales will lock it in quickly.",
    submitLabel: "Reserve My Visit",
    messageLabel: "Best time for you",
    messagePlaceholder:
      "Tell us the day and time that work best, plus anything you want ready before you arrive.",
  },
  financing: {
    label: "Payment Options",
    title: "Ask about payment options",
    description:
      "Check deposit guidance, monthly plan options, and the fastest way to move forward.",
    submitLabel: "Show Me My Options",
    messageLabel: "Your budget plan",
    messagePlaceholder:
      "Tell us what you want to know about deposit, monthly budget, or approval steps.",
    leadType: "financing",
  },
};

function parseIntent(value: string | null): VehicleIntent {
  if (value === "viewing" || value === "financing") {
    return value;
  }

  return "quote";
}

export function VehicleEnquiryForm({
  vehicleId,
  vehicleTitle,
  source,
  phoneHref,
  phoneDisplay,
  whatsappUrl,
}: {
  vehicleId?: string;
  vehicleTitle?: string;
  source: string;
  phoneHref?: string;
  phoneDisplay?: string;
  whatsappUrl?: string;
}) {
  const searchParams = useSearchParams();
  const [intent, setIntent] = useState<VehicleIntent>(() =>
    parseIntent(searchParams.get("intent")),
  );
  const [leadState, leadAction] = useActionState(submitLeadAction, initialState);
  const [testDriveState, testDriveAction] = useActionState(
    submitTestDriveAction,
    initialState,
  );

  useEffect(() => {
    setIntent(parseIntent(searchParams.get("intent")));
  }, [searchParams]);

  const activeIntent = intentMeta[intent];
  const state = intent === "viewing" ? testDriveState : leadState;
  const formId = `vehicle-enquiry-${intent}`;
  const phoneField = getActionFieldState(state, formId, "phone");
  const nameField = getActionFieldState(state, formId, "name");
  const emailField = getActionFieldState(state, formId, "email");
  const preferredDateField = getActionFieldState(state, formId, "preferredDate");
  const preferredTimeField = getActionFieldState(state, formId, "preferredTime");
  const messageField = getActionFieldState(state, formId, "message");

  return (
    <Card className="rounded-[28px] p-5 lg:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Talk to sales
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-stone-950">
          Ask about this vehicle
        </h3>
        <p className="mt-2 max-w-[38ch] text-sm leading-6 text-stone-600">
          Call, WhatsApp, or send one short message and the team will follow up.
        </p>
      </div>

      {phoneHref || whatsappUrl ? (
        <div className="mb-5 grid gap-2.5 sm:grid-cols-2">
          {phoneHref && phoneDisplay ? (
            <Button asChild variant="secondary" className="w-full">
              <a href={phoneHref}>
                <Phone className="size-4" />
                Call {phoneDisplay}
              </a>
            </Button>
          ) : null}
          {whatsappUrl ? (
            <Button asChild variant="dark" className="w-full">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="size-4" />
                WhatsApp Sales
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-[22px] border border-stone-200 bg-stone-100/85 p-1">
        <div className="grid gap-1.5 sm:grid-cols-3">
          {(Object.entries(intentMeta) as Array<
            [VehicleIntent, (typeof intentMeta)[VehicleIntent]]
          >).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => setIntent(key)}
              aria-pressed={intent === key}
              className={cn(
                "rounded-[18px] border px-3.5 py-2.5 text-left transition-all",
                intent === key
                  ? "border-primary bg-white text-stone-950 shadow-[0_10px_22px_rgba(185,106,43,0.14)] ring-1 ring-primary/15"
                  : "border-transparent bg-transparent text-stone-600 hover:bg-white/75 hover:text-stone-900",
              )}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-stone-200 pt-5">
        <h4 className="text-lg font-semibold text-stone-950">
          {activeIntent.title}
        </h4>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {activeIntent.description}
        </p>

        {intent === "viewing" ? (
          <form action={testDriveAction} className="mt-5 space-y-3">
            <input type="hidden" name="vehicleId" value={vehicleId || ""} />
            <input type="hidden" name="vehicleTitle" value={vehicleTitle || ""} />
            <input type="hidden" name="source" value={`${source} - viewing`} />

            <div>
              <Label htmlFor={`${formId}-phone`}>Phone</Label>
              <Input
                id={`${formId}-phone`}
                name="phone"
                placeholder="+254..."
                className="border-primary/35 bg-[#fffaf5]"
                required
                {...phoneField.inputProps}
              />
              <FieldError id={phoneField.errorId} error={phoneField.error} />
            </div>

            <div>
              <Label htmlFor={`${formId}-name`}>Full name</Label>
              <Input
                id={`${formId}-name`}
                name="name"
                placeholder="Your full name"
                required
                {...nameField.inputProps}
              />
              <FieldError id={nameField.errorId} error={nameField.error} />
            </div>

            <div>
              <Label htmlFor={`${formId}-email`}>Email</Label>
              <Input
                id={`${formId}-email`}
                name="email"
                type="email"
                placeholder="Optional email address"
                {...emailField.inputProps}
              />
              <FieldError id={emailField.errorId} error={emailField.error} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${formId}-preferred-date`}>Preferred date</Label>
                <Input
                  id={`${formId}-preferred-date`}
                  name="preferredDate"
                  type="date"
                  required
                  {...preferredDateField.inputProps}
                />
                <FieldError
                  id={preferredDateField.errorId}
                  error={preferredDateField.error}
                />
              </div>
              <div>
                <Label htmlFor={`${formId}-preferred-time`}>Preferred time</Label>
                <Input
                  id={`${formId}-preferred-time`}
                  name="preferredTime"
                  placeholder="11:00 AM"
                  {...preferredTimeField.inputProps}
                />
                <FieldError
                  id={preferredTimeField.errorId}
                  error={preferredTimeField.error}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`${formId}-message`}>
                {activeIntent.messageLabel}
              </Label>
              <Textarea
                id={`${formId}-message`}
                name="message"
                placeholder={activeIntent.messagePlaceholder}
                className="min-h-24"
                {...messageField.inputProps}
              />
              <FieldError id={messageField.errorId} error={messageField.error} />
            </div>

            {state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.success ? "text-emerald-700" : "text-red-600",
                )}
                role={state.success ? undefined : "alert"}
              >
                {state.message}
              </p>
            ) : null}

            <SubmitButton className="w-full">
              {activeIntent.submitLabel}
            </SubmitButton>
          </form>
        ) : (
          <form action={leadAction} className="mt-5 space-y-3">
            <input type="hidden" name="vehicleId" value={vehicleId || ""} />
            <input type="hidden" name="vehicleTitle" value={vehicleTitle || ""} />
            <input type="hidden" name="leadType" value={activeIntent.leadType} />
            <input type="hidden" name="source" value={`${source} - ${intent}`} />

            <div>
              <Label htmlFor={`${formId}-phone`}>Phone</Label>
              <Input
                id={`${formId}-phone`}
                name="phone"
                placeholder="+254..."
                className="border-primary/35 bg-[#fffaf5]"
                required
                {...phoneField.inputProps}
              />
              <FieldError id={phoneField.errorId} error={phoneField.error} />
            </div>

            <div>
              <Label htmlFor={`${formId}-name`}>Full name</Label>
              <Input
                id={`${formId}-name`}
                name="name"
                placeholder="Your full name"
                required
                {...nameField.inputProps}
              />
              <FieldError id={nameField.errorId} error={nameField.error} />
            </div>

            <div>
              <Label htmlFor={`${formId}-message`}>
                {activeIntent.messageLabel}
              </Label>
              <Textarea
                id={`${formId}-message`}
                name="message"
                placeholder={activeIntent.messagePlaceholder}
                className="min-h-24"
                {...messageField.inputProps}
              />
              <FieldError id={messageField.errorId} error={messageField.error} />
            </div>

            {state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.success ? "text-emerald-700" : "text-red-600",
                )}
                role={state.success ? undefined : "alert"}
              >
                {state.message}
              </p>
            ) : null}

            <SubmitButton className="w-full">
              {activeIntent.submitLabel}
            </SubmitButton>
          </form>
        )}
      </div>
    </Card>
  );
}
