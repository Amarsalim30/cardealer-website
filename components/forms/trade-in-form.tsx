"use client";

import { useActionState } from "react";

import { submitTradeInAction } from "@/lib/actions/public-actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/dealership";

const initialState: ActionState = { success: false, message: "" };

export function TradeInForm({
  desiredVehicleId,
  desiredVehicleTitle,
  source,
}: {
  desiredVehicleId?: string;
  desiredVehicleTitle?: string;
  source: string;
}) {
  const [state, formAction] = useActionState(submitTradeInAction, initialState);

  return (
    <Card className="rounded-[24px] p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-stone-900">Value your trade</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Share the essentials and we will review your current car before reaching
          out.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="desiredVehicleId" value={desiredVehicleId || ""} />
        <input
          type="hidden"
          name="desiredVehicleTitle"
          value={desiredVehicleTitle || ""}
        />
        <input type="hidden" name="source" value={source} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="trade-name">Full name</Label>
            <Input id="trade-name" name="name" placeholder="Your full name" />
          </div>
          <div>
            <Label htmlFor="trade-phone">Phone</Label>
            <Input id="trade-phone" name="phone" placeholder="+254..." />
          </div>
        </div>

        <div>
          <Label htmlFor="trade-email">Email</Label>
          <Input id="trade-email" name="email" type="email" placeholder="Optional" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="trade-make">Current vehicle make</Label>
            <Input id="trade-make" name="currentVehicleMake" placeholder="Toyota" />
          </div>
          <div>
            <Label htmlFor="trade-model">Current vehicle model</Label>
            <Input id="trade-model" name="currentVehicleModel" placeholder="Auris" />
          </div>
          <div>
            <Label htmlFor="trade-year">Year</Label>
            <Input id="trade-year" name="currentVehicleYear" type="number" />
          </div>
        </div>

        <div>
          <Label htmlFor="trade-mileage">Mileage</Label>
          <Input id="trade-mileage" name="currentVehicleMileage" type="number" />
        </div>

        <div>
          <Label htmlFor="trade-notes">Condition notes</Label>
          <Textarea
            id="trade-notes"
            name="conditionNotes"
            placeholder="Major service history, repaint, or known issues"
          />
        </div>

        <div>
          <Label htmlFor="trade-message">Anything else?</Label>
          <Textarea
            id="trade-message"
            name="message"
            placeholder="Tell us what kind of replacement you want."
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

        <SubmitButton className="w-full">Value Your Trade</SubmitButton>
      </form>
    </Card>
  );
}
