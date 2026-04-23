import type { HTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border bg-bg-surface p-4", className)} {...props} />;
}
