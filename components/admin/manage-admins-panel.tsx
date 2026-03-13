"use client";

import { useActionState } from "react";

import {
  createAdminAccessAction,
  removeAdminAccessAction,
} from "@/lib/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState, AdminProfile } from "@/types/dealership";

const initialState: ActionState = {
  success: false,
  message: "",
};

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ManageAdminsPanel({
  admins,
  currentUserId,
}: {
  admins: AdminProfile[];
  currentUserId: string;
}) {
  const [state, formAction] = useActionState(createAdminAccessAction, initialState);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <Card className="rounded-[30px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Add admin
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-stone-950">
          Grant workspace access
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
          Create a fresh admin account or grant access to an existing Supabase user.
          Leave password blank only when the user account already exists.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Sales manager"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="manager@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password for new account</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
            />
          </div>

          {state.message ? (
            <p
              className={state.success ? "text-sm text-green-700" : "text-sm text-red-600"}
              role={state.success ? "status" : "alert"}
            >
              {state.message}
            </p>
          ) : null}

          <SubmitButton>Grant admin access</SubmitButton>
        </form>
      </Card>

      <Card className="rounded-[30px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Current admins
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950">
              Control workspace access
            </h2>
          </div>
          <Badge variant="muted">{admins.length} active</Badge>
        </div>

        <div className="mt-6 grid gap-4">
          {admins.map((admin) => {
            const isOwner = admin.role === "owner";
            const isCurrentUser = admin.userId === currentUserId;

            return (
              <div
                key={admin.id}
                className="rounded-[26px] border border-border/70 bg-stone-50/80 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-stone-950">
                        {admin.fullName || admin.email}
                      </h3>
                      <Badge variant={isOwner ? "accent" : "muted"}>
                        {isOwner ? "Owner" : "Admin"}
                      </Badge>
                      {isCurrentUser ? <Badge variant="muted">You</Badge> : null}
                    </div>
                    <p className="mt-1 break-all text-sm text-stone-600">{admin.email}</p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                      Added {formatCreatedAt(admin.createdAt)}
                    </p>
                  </div>

                  {isOwner ? (
                    <p className="text-sm font-medium text-stone-500">
                      Owner access is locked here.
                    </p>
                  ) : (
                    <form action={removeAdminAccessAction}>
                      <input type="hidden" name="userId" value={admin.userId} />
                      <SubmitButton variant="secondary" size="sm">
                        Remove access
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
