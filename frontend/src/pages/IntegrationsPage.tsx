import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "../lib/utils";

// Subcomponents
import { HeaderSection } from "../components/integrations/HeaderSection";
import { KPICardsSection } from "../components/integrations/KPICardsSection";
import { PipelineFlowchart } from "../components/integrations/PipelineFlowchart";
import { IntegrationGridSection } from "../components/integrations/IntegrationGridSection";
import { MessageFlowMonitoring } from "../components/integrations/MessageFlowMonitoring";
import { DynamicRouterLogic } from "../components/integrations/DynamicRouterLogic";
import { DataSourceInventory } from "../components/integrations/DataSourceInventory";
import { LatencyAnalytics } from "../components/integrations/LatencyAnalytics";
import { PlatformHealthScore } from "../components/integrations/PlatformHealthScore";
import { FailureSimulationCockpit } from "../components/integrations/FailureSimulationCockpit";
import { RecoveryPlaybookTimeline } from "../components/integrations/RecoveryPlaybookTimeline";
import { SqsBufferMonitoring } from "../components/integrations/SqsBufferMonitoring";
import { AiInferenceMonitoring } from "../components/integrations/AiInferenceMonitoring";
import { DbAndSocketMonitor } from "../components/integrations/DbAndSocketMonitor";
import { SecurityHardeningStatus } from "../components/integrations/SecurityHardeningStatus";
import { ConfigurationCenter } from "../components/integrations/ConfigurationCenter";
import { AuditLogsDisplay } from "../components/integrations/AuditLogsDisplay";
import { IntegrationDetailsModal } from "../components/integrations/IntegrationDetailsModal";

// Initial Mock Data and Interfaces
import { 
  initialIntegrationsList, 
  initialDataSources, 
  initialAuditLogs, 
  FCAJIntegrationItem, 
  DataSourceItem, 
  AuditLogItem 
} from "../components/integrations/integrationFCAJData";

interface IntegrationsPageProps {
  isDarkMode?: boolean;
  key?: string | number;
}

