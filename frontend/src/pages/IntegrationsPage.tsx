import React, { useState, useEffect, useRef } from "react";
import { Integration, IntegrationConfig } from "../components/integrations/integrationsConfig";
import { IntegrationTabs } from "../components/integrations/IntegrationTabs";
import { IntegrationGrid } from "../components/integrations/IntegrationGrid";
import { IntegrationFormModal } from "../components/integrations/IntegrationFormModal";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Terminal, 
  RefreshCw, 
  HelpCircle, 
  TrendingUp, 
  Layers, 
  Pause, 
  Play, 
  Wifi, 
  Radio, 
  Activity,
  Server
} from "lucide-react";

// Ingestion initial node states mapping 4 ACTIVE nodes and 2 unplugged pending nodes
const initialIntegrations: Integration[] = [
  {
    id: "aws-cloudwatch",
    name: "AWS CloudWatch/CloudTrail Ingestion Gateway",
    category: "inbound",
    description: "Ingest real-time cloud infrastructure logs including EC2 metric monitors, VPC flow logs, and AWS Identity authentication events.",
    status: "ACTIVE",
    iconName: "aws",
    configuredAt: "2 days ago",
    epsVolume: 1240,
    logsProcessed: "482K",
    syncedRules: "24K",
    uptime: "99.9%",
    tunnelCount: 1,
    queueDepth: 0,
    configuration: {
      awsAccessKeyId: "AKIAIOSFODNN7EXAMPLE",
      awsSecretAccessKey: "••••••••••••••••••••••••••••••••",
      awsRegion: "ap-southeast-1",
      syncInterval: "1m",
      encryptionPolicy: "TLS-1.3",
      retryPolicy: "exponential"
    }
  },
  {
    id: "zeek-telemetry",
    name: "Zeek Network Intrusion Agent",
    category: "inbound",
    description: "High-velocity syslog ingestion stream containing Zeek conn.log, http.log, and dns.log events for intelligent AI security classification.",
    status: "ACTIVE",
    iconName: "zeek",
    configuredAt: "5 days ago",
    epsVolume: 820,
    logsProcessed: "3.2M",
    syncedRules: "180",
    uptime: "99.8%",
    tunnelCount: 1,
    queueDepth: 0,
    configuration: {
      apiEndpoint: "https://zeek-sensor-prod.domain.local/api/v2",
      authToken: "••••••••••••••••••••",
      syncInterval: "realtime",
      encryptionPolicy: "TLS-1.3",
      retryPolicy: "exponential"
    }
  },
  {
    id: "suricata-ids",
    name: "Suricata Signature IDS Engine",
    category: "inbound",
    description: "Rule-based IDS alert logs signature delivery streams, feeding network threat notifications directly from edge Suricata sensors.",
    status: "DEGRADED",
    iconName: "suricata",
    configuredAt: "1 week ago",
    epsVolume: 450,
    logsProcessed: "1.8M",
    syncedRules: "12.5K",
    uptime: "99.2%",
    tunnelCount: 1,
    queueDepth: 4,
    configuration: {
      apiEndpoint: "https://suricata-detector-prod.domain.local:8080/push",
      authToken: "••••••••••••••••••••",
      syncInterval: "5m",
      encryptionPolicy: "TLS-1.3",
      retryPolicy: "linear"
    }
  },
  {
    id: "slack-webhook",
    name: "Slack Critical Dispatcher",
    category: "notifications",
    description: "Automated webhook integration tool to dispatch critical cybersecurity incident payloads directly to corporate Slack channels.",
    status: "ACTIVE",
    iconName: "slack",
    configuredAt: "3 hours ago",
    epsVolume: 15,
    logsProcessed: "45K",
    syncedRules: "12",
    uptime: "100%",
    tunnelCount: 0,
    queueDepth: 0,
    configuration: {
      webhookUrl: "https://hooks.slack.com/services/T0000/B0000/XXXXXXXXXXXXXXXXXX",
      syncInterval: "realtime",
      encryptionPolicy: "HTTPS",
      retryPolicy: "exponential"
    }
  },
  {
    id: "pfsense-fw",
    name: "pfSense Firewall Block Orchestrator",
    category: "security_actions",
    description: "Configure API access on pfSense routers/firewalls to automate real-time IP blacklisting and source isolation directly from SOAR playbooks.",
    status: "OFFLINE",
    iconName: "pfsense",
    epsVolume: 0,
    logsProcessed: "0",
    syncedRules: "0",
    uptime: "0%",
    tunnelCount: 0,
    queueDepth: 0
  },
  {
    id: "twilio-smtp",
    name: "Twilio SMS / Email Gateway",
    category: "notifications",
    description: "Multi-channel notification gateway for dispatching secure 2FA verification tokens or periodic security reports directly to SOC supervisors.",
    status: "STANDBY",
    iconName: "twilio",
    epsVolume: 0,
    logsProcessed: "0",
    syncedRules: "0",
    uptime: "0%",
    tunnelCount: 0,
    queueDepth: 0
  }
];

