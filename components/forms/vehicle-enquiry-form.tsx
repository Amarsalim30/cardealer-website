"use client";

import { Phone } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  submitLeadAction,
  submitTestDriveAction,
} from "@/lib/actions/public-actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    label: "Ask About Price",
    title: "Ask about price or availability",
    description:
      "Use one short form for pricing, availability, or a walk-around video request.",
    submitLabel: "Send Enquiry",
    messageLabel: "What do you need?",
    messagePlaceholder:
      "Ask about the best price, current availability, or request a quick walk-around video.",
    leadType: "quote",
  },
  viewing: {
    label: "Book Viewing",
    title: "Book a viewing or test drive",
    description:
      "Share the preferred day and time and the sales team will confirm the slot quickly.",
    submitLabel: "Book Viewing",
    messageLabel: "Timing notes",
    messagePlaceholder:
      "Any timing, location, or inspection notes before you visit?",
  },
  financing: {
    label: "Financing Info",
    title: "Ask about financing",
    description:
      "Get repayment guidance, deposit expectations, and the next step for this vehicle.",
    submitLabel: "Request Financing Info",
    messageLabel: "Financing question",
    messagePlaceholder:
      "Tell us what you want to know about deposit, monthly plan, or approval steps.",
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
  const fieldPrefix = `vehicle-enquiry-${intent}`;

  return (
    <Card className="rounded-[28px] p-6 lg:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Quick enquiry
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-stone-950">
          Tell sales what you need
        </h3>
        <p className="mt-2 max-w-[42ch] text-sm leading-6 text-stone-600">
          Choose one path below instead of filling separate forms for the same
          vehicle.
        </p>
      </div>

      {phoneHref || whatsappUrl ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
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

      <div className="grid gap-2 sm:grid-cols-3">
        {(Object.entries(intentMeta) as Array<[VehicleIntent, (typeof intentMeta)[VehicleIntent]]>).map(
          ([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => setIntent(key)}
              aria-pressed={intent === key}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition-all",
                intent === key
                  ? "border-primary bg-[#f7ece4] shadow-[0_8px_24px_rgba(185,106,43,0.12)]"
                  : "border-stone-200 bg-white hover:border-stone-300",
              )}
            >
              <span className="block text-sm font-semibold text-stone-900">
                {item.label}
              </span>
            </button>
          ),
        )}
      </div>

      <div className="mt-6 border-t border-stone-200 pt-6">
        <h4 className="text-lg font-semibold text-stone-950">
          {activeIntent.title}
        </h4>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {activeIntent.description}
        </p>

        {intent === "viewing" ? (
          <form action={testDriveAction} className="mt-6 space-y-4">
            <input type="hidden" name="vehicleId" value={vehicleId || ""} />
            <input type="hidden" name="vehicleTitle" value={vehicleTitle || ""} />
            <input
              type="hidden"
              name="source"
              value={`${source} - viewing`}
            />

            <div>
              <Label htmlFor={`${fieldPrefix}-name`}>Full name</Label>
              <Input
                id={`${fieldPrefix}-name`}
                name="name"
                placeholder="Your full name"
              />
              {state.fieldErrors?.name ? (
                <p className="mt-2 text-sm text-red-600">
                  {state.fieldErrors.name[0]}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor={`${fieldPrefix}-phone`}>Phone</Label>
              <Input
                id={`${fieldPrefix}-phone`}
                name="phone"
                placeholder="+254..."
              />
              {state.fieldErrors?.phone ? (
                <p className="mt-2 text-sm text-red-600">
                  {state.fieldErrors.phone[0]}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor={`${fieldPrefix}-email`}>Email</Label>
              <Input
                id={`${fieldPrefix}-email`}
                name="email"
                type="email"
                placeholder="Optional email address"
              />
              {state.fieldErrors?.email ? (
                <p className="mt-2 text-sm text-red-600">
                  {state.fieldErrors.email[0]}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${fieldPrefix}-date`}>Preferred date</Label>
                <Input
                  id={`${fieldPrefix}-date`}
                  name="preferredDate"
                  type="date"
                />
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}-time`}>Preferred time</Label>
                <Input
                  id={`${fieldPrefix}-time`}
                  name="preferredTime"
                  placeholder="11:00 AM"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`${fieldPrefix}-message`}>
                {activeIntent.messageLabel}
              </Label>
              <Textarea
                id={`${fieldPrefix}-message`}
                name="message"
                placeholder={activeIntent.messagePlaceholder}
              />
            </div>

            {state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.success ? "text-emerald-700" : "text-red-600",
                )}
              >
                {state.message}
              </p>
            ) : null}

            <SubmitButton className="w-full">
              {activeIntent.submitLabel}
            </SubmitButton>
          </form>
        ) : (
          <form action={leadAction} className="mt-6 space-y-4">
            <input type="hidden" name="vehicleId" value={vehicleId || ""} />
            <input type="hidden" name="vehicleTitle" value={vehicleTitle || ""} />
            <input type="hidden" name="leadType" value={activeIntent.leadType} />
            <input
              type="hidden"
              name="source"
              value={`${source} - ${intent}`}
            />

            <div>
              <Label htmlFor={`${fieldPrefix}-name`}>Full name</Label>
              <Input
                id={`${fieldPrefix}-name`}
                name="name"
                placeholder="Your full name"
              />
              {state.fieldErrors?.name ? (
                <p className="mt-2 text-sm text-red-600">
                  {state.fieldErrors.name[0]}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor={`${fieldPrefix}-phone`}>Phone</Label>
              <Input
                id={`${fieldPrefix}-phone`}
                name="phone"
                placeholder="+254..."
              />
              {state.fieldErrors?.phone ? (
                <p className="mt-2 text-sm text-red-600">
                  {state.fieldErrors.phone[0]}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor={`${fieldPrefix}-email`}>Email</Label>
              <Input
                id={`${fieldPrefix}-email`}
                name="email"
                type="email"
                placeholder="Optional email address"
              />
              {state.fieldErrors?.email ? (
                <p className="mt-2 text-sm text-red-600">
                  {state.fieldErrors.email[0]}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor={`${fieldPrefix}-message`}>
                {activeIntent.messageLabel}
              </Label>
              <Textarea
                id={`${fieldPrefix}-message`}
                name="message"
                placeholder={activeIntent.messagePlaceholder}
              />
            </div>

            {state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.success ? "text-emerald-700" : "text-red-600",
                )}
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
