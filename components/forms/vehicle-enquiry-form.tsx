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
      "Use one short form for price, availability, or a walk-around video.",
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
      "Share the preferred day and time and sales will confirm the slot quickly.",
    submitLabel: "Book Viewing",
    messageLabel: "Timing notes",
    messagePlaceholder:
      "Tell us your preferred day, time, and any viewing notes before you visit.",
  },
  financing: {
    label: "Financing Info",
    title: "Ask about financing",
    description:
      "Ask about deposit, repayment options, and the next step for this vehicle.",
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
    <Card className="rounded-[28px] p-5 lg:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Quick enquiry
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
              <span className="block text-sm font-semibold">
                {item.label}
              </span>
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
            <input
              type="hidden"
              name="source"
              value={`${source} - viewing`}
            />

            <div>
              <Label htmlFor={`${fieldPrefix}-phone`}>Phone</Label>
              <Input
                id={`${fieldPrefix}-phone`}
                name="phone"
                placeholder="+254..."
                className="border-primary/35 bg-[#fffaf5]"
              />
              {state.fieldErrors?.phone ? (
                <p className="mt-2 text-sm text-red-600">
                  {state.fieldErrors.phone[0]}
                </p>
              ) : null}
            </div>

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
              <Label htmlFor={`${fieldPrefix}-message`}>
                {activeIntent.messageLabel}
              </Label>
              <Textarea
                id={`${fieldPrefix}-message`}
                name="message"
                placeholder={activeIntent.messagePlaceholder}
                className="min-h-24"
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
          <form action={leadAction} className="mt-5 space-y-3">
            <input type="hidden" name="vehicleId" value={vehicleId || ""} />
            <input type="hidden" name="vehicleTitle" value={vehicleTitle || ""} />
            <input type="hidden" name="leadType" value={activeIntent.leadType} />
            <input
              type="hidden"
              name="source"
              value={`${source} - ${intent}`}
            />

            <div>
              <Label htmlFor={`${fieldPrefix}-phone`}>Phone</Label>
              <Input
                id={`${fieldPrefix}-phone`}
                name="phone"
                placeholder="+254..."
                className="border-primary/35 bg-[#fffaf5]"
              />
              {state.fieldErrors?.phone ? (
                <p className="mt-2 text-sm text-red-600">
                  {state.fieldErrors.phone[0]}
                </p>
              ) : null}
            </div>

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
              <Label htmlFor={`${fieldPrefix}-message`}>
                {activeIntent.messageLabel}
              </Label>
              <Textarea
                id={`${fieldPrefix}-message`}
                name="message"
                placeholder={activeIntent.messagePlaceholder}
                className="min-h-24"
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
