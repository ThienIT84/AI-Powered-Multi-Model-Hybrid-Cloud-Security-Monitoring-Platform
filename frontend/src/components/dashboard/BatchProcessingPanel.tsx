import React, { useState, useEffect } from "react";
import { Cpu, RefreshCw, Zap, Server, ShieldCheck, Database, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function BatchProcessingPanel() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Logical values based on the spec
  const queueDepth = Math.max(120, 154 + Math.floor(Math.sin(ticks) * 15));
  const messagesPerSec = 50 + Math.floor(Math.cos(ticks * 1.5) * 4);
  const avgBatchSize = 50;
  const predictionThroughput = 4800 + Math.floor(Math.cos(ticks) * 120);
  const avgInferenceTime = 13 + (ticks % 3 === 0 ? 1 : 0);
  const queueDelay = "4.2 ms";
  const modelThroughput = `${predictionThroughput / 60} events/s`;

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-cyan-500 animate-bounce" />
          SECTION 28: SQS & BATCH PREDICTION MONITOR (AI PIPELINE)
        </h3>
        <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          SQS ACTIVE
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4 py-1.5 pr-0.5">
        
        {/* Highlight Main metrics row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/25 border border-border/40 p-2.5 rounded-lg flex flex-col justify-between leading-none font-mono">
            <div>
              <span className="text-muted-foreground text-[7px] font-black uppercase tracking-wider block">CURRENT QUEUE DEPTH</span>
              <span className="text-xl font-black text-foreground mt-1.5 block tracking-tighter">{queueDepth}</span>
            </div>
            <span className="text-[6.5px] mt-1 text-muted-foreground/50 uppercase leading-none font-semibold">Buffered in AWS SQS</span>
          </div>

          <div className="bg-secondary/25 border border-border/40 p-2.5 rounded-lg flex flex-col justify-between leading-none font-mono">
            <div>
              <span className="text-muted-foreground text-[7px] font-black uppercase tracking-wider block">BATCH SIZE LIMIT</span>
              <span className="text-xl font-black text-cyan-400 mt-1.5 block tracking-tighter">{avgBatchSize} items</span>
            </div>
            <span className="text-[6.5px] mt-1 text-muted-foreground/50 uppercase leading-none font-semibold">Thread batch threshold</span>
          </div>
        </div>

        {/* Detailed specs parameters list */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[8.5px] font-mono leading-none">
          <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
            <span className="text-muted-foreground font-bold">MESSAGES PER SEC:</span>
            <span className="text-foreground font-black">{messagesPerSec} msg/s</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
            <span className="text-muted-foreground font-bold">PRED THROUGHPUT:</span>
            <span className="text-foreground font-black">{predictionThroughput.toLocaleString()} /min</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
            <span className="text-muted-foreground font-bold">AVG INFERENCE TIME:</span>
            <span className="text-cyan-400 font-extrabold">{avgInferenceTime} ms</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
            <span className="text-muted-foreground font-bold">QUEUE DELAY RATE:</span>
            <span className="text-foreground font-black">{queueDelay}</span>
          </div>
          <div className="flex items-center justify-between col-span-2">
            <span className="text-muted-foreground font-bold">MODEL ENGINE COMPASS:</span>
            <span className="text-foreground font-black">{modelThroughput}</span>
          </div>
        </div>

        {/* Queue pressure linear visualizer */}
        <div>
          <div className="flex justify-between text-[7.5px] font-black text-muted-foreground uppercase leading-none mb-1">
             <span>Queue Pressure Overflows</span>
             <span>{((queueDepth / 300) * 100).toFixed(1)}% Usage</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
             <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${(queueDepth / 300) * 100}%` }} />
          </div>
        </div>

      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase opacity-55 shrink-0 font-mono">
        <span>FCAJ STREAM CONTEXT INDEX</span>
        <span>AWS active pool</span>
      </div>
    </div>
  );
}

export default BatchProcessingPanel;
