import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary px-5 py-3 !text-white hover:bg-[#8c4922] hover:!text-white",
        secondary:
          "border border-border bg-white/80 px-5 py-3 !text-stone-900 hover:bg-stone-100 hover:!text-stone-900",
        ghost: "px-4 py-2 text-stone-700 hover:bg-stone-100",
        dark: "bg-stone-900 px-5 py-3 !text-white hover:bg-stone-800 hover:!text-white",
      },
      size: {
        default: "",
        sm: "px-4 py-2 text-xs",
        lg: "px-6 py-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
