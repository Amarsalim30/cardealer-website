import { Phone } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export function MobileCtaBar({
  whatsappUrl,
  phoneHref,
  viewingHref,
}: {
  whatsappUrl: string;
  phoneHref: string;
  viewingHref: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/96 p-2.5 shadow-[0_-12px_28px_rgba(28,35,43,0.08)] lg:hidden">
      <div className="container-shell grid grid-cols-[1.35fr_1fr_1fr] gap-2">
        <Button asChild variant="whatsapp" className="h-11 w-full rounded-xl text-sm font-semibold">
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </a>
        </Button>
        <Button asChild variant="secondary" className="h-11 w-full rounded-xl text-sm font-semibold">
          <a href={phoneHref}>
            <Phone className="size-4" />
            Call
          </a>
        </Button>
        <Button asChild variant="secondary" className="h-11 w-full rounded-xl border-border/90 bg-surface-elevated text-sm font-semibold text-text-primary">
          <Link href={viewingHref}>Viewing</Link>
        </Button>
      </div>
    </div>
  );
}
