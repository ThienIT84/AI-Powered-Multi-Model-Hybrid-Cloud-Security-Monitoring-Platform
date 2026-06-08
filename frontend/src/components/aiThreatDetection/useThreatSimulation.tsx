import { useState, useEffect, useMemo } from "react";
import { ThreatEvent, GraphColors } from "./types";
import { PRESEEDED_THREAT_EVENTS } from "./mockData";

export function useThreatSimulation() {
  const [ticker, setTicker] = useState(0);
  const [liveInferences, setLiveInferences] = useState(384912);
  const [liveDetections, setLiveDetections] = useState(8429);
  const [liveFusionAlerts, setLiveFusionAlerts] = useState(2145);
  const [liveLatency, setLiveLatency] = useState(14.8);
  const [liveFpReduction, setLiveFpReduction] = useState(42.6);
  const [throughput, setThroughput] = useState(1280); // events per second

  const [alertFeed, setAlertFeed] = useState<ThreatEvent[]>(PRESEEDED_THREAT_EVENTS);

  // Monitor Light/Dark Theme to update Recharts colors cleanly
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Soft theme colors based on display mode
  const graphColors: GraphColors = useMemo(() => {
    return isDark ? {
      cyan: "#06b6d4",
      emerald: "#10b981",
      amber: "#f59e0b",
      red: "#ef4444",
      violet: "#8b5cf6",
      gray: "#1f2937",
      border: "#1f2937",
      text: "#94a3b8",
      grid: "rgba(148, 163, 184, 0.1)",
      tooltipBg: "#18181b",
      tooltipBorder: "#27272a",
      tooltipText: "#f4f4f5"
    } : {
      cyan: "#0891b2",
      emerald: "#059669",
      amber: "#d97706",
      red: "#dc2626",
      violet: "#7c3aed",
      gray: "#f3f4f6",
      border: "#e5e7eb",
      text: "#64748b",
      grid: "rgba(100, 116, 139, 0.1)",
      tooltipBg: "#ffffff",
      tooltipBorder: "#e4e4e7",
      tooltipText: "#18181b"
    };
  }, [isDark]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((t) => t + 1);

      // Increment live stats slightly
      const infStep = Math.floor(Math.random() * 8) + 3;
      setLiveInferences((prev) => prev + infStep);

      // Random throughput fluctuation
      setThroughput((prev) => {
        const diff = Math.floor(Math.random() * 80) - 40;
        const target = prev + diff;
        return target >= 1100 && target <= 1450 ? target : prev;
      });

      // Occasional alert injection
      if (Math.random() > 0.6) {
        setLiveDetections((prev) => prev + 1);

        if (Math.random() > 0.5) {
          setLiveFusionAlerts((prev) => prev + 1);

          // Prepend a dynamic live threat from mock templates to the alert stream
          const srcIPs = [
            "195.154.122.9", "185.220.101.5", "109.202.107.13", 
            "77.247.110.12", "193.106.191.1", "45.143.203.4"
          ];
          const dstIPs = [
            "10.0.1.25", "10.0.2.14", "10.0.4.10", "10.0.5.21"
          ];
          const attackPool: Array<{
            attack_type: "XSS" | "SQLi" | "DoS" | "Port Scan" | "Brute Force" | "Botnet";
            severity: "Critical" | "High" | "Medium";
            mitre: string;
            ai2a: string;
            ai2b?: string;
          }> = [
            { attack_type: "SQLi", severity: "Critical", mitre: "T1190", ai2a: "SQL Injection Scripting", ai2b: "High Suspected SQL payload" },
            { attack_type: "XSS", severity: "High", mitre: "T1190", ai2a: "Cross-Site Scripting Probe", ai2b: "Malicious iframe tag payload" },
            { attack_type: "DoS", severity: "Critical", mitre: "T1498", ai2a: "TCP Connection DoS", ai2b: "Clean" },
            { attack_type: "Port Scan", severity: "Medium", mitre: "T1595", ai2a: "IP Port Discovery Scan", ai2b: "Clean" },
            { attack_type: "Brute Force", severity: "High", mitre: "T1110", ai2a: "Direct login credential flood", ai2b: "Clean" },
            { attack_type: "Botnet", severity: "High", mitre: "T1071", ai2a: "External C2 Beacon detected", ai2b: "Custom HTTP User-Agent seen" }
          ];

          const chosen = attackPool[Math.floor(Math.random() * attackPool.length)];
          const now = new Date();
          const timestamp = now.toTimeString().split(" ")[0];

          const newEvent: ThreatEvent = {
            id: `evt-${Math.floor(Math.random() * 900000) + 100000}`,
            timestamp,
            src_ip: srcIPs[Math.floor(Math.random() * srcIPs.length)],
            dst_ip: dstIPs[Math.floor(Math.random() * dstIPs.length)],
            attack_type: chosen.attack_type,
            severity: chosen.severity,
            confidence: Math.floor(Math.random() * 15) + 84, // 84 to 98%
            pipeline: {
              zeek: true,
              ai1: Math.floor(Math.random() * 30) + 70, // 70 to 99
              ai2a: chosen.ai2a,
              ai2b: chosen.ai2b,
              fusion_score: Math.floor(Math.random() * 15) + 84
            },
            mitre: chosen.mitre
          };

          setAlertFeed((prev) => [newEvent, ...prev.slice(0, 50)]); // keep a max of 50 in state memory
        }
      }

      setLiveLatency((prev) => {
        const diff = (Math.random() * 0.8 - 0.4);
        const target = parseFloat((prev + diff).toFixed(1));
        return target >= 12 && target <= 18 ? target : prev;
      });

      setLiveFpReduction((prev) => {
        const diff = (Math.random() * 0.4 - 0.2);
        const target = parseFloat((prev + diff).toFixed(1));
        return target >= 41 && target <= 45 ? target : prev;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return {
    ticker,
    liveInferences,
    liveDetections,
    liveFusionAlerts,
    liveLatency,
    liveFpReduction,
    throughput,
    alertFeed,
    isDark,
    graphColors
  };
}
