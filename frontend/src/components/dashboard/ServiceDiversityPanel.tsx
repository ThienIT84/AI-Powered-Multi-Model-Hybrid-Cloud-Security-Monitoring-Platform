import React from "react";
import { Filter, AlertTriangle, CheckCircle, Info, BookOpen, Layers } from "lucide-react";
import { cn } from "../../lib/utils";

interface ServiceData {
  serviceName: string;
  port: string;
  trafficPct: number;
  coveragePct: number;
  trend: "STABLE" | "GROWING" | "LOW_VOL";
  underrepresented: boolean;
}

export function ServiceDiversityPanel() {
  const services: ServiceData[] = [
    { serviceName: "HTTP (Reverse Proxy)", port: "80", trafficPct: 44.5, coveragePct: 98.4, trend: "STABLE", underrepresented: false },
    { serviceName: "HTTPS (TLS/SSL)", port: "443", trafficPct: 38.2, coveragePct: 92.1, trend: "GROWING", underrepresented: false },
    { serviceName: "DNS Query Resolver", port: "53", trafficPct: 11.4, coveragePct: 88.5, trend: "STABLE", underrepresented: false },
    { serviceName: "SSH Cryptic Console", port: "22", trafficPct: 2.1, coveragePct: 99.1, trend: "LOW_VOL", underrepresented: false },
    { serviceName: "FTP Remote System", port: "21", trafficPct: 0.2, coveragePct: 15.0, trend: "LOW_VOL", underrepresented: true },
    { serviceName: "ICMP Diagnostic Ping", port: "All", trafficPct: 1.8, coveragePct: 62.4, trend: "STABLE", underrepresented: false },
    { serviceName: "Other TCP Custom Ports", port: "Various", trafficPct: 1.8, coveragePct: 41.5, trend: "LOW_VOL", underrepresented: true }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          SECTION 33: SERVICE PORT & PROTOCOL REPRESENTATION DIVERSITY STATS
        </h3>
        <span className="text-[7.2px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          COVERAGE METRICS
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar font-mono">
        <table className="w-full text-left border-collapse text-[8.5px]">
          <thead>
            <tr className="border-b border-border/20 text-muted-foreground uppercase text-[7.5px] font-black">
              <th className="pb-2.5">SERVICE LOG SECTOR</th>
              <th className="pb-2.5">PORT</th>
              <th className="pb-2.5">TRAFFIC %</th>
              <th className="pb-2.5">DATASET COVERAGE</th>
              <th className="pb-2.5">TRAFFIC TREND</th>
              <th className="pb-2.5 text-right">FCAJ METRIC INTEGRATIVE STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {services.map((svc) => (
              <tr key={svc.serviceName} className="hover:bg-secondary/10 transition-colors">
                <td className="py-2.5 font-bold text-foreground flex items-center gap-1.5">
                  {svc.underrepresented && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  {!svc.underrepresented && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                  {svc.serviceName}
                </td>
                <td className="py-2.5 text-muted-foreground">{svc.port}</td>
                <td className="py-2.5 text-foreground font-semibold">{svc.trafficPct}%</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${svc.coveragePct}%` }} />
                    </div>
                    <span>{svc.coveragePct}%</span>
                  </div>
                </td>
                <td className="py-2.5 font-bold">
                  <span className={cn(
                    "text-[7.5px] px-1.5 py-0.5 rounded leading-none uppercase font-black",
                    svc.trend === "GROWING" ? "bg-cyan-500/10 text-cyan-500" :
                    svc.trend === "LOW_VOL" ? "bg-amber-500/10 text-amber-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {svc.trend}
                  </span>
                </td>
                <td className="py-2.5 text-right font-black">
                  {svc.underrepresented ? (
                    <span className="text-amber-500 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded uppercase text-[7.5px]">
                      UNDERREPRESENTED (COLLECTING SAMPLES)
                    </span>
                  ) : (
                    <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase text-[7.5px]">
                      DATA SUFFICIENT
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ServiceDiversityPanel;
