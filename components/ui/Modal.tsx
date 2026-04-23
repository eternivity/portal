import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ModalProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose?: () => void;
}

export function Modal({ title, children, open, onClose }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg">{title}</h2>
          <Button aria-label="Close modal" onClick={onClose} variant="ghost" className="size-8 p-0">
            <X size={15} />
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}
