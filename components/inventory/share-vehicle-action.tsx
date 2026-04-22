"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function ShareVehicleAction({
  title,
  url,
  className,
}: {
  title: string;
  url: string;
  className?: string;
}) {
  const [feedback, setFeedback] = useState<"idle" | "copied" | "shared">("idle");

  useEffect(() => {
    if (feedback === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedback("idle");
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
        setFeedback("shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setFeedback("copied");
        return;
      }

      window.prompt("Copy this vehicle link", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      window.prompt("Copy this vehicle link", url);
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-[18px] border border-border/80 bg-white/92 px-4 py-3 text-left text-sm font-semibold text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-colors hover:border-accent/30 hover:bg-surface-elevated",
        className,
      )}
      onClick={handleShare}
    >
      <span>{feedback === "copied" ? "Link copied" : feedback === "shared" ? "Shared" : "Share vehicle"}</span>
      {feedback === "idle" ? (
        <Share2 className="size-4 text-text-secondary" />
      ) : (
        <Check className="size-4 text-success" />
      )}
    </button>
  );
}
