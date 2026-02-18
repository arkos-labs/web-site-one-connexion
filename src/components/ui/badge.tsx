import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status Variants
        pending: "border-transparent bg-status-pending text-status-pending-foreground hover:bg-status-pending/80",
        accepted: "border-transparent bg-status-accepted text-status-accepted-foreground hover:bg-status-accepted/80",
        dispatched: "border-transparent bg-status-dispatched text-status-dispatched-foreground hover:bg-status-dispatched/80",
        in_progress: "border-transparent bg-status-in_progress text-status-in_progress-foreground hover:bg-status-in_progress/80",
        delivered: "border-transparent bg-status-delivered text-status-delivered-foreground hover:bg-status-delivered/80",
        cancelled: "border-transparent bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/80",
        driver_accepted: "border-transparent bg-teal-500 text-white hover:bg-teal-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
