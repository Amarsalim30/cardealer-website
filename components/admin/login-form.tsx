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
    <Card className="w-full rounded-[32px] border border-white/80 bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        Admin sign in
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-stone-950">
        Access the operations workspace
      </h1>
      <p className="mt-4 text-sm leading-7 text-stone-600">
        Use your admin account to manage inventory, triage incoming leads, and
        keep the live site up to date.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </div>

        {state.message ? (
          <p className="text-sm text-red-600" role="alert">
            {state.message}
          </p>
        ) : null}

        <SubmitButton className="w-full">Sign in</SubmitButton>
      </form>

      {demoMode ? (
        <div className="mt-6 rounded-[22px] border border-dashed border-border bg-stone-50/80 p-4 text-sm text-stone-600">
          <p className="font-semibold text-stone-900">Local demo admin enabled</p>
          <p className="mt-1 leading-6">
            Demo access is available only in local development. Use the configured
            environment credentials if you are verifying UI flows locally.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