export function IntegrationsPage({ isDarkMode = true }: IntegrationsPageProps) {
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
  const [integrationsList] = useState<FCAJIntegrationItem[]>(initialIntegrationsList);
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
    return Array.from({ length: 15 }, (_, i) => {
      const d = new Date();
      d.setSeconds(d.getSeconds() - (14 - i) * 3);
      return {
        label: d.toTimeString().split(' ')[0],
        received: 420 + Math.floor(Math.random() * 150),
        processed: 418 + Math.floor(Math.random() * 150),
        failed: Math.floor(Math.random() * 5),
        queued: 10 + Math.floor(Math.random() * 15),
        dropped: 0
      };
    });
  });

  // Configuration State Center (Requirement 16)
  const [configs, setConfigs] = useState<Record<string, string>>({
    zeek: `{\n  "mirror_ip": "10.100.1.5",\n  "syslog_forward": "10.100.1.100:514",\n  "log_types": ["conn.log", "http.log", "dns.log"],\n  "max_batch_size": 250\n}`,
    suricata: `{\n  "interface": "eth0",\n  "rules_path": "/var/lib/suricata/rules/fcaj.rules",\n  "detection_engine": "hyperscan",\n  "eve_json": {\n    "enabled": true,\n    "types": ["alert", "http", "tls"]\n  }\n}`,
    sqs: `{\n  "queue_url": "https://sqs.ap-southeast-1.amazonaws.com/4751/fcaj-v3-buffer-queue.fifo",\n  "encryption_kms_key_id": "alias/fcaj-v3-key",\n  "batch_size": 10,\n  "visibility_timeout_seconds": 30\n}`,
    ai: `{\n  "ai1_unsupervised_anomaly_score_threshold": 82.5,\n  "ai2a_attack_models": ["port_scan", "brute_force", "dos"],\n  "ai2b_web_rules": ["xss", "sqli", "lfi"],\n  "quantization_precision": "INT8"\n}`,
    fusion: `{\n  " sliding_match_seconds": 30,\n  "deduplication": true,\n  "alert_escalation_score_threshold": 75,\n  "mitre_mappings": "T1190, T1059"\n}`,
    database: `{\n  "host": "fcaj-pgsql.rds.amazonaws.com",\n  "port": 5432,\n  "database": "fcaj_siem_core",\n  "pool_size": 30,\n  "idle_timeout_seconds": 15\n}`,
    websocket: `{\n  "listener_port": 3000,\n  "compress_frames": true,\n  "jwt_security_auth": true,\n  "heartbeat_interval_ms": 30000\n}`
  });

  const [activeConfigTab, setActiveConfigTab] = useState<string>("zeek");

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

        const timeStr = new Date().toTimeString().split(' ')[0];
        next.push({
          label: timeStr,
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

  // Handler for custom configuration settings center updates
  const handleConfigChange = useCallback((key: string, value: string) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6 select-none min-h-screen p-5 rounded-2xl border border-border/80 bg-background text-foreground transition-colors duration-300 font-sans">
      
      {/* HEADER CONTROL AREA (DARK/LIGHT SWAP INCLUDED) */}
      <HeaderSection 
        isDarkMode={isDarkMode} 
        systemTime={systemTime} 
        onAutoHeal={handleAutoHeal} 
      />

      {/* 1. INTEGRATION OVERVIEW TOP KPI CARDS */}
      <KPICardsSection 
        isDarkMode={isDarkMode} 
        topMetrics={topMetrics} 
        totalProcessedMessages={totalProcessedMessages} 
      />

      {/* 2. DATA PIPELINE VISUALIZATION (ARCHITECTURAL FLOW DIAGRAM) */}
      <PipelineFlowchart 
        simulatedFailures={simulatedFailures} 
        isDarkMode={isDarkMode} 
      />

      {/* Main Grid: Left Side Operations, Right Side Control Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Column 1 & 2: Integration Grid, Charts, Visualizers (Left) */}
        <div className="xl:col-span-2 space-y-6">

          {/* 3. INTEGRATION STATUS GRID / 18. DETAILS MODAL */}
          <IntegrationGridSection 
            computedIntegrations={computedIntegrations} 
            isDarkMode={isDarkMode} 
            onSelect={setSelectedIntegration} 
          />

          {/* 4. MESSAGE FLOW MONITOR REAL-TIME LINE CHART */}
          <MessageFlowMonitoring 
            chartHistory={chartHistory} 
            isDarkMode={isDarkMode} 
          />

          {/* 7. INTERACTIVE DATA ROUTING SCHEMATIC VISUALIZER */}
          <DynamicRouterLogic 
            isDarkMode={isDarkMode} 
            hoveredRoutingNode={hoveredRoutingNode} 
            onHoverNode={setHoveredRoutingNode} 
          />

          {/* 8. DATA SOURCE INVENTORY TABULAR INDEX */}
          <DataSourceInventory 
            dataSources={dataSources} 
            isDarkMode={isDarkMode} 
          />

          {/* 9. LATENCY PIPELINE ANALYTICS */}
          <LatencyAnalytics 
            isDarkMode={isDarkMode} 
            computedLatencyStages={computedLatencyStages} 
          />

        </div>

        {/* Column 3: Monitor Widgets, SQS metrics, Simulator (Right) */}
        <div className="space-y-6">

          {/* 12. GAUGE PLATFORM HEALTH SCORE */}
          <PlatformHealthScore 
            isDarkMode={isDarkMode} 
            pipelineHealthScore={pipelineHealthScore} 
          />

          {/* 13. FAILURE SIMULATION CENTER */}
          <FailureSimulationCockpit 
            isDarkMode={isDarkMode} 
            simulatedFailures={simulatedFailures} 
            onToggleFailure={toggleFailure} 
          />

          {/* 14. RECOVERY PLAYBOOK WORKFLOW TIMELINE */}
          <RecoveryPlaybookTimeline 
            isDarkMode={isDarkMode} 
            isOutageSimulated={isOutageSimulated} 
          />

          {/* 5. AWS SQS BUFFER MONITORING WIDGETS */}
          <SqsBufferMonitoring 
            isDarkMode={isDarkMode} 
            simulatedFailures={simulatedFailures} 
            sqsHistory={sqsHistory} 
          />

          {/* 6. AI PIPELINE MONITORING METRICS */}
          <AiInferenceMonitoring 
            isDarkMode={isDarkMode} 
            simulatedFailures={simulatedFailures} 
          />

          {/* 10. DATABASE INTEGRATION PANEL & 11. WEBSOCKET MONITOR */}
          <DbAndSocketMonitor 
            isDarkMode={isDarkMode} 
            simulatedFailures={simulatedFailures} 
          />

          {/* 17. SECURITY HARDENING STATUS */}
          <SecurityHardeningStatus 
            isDarkMode={isDarkMode} 
          />

        </div>

      </div>

      {/* 16. DETAILED PIPELINES CONFIGURATION CENTER */}
      <ConfigurationCenter 
        isDarkMode={isDarkMode} 
        configs={configs} 
        activeConfigTab={activeConfigTab} 
        setActiveConfigTab={setActiveConfigTab} 
        onConfigChange={handleConfigChange} 
      />

      {/* 15. CENTRAL AUDIT LOG TIMELINE PANEL */}
      <AuditLogsDisplay 
        isDarkMode={isDarkMode} 
        auditLogs={auditLogs} 
      />

      {/* 18. INTEGRATION DETAILS MODAL PORTAL */}
      <IntegrationDetailsModal 
        isDarkMode={isDarkMode} 
        selectedIntegration={selectedIntegration} 
        onClose={() => setSelectedIntegration(null)} 
      />

    </div>
  );
}
