"use client";

import { useActionState } from "react";

import { submitTestDriveAction } from "@/lib/actions/public-actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/dealership";

const initialState: ActionState = { success: false, message: "" };

export function TestDriveForm({
  vehicleId,
  vehicleTitle,
  source,
}: {
  vehicleId?: string;
  vehicleTitle?: string;
  source: string;
}) {
  const [state, formAction] = useActionState(submitTestDriveAction, initialState);

  return (
    <Card className="rounded-[24px] p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-stone-900">
          Book a test drive or viewing
        </h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Keep it short. We only need the basics to schedule the visit.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="vehicleId" value={vehicleId || ""} />
        <input type="hidden" name="vehicleTitle" value={vehicleTitle || ""} />
        <input type="hidden" name="source" value={source} />

        <div>
          <Label htmlFor="test-drive-name">Full name</Label>
          <Input id="test-drive-name" name="name" placeholder="Your full name" />
        </div>
        <div>
          <Label htmlFor="test-drive-phone">Phone</Label>
          <Input id="test-drive-phone" name="phone" placeholder="+254..." />
        </div>
        <div>
          <Label htmlFor="test-drive-email">Email</Label>
          <Input
            id="test-drive-email"
            name="email"
            type="email"
            placeholder="Optional email address"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="preferred-date">Preferred date</Label>
            <Input id="preferred-date" name="preferredDate" type="date" />
          </div>
          <div>
            <Label htmlFor="preferred-time">Preferred time</Label>
            <Input id="preferred-time" name="preferredTime" placeholder="11:00 AM" />
          </div>
        </div>
        <div>
          <Label htmlFor="test-drive-message">Message</Label>
          <Textarea
            id="test-drive-message"
            name="message"
            placeholder="Any timing or location notes?"
          />
        </div>

        {state.message ? (
          <p
            className={`text-sm ${
              state.success ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <SubmitButton className="w-full">Book Test Drive</SubmitButton>
      </form>
    </Card>
  );
}
