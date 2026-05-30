import React, { useState, useEffect } from "react";
import { Integration } from "./integrationsConfig";
import { 
  Cloud, 
  Activity, 
  ShieldCheck, 
  MessageSquare, 
  ShieldAlert, 
  Mail, 
  Settings2, 
  Cpu, 
  Play, 
  RefreshCw, 
  Terminal, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Lock,
  ArrowRight,
  Wifi,
  Radio,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IntegrationCardProps {
  key?: string;
  integration: Integration;
  onConfigureClick: (integration: Integration) => void;
}

export function IntegrationCard({ integration, onConfigureClick }: IntegrationCardProps) {
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartProgress, setRestartProgress] = useState(0);
  const [showLogsMini, setShowLogsMini] = useState(false);
  const [liveEps, setLiveEps] = useState(integration.epsVolume || 0);

  // Fluctuating EPS to mimic live ingestion stream behavior
  useEffect(() => {
    if (integration.status === "ACTIVE" && integration.epsVolume && integration.epsVolume > 0) {
      const interval = setInterval(() => {
        const offset = Math.floor((Math.random() - 0.5) * ((integration.epsVolume ?? 0)  * 0.08));
        setLiveEps(Math.max(1, (integration.epsVolume || 0) + offset));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [integration.status, integration.epsVolume]);

  const handleRestartNode = () => {
    if (isRestarting) return;
    setIsRestarting(true);
    setRestartProgress(0);
    
    const interval = setInterval(() => {
      setRestartProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRestarting(false);
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Get service specific icons and aesthetic borders
  const getServiceAsset = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "aws":
        return {
          icon: <Cloud className="w-6 h-6 text-amber-600 dark:text-amber-500" />,
          glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/35",
          accentColor: "text-amber-500",
          metricAccent: "text-amber-600 dark:text-amber-400 font-mono"
        };
      case "zeek":
        return {
          icon: <Activity className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-pulse" />,
          glow: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-500/35",
          accentColor: "text-cyan-500",
          metricAccent: "text-cyan-600 dark:text-cyan-400 font-mono"
        };
      case "suricata":
        return {
          icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-450" />,
          glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/35",
          accentColor: "text-emerald-500",
          metricAccent: "text-emerald-600 dark:text-emerald-400 font-mono"
        };
      case "slack":
        return {
          icon: <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
          glow: "group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500/35",
          accentColor: "text-indigo-500",
          metricAccent: "text-indigo-600 dark:text-indigo-400 font-mono"
        };
      case "pfsense":
        return {
          icon: <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-500" />,
          glow: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-500/35",
          accentColor: "text-rose-500",
          metricAccent: "text-rose-600 dark:text-rose-400 font-mono"
        };
      case "twilio":
      case "smtp":
        return {
          icon: <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
          glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-500/35",
          accentColor: "text-purple-500",
          metricAccent: "text-purple-600 dark:text-purple-400 font-mono"
        };
      default:
        return {
          icon: <Cpu className="w-6 h-6 text-slate-500 dark:text-slate-400" />,
          glow: "hover:border-slate-500/35",
          accentColor: "text-slate-500",
          metricAccent: "text-slate-600 dark:text-slate-400 font-mono"
        };
    }
  };

  const asset = getServiceAsset(integration.iconName);

  // Status mapping colors & details
  const getStatusConfig = (status: Integration["status"]) => {
    switch (status) {
      case "ACTIVE":
        return {
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
          dot: "bg-emerald-500 dark:bg-emerald-400 animate-pulse",
          pulseColor: "bg-emerald-500 dark:bg-emerald-400"
        };
      case "STANDBY":
        return {
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/30",
          dot: "bg-amber-500",
          pulseColor: "bg-amber-500"
        };
      case "DEGRADED":
        return {
          badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse",
          dot: "bg-red-500",
          pulseColor: "bg-red-500"
        };
      case "OFFLINE":
      default:
        return {
          badge: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/30",
          dot: "bg-neutral-500",
          pulseColor: "bg-neutral-500"
        };
    }
  };

  const statusStyle = getStatusConfig(integration.status);
  const isStandbyOrOffline = integration.status === "STANDBY" || integration.status === "OFFLINE";

  // Mocked Decrypted Log stream Specific to each platform
  const getMockedLogs = () => {
    switch (integration.id) {
      case "aws-cloudwatch":
        return [
          "[INFO] CRED_AUTH: Session ID role/SiSOC_Inbound verified successfully.",
          "[ACTIVE] SQS_POLLER: Received 18 logs from ap-southeast-1. CloudTrail chunk loaded.",
          "[INFO] STREAM: Ingested events. IPS verification check results: 0 anomalies."
        ];
      case "zeek-telemetry":
        return [
          "[ACTIVE] ZEEK_CORE: Parsed conn.log frame sync state correctly.",
          "[INFO] ANALYZER: Checked 14 SSL/TLS renegotiation handshake packets.",
          "[ACTIVE] HEURISTIC: Risk scores calculated: 0.02 base probability."
        ];
      case "suricata-ids":
        return [
          "[WARNING] ENGINE: Out-of-bounds TCP handshake warning signature on 10.0.1.42.",
          "[ACTIVE] SIGNATURE: Synchronized rules database with central threat matrix feed state.",
          "[WARNING] ALERTS: Dispatched Alert payload reference: Core Rule 20114."
        ];
      case "slack-webhook":
        return [
          "[DISPATCHED] Outbox dispatch test triggered. Payload status: 200 OK.",
          "[ACTIVE] STANDBY: Connection healthcheck validated against api.slack.com.",
          "[INFO] ROUTER: Listening for central SOAR warning critical event requests."
        ];
      default:
        return [
          "[STANDBY] Core channel operations locked or waiting registration payload.",
          "[INFO] SOCKET: Inactive telemetry port. Standing by for local TLS handshakes.",
          "[INFO] PARSER: Node engine idle headroom."
        ];
    }
  };

  return (
    <div 
      className={`bg-card/85 backdrop-blur-md rounded-xl border border-border p-5 flex flex-col justify-between h-72.5 relative transition-all duration-300 hover:border-cyan-500/25 group select-none overflow-hidden ${asset.glow}`}
      id={`node-card-${integration.id}`}
    >
      {/* Background cyber lines and accents */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-white/1.5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-1 h-14 bg-lineả-to-b from-cyan-500/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* RESTART OVERLAY STATE */}
      <AnimatePresence>
        {isRestarting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center font-mono text-[10px]"
          >
            <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin mb-3" />
            <span className="text-cyan-405 font-black uppercase tracking-wider block mb-1">
              RESTARTING NODE INTERFACE...
            </span>
            <div className="w-36 h-1 bg-neutral-800 rounded-full overflow-hidden mt-1 max-w-xs">
              <div 
                className="bg-cyan-500 h-full transition-all duration-150" 
                style={{ width: `${restartProgress}%` }}
              />
            </div>
            <span className="text-[8px] text-muted-foreground mt-2 uppercase">
              RE-ESTABLISHING TLS & ALIGNING RULES (Port 3000)
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINI LIVE LOGS SCREEN */}
      <AnimatePresence>
        {showLogsMini && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-2 bottom-12 top-2 z-20 bg-black/95 border border-border rounded-lg p-3.5 flex flex-col justify-between font-mono"
          >
            <div>
              <div className="flex items-center justify-between pb-1 border-b border-white/10 mb-2">
                <span className="text-[8px] font-black text-cyan-400 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-cyan-500" />
                  LIVE DECRYPTED SYSLOG STREAM
                </span>
                <span className="text-[7.5px] text-emerald-400">ENCRYPTED STATE: SHA-512</span>
              </div>
              <div className="space-y-1 text-[8.5px] text-zinc-300 leading-snug uppercase">
                {getMockedLogs().map((logStr, lIdx) => (
                  <div key={lIdx} className="border-b border-zinc-900/40 pb-1 flex items-start gap-1">
                    <span className="text-muted-foreground/45 shrink-0">&gt;&gt;</span>
                    <span className={logStr.includes("WARNING") ? "text-red-400 font-bold" : logStr.includes("ACTIVE") ? "text-cyan-400" : ""}>{logStr}</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setShowLogsMini(false)}
              className="w-full mt-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-[8px] text-center font-black rounded text-zinc-400 hover:text-white border border-neutral-800 transition uppercase tracking-widest cursor-pointer"
            >
              CLOSE TERMINAL MONITOR
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upper Segment Layout */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className={`p-2.5 bg-muted/60 border border-border rounded-xl transition-all duration-300 shadow-inner group-hover:scale-105 group-hover:bg-muted`}>
            {asset.icon}
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8.5px] font-black tracking-widest font-mono transition-all duration-305 ${statusStyle.badge}`}>
            <span className={`relative flex h-1.5 w-1.5`}>
              {integration.status === "ACTIVE" && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.pulseColor}`} />
              )}
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusStyle.dot}`} />
            </span>
            <span>{integration.status}</span>
          </span>
        </div>

        {/* Node description */}
        <div className="mt-3.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[8.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
              {integration.category === "inbound" ? "TELEMETRY INGESTION GATEWAY" : integration.category === "notifications" ? "COMMAND INCIDENT NOTIFIER" : "SOAR ACTIVE REMEDIATION"}
            </span>
            <span className="text-muted-foreground/30 text-[8px]">•</span>
            <span className="text-[7.5px] font-mono text-cyan-500/70 font-bold uppercase tracking-widest">
              ID: {integration.id}
            </span>
          </div>

          <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-mono group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
            {integration.name}
          </h3>
          <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2 uppercase font-sans tracking-wide">
            {integration.description}
          </p>
        </div>
      </div>

      {/* Real-time multi-metric grid metrics display instead of just one line */}
      <div className="bg-muted/30 border border-border/60 rounded-lg p-2 grid grid-cols-3 gap-1 font-mono text-[8px] text-center select-none mt-2">
        <div className="border-r border-border/50 pr-1 py-0.5">
          <span className="text-muted-foreground/80 font-bold uppercase block mb-0.5">EST RATE</span>
          <span className={`font-black tracking-tight ${integration.status === "ACTIVE" ? "text-cyan-600 dark:text-cyan-400 animate-pulse" : "text-muted-foreground/50"}`}>
            {integration.status === "ACTIVE" ? `${liveEps.toLocaleString()} EPS` : "0 EPS"}
          </span>
        </div>
        <div className="border-r border-border/50 px-1 py-0.5">
          <span className="text-muted-foreground/80 font-bold uppercase block mb-0.5">PROCESSED</span>
          <span className="font-extrabold text-foreground">
            {isStandbyOrOffline ? "0" : integration.logsProcessed || "0"}
          </span>
        </div>
        <div className="pl-1 py-0.5">
          <span className="text-muted-foreground/80 font-bold uppercase block mb-0.5">SYNCED RULES</span>
          <span className={`font-extrabold ${integration.status === "ACTIVE" ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground/50"}`}>
            {isStandbyOrOffline ? "0" : integration.syncedRules || "0"}
          </span>
        </div>
      </div>

      {/* Action Buttons Interface Footer block */}
      <div className="border-t border-border pt-3 mt-3.5 flex items-center justify-between">
        <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
          {integration.configuredAt ? `SYNCED: ${integration.configuredAt}` : "STANDBY // DISCONNECTED"}
        </span>

        <div className="flex gap-1.5 items-center">
          {/* Active controls for View Logs & Restart if ACTIVE or DEGRADED */}
          {!isStandbyOrOffline && (
            <>
              {/* Restart Button */}
              <button
                onClick={handleRestartNode}
                title="Restart Connection Core"
                id={`restart-node-${integration.id}`}
                className="p-1 px-1.5 rounded bg-muted hover:bg-muted-foreground/10 border border-border text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* View Logs Terminal Button */}
              <button
                onClick={() => setShowLogsMini(true)}
                title="View Decrypted Stream"
                id={`terminal-logs-view-${integration.id}`}
                className="p-1 px-1.5 rounded bg-muted hover:bg-muted-foreground/10 border border-border text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Configuration click - dynamic text depends on status */}
          <button
            onClick={() => onConfigureClick(integration)}
            id={`configure-action-${integration.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[8.5px] font-black uppercase tracking-widest transition duration-300 relative overflow-hidden cursor-pointer ${
              isStandbyOrOffline
                ? "bg-linear-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-500 hover:to-indigo-500 text-white border border-blue-600/10 shadow-[0_0_12px_rgba(37,99,235,0.12)] active:scale-95"
                : "bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5 font-bold" />
            <span>{isStandbyOrOffline ? "PLUG SERVICE" : "CONFIGURE"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
