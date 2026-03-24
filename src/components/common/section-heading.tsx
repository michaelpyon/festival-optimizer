import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? (
        <p className="editorial-kicker">{eyebrow}</p>
      ) : null}
      <div className="space-y-2">
        <h2 className="max-w-3xl font-heading text-4xl font-medium tracking-tight text-balance text-foreground sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
