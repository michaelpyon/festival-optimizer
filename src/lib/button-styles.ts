import { cva } from "class-variance-authority";

export const buttonLinkVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_28px_rgb(241_224_195_/_0.12)] hover:bg-primary/90",
        outline:
          "border-border bg-card/80 text-foreground hover:bg-accent hover:text-foreground",
      },
      size: {
        default: "h-10 gap-2 px-5",
        sm: "h-8 gap-1.5 px-4 text-[0.78rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
