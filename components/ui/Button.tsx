import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-purple-600 text-purple-50 hover:bg-purple-800",
  secondary: "border bg-bg-secondary text-text-primary hover:bg-purple-50",
  ghost: "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-9 items-center justify-center rounded-lg px-4 py-2 text-body font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
