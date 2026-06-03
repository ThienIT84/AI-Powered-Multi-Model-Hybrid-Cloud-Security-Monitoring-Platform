import React from "react";
import { Flame, Layers, Server, Globe } from "lucide-react";

interface NetworkSimulatorInjectorProps {
  onInjectPortScan: () => void;
  onInjectExfil: () => void;
  onInjectTor: () => void;
  isInjectingPortScan: boolean;
  isInjectingExfil: boolean;
  isInjectingTor: boolean;
}

export const NetworkSimulatorInjector: React.FC<NetworkSimulatorInjectorProps> = ({
  onInjectPortScan,
  onInjectExfil,
  onInjectTor,
  isInjectingPortScan,
  isInjectingExfil,
  isInjectingTor,
}) => {
  return (
    <div className="xl:col-span-4 self-start h-fit bg-card border border-border rounded-lg p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-red-500/[0.003] to-transparent pointer-events-none" />

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <h2 className="text-[10px] font-black text-rose-600 dark:text-rose-455 tracking-widest uppercase">
            ACTIVE SIEM SECURITY INJECTOR WIDGET
          </h2>
        </div>
        <p className="text-[10px] text-slate-650 dark:text-slate-405 font-sans leading-relaxed mb-3">
          Enterprise penetration testing utility. Inject port sweep scans, database exfiltrations, and command-and-control handshakes directly into active RAM arrays to validate classifier accuracy.
        </p>

        <div className="space-y-2">
          {/* Sweep reconnais */}
          <button
            onClick={onInjectPortScan}
            disabled={isInjectingPortScan}
            className="w-full text-left bg-secondary/65 dark:bg-slate-900/60 hover:bg-red-500/3 border border-border hover:border-red-500/35 p-2 rounded-lg flex items-center justify-between group transition-all text-xs cursor-pointer"
          >
            <div>
              <div className="font-extrabold text-foreground group-hover:text-red-500 dark:group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                Port Scan Recon
                {isInjectingPortScan && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5 font-sans leading-tight">Probing TCP ports 21-445 targets</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[7.5px] font-black text-amber-600 dark:text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/15">MEDIUM RISK</span>
              <Layers className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400" />
            </div>
          </button>

          {/* Bulk exfil */}
          <button
            onClick={onInjectExfil}
            disabled={isInjectingExfil}
            className="w-full text-left bg-secondary/65 dark:bg-slate-900/60 hover:bg-red-500/3 border border-border hover:border-red-500/35 p-2 rounded-lg flex items-center justify-between group transition-all text-xs cursor-pointer"
          >
            <div>
              <div className="font-extrabold text-foreground group-hover:text-red-500 dark:group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                Massive Exfiltration
                {isInjectingExfil && <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-ping" />}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5 font-sans leading-tight">Leaking 156MB SQL database data dump</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[7.5px] font-black text-red-600 dark:text-red-550 bg-red-500/10 px-1 py-0.2 rounded border border-red-500/15">CRITICAL</span>
              <Server className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400" />
            </div>
          </button>

          {/* Onion protocol */}
          <button
            onClick={onInjectTor}
            disabled={isInjectingTor}
            className="w-full text-left bg-secondary/65 dark:bg-slate-900/60 hover:bg-rose-500/3 border border-border hover:border-rose-500/35 p-2 rounded-lg flex items-center justify-between group transition-all text-xs cursor-pointer"
          >
            <div>
              <div className="font-extrabold text-foreground group-hover:text-red-500 dark:group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                Tor Onion DNS Tunnel
                {isInjectingTor && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5 font-sans leading-tight">C2 Shell tunneling on port 9001</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[7.5px] font-black text-rose-600 dark:text-rose-455 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/15">HIGH THREAT</span>
              <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-600 dark:group-hover:text-rose-450" />
            </div>
          </button>
        </div>
      </div>

      <div className="bg-secondary/60 dark:bg-slate-900 border border-border p-2 rounded text-[9px] text-muted-foreground mt-3 flex justify-between uppercase">
        <span>Injected metrics affect all metrics tabs:</span>
        <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">Active system</span>
      </div>
    </div>
  );
};
