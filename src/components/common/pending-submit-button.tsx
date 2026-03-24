"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function PendingSubmitButton({
  label,
  pendingLabel,
  className,
  size = "default",
  variant = "default",
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size={size}
      variant={variant}
      className={className}
      disabled={pending}
    >
      {pending ? pendingLabel ?? "Working..." : label}
    </Button>
  );
}
