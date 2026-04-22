"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

const depositOptions = [20, 30, 40] as const;
const termOptions = [24, 36, 48] as const;

function roundToNearest(value: number, unit: number) {
  return Math.round(value / unit) * unit;
}

export function VehicleFinanceEstimator({
  price,
  financingHref,
  className,
}: {
  price: number;
  financingHref: string;
  className?: string;
}) {
  const [depositRate, setDepositRate] = useState<(typeof depositOptions)[number]>(30);
  const [termMonths, setTermMonths] = useState<(typeof termOptions)[number]>(24);

  const depositAmount = roundToNearest((price * depositRate) / 100, 1000);
  const monthlyPayment = roundToNearest((price - depositAmount) / termMonths, 1000);

  return (
    <Card className={cn("rounded-[28px] border border-border/80 p-5 lg:p-6", className)}>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
        Financing
      </p>
      <h2 className="mt-2 text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
        Estimate your monthly payment
      </h2>

      <div className="mt-5 space-y-4">
        <div className="rounded-[18px] border border-border/80 bg-white/92 px-4 py-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Vehicle price
          </p>
          <p className="mt-1.5 text-base font-semibold text-text-primary">
            {formatCurrency(price)}
          </p>
        </div>

        <div className="rounded-[18px] border border-border/80 bg-white/92 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Deposit
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {formatCurrency(depositAmount)} ({depositRate}%)
            </p>
          </div>

          <input
            aria-label="Choose deposit percentage"
            className="mt-3 h-2 w-full cursor-pointer accent-accent"
            max={40}
            min={20}
            step={10}
            type="range"
            value={depositRate}
            onChange={(event) =>
              setDepositRate(Number(event.target.value) as (typeof depositOptions)[number])
            }
          />

          <div className="mt-3 grid grid-cols-3 gap-2">
            {depositOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "rounded-[14px] border px-3 py-2 text-sm font-semibold transition-colors",
                  depositRate === option
                    ? "border-accent bg-accent/8 text-accent"
                    : "border-border/80 bg-surface text-text-secondary hover:border-accent/40 hover:text-text-primary",
                )}
                onClick={() => setDepositRate(option)}
              >
                {option}%
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-border/80 bg-white/92 px-4 py-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Loan term
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {termOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "rounded-[14px] border px-3 py-2 text-sm font-semibold transition-colors",
                  termMonths === option
                    ? "border-accent bg-accent/8 text-accent"
                    : "border-border/80 bg-surface text-text-secondary hover:border-accent/40 hover:text-text-primary",
                )}
                onClick={() => setTermMonths(option)}
              >
                {option} mo
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-accent/18 bg-accent/8 px-4 py-4 text-center">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Estimated monthly payment
          </p>
          <p className="mt-2 text-[1.75rem] font-semibold tracking-[-0.04em] text-accent">
            {formatCurrency(monthlyPayment)}
            <span className="ml-1 text-base font-semibold text-text-secondary">/month</span>
          </p>
        </div>

        <p className="text-xs leading-5 text-text-secondary">
          Rates are approximate and for guidance only. Final terms depend on lender approval.
        </p>

        <Button asChild variant="primary" className="w-full rounded-[18px]">
          <Link href={financingHref}>Apply for financing</Link>
        </Button>
      </div>
    </Card>
  );
}