// Structural SIEM logger parameters
interface RealtimeLog {
  timestamp: string;
  category: "INFO" | "ACTIVE" | "WARNING" | "ERROR" | "DISPATCHED";
  origin: string;
  message: string;
}

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "inbound" | "notifications" | "security_actions">("all");

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UTC scheduler ticker & investigation state
  const [systemTime, setSystemTime] = useState("");
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [logsList, setLogsList] = useState<RealtimeLog[]>([
    {
      timestamp: new Date(Date.now() - 5000).toISOString().substring(11, 19),
      category: "INFO",
      origin: "SYS_CORE",
      message: "Ingestion router online. Port 3000 mapping: active."
    },
    {
      timestamp: new Date(Date.now() - 3000).toISOString().substring(11, 19),
      category: "ACTIVE",
      origin: "ZEEK_AGENT",
      message: "Pulsed connection conn.log stream telemetry synchronization state."
    },
    {
      timestamp: new Date(Date.now() - 1000).toISOString().substring(11, 19),
      category: "DISPATCHED",
      origin: "SLACK_CMD",
      message: "Gateway test packet successfully dispatched to security-alert webhooks."
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const prevLogsLengthRef = useRef(logsList.length);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Check if user is scrolled near the bottom (within a threshold, e.g. 35px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 35;
    isAtBottomRef.current = isNearBottom;

    if (isNearBottom) {
      setUnreadCount(0);
    }
  };

  const scrollToNewest = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
    setUnreadCount(0);
  };

  // Smart handle scrolling on new logs
  useEffect(() => {
    if (logsList.length > prevLogsLengthRef.current) {
      const addedCount = logsList.length - prevLogsLengthRef.current;
      prevLogsLengthRef.current = logsList.length;

      if (!isAtBottomRef.current) {
        setUnreadCount(prev => prev + addedCount);
      } else {
        scrollToNewest();
      }
    } else {
      prevLogsLengthRef.current = logsList.length;
    }
  }, [logsList]);

  // Real-time UTC scheduler clock ticking
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.getUTCFullYear() + "-" + 
        String(now.getUTCMonth() + 1).padStart(2, '0') + "-" + 
        String(now.getUTCDate()).padStart(2, '0') + " " + 
        String(now.getUTCHours()).padStart(2, '0') + ":" + 
        String(now.getUTCMinutes()).padStart(2, '0') + ":" + 
        String(now.getUTCSeconds()).padStart(2, '0') + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll central SOC syslog dispatcher streams
  useEffect(() => {
    if (isFeedPaused) return;

    const streamSources = [
      { origin: "AWS_TRAIL", category: "ACTIVE" as const, message: "Authorized session credentials role/SOC_Gateway. CloudTrail chunk loaded." },
      { origin: "ZEEK_DIAG", category: "INFO" as const, message: "Parsed 48 TCP SSL renegotiation handshake frames smoothly." },
      { origin: "SURICATA_ENG", category: "WARNING" as const, message: "Signatures engine alerts generated: Out-of-bounds TCP probe on interface 1." },
      { origin: "PFSENSE_SOAR", category: "ERROR" as const, message: "Severed routing handshake attempt on 10.12.92.1. Rule timeout threshold breached." },
      { origin: "SLACK_WEBHOOK", category: "DISPATCHED" as const, message: "Posted high-risk packet event digest payload to external webhook channel." },
      { origin: "AWS_TRAIL", category: "INFO" as const, message: "Scheduled sync completed: 1,240 EPS throughput bandwidth verified." },
      { origin: "TWILIO_GATE", category: "ACTIVE" as const, message: "Reconfigured outbox sms queuing latency index check: 2FA streams stable." }
    ];

    const interval = setInterval(() => {
      const randomSeed = streamSources[Math.floor(Math.random() * streamSources.length)];
      const stamp = new Date().toISOString().substring(11, 19);

      setLogsList(prev => {
        const nextLogs = [
          ...prev, 
          {
            timestamp: stamp,
            category: randomSeed.category,
            origin: randomSeed.origin,
            message: randomSeed.message
          }
        ];
        // Enforce maximum virtual length to avoid browser leak
        if (nextLogs.length > 50) {
          return nextLogs.slice(nextLogs.length - 20);
        }
        return nextLogs;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isFeedPaused]);

  // Save Config callback
  const handleSaveConfiguration = (id: string, config: IntegrationConfig) => {
    const targetNode = integrations.find(it => it.id === id);
    const name = targetNode?.name || "Ingested Node";

    setIntegrations(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: "ACTIVE",  // Switch unplugged to ACTIVE
            configuredAt: "Just now",
            epsVolume: id === "pfsense-fw" ? 310 : id === "twilio-smtp" ? 45 : item.epsVolume,
            logsProcessed: id === "pfsense-fw" ? "14.2K" : id === "twilio-smtp" ? "4.8K" : item.logsProcessed,
            syncedRules: id === "pfsense-fw" ? "120" : id === "twilio-smtp" ? "5" : item.syncedRules,
            uptime: "100%",
            tunnelCount: id === "pfsense-fw" ? 1 : item.tunnelCount,
            configuration: config
          };
        }
        return item;
      })
    );

    // Prepend to central SIEM log aggregator
    const stamp = new Date().toISOString().substring(11, 19);
    setLogsList(prev => [
      ...prev,
      {
        timestamp: stamp,
        category: "ACTIVE",
        origin: "SOC_CORE",
        message: `AUTHORIZED CONFIGURATION MATRIX FOR "${name.toUpperCase()}" [REGISTRATION SUCCESS]`
      }
    ]);

    setIsModalOpen(false);
  };

  // Sever/Disconnect callback
  const handleDisconnectConfiguration = (id: string) => {
    const targetNode = integrations.find(it => it.id === id);
    const name = targetNode?.name || "Ingested Node";

    setIntegrations(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: id === "twilio-smtp" ? "STANDBY" : "OFFLINE",
            configuredAt: undefined,
            epsVolume: 0,
            logsProcessed: "0",
            syncedRules: "0",
            uptime: "0%",
            tunnelCount: 0,
            configuration: undefined
          };
        }
        return item;
      })
    );

    // Append security offline notice
    const stamp = new Date().toISOString().substring(11, 19);
    setLogsList(prev => [
      ...prev,
      {
        timestamp: stamp,
        category: "WARNING",
        origin: "SOC_CORE",
        message: `SEVERED SOCKET CONNECTOR FOR "${name.toUpperCase()}" [NODE UNPLUGGED]`
      }
    ]);

    setIsModalOpen(false);
  };

  const handleConfigureClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  // Node Calculations (Active vs Standby/Offline)
  const activeCount = integrations.filter(item => item.status === "ACTIVE" || item.status === "DEGRADED").length;
  const pendingCount = integrations.filter(item => item.status === "STANDBY" || item.status === "OFFLINE").length;

  // Log categories stylesheet helper (light/dark mode optimal layout)
  const getLogColorClass = (category: RealtimeLog["category"]) => {
  switch (category) {
    case "ACTIVE":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/40";

    case "WARNING":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-200 dark:bg-amber-950/60 dark:border-amber-800/40";

    case "ERROR":
      return "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-200 dark:bg-rose-950/70 dark:border-rose-800/40 animate-pulse font-bold";

    case "DISPATCHED":
      return "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-200 dark:bg-purple-950/60 dark:border-purple-800/40";

    case "INFO":
    default:
      return "text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-200 dark:bg-cyan-950/60 dark:border-cyan-800/40";
  }
};

  return (
    <div className="space-y-6 relative" id="siem-soar-control-panel-root">
      
      {/* 1. Global Integration Overview Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md pb-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div className="space-y-1.5 matches-soc-title">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-cyan-600 dark:text-cyan-400 uppercase">
              SIEM & SOAR INGESTION ROUTING PLANE
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-mono font-black text-foreground tracking-tight uppercase leading-none">
            CENTRAL SERVICE INTEGRATIONS
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-sans">
            Configure logs ingestion pipelines, notifications dispatches, & security response orchestration keys.
          </p>
        </div>

        {/* Dynamic Telemetry engine UTC Clock scheduler */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-card border border-border rounded-lg px-4 py-2 font-mono text-right hover:border-cyan-500/30 transition-all select-none">
            <span className="text-[8px] font-black tracking-widest text-muted-foreground block uppercase mb-1">
              TELEMETRY ENGINE CLOCK
            </span>
            <div className="flex items-center gap-2 justify-end">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                {systemTime || "WAITING FOR TICK..."}
              </span>
            </div>
          </div>
          <div className="h-8 bg-border w-px hidden md:block" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-widest bg-card border border-border px-3 py-3 rounded-lg hidden md:block select-none shadow-sm">
            ORCH_PLANE_V2.8
          </span>
        </div>
      </div>

      {/* 2. KPI STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Established Nodes Card */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4 relative overflow-hidden shadow-sm group hover:border-cyan-500/15 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-emerald-500/1.5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-xl shadow-inner group-hover:scale-105 transition-transform">
              <CheckCircle className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
                ESTABLISHED NODES
              </span>
              <span className="text-xl font-black font-mono text-foreground leading-none block">
                {activeCount} <strong className="text-muted-foreground/60 font-semibold text-xs uppercase">/ {integrations.length} ACTIVE</strong>
              </span>
              <span className="text-[8px] font-mono text-emerald-500 flex items-center gap-1 mt-1 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                SYNC HEALTH: 100%
              </span>
            </div>
          </div>
          
          {/* Custom SVG sparkline showing activity fluctuations */}
          <div className="hidden lg:block shrink-0">
            <span className="text-[7px] font-mono text-muted-foreground uppercase font-bold tracking-widest block text-right mb-1">
              ACTIVITY
            </span>
            <svg className="w-16 h-7 text-emerald-500/80 stroke-current" viewBox="0 0 60 20" fill="none">
              <path 
                d="M0 15 L10 5 L20 18 L30 8 L40 12 L50 4 L60 16" 
                strokeWidth="1.6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
        </div>

        {/* Pending Registration Card */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4 relative overflow-hidden shadow-sm group hover:border-amber-500/15 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-500/1.5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 rounded-xl shadow-inner group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
                PENDING REGISTRATION
              </span>
              <span className="text-xl font-black font-mono text-foreground leading-none block">
                {pendingCount} <strong className="text-muted-foreground/60 font-semibold text-xs uppercase">UNPLUGGED</strong>
              </span>
              <span className="text-[8px] font-mono text-amber-500 flex items-center gap-1 mt-1 font-semibold">
                WAITING CONFIG COMPLIANCE
              </span>
            </div>
          </div>

          {/* Dotted scanning loading animation */}
          <div className="flex items-center gap-1 shrink-0 bg-muted/50 p-1.5 rounded-md border border-border/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>

        {/* Live System EPS Volume Card */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4 relative overflow-hidden shadow-sm group hover:border-cyan-500/15 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-cyan-500/1.5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl shadow-inner group-hover:scale-105 transition-transform">
              <Database className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
                LIVE SYSTEM EPS VOLUME
              </span>
              <span className="text-xl font-black font-mono text-foreground leading-none block">
                {integrations.filter(x => x.tunnelCount && x.tunnelCount > 0).length} ACTIVE <strong className="text-muted-foreground/60 font-semibold text-xs uppercase">TUNNELS</strong>
              </span>
              <span className="text-[8px] font-mono text-cyan-500 flex items-center gap-1 mt-1 font-bold">
                ROUTING COMPACT PORT: 3000
              </span>
            </div>
          </div>

          {/* Animated vertical telemetry flow bars */}
          <div className="flex items-end gap-1 h-8 shrink-0 pb-1 px-1 select-none">
            <div className="w-1 bg-cyan-500/60 rounded-full animate-pulse h-6" style={{ animationDuration: "1s" }} />
            <div className="w-1 bg-cyan-500 rounded-full animate-pulse h-4" style={{ animationDuration: "1.3s" }} />
            <div className="w-1 bg-indigo-505/85 rounded-full animate-pulse h-7" style={{ animationDuration: "0.8s" }} />
            <div className="w-1 bg-cyan-500 rounded-full animate-pulse h-3" style={{ animationDuration: "1.5s" }} />
          </div>
        </div>

      </div>

      {/* 3. Live Central SIEM Aggregation Feed Terminal Widget */}
      <div 
        className="bg-card border border-border rounded-xl p-4.5 shadow-sm relative overflow-hidden select-none focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all font-sans" 
        id="siem-log-terminal"
      >
        {/* Sticky-like elegant control header block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3 mb-3.5 sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-500/15 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-md border border-cyan-500/20">
              <Terminal className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black text-cyan-550 dark:text-cyan-400 tracking-[0.15em] uppercase block mb-0.5">
                SIEM LOG BUS INGESTION STREAM
              </span>
              <h3 className="text-xs font-black text-foreground font-mono uppercase tracking-wider">
                LIVE CENTRAL CENTRAL SIEM AGGREGATION & GATEWAY TRANSIT DISPATCH FEED
              </h3>
            </div>
          </div>
          
          {/* Pause / Resume Toggles with refined buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFeedPaused(!isFeedPaused)}
              id="pause-feed-toggle-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-border rounded-lg font-mono text-[8.5px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer transition select-none"
            >
              {isFeedPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" />
                  <span>RESUME STREAM</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-rose-600 dark:text-rose-405" />
                  <span>PAUSE STREAM</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Syslog Logger Container and Floating Badge Parent wrapper */}
        <div className="relative">
          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="space-y-1.5 bg-background border border-border/80 p-3 rounded-lg h-45 overflow-y-auto custom-scrollbar font-mono text-[9.5px] uppercase tracking-wide leading-relaxed shadow-inner"
          >
            <AnimatePresence initial={false}>
              {logsList.map((log, index) => {
                const catClass = getLogColorClass(log.category);
                return (
                  <motion.div 
                    key={`${index}-${log.timestamp}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex items-start gap-3 py-1.5 px-2.5 rounded-lg border border-transparent hover:border-border/30 hover:bg-muted/40 transition-colors ${
                      index % 2 === 0 
                        ? "bg-muted/25" 
                        : "bg-transparent"
                    }`}
                    id={`syslog-item-${index}`}
                  >
                    {/* Timestamp */}
                    <span className="text-muted-foreground font-bold shrink-0 select-none">
                      [{log.timestamp}]
                    </span>

                    {/* Tag badge with light/dark compliance */}
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 tracking-widest border ${catClass}`}>
                      {log.category}
                    </span>

                    {/* Source Origin node label */}
                    <span className="text-cyan-600 dark:text-cyan-400 font-extrabold shrink-0 select-none font-mono">
                      {log.origin}:
                    </span>

                    {/* Message content */}
                    <span className="text-foreground/85 dark:text-zinc-300 break-all select-all font-mono tracking-tight font-semibold">
                      {log.message}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={terminalEndRef} />
          </div>

          {/* New Event notification indicator banner centered */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                onClick={scrollToNewest}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-mono text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg border border-cyan-400/20 cursor-pointer flex items-center gap-2 select-none z-10 transition-all animate-bounce"
                id="new-telemetry-badge-btn"
              >
                <Activity className="w-3.5 h-3.5 text-white" />
                <span>+{unreadCount} new telemetry events</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Filter tabs and search */}
      <IntegrationTabs
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 5. Ingress Node Grid */}
      <IntegrationGrid
        integrations={integrations}
        searchQuery={searchQuery}
        activeTab={activeTab}
        onConfigureClick={handleConfigureClick}
      />

      {/* 6. Ingestion Routing Info Notice */}
      <div className="bg-muted/40 border border-border rounded-xl p-4 flex items-start gap-3.5 relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.025),transparent)] pointer-events-none" />
        <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0 animate-pulse" />
        <div className="space-y-1 relative">
          <span className="text-[9.5px] font-mono font-black tracking-widest text-muted-foreground uppercase block">
            SIEM DATASTREAM ENCRYPTION POLICY & SHIELDING GUIDELINES
          </span>
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed uppercase">
            All ingestion pipelines, credentials, and API tokens are encrypted locally. External SOAR endpoints utilize dynamic TLS state handshakes to maintain Paramount routing parameters across critical AWS CloudWatch and Zeek network nodes.
          </p>
        </div>
      </div>

      {/* Credentials Configurator Workspace Center Modal */}
      {selectedIntegration && (
        <IntegrationFormModal
          isOpen={isModalOpen}
          integration={selectedIntegration}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveConfiguration}
          onDisconnect={handleDisconnectConfiguration}
        />
      )}

    </div>
  );
}
