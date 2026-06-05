import React, { useState, useEffect } from "react";
import { ActivitySquare, HeartPulse, HardDrive, RefreshCw, RadioReceiver, Network, PlaySquare } from "lucide-react";

interface MonitoringSettingsTabProps {
  data: {
    cpuUsage: number;
    ramUsage: number;
    diskUsage: number;
    aiEngineHealth: {
      ai1: boolean;
      ai2a: boolean;
      ai2b: boolean;
      fusion: boolean;
    };
    connectedClients: number;
    sqsQueueLength: number;
    sqsProcessingRate: number;
  };
  onChange: (path: string, value: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function MonitoringSettingsTab({ data, onChange, onToast }: MonitoringSettingsTabProps) {
  // Local state for live oscillating numbers to give a high fidelity animation
  const [liveCpu, setLiveCpu] = useState(data.cpuUsage);
  const [liveRam, setLiveRam] = useState(data.ramUsage);
  const [liveSqsRate, setLiveSqsRate] = useState(data.sqsProcessingRate);

  useEffect(() => {
    const interval = setInterval(() => {
      // Oscillate CPU usage subtly around user's settings state for high fidelity
      setLiveCpu((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const target = Math.min(99, Math.max(5, data.cpuUsage + delta));
        return target;
      });
      // Oscillate RAM usage
      setLiveRam((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const target = Math.min(99, Math.max(5, data.ramUsage + delta));
        return target;
      });
      // Oscillate SQS rate
      setLiveSqsRate((prev) => {
        const delta = Math.floor(Math.random() * 11) - 5;
        const target = Math.max(10, data.sqsProcessingRate + delta);
        return target;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [data.cpuUsage, data.ramUsage, data.sqsProcessingRate]);

  const triggerResetMetrics = () => {
    onToast("PURGING SYSTEM METRICS LOG CACHES...", "info");
    setTimeout(() => {
      onChange("cpuUsage", 38);
      onChange("ramUsage", 54);
      setLiveCpu(38);
      setLiveRam(54);
      onToast("HEALTH PROTOCOL MEASUREMENTS RESET TO BASELINE.", "success");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <ActivitySquare className="w-4 h-4 text-cyan-500" />
            Hardware & Pipeline Health Diagnostics
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
            Analyze CPU/RAM loads, review active node diagnostics, and examine WebSocket peer connections
          </p>
        </div>
        <button
          onClick={triggerResetMetrics}
          className="px-3.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest bg-muted border border-border/80 hover:bg-muted/70 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          RESET TO BASELINE
        </button>
      </div>

      {/* HARDWARE OVERVIEW METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CPU */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">CPU INGESTION CAPACITANCE</span>
            <span className="text-[14px] font-black text-cyan-500">{liveCpu}%</span>
          </div>
          <div className="w-full bg-muted h-3 rounded-lg overflow-hidden border border-border/50">
            <div 
              style={{ width: `${liveCpu}%` }} 
              className={`h-full rounded-lg transition-all duration-1000 ${
                liveCpu > 85 ? "bg-red-500" : liveCpu > 65 ? "bg-orange-500" : "bg-cyan-500"
              }`} 
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-muted-foreground/60 uppercase">
            <span>24 Logical Threads</span>
            <span>FREQ: 3.48 GHz</span>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">RAM BUFFER DISPATCH</span>
            <span className="text-[14px] font-black text-purple-400">{liveRam}%</span>
          </div>
          <div className="w-full bg-muted h-3 rounded-lg overflow-hidden border border-border/50">
            <div 
              style={{ width: `${liveRam}%` }} 
              className="bg-purple-500 h-full rounded-lg transition-all duration-1000" 
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-muted-foreground/60 uppercase">
            <span>8.6 GB DISPATCHED</span>
            <span>CAP: 16.0 GB DDR5</span>
          </div>
        </div>

        {/* Disk */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SSD LOG STORAGE DENSE</span>
            <span className="text-[14px] font-black text-amber-500">{data.diskUsage}%</span>
          </div>
          <div className="w-full bg-muted h-3 rounded-lg overflow-hidden border border-border/50">
            <div 
              style={{ width: `${data.diskUsage}%` }} 
              className="bg-amber-500 h-full rounded-lg transition-all duration-300" 
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-muted-foreground/60 uppercase">
            <span>420 GB COMMITTED</span>
            <span>CAP: 1.0 TB NVME</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MODEL COMPONENT INDEPENDENT HEALTH STATUS */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
            Isolated Model Health Diagnostic Indicators
          </span>

          <div className="grid grid-cols-2 gap-4 text-[10px] font-mono pt-1">
            <div className="p-3 bg-muted/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[7.5px] uppercase">AI1: Isolation</span>
                <span className="text-foreground tracking-widest font-black uppercase">AD-Detection</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="p-3 bg-muted/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[7.5px] uppercase">AI2A: XGBoost</span>
                <span className="text-foreground tracking-widest font-black uppercase">Tactical-Class</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="p-3 bg-muted/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[7.5px] uppercase">AI2B: Payload</span>
                <span className="text-foreground tracking-widest font-black uppercase">Payload-Verify</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="p-3 bg-muted/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[7.5px] uppercase">Fusion Layer</span>
                <span className="text-foreground tracking-widest font-black uppercase">Decision Core</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>
          </div>
        </div>

        {/* WEBSOCKET AND CONSUMER RATE DIAGNOSTICS */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
            <RadioReceiver className="w-3.5 h-3.5 text-cyan-400" />
            Consumer Peers & Buffer Diagnostics
          </span>

          <div className="space-y-3 font-mono text-[9.5px]">
            <div className="flex items-center justify-between p-3 bg-muted/40 border border-border/60 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Network className="w-4 h-4 text-cyan-500" />
                <span className="font-extrabold text-foreground uppercase">WebSocket Active Peer listeners</span>
              </div>
              <span className="text-[12px] font-black text-foreground">{data.connectedClients} CLIENT SERVICES</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/40 border border-border/60 rounded-xl text-center">
                <span className="text-muted-foreground block text-[7.5px] uppercase">Ingested Queue Size</span>
                <span className="text-[12px] font-black text-foreground font-mono">{data.sqsQueueLength} MSGS</span>
              </div>

              <div className="p-3 bg-muted/40 border border-border/60 rounded-xl text-center">
                <span className="text-muted-foreground block text-[7.5px] uppercase">Mean Processing Vol</span>
                <span className="text-[12.5px] font-black text-emerald-500 font-mono">{liveSqsRate} FLOWS/S</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
