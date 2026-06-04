import React, { useState } from "react";
import { Zap, Loader2, CheckCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

interface PlaybookTriggerButtonProps {
  playbookName: string;
}

export function PlaybookTriggerButton({ playbookName }: PlaybookTriggerButtonProps) {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");

  const handleTrigger = () => {
    setStatus("running");
    setTimeout(() => {
      setStatus("done");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }, 2000);
  };

  return (
    <button
      onClick={handleTrigger}
      disabled={status === "running"}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[8.5px] font-black uppercase tracking-wider transition-all select-none leading-none w-full justify-center max-w-52.5",
        status === "done" 
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/15" 
          : status === "running"
            ? "bg-muted border-border text-muted-foreground cursor-wait"
            : "bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border-[#06b6d4]/25 text-cyan-400 hover:text-cyan-300 cursor-pointer"
      )}
    >
      {status === "idle" && <Zap size={11} />}
      {status === "running" && <Loader2 size={11} className="animate-spin" />}
      {status === "done" && <CheckCircle size={11} />}
      
      {status === "idle" && playbookName}
      {status === "running" && "Triggering SOAR..."}
      {status === "done" && "Playbook Dispatched!"}
    </button>
  );
}
export default PlaybookTriggerButton;
