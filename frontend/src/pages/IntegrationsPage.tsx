import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from "recharts";
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
  Activity, 
  Server, 
  Cpu, 
  GitFork, 
  Clock, 
  Flame, 
  Monitor, 
  Network, 
  FileText, 
  HardDrive, 
  Radio, 
  ShieldAlert, 
  Play as PlayIcon, 
  PowerOff, 
  RotateCcw, 
  Sliders, 
  Eye, 
  Key, 
  Lock, 
  Check, 
  X,
  Settings,
  ChevronRight,
  Info
} from "lucide-react";
import { 
  initialIntegrationsList, 
  initialDataSources, 
  initialAuditLogs, 
  FCAJIntegrationItem, 
  DataSourceItem, 
  AuditLogItem 
} from "../components/integrations/integrationFCAJData";
import { cn } from "../lib/utils";

export function IntegrationsPage() {
  // --- Standard Themes Control (Requirement 19) ---
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- Realtime Metrics States (Requirement 21) ---
  const [totalProcessedMessages, setTotalProcessedMessages] = useState(124800);
  const [activeAlertsCount, setActiveAlertsCount] = useState(508);
  const [incidentsCount, setIncidentsCount] = useState(102);

  // --- Interactive Failures Simulation Core (Requirement 13) ---
  const [simulatedFailures, setSimulatedFailures] = useState<Record<string, boolean>>({
    zeek: false,
    suricata: false,
    ai1: false,
    ai2a: false,
    ai2b: false,
    websocket: false,
    sqsOverflow: false,
    database: false,
  });

  // Integrations List State (Requirement 3)
  const [integrationsList, setIntegrationsList] = useState<FCAJIntegrationItem[]>(initialIntegrationsList);
  // Data Sources (Requirement 8)
  const [dataSources, setDataSources] = useState<DataSourceItem[]>(initialDataSources);
  // Audit Logs (Requirement 15)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  // Selected Card for Details Modal (Requirement 18)
  const [selectedIntegration, setSelectedIntegration] = useState<FCAJIntegrationItem | null>(null);

  // Active Routing Visualizer Highlight Node
  const [hoveredRoutingNode, setHoveredRoutingNode] = useState<string | null>(null);

  // Live Queue Depth Timeline state for AWS SQS (Requirement 5)
  const [sqsHistory, setSqsHistory] = useState(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      time: `${12 + i}:00`,
      depth: 1100 + Math.floor(Math.random() * 400),
      throughput: 250 + Math.floor(Math.random() * 120),
    }));
  });

  // Live Message Monitoring Data State (Requirement 4)
  const [chartHistory, setChartHistory] = useState(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      label: `${i * 3}s ago`,
      received: 420 + Math.floor(Math.random() * 150),
      processed: 418 + Math.floor(Math.random() * 150),
      failed: Math.floor(Math.random() * 5),
      queued: 10 + Math.floor(Math.random() * 15),
      dropped: 0
    }));
  });

  // Configuration State Center (Requirement 16)
  const [configs, setConfigs] = useState({
    zeek: `{\n  "mirror_ip": "10.100.1.5",\n  "syslog_forward": "10.100.1.100:514",\n  "log_types": ["conn.log", "http.log", "dns.log"],\n  "max_batch_size": 250\n}`,
    suricata: `{\n  "interface": "eth0",\n  "rules_path": "/var/lib/suricata/rules/fcaj.rules",\n  "detection_engine": "hyperscan",\n  "eve_json": {\n    "enabled": true,\n    "types": ["alert", "http", "tls"]\n  }\n}`,
    sqs: `{\n  "queue_url": "https://sqs.ap-southeast-1.amazonaws.com/4751/fcaj-v3-buffer-queue.fifo",\n  "encryption_kms_key_id": "alias/fcaj-v3-key",\n  "batch_size": 10,\n  "visibility_timeout_seconds": 30\n}`,
    ai: `{\n  "ai1_unsupervised_anomaly_score_threshold": 82.5,\n  "ai2a_attack_models": ["port_scan", "brute_force", "dos"],\n  "ai2b_web_rules": ["xss", "sqli", "lfi"],\n  "quantization_precision": "INT8"\n}`,
    fusion: `{\n  " sliding_match_seconds": 30,\n  "deduplication": true,\n  "alert_escalation_score_threshold": 75,\n  "mitre_mappings": "T1190, T1059"\n}`,
    database: `{\n  "host": "fcaj-pgsql.rds.amazonaws.com",\n  "port": 5432,\n  "database": "fcaj_siem_core",\n  "pool_size": 30,\n  "idle_timeout_seconds": 15\n}`,
    websocket: `{\n  "listener_port": 3000,\n  "compress_frames": true,\n  "jwt_security_auth": true,\n  "heartbeat_interval_ms": 30000\n}`
  });

  const [activeConfigTab, setActiveConfigTab] = useState<keyof typeof configs>("zeek");

  // UTC scheduler clock ticking
  const [systemTime, setSystemTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(
        now.getUTCFullYear() + "-" + 
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

  // Compute stats according to failures (Requirement 13 & 12)
  const topMetrics = useMemo(() => {
    const isZeekFailed = simulatedFailures.zeek;
    const isSuricataFailed = simulatedFailures.suricata;
    const isAiFailed = simulatedFailures.ai1 || simulatedFailures.ai2a || simulatedFailures.ai2b;
    const isDbFailed = simulatedFailures.database;
    const isWsFailed = simulatedFailures.websocket;
    const isSqsFailed = simulatedFailures.sqsOverflow;

    const countFailed = 
      (isZeekFailed ? 1 : 0) + 
      (isSuricataFailed ? 1 : 0) + 
      (isAiFailed ? 1 : 0) + 
      (isDbFailed ? 1 : 0) + 
      (isWsFailed ? 1 : 0) + 
      (isSqsFailed ? 1 : 0);

    const warningCount = 0; // standard setup
    const totalIntegrations = 7;
    const healthyCount = Math.max(0, totalIntegrations - countFailed);

    let avgLatency = 24.5;
    if (isSqsFailed) avgLatency += 120.4;
    if (isDbFailed) avgLatency += 85.0;
    if (isAiFailed) avgLatency += 40.2;

    return {
      total: totalIntegrations,
      healthy: healthyCount,
      warning: countFailed > 0 && healthyCount > 2 ? 1 : 0,
      failed: countFailed,
      latency: parseFloat(avgLatency.toFixed(1)),
    };
  }, [simulatedFailures]);

  // Comprehensive Pipeline Health Score (Requirement 12)
  const pipelineHealthScore = useMemo(() => {
    let base = 100;
    if (simulatedFailures.zeek) base -= 15;
    if (simulatedFailures.suricata) base -= 15;
    if (simulatedFailures.ai1) base -= 12;
    if (simulatedFailures.ai2a) base -= 12;
    if (simulatedFailures.ai2b) base -= 12;
    if (simulatedFailures.websocket) base -= 10;
    if (simulatedFailures.sqsOverflow) base -= 14;
    if (simulatedFailures.database) base -= 15;
    return Math.max(5, base);
  }, [simulatedFailures]);

  // Multi-System live ticking updates (Requirement 21 & Requirement 4)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Processed stats increase
      setTotalProcessedMessages(prev => {
        let step = Math.floor(Math.random() * 25) + 12;
        if (simulatedFailures.zeek && simulatedFailures.suricata) {
          step = 0; // flow stopped completely
        } else if (simulatedFailures.zeek || simulatedFailures.suricata) {
          step = Math.floor(step * 0.5);
        }
        return prev + step;
      });

      // 2. Increment active alert counters randomly if healthy
      if (Math.random() > 0.8 && !simulatedFailures.suricata) {
        setActiveAlertsCount(prev => prev + 1);
        if (Math.random() > 0.6) {
          setIncidentsCount(prev => prev + 1);
        }
      }

      // 3. Keep updating live Recharts database history timeline logs (Requirement 4)
      setChartHistory(prev => {
        const next = [...prev.slice(1)];
        let received = 400 + Math.floor(Math.random() * 120);
        let processed = received - (Math.floor(Math.random() * 3));
        let failed = Math.floor(Math.random() * 3);
        let queued = 8 + Math.floor(Math.random() * 10);
        let dropped = 0;

        if (simulatedFailures.zeek) {
          received = Math.floor(received * 0.1);
          processed = Math.floor(processed * 0.1);
        }
        if (simulatedFailures.suricata) {
          received = Math.floor(received * 0.85); // Suricata drops, some zeek remains
        }
        if (simulatedFailures.sqsOverflow) {
          queued += 450 + Math.floor(Math.random() * 200);
          processed = Math.floor(processed * 0.2); // database congestion / backlog
          failed += Math.floor(Math.random() * 20) + 10;
          dropped += Math.floor(Math.random() * 15) + 5;
        }
        if (simulatedFailures.database) {
          failed += Math.floor(received * 0.95);
          processed = 0;
          dropped += Math.floor(received * 0.05);
        }
        if (simulatedFailures.ai1 || simulatedFailures.ai2a || simulatedFailures.ai2b) {
          failed += Math.floor(received * 0.3);
          processed = Math.floor(processed * 0.7);
        }

        next.push({
          label: `${Date.now().toString().slice(-4)}s`,
          received,
          processed,
          failed,
          queued,
          dropped
        });
        return next;
      });

      // 4. Update AWS SQS specific real-time records timeline (Requirement 5)
      setSqsHistory(prev => {
        const next = [...prev.slice(1)];
        let baseDepth = 1200;
        let baseThroughput = 220;

        if (simulatedFailures.sqsOverflow) {
          baseDepth = 8500 + Math.floor(Math.random() * 800);
          baseThroughput = 45;
        } else if (simulatedFailures.database) {
          baseDepth = 4800 + Math.floor(Math.random() * 500);
          baseThroughput = 0;
        } else {
          baseDepth = 1000 + Math.floor(Math.random() * 300);
          baseThroughput = 250 + Math.floor(Math.random() * 100);
        }

        next.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          depth: baseDepth,
          throughput: baseThroughput
        });
        return next;
      });

      // 5. Simulated update for Data Ingestion Source records listing table
      setDataSources(prev => {
        return prev.map(source => {
          let recStep = Math.floor(Math.random() * 4) + 1;
          let statusResult = source.status;

          if (source.name.includes("conn") || source.name.includes("http") || source.name.includes("dns")) {
            if (simulatedFailures.zeek) {
              recStep = 0;
              statusResult = "Offline";
            } else {
              statusResult = "Healthy";
            }
          }
          if (source.name.includes("eve.json") || source.name.includes("alerts")) {
            if (simulatedFailures.suricata) {
              recStep = 0;
              statusResult = "Offline";
            } else {
              statusResult = "Healthy";
            }
          }
          if (source.name.includes("fusion_alerts")) {
            if (simulatedFailures.ai1 || simulatedFailures.ai2a || simulatedFailures.ai2b || simulatedFailures.database) {
              recStep = 0;
              statusResult = "Critical";
            } else {
              statusResult = "Healthy";
            }
          }

          return {
            ...source,
            recordsToday: source.recordsToday + recStep,
            status: statusResult,
            lastReceived: recStep > 0 ? "JUST NOW" : "5M AGO"
          };
        });
      });

    }, 3000); // 3 seconds real-time polling ticks

    return () => clearInterval(interval);
  }, [simulatedFailures]);

  // Compute updated Integration grid elements live with simulated failures (Requirement 3)
  const computedIntegrations = useMemo(() => {
    return integrationsList.map(item => {
      let status: "Healthy" | "Warning" | "Critical" | "Offline" = "Healthy";
      let healthScore = 100;
      let latencyMs = item.latencyMs;

      if (item.id === "zeek" && simulatedFailures.zeek) {
        status = "Offline";
        healthScore = 0;
        latencyMs = 999;
      }
      if (item.id === "suricata" && simulatedFailures.suricata) {
        status = "Offline";
        healthScore = 0;
        latencyMs = 999;
      }
      if (item.id === "sqs") {
        if (simulatedFailures.sqsOverflow) {
          status = "Critical";
          healthScore = 24;
          latencyMs = 450;
        } else if (simulatedFailures.zeek && simulatedFailures.suricata) {
          status = "Warning";
          healthScore = 80;
          latencyMs = 0;
        }
      }
      if (item.id === "rds") {
        if (simulatedFailures.database) {
          status = "Critical";
          healthScore = 5;
          latencyMs = 1500;
        } else if (simulatedFailures.sqsOverflow) {
          status = "Warning";
          healthScore = 75;
          latencyMs = 85;
        }
      }
      if (item.id === "websocket") {
        if (simulatedFailures.websocket) {
          status = "Offline";
          healthScore = 0;
          latencyMs = 999;
        }
      }
      if (item.id === "ai") {
        const aiFailedCount = (simulatedFailures.ai1 ? 1 : 0) + (simulatedFailures.ai2a ? 1 : 0) + (simulatedFailures.ai2b ? 1 : 0);
        if (aiFailedCount === 3) {
          status = "Offline";
          healthScore = 0;
        } else if (aiFailedCount > 0) {
          status = "Warning";
          healthScore = 60;
          latencyMs = 125;
        }
      }

      return {
        ...item,
        status,
        healthScore,
        latencyMs,
      };
    });
  }, [integrationsList, simulatedFailures]);

  // Failure Simulation state changers
  const toggleFailure = useCallback((key: string) => {
    setSimulatedFailures(prev => {
      const nextState = { ...prev, [key]: !prev[key] };
      
      // Update Audit Logs matching failure injection (Requirement 15)
      const auditMsg = nextState[key] 
        ? `CRITICAL FAULT: Simulated injected block of system key [${key.toUpperCase()}] triggered.`
        : `HEALTH RECOVERED: Injected diagnostic failure resolved for system node [${key.toUpperCase()}].`;

      const newAudit: AuditLogItem = {
        timestamp: new Date().toISOString(),
        component: key.toUpperCase(),
        event: nextState[key] ? "Node Disconnection Script" : "Self-Healing Auto Script",
        status: nextState[key] ? "Failure" : "Success",
        user: "phutd0212@gmail.com",
        action: auditMsg,
      };

      setAuditLogs(logs => [newAudit, ...logs].slice(0, 50));
      return nextState;
    });
  }, []);

  // Restore Pipeline Action handler (Requirement 14)
  const handleAutoHeal = useCallback(() => {
    setSimulatedFailures({
      zeek: false,
      suricata: false,
      ai1: false,
      ai2a: false,
      ai2b: false,
      websocket: false,
      sqsOverflow: false,
      database: false,
    });

    const recoveryAudit: AuditLogItem = {
      timestamp: new Date().toISOString(),
      component: "PIPELINE ORCHESTRATOR",
      event: "FCAJ Global Recovery Event",
      status: "Success",
      user: "phutd0212@gmail.com",
      action: "Global cleanup script executed. Restored connection buffers, cleaned PG tables, rebooted model sockets."
    };
    
    setAuditLogs(logs => [recoveryAudit, ...logs].slice(0, 50));
  }, []);

  // Compute live recovery steps based on current outage status (Requirement 14)
  const isOutageSimulated = useMemo(() => {
    return Object.values(simulatedFailures).some(v => v === true);
  }, [simulatedFailures]);

  // Compute Latency End-To-End Metrics (Requirement 9)
  const computedLatencyStages = useMemo(() => {
    let labToSqs = 12;
    let sqsToAi = 45;
    let aiToFusion = 14;
    let fusionToDb = 8;
    let dbToWs = 4;
    let wsToDash = 2;

    if (simulatedFailures.zeek || simulatedFailures.suricata) {
      labToSqs += 25;
    }
    if (simulatedFailures.sqsOverflow) {
      sqsToAi += 340;
      labToSqs += 85;
    }
    if (simulatedFailures.ai1 || simulatedFailures.ai2a || simulatedFailures.ai2b) {
      sqsToAi += 120;
    }
    if (simulatedFailures.database) {
      fusionToDb += 950;
      dbToWs += 200;
    }
    if (simulatedFailures.websocket) {
      wsToDash = 999;
    }

    const avg = Math.round((labToSqs + sqsToAi + aiToFusion + fusionToDb + dbToWs + wsToDash) / 6);
    const p95 = Math.round(avg * 1.45);
    const p99 = Math.round(avg * 2.1);
    const max = Math.round(avg * 3.3);

    return {
      stages: [
        { name: "Lab → SQS", avg: labToSqs, p95: Math.round(labToSqs * 1.5), max: labToSqs * 2 },
        { name: "SQS → AI", avg: sqsToAi, p95: Math.round(sqsToAi * 1.3), max: sqsToAi * 1.8 },
        { name: "AI → Fusion", avg: aiToFusion, p95: Math.round(aiToFusion * 1.4), max: aiToFusion * 2.1 },
        { name: "Fusion → Database", avg: fusionToDb, p95: Math.round(fusionToDb * 1.6), max: fusionToDb * 3 },
        { name: "Database → WebSocket", avg: dbToWs, p95: Math.round(dbToWs * 1.7), max: dbToWs * 4 },
        { name: "WebSocket → Dashboard", avg: wsToDash, p95: wsToDash === 999 ? 999 : Math.round(wsToDash * 1.9), max: wsToDash === 999 ? 999 : wsToDash * 5 },
      ],
      avg,
      p95,
      p99,
      max
    };
  }, [simulatedFailures]);

  return (
    <div className={cn(
      "space-y-6 select-none min-h-screen p-5 rounded-2xl border transition-colors duration-300 font-sans",
      isDarkMode 
        ? "bg-slate-950 text-slate-100 border-slate-900" 
        : "bg-slate-50 text-slate-900 border-slate-200"
    )}>
      
      {/* HEADER CONTROL AREA (DARK/LIGHT SWAP INCLUDED) */}
      <div className={cn(
        "flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 p-5 rounded-xl border",
        isDarkMode ? "bg-slate-900/60 border-slate-800/40" : "bg-white border-slate-200/60"
      )}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-cyan-500 animate-pulse" />
            <h1 className="text-base font-black uppercase tracking-widest leading-none font-mono">
              FCAJ v3.0 Live Integration Center
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
            Full-Stack Pipeline Monitoring • AWS SQS Buffer • Machine Learning Feature Routing • Auto-Recover Systems
          </p>
        </div>

        {/* Global theme controls, Clock and Global Platform Auto-Repair */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/45 p-1 rounded-lg border border-slate-350 dark:border-slate-800">
            <button 
              onClick={() => setIsDarkMode(true)}
              className={cn(
                "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded transition-colors",
                isDarkMode ? "bg-cyan-500 text-white" : "text-slate-400"
              )}
            >
              SOC Mode (Dark)
            </button>
            <button 
              onClick={() => setIsDarkMode(false)}
              className={cn(
                "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded transition-colors",
                !isDarkMode ? "bg-cyan-600 text-white" : "text-slate-400"
              )}
            >
              Corporate Mode (Light)
            </button>
          </div>

          <div className={cn(
            "px-3.5 py-1.5 rounded-lg border font-mono text-[10px] flex items-center gap-2",
            isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-100 border-slate-250"
          )}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">{systemTime}</span>
          </div>

          <button 
            onClick={handleAutoHeal}
            className="px-4 py-1.5 bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-[10px] uppercase font-black tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            <RotateCcw size={12} /> Auto-Heal Systems
          </button>
        </div>
      </div>

      {/* 1. INTEGRATION OVERVIEW TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* KPI 1: Total Integrations */}
        <div className={cn(
          "p-4 rounded-xl border relative overflow-hidden group hover:scale-[1.01] transition-all",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Total Pipelines</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-black font-mono">{topMetrics.total}</p>
            <span className="text-[9px] text-emerald-500 font-mono font-black">100% Config</span>
          </div>
          <div className="h-4 w-full mt-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-cyan-500 stroke-[1.5] fill-none">
              <path d="M 0 10 Q 25 15 50 5 T 100 12" />
            </svg>
          </div>
        </div>

        {/* KPI 2: Healthy Integrations */}
        <div className={cn(
          "p-4 rounded-xl border relative overflow-hidden group hover:scale-[1.01] transition-all",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Healthy Nodes</span>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              topMetrics.failed === 0 ? "bg-emerald-500" : "bg-amber-500"
            )} />
          </div>
          <div className="flex items-baseline justify-between">
            <p className={cn(
              "text-xl font-black font-mono",
              topMetrics.failed === 0 ? "text-emerald-500" : "text-amber-500"
            )}>{topMetrics.healthy}</p>
            <span className="text-[9px] text-slate-400 font-mono">Online</span>
          </div>
          <div className="h-4 w-full mt-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-500 stroke-[1.5] fill-none">
              <path d="M 0 12 L 20 8 L 40 14 L 60 4 L 80 18 L 100 10" />
            </svg>
          </div>
        </div>

        {/* KPI 3: Warning Integrations */}
        <div className={cn(
          "p-4 rounded-xl border relative overflow-hidden group hover:scale-[1.01] transition-all",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Warnings</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-black font-mono text-amber-550">{topMetrics.warning}</p>
            <span className="text-[9px] text-amber-500 font-mono font-black">+1 Active</span>
          </div>
          <div className="h-4 w-full mt-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-amber-550 stroke-[1.5] fill-none">
              <path d="M 0 15 Q 30 2 60 18 T 100 8" />
            </svg>
          </div>
        </div>

        {/* KPI 4: Failed Integrations */}
        <div className={cn(
          "p-4 rounded-xl border relative overflow-hidden group hover:scale-[1.01] transition-all",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Failed Nodes</span>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full animate-bounce",
              topMetrics.failed > 0 ? "bg-red-550 animate-ping" : "bg-slate-400"
            )} />
          </div>
          <div className="flex items-baseline justify-between">
            <p className={cn(
              "text-xl font-black font-mono",
              topMetrics.failed > 0 ? "text-red-500 animate-pulse" : "text-slate-400"
            )}>{topMetrics.failed}</p>
            <span className="text-[9px] text-slate-450 font-mono">Severed</span>
          </div>
          <div className="h-4 w-full mt-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-red-500 stroke-[1.5] fill-none">
              <path d={topMetrics.failed > 0 ? "M 0 12 L 20 2 Q 40 18 60 6 L 80 18 L 100 2" : "M 0 15 L 100 15"} />
            </svg>
          </div>
        </div>

        {/* KPI 5: Average Latency */}
        <div className={cn(
          "p-4 rounded-xl border relative overflow-hidden group hover:scale-[1.01] transition-all",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Transit Latency</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-black font-mono text-cyan-400">{topMetrics.latency} ms</p>
            <span className="text-[9px] text-slate-405 font-mono">P95 Mean</span>
          </div>
          <div className="h-4 w-full mt-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-indigo-500 stroke-[1.5] fill-none">
              <path d="M 0 5 Q 40 18 80 2 T 100 12" />
            </svg>
          </div>
        </div>

        {/* KPI 6: Messages Processed Today */}
        <div className={cn(
          "p-4 rounded-xl border relative overflow-hidden group hover:scale-[1.01] transition-all",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Ingested Logs</span>
            <Activity size={10} className="text-emerald-500 animate-spin" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-black font-mono text-emerald-400">{totalProcessedMessages.toLocaleString()} M</p>
            <span className="text-[8px] text-emerald-500 font-mono font-black">+142/s</span>
          </div>
          <div className="h-4 w-full mt-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-400 stroke-[1.5] fill-none">
              <path d="M 0 18 L 10 14 L 30 18 L 50 12 L 70 16 L 90 2 L 100 6" />
            </svg>
          </div>
        </div>

      </div>

      {/* 2. DATA PIPELINE VISUALIZATION (ARCHITECTURAL FLOW DIAGRAM) */}
      <div className={cn(
        "p-5 rounded-xl border",
        isDarkMode ? "bg-slate-900/40 border-slate-800/60" : "bg-white border-slate-200"
      )}>
        <div className="flex justify-between items-center mb-4 border-b pb-2 border-slate-250 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <GitFork size={15} className="text-cyan-400" />
            <h2 className="text-xs font-black uppercase tracking-wider font-mono">
              FCAJ v3.0 End-To-End Ingestion Data Routing Architecture Map
            </h2>
          </div>
          <span className="text-[9px] font-mono uppercase bg-cyan-500/10 text-cyan-450 border border-cyan-500/20 px-2 py-0.5 rounded">
            Live Stream View
          </span>
        </div>

        {/* Horizontal scrollable visual flowchart */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex items-center justify-between min-w-300 gap-2 py-2">
            
            {/* Stage 1: Lab */}
            <div className="flex items-center">
              <div className={cn(
                "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
                simulatedFailures.zeek && simulatedFailures.suricata ? "bg-red-950/40 border-red-800 text-red-550" : "bg-slate-800/10 border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-300"
              )}>
                <p className="text-[9px] font-black uppercase">Local Lab</p>
                <div className="h-1 w-full bg-emerald-500 rounded" />
                <p className="text-[8px] opacity-80">100% Rate</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 2: Zeek */}
            <div className="flex items-center">
              <div className={cn(
                "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
                simulatedFailures.zeek ? "bg-red-950/40 border-red-800 text-red-500 animate-pulse" : "bg-emerald-950/10 border-emerald-500/30 text-emerald-400"
              )}>
                <p className="text-[9px] font-black uppercase">Zeek Sensor</p>
                <div className={cn("h-1 w-full rounded", simulatedFailures.zeek ? "bg-red-500" : "bg-emerald-505")} />
                <p className="text-[8px] opacity-80">{simulatedFailures.zeek ? "OFFLINE" : "12ms / 340e"}</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 3: Suricata */}
            <div className="flex items-center">
              <div className={cn(
                "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
                simulatedFailures.suricata ? "bg-red-950/40 border-red-800 text-red-500 animate-pulse" : "bg-emerald-950/10 border-emerald-500/30 text-emerald-400"
              )}>
                <p className="text-[9px] font-black uppercase">Suricata IDS</p>
                <div className={cn("h-1 w-full rounded", simulatedFailures.suricata ? "bg-red-500" : "bg-emerald-500")} />
                <p className="text-[8px] opacity-80">{simulatedFailures.suricata ? "OFFLINE" : "18ms / 12e"}</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 4: Filebeat */}
            <div className="flex items-center">
              <div className={cn(
                "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
                simulatedFailures.zeek && simulatedFailures.suricata ? "bg-red-950/30 border-red-800/40 text-red-400" : "bg-emerald-950/10 border-emerald-500/30 text-emerald-400"
              )}>
                <p className="text-[9px] font-black uppercase">Filebeat</p>
                <div className="h-1 w-full bg-emerald-500 rounded" />
                <p className="text-[8px] opacity-80">98% Flow</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 5: AWS SQS Buffer */}
            <div className="flex items-center">
              <div className={cn(
                "w-28 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
                simulatedFailures.sqsOverflow ? "bg-red-950/50 border-red-500 text-red-500 animate-pulse" : "bg-emerald-950/10 border-emerald-500/30 text-emerald-400"
              )}>
                <p className="text-[9px] font-black uppercase">AWS SQS FIFO</p>
                <div className={cn("h-1 w-full rounded", simulatedFailures.sqsOverflow ? "bg-red-500" : "bg-emerald-500")} />
                <p className="text-[8px] opacity-80">{simulatedFailures.sqsOverflow ? "OVERFLOW" : "45ms | 1120 Q"}</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 6: Feature Router */}
            <div className="flex items-center">
              <div className="w-24 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-800/10 font-mono text-center space-y-1 hover:scale-105 transition-transform">
                <p className="text-[9px] font-black uppercase">Router</p>
                <div className="h-1 w-full bg-cyan-500 rounded" />
                <p className="text-[8px] opacity-80">Active Demux</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 7: AI Engines Composite */}
            <div className="flex items-center">
              <div className={cn(
                "w-36 p-1.5 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
                simulatedFailures.ai1 || simulatedFailures.ai2a || simulatedFailures.ai2b ? "bg-red-950/30 border-red-700 text-red-400" : "bg-indigo-950/10 border-indigo-500/30 text-indigo-400"
              )}>
                <p className="text-[8px] font-black uppercase text-indigo-300">Models (AI1, 2A, 2B)</p>
                <div className="grid grid-cols-3 gap-0.5 text-[7px] font-sans">
                  <span className={cn("rounded px-0.5", simulatedFailures.ai1 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/10 text-emerald-450")}>AI1</span>
                  <span className={cn("rounded px-0.5", simulatedFailures.ai2a ? "bg-red-500/20 text-red-400" : "bg-emerald-500/10 text-emerald-450")}>2A</span>
                  <span className={cn("rounded px-0.5", simulatedFailures.ai2b ? "bg-red-500/20 text-red-400" : "bg-emerald-500/10 text-emerald-450")}>2B</span>
                </div>
                <p className="text-[8px] opacity-80">Avg Inference: 65ms</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 8: Fusion Layer */}
            <div className="flex items-center">
              <div className="w-24 p-2 rounded-lg border border-indigo-505/30 bg-indigo-950/10 font-mono text-center space-y-1 hover:scale-105 transition-transform">
                <p className="text-[9px] font-black uppercase text-indigo-400">Fusion Sys</p>
                <div className="h-1 w-full bg-indigo-505 rounded" />
                <p className="text-[8px] text-indigo-430">MITRE Sync</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 9: PostgreSQL */}
            <div className="flex items-center">
              <div className={cn(
                "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
                simulatedFailures.database ? "bg-red-950/40 border-red-800 text-red-500 animate-pulse" : "bg-emerald-950/10 border-emerald-500/30 text-emerald-400"
              )}>
                <p className="text-[9px] font-black uppercase">Postgres DB</p>
                <div className={cn("h-1 w-full rounded", simulatedFailures.database ? "bg-red-505" : "bg-emerald-500")} />
                <p className="text-[8px] opacity-80">{simulatedFailures.database ? "CORRUPTED" : "8ms / Pools"}</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 10: WebSocket */}
            <div className="flex items-center">
              <div className={cn(
                "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
                simulatedFailures.websocket ? "bg-red-950/40 border-red-800 text-red-500 animate-pulse" : "bg-emerald-950/10 border-emerald-500/30 text-emerald-400"
              )}>
                <p className="text-[9px] font-black uppercase">WebSockets</p>
                <div className={cn("h-1 w-full rounded", simulatedFailures.websocket ? "bg-red-500" : "bg-emerald-500")} />
                <p className="text-[8px] opacity-80">{simulatedFailures.websocket ? "OFFLINE" : "Active"}</p>
              </div>
              <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
            </div>

            {/* Stage 11: Realtime Dashboard Screen */}
            <div className="w-24 p-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-slate-850/10 font-mono text-center space-y-1">
              <p className="text-[9px] font-black uppercase">FC Dashboard</p>
              <div className="h-1 w-full bg-emerald-500 rounded" />
              <p className="text-[8px] opacity-80">Rendered (Static)</p>
            </div>

          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Operations, Right Side Control Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Column 1 & 2: Integration List and Analytics (Left) */}
        <div className="xl:col-span-2 space-y-6">

          {/* 3. INTEGRATION STATUS GRID / 18. DETAILS MODAL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
                Core Integrations Status Grid ({computedIntegrations.length})
              </h3>
              <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">Click any card for full specs & dependencies modal</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {computedIntegrations.map(itm => {
                const colors = 
                  itm.status === "Healthy" ? "border-emerald-500 bg-emerald-500/5 text-emerald-500" :
                  itm.status === "Warning" ? "border-amber-400 bg-amber-500/5 text-amber-500" :
                  "border-red-500 bg-red-500/5 text-red-500";

                return (
                  <div 
                    key={itm.id}
                    onClick={() => setSelectedIntegration(itm)}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col justify-between cursor-pointer hover:border-slate-405 dark:hover:border-slate-700 transition-all shadow-sm active:scale-[0.99]",
                      isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
                    )}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-805 dark:text-slate-100 font-mono uppercase">{itm.name}</p>
                          <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">{itm.category} • {itm.version}</span>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded text-[8.5px] font-black uppercase border tracking-wider", colors)}>
                          {itm.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans uppercase line-clamp-2 mb-3">
                        {itm.description}
                      </p>
                    </div>

                    <div className="border-t pt-2 border-slate-200 dark:border-slate-850/60 grid grid-cols-3 gap-2 font-mono text-[9px]">
                      <div>
                        <span className="text-slate-400 uppercase text-[8px] font-bold block mb-0.5">Last Sync</span>
                        <span className="font-bold uppercase text-slate-655 dark:text-zinc-300">{itm.lastSync}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[8px] font-bold block mb-0.5">Latency</span>
                        <span className={cn(
                          "font-bold",
                          itm.latencyMs > 100 ? "text-red-550" : "text-slate-655 dark:text-zinc-300"
                        )}>{itm.latencyMs}ms</span>
                      </div>
                      <div>
                        <span className="text-slate-405 uppercase text-[8px] font-bold block mb-0.5">Health Score</span>
                        <span className={cn(
                          "font-black font-mono px-1 py-0.5 rounded",
                          itm.healthScore >= 95 ? "bg-emerald-500/10 text-emerald-500" :
                          itm.healthScore >= 60 ? "bg-amber-500/10 text-amber-500" :
                          "bg-red-500/10 text-red-500 animate-pulse"
                        )}>{itm.healthScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. MESSAGE FLOW MONITOR REAL-TIME LINE CHART */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono",
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-slate-250 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">WebSocket Flow Streams Monitoring</h3>
              </div>
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Realtime Ingest Chart (Updates every 3s)</span>
            </div>

            <div className="h-55 w-full text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartHistory}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#888" tickLine={false} />
                  <YAxis stroke="#888" tickLine={false} />
                  <RechartsTooltip contentStyle={{ fontSize: 9, fontFamily: "monospace", borderRadius: 4, backgroundColor: "#020617", borderColor: "#1e293b" }} />
                  <Area type="monotone" name="Inbound Received" dataKey="received" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRec)" strokeWidth={1.5} />
                  <Area type="monotone" name="Successfully Processed" dataKey="processed" stroke="#10b981" fillOpacity={1} fill="url(#colorProc)" strokeWidth={1.5} />
                  <Line type="monotone" name="Failed Frame Drops" dataKey="failed" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" name="Buffer Queued" dataKey="queued" stroke="#f59e0b" strokeWidth={1} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex gap-4 mt-3 pt-2 border-t border-slate-200 dark:border-slate-850 justify-center flex-wrap">
              <div className="flex items-center gap-1.5 text-[9px] uppercase">
                <span className="w-2 h-2 rounded bg-blue-500" />
                <span className="text-slate-400">Received Flows</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase">
                <span className="w-2 h-2 rounded bg-emerald-500" />
                <span className="text-slate-400">Processed Ok</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase">
                <span className="w-2 h-2 rounded bg-red-500" />
                <span className="text-slate-400">Failures</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase">
                <span className="w-2 h-2 rounded bg-amber-500" />
                <span className="text-slate-400">SQS Wait Buffer</span>
              </div>
            </div>
          </div>

          {/* 7. INTERACTIVE DATA ROUTING SCHEMATIC VISUALIZER */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono text-[10px]",
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="mb-4 pb-2 border-b border-slate-250 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders size={13} className="text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">Dynamic Router Logic Schema</h3>
              </div>
              <span className="text-[8px] text-slate-400 uppercase font-black">Hover any input node to trace logic path</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch relative">
              {/* Box 1: Sources */}
              <div className="space-y-3">
                <p className="text-[8px] font-black uppercase text-slate-400">1. Data file Log Ingestion</p>
                
                <div 
                  onMouseEnter={() => setHoveredRoutingNode("conn")}
                  onMouseLeave={() => setHoveredRoutingNode(null)}
                  className={cn(
                    "p-3 rounded-lg border font-mono text-center cursor-help transition-all",
                    hoveredRoutingNode === "conn" ? "bg-blue-500/20 border-blue-500 scale-[1.03]" : "bg-slate-800/10 border-slate-705 dark:border-slate-800"
                  )}
                >
                  <p className="font-black uppercase">conn.log</p>
                  <span className="text-[8px] opacity-80 uppercase block mt-1">Network flows</span>
                </div>

                <div 
                  onMouseEnter={() => setHoveredRoutingNode("http")}
                  onMouseLeave={() => setHoveredRoutingNode(null)}
                  className={cn(
                    "p-3 rounded-lg border font-mono text-center cursor-help transition-all",
                    hoveredRoutingNode === "http" ? "bg-amber-400/20 border-amber-500 scale-[1.03]" : "bg-slate-800/10 border-slate-705 dark:border-slate-800"
                  )}
                >
                  <p className="font-black uppercase">http.log</p>
                  <span className="text-[8px] opacity-80 uppercase block mt-1">Web queries</span>
                </div>
              </div>

              {/* Box 2: Middle processing models (AI) */}
              <div className="flex flex-col justify-around gap-2 bg-slate-800/5 dark:bg-slate-905/30 border border-transparent p-2.5 rounded-xl">
                <div 
                  className={cn(
                    "p-2.5 rounded-lg border text-center transition-all",
                    hoveredRoutingNode === "conn" ? "bg-blue-500/15 border-blue-400" : "bg-slate-800/20 border-slate-355 dark:border-slate-850"
                  )}
                >
                  <p className="font-black uppercase text-[9px] text-cyan-400">AI1 Anomaly</p>
                  <span className="text-[7.5px] opacity-70">UNSUPERVISED PIPELINES</span>
                </div>

                <div 
                  className={cn(
                    "p-2.5 rounded-lg border text-center transition-all",
                    hoveredRoutingNode === "conn" ? "bg-blue-500/15 border-blue-400" : "bg-slate-800/20 border-slate-355 dark:border-slate-850"
                  )}
                >
                  <p className="font-black uppercase text-[9px] text-emerald-400">AI2A Attack Classifier</p>
                  <span className="text-[7.5px] opacity-70">SUPERVISED THREATS</span>
                </div>

                <div 
                  className={cn(
                    "p-2.5 rounded-lg border text-center transition-all",
                    hoveredRoutingNode === "http" ? "bg-amber-500/15 border-amber-400 animate-pulse" : "bg-slate-800/20 border-slate-355 dark:border-slate-850"
                  )}
                >
                  <p className="font-black uppercase text-[9px] text-indigo-400">AI2B Web Attack Classifier</p>
                  <span className="text-[7.5px] opacity-70">URI INJECTION DETECTOR</span>
                </div>
              </div>

              {/* Box 3: Fusion and Alert consolidation output */}
              <div className="flex flex-col justify-center space-y-4">
                <p className="text-[8px] font-black uppercase text-slate-400">2. Fusion Synapse Process</p>
                <div className="p-4 rounded-xl border border-indigo-505/30 bg-indigo-950/15 text-center relative group">
                  <Flame size={18} className="mx-auto text-indigo-405 mb-1.5 animate-pulse" />
                  <p className="font-black uppercase tracking-wider text-[10px] text-indigo-400">Fusion Core Layer</p>
                  <p className="text-[8px] text-slate-400 uppercase mt-1">
                    Combines AI Scores + Suricata alert profiles → Verdicts
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 8. DATA SOURCE INVENTORY TABULAR INDEX */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
              Ingested System Data Sources Inventory List
            </h3>
            
            <div className={cn(
              "rounded-xl border overflow-hidden",
              isDarkMode ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-200"
            )}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[10px] min-w-150">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-950/80 text-[8.5px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-4 py-2.5">Source File Name</th>
                      <th className="px-4 py-2.5">Ingestion Channel Type</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5 text-right">Eps Volume Today</th>
                      <th className="px-4 py-2.5 text-center">Last Telemetry Sync</th>
                      <th className="px-4 py-2.5">Json Payload Specification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                    {dataSources.map(ds => {
                      const st = 
                        ds.status === "Healthy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                        "bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse";

                      return (
                        <tr key={ds.name} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3 font-extrabold text-slate-855 dark:text-slate-200">{ds.name}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 uppercase font-sans text-[9px]">{ds.type}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={cn("px-1.5 py-0.5 rounded uppercase font-black text-[7.5px]", st)}>
                              {ds.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-855 dark:text-slate-100">{ds.recordsToday.toLocaleString()} recs</td>
                          <td className="px-4 py-3 text-center text-slate-400 font-sans text-[9px]">{ds.lastReceived}</td>
                          <td className="px-4 py-3 text-slate-500 select-all truncate max-w-50" title={ds.schema}>{ds.schema}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 9. LATENCY PIPELINE ANALYTICS */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono",
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-250 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-cyan-405" />
                <h3 className="text-xs font-black uppercase tracking-wider">End-To-End Latency Profile Analytics</h3>
              </div>
              <span className="text-[8px] bg-slate-800 px-2 py-0.5 text-slate-400 uppercase font-black rounded font-mono">P99 SLA Target: 500ms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[8px] text-slate-400 block mb-1">AGGREGATE MEAN</span>
                <span className="text-sm font-black text-slate-250 dark:text-slate-100">{computedLatencyStages.avg} ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[8px] text-amber-500 block mb-1">P95 SLA STATUS</span>
                <span className="text-sm font-black text-amber-500">{computedLatencyStages.p95} ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[8px] text-rose-500 block mb-1">P99 CRITICAL BOUND</span>
                <span className="text-sm font-black text-rose-500">{computedLatencyStages.p99} ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-center animate-pulse">
                <span className="text-[8px] text-red-500 block mb-1">MAX HANDSHAKE RECORD</span>
                <span className="text-sm font-black text-red-500">{computedLatencyStages.max} ms</span>
              </div>
            </div>

            <div className="space-y-2 text-[9px]">
              {computedLatencyStages.stages.map(st => {
                const ratio = Math.min(100, Math.max(5, (st.avg / 500) * 100));
                return (
                  <div key={st.name} className="space-y-1">
                    <div className="flex justify-between items-center text-slate-430">
                      <span className="font-black uppercase">{st.name}</span>
                      <span>MEAN: {st.avg}ms • P95: {st.p95}ms • MAX: {st.max}ms</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          st.avg > 300 ? "bg-red-550" : st.avg > 100 ? "bg-amber-400" : "bg-cyan-500"
                        )}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Column 3: Monitor Widgets, SQS metrics, Simulator (Right) */}
        <div className="space-y-6">

          {/* 12. GAUGE PLATFORM HEALTH SCORE */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono text-center flex flex-col items-center justify-center",
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="w-full text-left mb-3 pb-2 border-b border-slate-250 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 text-center">FCAJ v3.0 Overall Platform Health</h3>
            </div>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} 
                  strokeWidth="8" fill="transparent" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke={pipelineHealthScore >= 80 ? "#10b981" : pipelineHealthScore >= 50 ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * pipelineHealthScore) / 100}
                  className="transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-3xl font-black">{pipelineHealthScore}%</span>
                <span className={cn(
                  "text-[8.5px] uppercase tracking-widest font-black mt-1",
                  pipelineHealthScore >= 85 ? "text-emerald-500" : pipelineHealthScore >= 60 ? "text-amber-500 animate-pulse" : "text-red-500 animate-bounce"
                )}>
                  {pipelineHealthScore >= 85 ? "OPTIMAL RATE" : pipelineHealthScore >= 60 ? "WARNING RANGE" : "SEVER COMPROMISED"}
                </span>
              </div>
            </div>
          </div>

          {/* 13. FAILURE SIMULATION CENTER */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono border-red-500/20",
            isDarkMode ? "bg-red-950/10" : "bg-red-50/20"
          )}>
            <div className="flex gap-2 items-center mb-3 text-red-500 pb-2 border-b border-slate-250 dark:border-slate-800">
              <Flame size={14} className="animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider">FCAJ Outage Simulations Cockpit</h3>
            </div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest block mb-4">
              Force hardware disconnections to test threat response routing matrices:
            </p>

            <div className="grid grid-cols-2 gap-2 text-[8.5px] uppercase font-black tracking-widest">
              <button 
                onClick={() => toggleFailure("zeek")}
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
                  simulatedFailures.zeek ? "bg-red-500 text-white border-red-600" : "bg-slate-800/25 border-slate-702 text-slate-400 hover:text-white"
                )}
              >
                <span>Sever Zeek</span>
                <PowerOff size={11} />
              </button>

              <button 
                onClick={() => toggleFailure("suricata")}
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
                  simulatedFailures.suricata ? "bg-red-500 text-white border-red-600" : "bg-slate-800/25 border-slate-702 text-slate-400 hover:text-white"
                )}
              >
                <span>Sever Suricata</span>
                <PowerOff size={11} />
              </button>

              <button 
                onClick={() => toggleFailure("ai1")}
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
                  simulatedFailures.ai1 ? "bg-red-500 text-white border-red-600" : "bg-slate-800/25 border-slate-702 text-slate-400 hover:text-white"
                )}
              >
                <span>Kill AI1 Model</span>
                <PowerOff size={11} />
              </button>

              <button 
                onClick={() => toggleFailure("ai2a")}
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
                  simulatedFailures.ai2a ? "bg-red-500 text-white border-red-600" : "bg-slate-800/25 border-slate-702 text-slate-400 hover:text-white"
                )}
              >
                <span>Kill AI2A Model</span>
                <PowerOff size={11} />
              </button>

              <button 
                onClick={() => toggleFailure("ai2b")}
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
                  simulatedFailures.ai2b ? "bg-red-500 text-white border-red-600" : "bg-slate-800/25 border-slate-702 text-slate-400 hover:text-white"
                )}
              >
                <span>Kill AI2B Web</span>
                <PowerOff size={11} />
              </button>

              <button 
                onClick={() => toggleFailure("websocket")}
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
                  simulatedFailures.websocket ? "bg-red-500 text-white border-red-600" : "bg-slate-800/25 border-slate-702 text-slate-400 hover:text-white"
                )}
              >
                <span>Break Sockets</span>
                <PowerOff size={11} />
              </button>

              <button 
                onClick={() => toggleFailure("sqsOverflow")}
                className={cn(
                  "p-2 rounded-lg border flex items-center justify-between transition-colors cursor-pointer col-span-2",
                  simulatedFailures.sqsOverflow ? "bg-orange-500 text-white border-orange-600 animate-pulse" : "bg-slate-800/25 border-slate-702 text-slate-400 hover:text-white"
                )}
              >
                <span>Simulate AWS SQS Payload Backlog Overflow</span>
                <Activity size={11} className="animate-spin" />
              </button>

              <button 
                onClick={() => toggleFailure("database")}
                className={cn(
                  "p-2 rounded-lg border flex items-center justify-between transition-colors cursor-pointer col-span-2",
                  simulatedFailures.database ? "bg-red-600 text-white border-red-700 animate-pulse" : "bg-slate-800/25 border-slate-702 text-slate-400 hover:text-white"
                )}
              >
                <span>PostgreSQL DB Connection Failure</span>
                <Database size={11} />
              </button>
            </div>
          </div>

          {/* 14. RECOVERY PLAYBOOK WORKFLOW TIMELINE */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono text-[9px]",
            isDarkMode ? "bg-slate-905/30 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex gap-1 items-center pb-2 border-b border-slate-250 dark:border-slate-800 mb-3 justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-cyan-500" />
                <h3 className="text-[10px] font-black uppercase tracking-wider">SOAR Automated Incident Recovery Playbook</h3>
              </div>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">Active</span>
            </div>

            <div className="space-y-4 relative pl-3.5 border-l border-slate-350 dark:border-slate-800">
              
              {/* Failure */}
              <div className="relative">
                <span className={cn(
                  "absolute -left-4.75 top-0.5 w-2.5 h-2.5 rounded-full",
                  isOutageSimulated ? "bg-red-500 animate-ping" : "bg-emerald-500"
                )} />
                <p className="font-extrabold uppercase">1/ System Failure Detection</p>
                <p className="text-slate-405">
                  {isOutageSimulated ? "Outage event captured by central keepalive probes." : "All keepalive signals passing normally."}
                </p>
                <span className="text-[8.5px] text-zinc-500">Milli-Latency: {isOutageSimulated ? "1.2ms triage" : "0ms"}</span>
              </div>

              {/* Alert */}
              <div className="relative">
                <span className={cn(
                  "absolute -left-4.75 top-0.5 w-2.5 h-2.5 rounded-full",
                  isOutageSimulated ? "bg-amber-500 animate-pulse" : "bg-slate-700"
                )} />
                <p className="font-extrabold uppercase">2/ Slack Alert Payload Dispatched</p>
                <p className="text-slate-405">
                  {isOutageSimulated ? "Critical webhook payload sent to enterprise SOC Slack channel." : "System standby state."}
                </p>
              </div>

              {/* Action Recovery Run */}
              <div className="relative">
                <span className={cn(
                  "absolute -left-4.75 top-0.5 w-2.5 h-2.5 rounded-full",
                  isOutageSimulated ? "bg-indigo-505 animate-spin" : "bg-slate-700"
                )} />
                <p className="font-extrabold uppercase">3/ Auto-Healing Container Restarter</p>
                <p className="text-slate-405 text-[8.5px]">
                  {isOutageSimulated ? "Orchestrator restarting severed Docker processes..." : "Health stable. Idle standby."}
                </p>
              </div>

              {/* Back to Healthy */}
              <div className="relative">
                <span className={cn(
                  "absolute -left-4.75 top-0.5 w-2.5 h-2.5 rounded-full",
                  isOutageSimulated ? "bg-slate-700" : "bg-emerald-500"
                )} />
                <p className="font-extrabold uppercase text-emerald-550">4/ Full Service Restored (Healthy)</p>
                <p className="text-slate-405 text-emerald-500">
                  {isOutageSimulated ? "Waiting for simulate clear keys." : "FCAJ pipeline verified at 100% telemetry status."}
                </p>
              </div>
            </div>
          </div>

          {/* 5. AWS SQS BUFFER MONITORING WIDGETS */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono",
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-250 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-1.5">
                <HardDrive size={13} className="text-cyan-405" />
                <h3 className="text-[10px] font-black uppercase tracking-wider">AWS SQS Buffering Monitor (FIFO Queue)</h3>
              </div>
              <span className="text-[8px] tracking-widest text-[#94a3b8] font-bold">Inbound Queuing Channel</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-3 text-[9px]">
              <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
                <p className="text-slate-400 block mb-0.5 uppercase text-[7.5px]">Queue Depth</p>
                <span className={cn(
                  "font-black text-xs block",
                  simulatedFailures.sqsOverflow ? "text-red-500 animate-pulse" : "text-white"
                )}>
                  {simulatedFailures.sqsOverflow ? "8,521" : "1,120"} msgs
                </span>
              </div>
              
              <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
                <p className="text-slate-400 block mb-0.5 uppercase text-[7.5px]">In Flight</p>
                <span className="font-black text-xs text-cyan-400 block">320 msgs</span>
              </div>

              <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
                <p className="text-slate-400 block mb-0.5 uppercase text-[7.5px]">Rate / Sec</p>
                <span className="font-black text-xs text-emerald-400 block">
                  {simulatedFailures.sqsOverflow ? "12 / s" : "248 / s"}
                </span>
              </div>
            </div>

            {/* Micro simple spark charts */}
            <div className="h-22.5 w-full text-[8px] pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sqsHistory}>
                  <Area type="monotone" name="Queue Depth" dataKey="depth" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.06} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6. AI PIPELINE MONITORING METRICS */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono text-[9px]",
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex gap-2 items-center mb-3 pb-2 border-b border-slate-250 dark:border-slate-800">
              <Cpu size={14} className="text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-wider">AI Inference & CPU Monitoring Panel</h3>
            </div>

            <div className="space-y-4">
              {/* AI1 */}
              <div className="space-y-1">
                <div className="flex justify-between font-black uppercase">
                  <span className="text-cyan-400">AI1 Anomaly Model</span>
                  <span>{simulatedFailures.ai1 ? "CRITICAL OUT" : "CPU: 24% | MEM: 1.2GB | Errors: 0%"}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", simulatedFailures.ai1 ? "bg-red-500 w-full animate-pulse" : "bg-cyan-500 w-1/4")} />
                </div>
              </div>

              {/* AI2A */}
              <div className="space-y-1">
                <div className="flex justify-between font-black uppercase">
                  <span className="text-emerald-400">AI2A Attack Engine</span>
                  <span>{simulatedFailures.ai2a ? "CRITICAL OUT" : "CPU: 42% | MEM: 2.1GB | Errors: 0.1%"}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", simulatedFailures.ai2a ? "bg-red-500 w-full animate-pulse" : "bg-emerald-500 w-2/5")} />
                </div>
              </div>

              {/* AI2B */}
              <div className="space-y-1">
                <div className="flex justify-between font-black uppercase">
                  <span className="text-indigo-400">AI2B Web Model</span>
                  <span>{simulatedFailures.ai2b ? "CRITICAL OUT" : "CPU: 18% | MEM: 800MB | Errors: 0%"}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", simulatedFailures.ai2b ? "bg-red-500 w-full animate-pulse" : "bg-indigo-505 w-1/5")} />
                </div>
              </div>
            </div>
          </div>

          {/* 10. DATABASE INTEGRATION PANEL & 11. WEBSOCKET MONITOR */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono text-[9px] space-y-4",
            isDarkMode ? "bg-slate-905/30 border-slate-800" : "bg-white border-slate-205"
          )}>
            {/* DB Panel */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-400 uppercase text-[9px] font-black border-b border-slate-200 dark:border-slate-805 pb-1">
                <div className="flex items-center gap-1 text-slate-850 dark:text-slate-100">
                  <Database size={11} className="text-emerald-405" />
                  <span>PostgreSQL Database RDS Info</span>
                </div>
                <span>Healthy</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400 font-sans">
                <div>Active SQL Connections: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.database ? "0" : "52"}</span></div>
                <div>Storage Space Util: <span className="font-mono text-slate-900 dark:text-white font-black">24.2 GB</span></div>
                <div>Writes Today: <span className="font-mono text-slate-900 dark:text-white font-black">1.1M Recs</span></div>
                <div>Read Queries Speed: <span className="font-mono text-slate-900 dark:text-white font-black">1.2ms</span></div>
              </div>
            </div>

            {/* Socket client Monitor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-400 uppercase text-[9px] font-black border-b border-slate-200 dark:border-slate-805 pb-1">
                <div className="flex items-center gap-1 text-slate-850 dark:text-slate-100">
                  <Radio size={11} className="text-indigo-405" />
                  <span>WebSocket Gateway RFC6455 Monitor</span>
                </div>
                <span>{simulatedFailures.websocket ? "Offline" : "Healthy"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400 font-sans">
                <div>Connected Analysts: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.websocket ? "0" : "14"}</span></div>
                <div>Sent Frames Rate: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.websocket ? "0p/s" : "48p/s"}</span></div>
                <div>Dropped Frame Rate: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.websocket ? "100%" : "0.00%"}</span></div>
                <div>Socket Health Status: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.websocket ? "0%" : "100%"}</span></div>
              </div>
            </div>
          </div>

          {/* 17. SECURITY HARDENING STATUS */}
          <div className={cn(
            "p-5 rounded-xl border relative font-mono text-[9px]",
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex gap-2 items-center mb-3 text-cyan-405 pb-1 border-b border-slate-200 dark:border-slate-805">
              <Lock size={12} className="text-cyan-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-wider">AWS IAM & TLS Tunnel Security Status</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-slate-400 leading-snug">
              <div className="space-y-0.5">
                <p className="font-black text-slate-800 dark:text-slate-300">AWS KMS Key Encryption</p>
                <div className="flex items-center gap-1 text-[8.5px] uppercase font-black text-emerald-500">
                  <Check size={11} /> alias/fcaj-v3-key
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="font-black text-slate-800 dark:text-slate-300">TLS Encryption Stream</p>
                <div className="flex items-center gap-1 text-[8.5px] uppercase font-black text-emerald-500">
                  <Check size={11} /> enforced TLS v1.3 only
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="font-black text-slate-800 dark:text-slate-300">Secret Rotation Plan</p>
                <div className="flex items-center gap-1 text-[8.5px] uppercase font-black text-cyan-455">
                  <Clock size={11} /> every 30 days
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="font-black text-slate-800 dark:text-slate-300">AWS Credentials IAM Check</p>
                <div className="flex items-center gap-1 text-[8.5px] uppercase font-black text-emerald-500">
                  <Check size={11} /> active (verified)
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 16. DETAILED PIPELINES CONFIGURATION CENTER */}
      <div className={cn(
        "p-5 rounded-xl border font-mono text-[10px]",
        isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-250 dark:border-slate-800">
          <Settings size={14} className="text-cyan-405" />
          <h3 className="text-xs font-black uppercase tracking-wider">Configuration Settings Center</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(configs).map((key) => (
            <button 
              key={key}
              onClick={() => setActiveConfigTab(key as keyof typeof configs)}
              className={cn(
                "px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded-md border text-slate-430 cursor-pointer",
                activeConfigTab === key 
                  ? "bg-cyan-500 text-white border-cyan-500" 
                  : "bg-slate-800/20 border-slate-700 hover:text-white"
              )}
            >
              {key} settings
            </button>
          ))}
        </div>

        <textarea 
          value={configs[activeConfigTab]}
          onChange={(e) => setConfigs(prev => ({ ...prev, [activeConfigTab]: e.target.value }))}
          className="w-full h-32 p-3 font-mono text-[10.5px] leading-relaxed bg-slate-950 text-emerald-450 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-450 custom-scrollbar select-text"
          placeholder="Type virtual integration payload logic format here..."
        />
        <div className="flex justify-between items-center mt-2 text-[8px] text-zinc-500">
          <span className="uppercase">Click auto-heal to restore default states if schema breaks.</span>
          <span className="uppercase text-emerald-500">Auto-validating active payload schema syntax... Verified.</span>
        </div>
      </div>

      {/* 15. COMPACT AUDIT LOGS DISPLAY ROW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
            System Central Audit Logs Timeline & Telemetry Alerts
          </h3>
          <span className="text-[8px] uppercase tracking-widest text-slate-400">Ingested by phutd0212</span>
        </div>

        <div className={cn(
          "rounded-xl border overflow-hidden p-2",
          isDarkMode ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-205"
        )}>
          <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar font-mono text-[9px]">
            {auditLogs.map((log, index) => {
              const categoryBadge = 
                log.status === "Success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                log.status === "Failure" ? "bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse" :
                "bg-blue-500/10 text-blue-400 border border-blue-500/30";

              return (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 hover:bg-slate-800/10 rounded transition-colors border border-transparent hover:border-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={cn("px-1 rounded font-black text-[8px] uppercase shrink-0", categoryBadge)}>{log.status}</span>
                    <span className="text-cyan-400 font-black uppercase shrink-0">[{log.component}]</span>
                    <span className="text-slate-300 font-semibold">{log.action}</span>
                  </div>
                  <span className="text-slate-500 font-sans text-[8.5px] italic self-end sm:self-auto uppercase">{log.user} (admin)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 18. INTEGRATION DETAILS MODAL PORTAL */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={cn(
            "w-full max-w-xl p-5 rounded-2xl border font-mono text-[10px] space-y-4 shadow-2xl relative",
            isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-300 text-slate-900"
          )}>
            {/* Close button */}
            <button 
              onClick={() => setSelectedIntegration(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="border-b pb-3 border-slate-800 space-y-1">
              <span className="text-[8.5px] uppercase tracking-widest text-[#94a3b8] font-bold">{selectedIntegration.category}</span>
              <h2 className="text-sm font-black uppercase tracking-wider text-cyan-405">{selectedIntegration.name}</h2>
              <p className="text-[8.5px] text-slate-500">Compliance Code Integration Target: {selectedIntegration.version}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-[9px] uppercase font-bold text-slate-400">Technical Specs Mapping</h3>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-3 rounded-lg border border-slate-805">
                {Object.entries(selectedIntegration.specs).map(([k, v]) => (
                  <div key={k} className="space-y-0.5">
                    <span className="text-[8px] text-zinc-500 uppercase block">{k}</span>
                    <span className="font-extrabold uppercase text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[9px] uppercase font-bold text-slate-405">Current Telemetry Metrics</h3>
              <div className="grid grid-cols-3 gap-2">
                {selectedIntegration.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-center">
                    <span className="text-[8px] text-slate-400 block mb-1 uppercase tracking-tight leading-none">{m.label}</span>
                    <span className="font-mono text-zinc-200 font-extrabold text-xs block">{m.value}</span>
                    <span className="text-[7.5px] text-emerald-500 block uppercase mt-1">{m.trend}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[9px] uppercase font-bold text-slate-405">Pipeline Dependencies</h3>
              <div className="flex gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase text-[8.5px]">Local Lab Network Tap</span>
                <span className="p-0.5 text-zinc-500 font-bold">→</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-505/20 uppercase text-[8.5px]">{selectedIntegration.id} parser</span>
                <span className="p-0.5 text-zinc-500 font-bold">→</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase text-[8.5px]">AWS SQS stream</span>
              </div>
            </div>

            <div className="border-t pt-3 border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedIntegration(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white uppercase text-[9px] font-bold rounded-lg cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
