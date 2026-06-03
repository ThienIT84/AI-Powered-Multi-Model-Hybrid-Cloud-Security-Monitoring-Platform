import React from "react";
import { AlertTriangle } from "lucide-react";

interface NetworkWipeConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const NetworkWipeConfirm: React.FC<NetworkWipeConfirmProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="bg-red-950/40 border border-red-500/20 p-3 rounded-lg flex items-center justify-between text-[11px] animate-fade-in font-mono">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
        <span className="text-red-400 font-extrabold">
          SIEM FLUSH WARNING: ARE YOU SURE YOU WANT TO FLUSH ALL ACTIVE STACK CONNECTION RAM FORENSICS?
        </span>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onConfirm}
          className="px-2.5 py-1 bg-red-500 hover:bg-red-650 text-white font-extrabold rounded text-[9px] cursor-pointer"
        >
          CONFIRM FLUSH
        </button>
        <button 
          onClick={onCancel}
          className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded text-[9px] cursor-pointer"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};
