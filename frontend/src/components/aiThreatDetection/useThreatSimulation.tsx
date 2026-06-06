import { useState, useEffect, useMemo } from "react";
import { ThreatEvent, GraphColors } from "./types";
import { PRESEEDED_THREAT_EVENTS } from "./mockData";

export function useThreatSimulation() {
  const [ticker, setTicker] = useState(0);
  const [liveInferences, setLiveInferences] = useState(152347);
  const [liveNormalFlows, setLiveNormalFlows] = useState(45188);
  const [liveAnomalyFlows, setLiveAnomalyFlows] = useState(4812);
  const [liveDetections, setLiveDetections] = useState(8412);
  const [liveFusionAlerts, setLiveFusionAlerts] = useState(2134);
  const [liveLatency, setLiveLatency] = useState(27);
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
      const infStep = Math.floor(Math.random() * 3) + 1;
      setLiveInferences((prev) => prev + infStep);
      setLiveNormalFlows((prev) => prev + (Math.random() > 0.3 ? infStep : 0));
      setLiveAnomalyFlows((prev) => prev + (Math.random() > 0.85 ? 1 : 0));
      
      if (Math.random() > 0.8) {
        setLiveDetections((prev) => prev + 1);
        if (Math.random() > 0.6) {
          setLiveFusionAlerts((prev) => prev + 1);
          
          // Prepend a dynamic live threat from pool to alert feed
          const randomBase = PRESEEDED_THREAT_EVENTS[Math.floor(Math.random() * PRESEEDED_THREAT_EVENTS.length)];
          const now = new Date();
          const timestamp = now.toTimeString().split(" ")[0];
          const newEvent: ThreatEvent = {
            ...randomBase,
            id: `evt-${Math.floor(Math.random() * 900000) + 100000}`,
            timestamp,
            source: `${Math.floor(Math.random() * 180) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            riskScore: randomBase.riskScore + Math.floor(Math.random() * 5) - 2
          };
          setAlertFeed((prev) => [newEvent, ...prev.slice(0, 9)]);
        }
      }

      setLiveLatency((prev) => {
        const variance = Math.random() > 0.5 ? 1 : -1;
        const target = prev + variance;
        return target >= 25 && target <= 29 ? target : prev;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return {
    ticker,
    liveInferences,
    liveNormalFlows,
    liveAnomalyFlows,
    liveDetections,
    liveFusionAlerts,
    liveLatency,
    alertFeed,
    isDark,
    graphColors
  };
}
