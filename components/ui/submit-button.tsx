"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({
  children,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
