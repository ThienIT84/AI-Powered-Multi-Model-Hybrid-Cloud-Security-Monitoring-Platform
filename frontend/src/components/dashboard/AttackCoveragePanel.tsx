import React from "react";
import { Shield, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils";

interface AttackSample {
  type: string;
  count: number;
  coverage: string;
  lastCollected: string;
  trainingUsage: string;
}

export function AttackCoveragePanel() {
  const attacks: AttackSample[] = [
    { type: "Port Scan (Nmap/Masscan)", count: 184502, coverage: "99.8%", lastCollected: "3 mins ago", trainingUsage: "Optimized (95% set)" },
    { type: "Brute Force (SSH/Hydra)", count: 24109, coverage: "98.2%", lastCollected: "12 mins ago", trainingUsage: "Optimized (90% set)" },
    { type: "DoS / DDoS Floods (Hping)", count: 110940, coverage: "96.4%", lastCollected: "1 hour ago", trainingUsage: "Active Train (100%)" },
    { type: "XSS Injections (Cross-Site)", count: 12842, coverage: "92.1%", lastCollected: "42 mins ago", trainingUsage: "Active Train (100%)" },
    { type: "SQLi Database Injections", count: 9140, coverage: "94.5%", lastCollected: "2 hours ago", trainingUsage: "Active Train (100%)" },
    { type: "Beaconing Backdoor C2", count: 4891, coverage: "89.2%", lastCollected: "4 mins ago", trainingUsage: "Pending Fine-Tune" },
    { type: "Data Exfiltration (SCP/Base64)", count: 3204, coverage: "91.8%", lastCollected: "10 mins ago", trainingUsage: "Optimized (92% set)" }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-extrabold text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          SECTION 35: FCAJ CYBERSECURITY ATTACK VECTOR COVERAGE ANALYSIS
        </h3>
        <span className="text-[7.2px] bg-cyan-500/10 dark:bg-[#06b6d4]/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 dark:border-cyan-500/15 px-2 py-0.5 rounded uppercase font-extrabold font-mono">
          AGGREGATE VECTORS: 7
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar font-mono">
        <table className="w-full text-left border-collapse text-[8.5px]">
          <thead>
            <tr className="border-b border-border/20 text-muted-foreground uppercase text-[7.5px] font-extrabold">
              <th className="pb-2.5 font-extrabold">ATTACK ATTRIBUTE VECTOR</th>
              <th className="pb-2.5 font-extrabold">SAMPLE SIZES</th>
              <th className="pb-2.5 font-extrabold">COVERAGE FACTOR</th>
              <th className="pb-2.5 font-extrabold">LATEST REGISTRY RECORD</th>
              <th className="pb-2.5 text-right font-extrabold">ONNX TRAINING MATRIX USAGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {attacks.map((att) => (
              <tr key={att.type} className="hover:bg-secondary/20 dark:hover:bg-secondary/15 transition-colors">
                <td className="py-2.5 font-extrabold text-foreground flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {att.type}
                </td>
                <td className="py-2.5 font-extrabold text-foreground">{att.count.toLocaleString()} samples</td>
                <td className="py-2.5">
                  <span className="inline-block bg-cyan-100/50 dark:bg-cyan-950/30 px-1.5 py-0.5 border border-cyan-500/20 dark:border-cyan-500/25 rounded leading-none text-[8px] font-extrabold text-cyan-700 dark:text-cyan-400">
                    {att.coverage}
                  </span>
                </td>
                <td className="py-2.5 text-muted-foreground font-extrabold">{att.lastCollected}</td>
                <td className="py-2.5 text-right font-extrabold">
                  <span className={cn(
                    "text-[7.5px] px-2 py-0.5 rounded leading-none font-extrabold shrink-0 uppercase border",
                    att.trainingUsage.includes("Pending") 
                      ? "bg-amber-100/55 dark:bg-amber-950/30 border-amber-500/20 dark:border-amber-500/25 text-amber-700 dark:text-amber-500" 
                      : "bg-cyan-100/55 dark:bg-cyan-950/30 border-cyan-500/20 dark:border-cyan-500/25 text-cyan-700 dark:text-cyan-500"
                  )}>
                    {att.trainingUsage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttackCoveragePanel;
