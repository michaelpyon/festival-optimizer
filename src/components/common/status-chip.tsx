import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneClasses = {
  confirmed: "border-transparent bg-tertiary-container text-on-tertiary-fixed",
  tentative: "border-transparent bg-secondary-container text-secondary-fixed",
  historic: "border-transparent bg-surface-container-high text-on-surface-variant",
} as const;

export function StatusChip({
  tone,
  label,
}: {
  tone: keyof typeof toneClasses;
  label: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em]",
        toneClasses[tone],
      )}
    >
      {label}
    </Badge>
  );
}
