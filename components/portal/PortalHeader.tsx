import { Button } from "@/components/ui/Button";

interface PortalHeaderProps {
  clientName: string;
  projectName: string;
}

export function PortalHeader({ clientName, projectName }: PortalHeaderProps) {
  return (
    <header className="border-b bg-bg-surface px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div>
          <p className="label text-text-hint">{clientName}</p>
          <h1 className="text-xl leading-tight">{projectName}</h1>
        </div>
        <Button variant="secondary">Dosya yukle</Button>
      </div>
    </header>
  );
}
