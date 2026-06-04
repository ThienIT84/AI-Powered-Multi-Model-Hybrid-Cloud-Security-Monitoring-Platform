import React, { useState, useEffect } from "react";
import { Cpu, Settings, Activity, AlertOctagon, Layers, CpuIcon, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface ONNXEngineData {
  id: string;
  name: string;
  onnxVersion: string;
  modelVersion: string;
  memory: string;
  cpu: string;
  latency: string;
  predictions: number;
  errors: number;
}

export function ONNXEnginePanel() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const initialEngines: ONNXEngineData[] = [
    {
      id: "AI1",
      name: "AI1 (Global Outlier Filter)",
      onnxVersion: "1.16.2",
      modelVersion: "v3.1.2-beta",
      memory: "256 MB",
      cpu: "12%",
      latency: "1.2 ms",
      predictions: 348500,
      errors: 0
    },
    {
      id: "AI2A",
      name: "AI2A (Local Zeek Feature Classifier)",
      onnxVersion: "1.16.2",
      modelVersion: "v3.0.4-release",
      memory: "512 MB",
      cpu: "24%",
      latency: "4.8 ms",
      predictions: 182490,
      errors: 2
    },
    {
      id: "AI2B",
      name: "AI2B (Public Feature Matcher)",
      onnxVersion: "1.17.0",
      modelVersion: "v3.0.5-release",
      memory: "384 MB",
      cpu: "18%",
      latency: "2.9 ms",
      predictions: 165810,
      errors: 1
    }
  ];

  const getWiggledPredict = (id: string, basePred: number) => {
    return basePred + Math.floor(ticks * 5.4 + (id.charCodeAt(0) % 3));
  };

  const getWiggledCPU = (id: string, baseCpu: string) => {
    const cpuVal = parseInt(baseCpu);
    const added = Math.sin(ticks + id.charCodeAt(0)) * 3;
    return `${Math.max(1, Math.min(99, Math.floor(cpuVal + added)))}%`;
  };

  const getWiggledLatency = (id: string, baseLat: string) => {
    const parseFloatVal = parseFloat(baseLat);
    const added = Math.cos(ticks * 2 + id.charCodeAt(0)) * 0.15;
    return `${Math.max(0.1, parseFloatVal + added).toFixed(1)} ms`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-500" />
          SECTION 29: ONNX RUNTIME COPROCESSOR THREAD LEVEL LEVEL MONITORING
        </h3>
        <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          CUDA READY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {initialEngines.map((engine) => {
          const wCpu = getWiggledCPU(engine.id, engine.cpu);
          const wLat = getWiggledLatency(engine.id, engine.latency);
          const wPred = getWiggledPredict(engine.id, engine.predictions);

          return (
            <div key={engine.id} className="bg-secondary/15 border border-border/80 rounded-xl p-3 flex flex-col justify-between font-mono">
              <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-2 leading-none">
                <span className="text-[9px] font-black text-foreground">{engine.name}</span>
                <span className="text-[7px] text-cyan-400 font-extrabold">{engine.id} ACTIVE</span>
              </div>

              <div className="space-y-1.5 text-[8px] leading-tight my-1 flex-1">
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground font-medium">ONNX VERSION:</span>
                  <span className="text-foreground font-black">{engine.onnxVersion}</span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground font-medium">MODEL VERSION:</span>
                  <span className="text-foreground font-black">{engine.modelVersion}</span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground font-medium">MEMORY ALLOC:</span>
                  <span className="text-foreground font-black">{engine.memory}</span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground font-medium">CPU SCHEDULER:</span>
                  <span className="text-cyan-400 font-extrabold">{wCpu}</span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground font-medium">INFERENCE LATENCY:</span>
                  <span className="text-foreground font-black">{wLat}</span>
                </div>
                <div className="flex justify-between border-b border-border/5 pb-1">
                  <span className="text-muted-foreground font-medium">PREDICTIONS COUNT:</span>
                  <span className="text-cyan-500 font-black">{wPred.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">ENGINE ERROR COUNT:</span>
                  <span className={cn(
                    "font-bold",
                    engine.errors > 0 ? "text-rose-500 animate-pulse" : "text-emerald-500"
                  )}>{engine.errors}</span>
                </div>
              </div>

              {/* Graphical mini workload representation bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[6.5px] font-black uppercase text-muted-foreground leading-none mb-1">
                  <span>WAVEFORM WORKLOAD</span>
                  <span>{wCpu} Active</span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, parseInt(wCpu) * 2)}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ONNXEnginePanel;
