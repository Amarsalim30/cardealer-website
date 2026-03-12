"use client";

import { useActionState } from "react";

import { loginAdminAction } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/types/dealership";

const initialState: ActionState = { success: false, message: "" };

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const [state, formAction] = useActionState(loginAdminAction, initialState);

  return (
    <Card className="mx-auto max-w-lg rounded-[32px] p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        Admin login
      </p>
      <h1 className="mt-4 display-font text-4xl text-stone-950">
        Access inventory management
      </h1>
      <p className="mt-4 text-sm leading-7 text-stone-600">
        Sign in to create listings, manage status, and review incoming enquiries.
      </p>

      {demoMode ? (
        <div className="mt-6 rounded-[24px] border border-border bg-stone-50 p-5 text-sm text-stone-600">
          <p className="font-semibold text-stone-900">Local demo admin enabled</p>
          <p className="mt-2">
            Demo access is available only in local development. Use the configured
            demo credentials from your environment.
          </p>
        </div>
      ) : null}

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" />
        </div>

        {state.message ? (
          <p className="text-sm text-red-600" role="alert">
            {state.message}
          </p>
        ) : null}

        <SubmitButton className="w-full">Sign in</SubmitButton>
      </form>
    </Card>
  );
}
