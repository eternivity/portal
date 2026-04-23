"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function NewProjectModal() {
  const [open, setOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="px-[14px] py-[6px] text-[12px]">
        <Plus size={14} />
        Yeni proje
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4">
          <Card className="w-full max-w-sm p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-medium leading-[1.6]">Yeni proje</h2>
              <button className="grid size-8 place-items-center text-text-secondary" onClick={() => setOpen(false)} aria-label="Kapat">
                <X size={15} />
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input placeholder="Proje adı" required />
              <Input placeholder="Müşteri" required />
              <Input placeholder="Portal slug" required />
              <Input placeholder="Renk #534AB7" />
              <Button type="submit" className="w-full">Projeyi oluştur</Button>
            </form>
          </Card>
        </div>
      ) : null}
    </>
  );
}
