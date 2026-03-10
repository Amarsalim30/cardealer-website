import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

type FloatingWhatsAppButtonProps = {
  whatsappUrl: string;
  label?: string;
};

export function FloatingWhatsAppButton({
  whatsappUrl,
  label = "Chat on WhatsApp",
}: FloatingWhatsAppButtonProps) {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(20,75,44,0.35)] transition-transform hover:scale-[1.02] hover:bg-[#1fb85a] sm:right-6 sm:h-14 sm:px-5"
    >
      <WhatsAppIcon className="size-5 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
