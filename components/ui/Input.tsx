import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border bg-bg-surface px-3 text-body text-text-primary outline-none transition-colors placeholder:text-text-hint focus:border-purple-600",
        className
      )}
      {...props}
    />
  );
}
