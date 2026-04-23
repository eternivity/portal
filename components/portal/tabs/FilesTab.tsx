"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { PortalFile } from "@/lib/portal-types";
import { formatFileSize } from "@/lib/portal-utils";
import { cn } from "@/lib/helpers";

const fileTypeStyles: Record<string, { icon: string; className: string }> = {
  pdf: { icon: "PDF", className: "bg-[#EAF3FF] text-[#2F74C0]" },
  png: { icon: "PNG", className: "bg-purple-50 text-purple-600" },
  jpg: { icon: "JPG", className: "bg-[#FCE9F1] text-[#C34270]" },
  zip: { icon: "ZIP", className: "bg-[#E9F8F1] text-[#188763]" },
  mp4: { icon: "MP4", className: "bg-amber-50 text-amber-600" }
};

export function FilesTab({ initialFiles }: { initialFiles: PortalFile[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [revisionFileId, setRevisionFileId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function approve(fileId: string) {
    setFiles((current) => current.map((file) => (file.id === fileId ? { ...file, approval_status: "approved" } : file)));
    await fetch(`/api/files/${fileId}/approve`, { method: "PATCH" });
  }

  async function requestChanges(fileId: string) {
    setFiles((current) => current.map((file) => (file.id === fileId ? { ...file, approval_status: "changes_requested" } : file)));
    setRevisionFileId(null);
    setMessage("");
    await fetch(`/api/files/${fileId}/changes`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message })
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <p className="text-[12px] font-medium uppercase leading-[1.6] tracking-[0.06em] text-text-secondary">Onay bekleyen dosyalar</p>
        <span className="text-[11px] leading-[1.6] text-text-secondary">{files.length} dosya</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {files.map((file) => {
          const type = (file.file_type ?? "pdf").toLowerCase();
          const style = fileTypeStyles[type] ?? fileTypeStyles.pdf;
          const approved = file.approval_status === "approved";

          return (
            <div key={file.id} className={cn("relative rounded-xl border bg-white p-3", approved && "opacity-60")}>
              <div className="flex items-center gap-3">
                <div className={cn("grid size-7 place-items-center rounded-md text-[10px] font-medium", style.className)}>{style.icon}</div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium leading-[1.6]">{file.file_name}</p>
                  <p className="text-[11px] leading-[1.6] text-text-secondary">{formatFileSize(file.file_size)}</p>
                </div>
              </div>

              {file.approval_status === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <button className="rounded-lg bg-teal-50 px-[10px] py-1 text-[11px] font-medium text-teal-600" onClick={() => approve(file.id)}>
                    Onayla
                  </button>
                  <button className="rounded-lg bg-amber-50 px-[10px] py-1 text-[11px] font-medium text-amber-600" onClick={() => setRevisionFileId(file.id)}>
                    Revizyon
                  </button>
                </div>
              ) : null}

              {approved ? (
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-600">
                  <Check size={12} />
                  Onaylandı
                </div>
              ) : null}

              {revisionFileId === file.id ? (
                <div className="absolute left-3 right-3 top-[72px] z-10 rounded-xl border bg-white p-3">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="min-h-20 w-full resize-none rounded-lg border bg-bg-secondary px-3 py-2 text-[12px] outline-none"
                    placeholder="Revizyon notu"
                  />
                  <button className="mt-2 rounded-lg bg-amber-50 px-[10px] py-1 text-[11px] font-medium text-amber-600" onClick={() => requestChanges(file.id)}>
                    Gönder
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
