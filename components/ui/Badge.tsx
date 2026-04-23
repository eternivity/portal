import type { HTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

type BadgeTone = "success" | "warning" | "danger" | "muted" | "brand";

const tones: Record<BadgeTone, string> = {
  success: "bg-teal-50 text-teal-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-coral-50 text-coral-400",
  muted: "bg-gray-50 text-gray-600",
  brand: "bg-purple-50 text-purple-800"
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium leading-[1.6]", tones[tone], className)}
      {...props}
    />
  );
}
