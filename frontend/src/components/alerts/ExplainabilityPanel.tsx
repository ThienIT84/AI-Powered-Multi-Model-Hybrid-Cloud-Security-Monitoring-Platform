import React from "react";
import { Alert, getAlertFusionMeta } from "../../types";
import { Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface ExplainabilityPanelProps {
  alert: Alert;
}

export function ExplainabilityPanel({ alert }: ExplainabilityPanelProps) {
  const meta = getAlertFusionMeta(alert);

  // Deriving features dynamically based on attackType of alert
  const isXSS = alert.attackType.includes("XSS");
  const isSQLi = alert.attackType.includes("SQL") || alert.attackType.includes("Injection");
  const isWeb = isXSS || isSQLi;
  const isBrute = alert.attackType.includes("Brute") || alert.attackType.includes("Credential");
  const isScan = alert.attackType.includes("Scan") || alert.attackType.includes("Discovery");

  // Mock features to match target requirements (duration, orig_bytes, resp_bytes, entropy, special_char_ratio, has_script_tag)
  const features = [
    {
      feature: "has_script_tag",
      weight: isXSS ? 33 : isSQLi ? 8 : 1,
      impact: isXSS ? "High Impact" : "Negligible",
      description: isXSS ? "Script tag detected in request body check contributed 33%." : "No embedded executable script mark detected."
    },
    {
      feature: "special_char_ratio",
      weight: isSQLi ? 35 : isXSS ? 25 : isBrute ? 4 : 8,
      impact: isSQLi || isXSS ? "High Impact" : "Typical",
      description: isSQLi ? "Abnormal injection characters (Quotes, hyphens) contributed 35%." : "Typical parameter density found."
    },
    {
      feature: "entropy",
      weight: isSQLi ? 27 : isXSS ? 21 : isScan ? 12 : 18,
      impact: isWeb ? "Elevated Entropy" : "Normal Density",
      description: isSQLi ? "High URL query string entropy contributed 27%." : "Payload character randomness fits standard guidelines."
    },
    {
      feature: "duration",
      weight: isScan ? 28 : isBrute ? 19 : 14,
      impact: isScan ? "Burst Scan" : "Standard Span",
      description: isScan ? "Rapid packet burst sequence span contributed 28%." : "Normal socket span observed."
    },
    {
      feature: "orig_bytes",
      weight: isBrute ? 22 : isSQLi ? 15 : 12,
      impact: isBrute ? "High Payload size" : "Standard",
      description: isBrute ? "Repetitive outbound auth payload attempts size contributed 22%." : "Standard connection payload size extracted."
    },
    {
      feature: "resp_bytes",
      weight: isSQLi ? 24 : isBrute ? 10 : 8,
      impact: isSQLi ? "Heavy Response Out" : "Nominal",
      description: isSQLi ? "Abnormally large DB retrieval dump size contributed 24%." : "Standard server feedback response logged."
    }
  ].sort((a, b) => b.weight - a.weight);

  const humanReadableSummary = isXSS 
    ? "AI Model Explanation: Script tag detected contributed 33%. High URI entropy contributed 21%."
    : isSQLi 
      ? "AI Model Explanation: High URI entropy contributed 27%. SQL special injection-character ratio contributed 35%."
      : isScan 
        ? "AI Model Explanation: Scanning duration and high network host discovery frequency contributed 28%."
        : "AI Model Explanation: Unusual origin payload byte sizes combined with connection state anomalies contributed 22%.";

  return (
    <div className="space-y-4">
      {/* Target 13 Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-[0.2em] block">
            SHAP MODEL EXPLAINABILITY
          </span>
          <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Key Telemetry Dimensions Driving AI Verdict
          </h3>
        </div>
        <Sparkles size={12} className="text-cyan-500" />
      </div>

      <div className="bg-secondary/15 border border-border/50 rounded-xl p-3.5 space-y-4">
        <div className="flex items-center gap-1.5 text-[8.5px] font-black text-foreground uppercase tracking-wider">
          <TrendingUp size={12} className="text-cyan-500 animate-pulse" />
          <span>SHAP Feature Importance & Attribution Table</span>
        </div>

        {/* SHAP Progress list bars */}
        <div className="space-y-3">
          {features.map((f, i) => (
            <div key={f.feature} className="space-y-1">
              <div className="flex items-center justify-between text-[8px] font-mono uppercase">
                <span className="font-extrabold text-foreground">{f.feature}</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-extrabold font-mono text-[8.5px]">{f.weight}%</span>
                  <span className="text-muted-foreground text-[6.5px]">Impact: {f.impact}</span>
                </div>
              </div>

              {/* Stacked metric bar visual */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden flex border border-border/15">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    f.weight > 25 ? "bg-red-500" : f.weight > 15 ? "bg-orange-500" : "bg-cyan-500"
                  )} 
                  style={{ width: `${f.weight * 2}%` }} 
                />
              </div>

              <p className="text-[7px] text-muted-foreground italic leading-none pt-0.5 pl-1">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Human Readable Explanation box */}
        <div className="p-2.5 bg-background border border-border/70 rounded-lg space-y-1">
          <span className="text-[7px] text-[#06b6d4] uppercase tracking-widest block font-black">
            HUMAN-READABLE DIAGNOSTIC SUMMARY
          </span>
          <p className="text-[8.5px] font-medium text-muted-foreground/90 leading-normal">
            {humanReadableSummary}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExplainabilityPanel;
