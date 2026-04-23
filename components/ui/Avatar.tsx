import { cn } from "@/lib/helpers";

interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex size-[30px] shrink-0 items-center justify-center rounded-full bg-purple-100 text-[11px] font-medium leading-none text-purple-800",
        className
      )}
    >
      {initials}
    </div>
  );
}
