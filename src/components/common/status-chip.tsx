import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneClasses = {
  confirmed: "border-transparent bg-[#a8ccd6] text-[#001f26]",
  tentative: "border-transparent bg-[#4b3f72] text-[#e8deff]",
  historic: "border-transparent bg-[#2a2a2a] text-[#cec5b9]",
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
