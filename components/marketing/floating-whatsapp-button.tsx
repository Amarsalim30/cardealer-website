"use client";

import { useEffect, useState } from "react";

import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

type FloatingWhatsAppButtonProps = {
  whatsappUrl: string;
  label?: string;
};

export function FloatingWhatsAppButton({
  whatsappUrl,
  label = "Chat on WhatsApp",
}: FloatingWhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const revealOffset = 360;

    const syncVisibility = () => {
      setIsVisible(window.scrollY >= revealOffset);
    };

    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });

    return () => window.removeEventListener("scroll", syncVisibility);
  }, []);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`fixed bottom-6 right-6 z-50 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-[0.82rem] font-bold text-white shadow-[0_8px_20px_rgba(20,75,44,0.25)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#1fb85a] ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <WhatsAppIcon className="size-5 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
