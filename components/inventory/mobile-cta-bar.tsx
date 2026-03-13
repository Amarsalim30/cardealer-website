import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export function MobileCtaBar({
  whatsappUrl,
  phoneHref,
}: {
  whatsappUrl: string;
  phoneHref: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/96 p-3 shadow-[0_-12px_28px_rgba(28,35,43,0.08)] lg:hidden">
      <div className="container-shell grid grid-cols-[1.5fr_1fr] gap-3">
        <Button asChild variant="whatsapp" className="w-full">
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </a>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <a href={phoneHref}>
            <Phone className="size-4" />
            Call
          </a>
        </Button>
      </div>
    </div>
  );
}
