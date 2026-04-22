"use client";

import Link from "next/link";
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
  primaryHref,
  primaryLabel,
  trustItems,
  tradeInHref,
  compact = false,
}: {
  vehicleId?: string;
  vehicleTitle?: string;
  source: string;
  phoneHref?: string;
  phoneDisplay?: string;
  whatsappUrl?: string;
  primaryHref?: string;
  primaryLabel?: string;
  trustItems?: Array<{ label: string; value: string }>;
  tradeInHref?: string;
  compact?: boolean;
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
    <Card
      className={cn(
        "border border-border/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(247,249,251,0.94))] shadow-[0_18px_50px_rgba(15,23,42,0.06)]",
        compact ? "rounded-[28px] p-4 lg:p-5" : "rounded-[32px] p-5 lg:p-6",
      )}
    >
      <div className={cn(compact ? "mb-3" : "mb-4")}>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-text-secondary">
          Talk to sales
        </p>
        <h3
          className={cn(
            "font-semibold text-text-primary",
            compact
              ? "mt-1.5 text-[1.35rem] leading-tight tracking-[-0.035em]"
              : "mt-2 text-[1.7rem] leading-tight tracking-[-0.04em]",
          )}
        >
          Ask about this vehicle
        </h3>
        <p
          className={cn(
            "mt-2 max-w-[38ch] text-text-secondary",
            compact ? "text-[0.92rem] leading-5" : "text-sm leading-6",
          )}
        >
          Call, WhatsApp, or send one short message and the team will follow up.
        </p>
      </div>

      {trustItems?.length ? (
        <div
          className={cn(
            "grid gap-1.5",
            trustItems.length === 3 ? "grid-cols-3" : "grid-cols-2",
            compact ? "mb-3" : "mb-4",
          )}
        >
          {trustItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-[16px] border border-border/80 bg-white/88 px-3 py-2.5",
                compact ? "text-center" : "",
              )}
            >
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {primaryHref || phoneHref || whatsappUrl ? (
        <div
          className={cn(
            "grid",
            primaryHref && primaryLabel ? "gap-1.5" : compact ? "sm:grid-cols-2 gap-1.5" : "sm:grid-cols-2 gap-2",
            compact ? "mb-3" : "mb-4",
          )}
        >
          {primaryHref && primaryLabel ? (
            <Button
              asChild
              variant="primary"
              size={compact ? "sm" : undefined}
              className={cn("w-full", compact ? "rounded-[18px]" : "rounded-2xl")}
            >
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          ) : null}

          <div className={cn("grid sm:grid-cols-2", compact ? "gap-1.5" : "gap-2")}>
          {phoneHref && phoneDisplay ? (
            <Button
              asChild
              variant="secondary"
              size={compact ? "sm" : undefined}
              className={cn("w-full", compact ? "rounded-[18px]" : "rounded-2xl")}
            >
              <a href={phoneHref}>
                <Phone className="size-4" />
                Call {phoneDisplay}
              </a>
            </Button>
          ) : null}
          {whatsappUrl ? (
            <Button
              asChild
              variant="whatsapp"
              size={compact ? "sm" : undefined}
              className={cn("w-full", compact ? "rounded-[18px]" : "rounded-2xl")}
            >
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="size-4" />
                WhatsApp Sales
              </a>
            </Button>
          ) : null}
          </div>
        </div>
      ) : null}

      {tradeInHref ? (
        <div className={cn(compact ? "mb-3" : "mb-4")}>
          <Link
            href={tradeInHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-accent"
          >
            Value your trade-in
          </Link>
        </div>
      ) : null}

      <div className={cn("border border-border/80 bg-surface-elevated/90 p-1", compact ? "rounded-[20px]" : "rounded-[24px]")}>
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
                "border text-left transition-all",
                compact ? "rounded-[16px] px-3 py-2" : "rounded-[18px] px-3.5 py-2.5",
                intent === key
                  ? "border-accent bg-white text-text-primary shadow-[0_10px_22px_rgba(23,58,94,0.08)] ring-1 ring-accent/10"
                  : "border-transparent bg-transparent text-text-secondary hover:bg-white/90 hover:text-text-primary",
              )}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={cn("border-t border-border/80", compact ? "mt-3 pt-3" : "mt-4 pt-4")}>
        <h4
          className={cn(
            "font-semibold tracking-[-0.02em] text-text-primary",
            compact ? "text-base" : "text-[1.05rem]",
          )}
        >
          {activeIntent.title}
        </h4>
        <p className={cn("mt-2 text-text-secondary", compact ? "text-[0.92rem] leading-5" : "text-sm leading-6")}>
          {activeIntent.description}
        </p>

        {intent === "viewing" ? (
          <form action={testDriveAction} className={cn(compact ? "mt-3 space-y-2.5" : "mt-4 space-y-3")}>
            <input type="hidden" name="vehicleId" value={vehicleId || ""} />
            <input type="hidden" name="vehicleTitle" value={vehicleTitle || ""} />
            <input type="hidden" name="source" value={`${source} - viewing`} />

            <div>
              <Label htmlFor={`${formId}-phone`}>Phone</Label>
              <Input
                id={`${formId}-phone`}
                name="phone"
                placeholder="+254..."
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
                className={cn("rounded-2xl", compact ? "min-h-20" : "min-h-24")}
                {...messageField.inputProps}
              />
              <FieldError id={messageField.errorId} error={messageField.error} />
            </div>

            {state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.success ? "text-success" : "text-danger",
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
          <form action={leadAction} className={cn(compact ? "mt-3 space-y-2.5" : "mt-4 space-y-3")}>
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
                className={cn("rounded-2xl", compact ? "min-h-20" : "min-h-24")}
                {...messageField.inputProps}
              />
              <FieldError id={messageField.errorId} error={messageField.error} />
            </div>

            {state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.success ? "text-success" : "text-danger",
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
