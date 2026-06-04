import React from "react";
import { Alert, getAlertFusionMeta } from "../../../types";
import { cn } from "../../../lib/utils";
import { ShieldAlert, Wifi, Globe, KeyRound } from "lucide-react";

interface RiskScoreBreakdownProps {
  alert: Alert;
}

export function RiskScoreBreakdown({ alert }: RiskScoreBreakdownProps) {
  const meta = getAlertFusionMeta(alert);

  // Sub risks derivation based on threat types
  const finalRisk = alert.riskScore || 70;
  
  // Custom Segments
  const hasWebRisk = meta.ai2bWeb !== "NONE";
  const hasSigRisk = meta.suricataEvidence !== "NO MATCH";
  const hasNetRisk = meta.ai1Result === "ANOMALY";

  const netRiskScore = hasNetRisk ? Math.min(100, Math.floor(finalRisk * 1.15)) : 10;
  const webRiskScore = hasWebRisk ? Math.min(100, Math.floor(finalRisk * 1.2)) : 5;
  const sigRiskScore = hasSigRisk ? 100 : (alert.riskScore > 50 ? 55 : 0);

  // Gauge details
  const radius = 35;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (finalRisk / 100) * circumference;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            RISK MATRIX BALANCER
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Segmented risk score indicators
          </span>
        </div>
        <ShieldAlert size={14} className="text-cyan-500" />
      </div>

      <div className="bg-background/40 border border-border/70 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-5 justify-around select-none">
        {/* SVG Circular Gauge */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="var(--border)"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="opacity-20"
            />
            {/* Progress Segment with Gradient */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="url(#riskGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
 
          {/* Inner Text Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none mt-1">
            <span className={cn(
              "text-[18px] font-mono font-black",
              finalRisk > 75 ? "text-red-500" : "text-[#06b6d4]"
            )}>
              {finalRisk}
            </span>
            <span className="text-[6.5px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">
              FUSION WEIGHT
            </span>
          </div>
        </div>

        {/* Breakdown Segments */}
        <div className="flex-1 w-full space-y-2.5">
          {/* Segment 1: Network Risk */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px] leading-none">
              <span className="font-extrabold text-foreground uppercase tracking-wide flex items-center gap-1">
                <Wifi size={10} className="text-cyan-400" />
                NETWORK LAYER RISK
              </span>
              <span className="font-mono font-bold text-muted-foreground">{netRiskScore}/100</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full transition-all duration-700" 
                style={{ width: `${netRiskScore}%` }}
              />
            </div>
          </div>

          {/* Segment 2: Web Risk */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px] leading-none select-none">
              <span className="font-extrabold text-foreground uppercase tracking-wide flex items-center gap-1">
                <Globe size={10} className="text-purple-400" />
                WEB APP PAYLOAD RISK
              </span>
              <span className="font-mono font-bold text-muted-foreground">{webRiskScore}/100</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                style={{ width: `${webRiskScore}%` }}
              />
            </div>
          </div>

          {/* Segment 3: Signature Risk */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px] leading-none select-none">
              <span className="font-extrabold text-foreground uppercase tracking-wide flex items-center gap-1">
                <KeyRound size={10} className="text-blue-400" />
                STATIC SIGNATURE RISK
              </span>
              <span className="font-mono font-bold text-muted-foreground">{sigRiskScore}/100</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-700" 
                style={{ width: `${sigRiskScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RiskScoreBreakdown;
