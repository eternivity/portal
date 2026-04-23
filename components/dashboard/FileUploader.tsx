"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Download, FileArchive, FileImage, FileText, FileVideo, Upload } from "lucide-react";
import { cn } from "@/lib/helpers";
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE, getFileExtension } from "@/lib/storage";
import { formatFileSize } from "@/lib/portal-utils";

type DashboardFile = {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  approval_status: "pending" | "approved" | "changes_requested";
};

type UploadingFile = {
  id: string;
  file: File;
  progress: number;
};

const iconStyles: Record<string, string> = {
  pdf: "bg-blue-50 text-blue-600",
  png: "bg-purple-50 text-purple-600",
  jpg: "bg-pink-50 text-pink-600",
  jpeg: "bg-pink-50 text-pink-600",
  zip: "bg-green-50 text-green-600",
  mp4: "bg-amber-50 text-amber-600",
  docx: "bg-blue-50 text-blue-600",
  xlsx: "bg-teal-50 text-teal-600"
};

const approvalLabels = {
  pending: { label: "Onay bekleniyor", className: "bg-amber-50 text-amber-600" },
  approved: { label: "Onaylandı", className: "bg-teal-50 text-teal-600" },
  changes_requested: { label: "Revizyon istendi", className: "bg-coral-50 text-coral-600" }
};

function TypeIcon({ type }: { type: string | null }) {
  const normalized = type?.toLowerCase() ?? "pdf";
  const className = iconStyles[normalized] ?? "bg-gray-50 text-gray-600";
  const Icon = normalized === "mp4" ? FileVideo : normalized === "zip" ? FileArchive : ["png", "jpg", "jpeg"].includes(normalized) ? FileImage : FileText;

  return (
    <div className={cn("grid size-7 place-items-center rounded-md text-[10px] font-medium", className)}>
      <Icon size={14} />
    </div>
  );
}

export function FileUploader({ projectId, initialFiles = [] }: { projectId: string; initialFiles?: DashboardFile[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [files, setFiles] = useState<DashboardFile[]>(initialFiles);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [error, setError] = useState("");

  const visibleFiles = files.filter((file) => (filter === "all" ? true : file.approval_status === filter));

  function validate(file: File) {
    const extension = getFileExtension(file.name);
    return ALLOWED_FILE_EXTENSIONS.includes(extension) && file.size <= MAX_FILE_SIZE;
  }

  async function uploadOne(file: File) {
    if (!validate(file)) {
      setError(`${file.name} desteklenmiyor veya 50MB limitini aşıyor.`);
      return;
    }

    const id = crypto.randomUUID();
    setUploads((current) => [...current, { id, file, progress: 8 }]);

    const timer = window.setInterval(() => {
      setUploads((current) => current.map((item) => (item.id === id ? { ...item, progress: Math.min(item.progress + 12, 88) } : item)));
    }, 220);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);

    const response = await fetch("/api/files/upload", { method: "POST", body: formData });
    window.clearInterval(timer);

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(result?.error ?? "Dosya yüklenemedi.");
      setUploads((current) => current.filter((item) => item.id !== id));
      return;
    }

    const result = (await response.json()) as { file: DashboardFile };
    setUploads((current) => current.map((item) => (item.id === id ? { ...item, progress: 100 } : item)));
    window.setTimeout(() => {
      setUploads((current) => current.filter((item) => item.id !== id));
      setFiles((current) => [result.file, ...current]);
    }, 350);
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError("");
    Array.from(fileList).forEach((file) => void uploadOne(file));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  async function download(path: string) {
    const response = await fetch(`/api/files/signed-url?path=${encodeURIComponent(path)}&expires=86400`);
    const result = (await response.json()) as { signedUrl?: string };
    if (result.signedUrl) window.open(result.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragEnter={() => setDragging(true)}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn("cursor-pointer rounded-xl border-[1.5px] border-dashed border-purple-200 bg-white p-8 text-center", dragging && "border-purple-400 bg-purple-50")}
      >
        <Upload size={24} className="mx-auto mb-2 text-purple-400" />
        <p className="text-[13px] leading-[1.6] text-text-secondary">Dosya sürükle veya tıkla</p>
        <p className="text-[11px] leading-[1.6] text-text-hint">Maks 50MB</p>
        <input ref={inputRef} hidden multiple type="file" accept=".pdf,.jpg,.jpeg,.png,.mp4,.zip,.docx,.xlsx" onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)} />
      </div>

      {error ? <p className="text-[12px] leading-[1.6] text-coral-400">{error}</p> : null}

      {uploads.length ? (
        <div className="space-y-2">
          {uploads.map((upload) => (
            <div key={upload.id} className="rounded-xl border bg-white p-3">
              <div className="flex items-center gap-3">
                <TypeIcon type={getFileExtension(upload.file.name)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[12px] font-medium">{upload.file.name}</p>
                    <p className="text-[11px] text-text-secondary">{Math.round(upload.progress)}%</p>
                  </div>
                  <p className="text-[11px] text-text-secondary">{formatFileSize(upload.file.size)}</p>
                  <div className="mt-2 h-1 rounded-full bg-purple-200">
                    <div className="h-1 rounded-full bg-purple-600" style={{ width: `${upload.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { key: "all", label: "Tümü" },
            { key: "pending", label: "Onay bekleyen" },
            { key: "approved", label: "Onaylandı" }
          ].map((item) => (
            <button
              key={item.key}
              className={cn("rounded-full px-3 py-1 text-[12px] font-medium", filter === item.key ? "bg-purple-600 text-white" : "bg-white text-text-secondary")}
              onClick={() => setFilter(item.key as typeof filter)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {visibleFiles.map((file) => {
            const badge = approvalLabels[file.approval_status];
            return (
              <div key={file.id} className="rounded-xl border bg-white p-3">
                <div className="flex items-center gap-3">
                  <TypeIcon type={file.file_type} />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium leading-[1.6]">{file.file_name}</p>
                    <p className="text-[11px] leading-[1.6] text-text-secondary">{formatFileSize(file.file_size)}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] leading-[1.6] text-text-secondary">
                    <input
                      type="checkbox"
                      checked={file.approval_status === "pending"}
                      onChange={(event) => {
                        const nextStatus = event.target.checked ? "pending" : "approved";
                        setFiles((current) => current.map((item) => (item.id === file.id ? { ...item, approval_status: nextStatus } : item)));
                      }}
                      className="size-3 accent-purple-600"
                    />
                    Onay iste
                  </label>
                  <button className="flex size-6 items-center justify-center rounded-lg text-purple-600" onClick={() => download(file.file_url)} aria-label="İndir">
                    <Download size={14} />
                  </button>
                </div>
                {badge ? <span className={cn("mt-3 inline-flex rounded-full px-2 py-1 text-[11px] font-medium leading-[1.6]", badge.className)}>{badge.label}</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
