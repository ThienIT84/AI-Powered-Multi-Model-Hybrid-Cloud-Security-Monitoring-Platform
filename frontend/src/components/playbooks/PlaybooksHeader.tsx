import React, { useRef, useState } from "react";
import { PlusCircle, LogIn, ShieldCheck } from "lucide-react";

interface PlaybooksHeaderProps {
  onOpenCreateModal: () => void;
  onImportTrigger: (importedData: any) => void;
  utcTime: string;
}

export function PlaybooksHeader({
  onOpenCreateModal,
  onImportTrigger,
  utcTime,
}: PlaybooksHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setImportMessage(null);
        onImportTrigger(parsed);
      } catch (err) {
        setImportMessage("Invalid playbook JSON file format.");
        window.setTimeout(() => setImportMessage(null), 3500);
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can trigger change again
    e.target.value = "";
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 md:p-5 shadow-xs select-none">
      {/* Upper Brand / Info row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-lg shrink-0 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight leading-none mb-1.5">
              PLAYBOOKS
            </h1>
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground">
              Incident Response Procedures and Security Response Workflows
            </p>
          </div>
        </div>

        {/* Live Clock Status & Action Buttons aligned nicely */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Live Clock Status */}
          <div className="flex flex-col text-left md:text-right font-mono justify-center">
            <span className="text-[9px] font-black text-foreground tracking-tight uppercase leading-none">
              ORCHESTRATION GATEWAY
            </span>
            <span className="text-[11px] font-bold text-cyan-400 mt-1 block leading-none">
              {utcTime || "SYSTEM READY"}
            </span>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-4 flex items-center gap-2">
            {/* Invisible file input for imports */}
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-muted font-mono hover:bg-muted/80 text-[8.5px] font-black tracking-wider uppercase rounded-lg border border-border flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogIn size={11} className="text-muted-foreground shrink-0" />
              Import Playbook
            </button>

            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2 bg-cyan-600 font-mono hover:bg-cyan-500 text-white text-[8.5px] font-black tracking-wider uppercase rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle size={11} className="shrink-0" />
              Create Playbook
            </button>
          </div>
        </div>
      </div>
      {importMessage && (
        <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-500 px-3 py-2 text-[9px] font-black uppercase tracking-widest">
          {importMessage}
        </div>
      )}
    </div>
  );
}
