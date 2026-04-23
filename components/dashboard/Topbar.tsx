import type { ReactNode } from "react";

interface TopbarProps {
  title: string;
  action?: ReactNode;
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-[18px] font-medium leading-[1.6]">{title}</h1>
      {action}
    </header>
  );
}
