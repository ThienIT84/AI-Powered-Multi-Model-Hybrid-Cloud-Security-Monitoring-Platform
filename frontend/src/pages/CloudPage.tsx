import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cloud, 
  Activity, 
  Database, 
  HardDrive, 
  Cpu, 
  Layers, 
  Radio, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Terminal, 
  DollarSign, 
  TrendingUp, 
  Play, 
  Pause, 
  ShieldAlert, 
  RefreshCw, 
  ToggleLeft, 
  Sliders, 
  Eye, 
  Lock, 
  Server,
  Zap, 
  ChevronRight,
  HelpCircle,
  TrendingDown
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";

// Interfaces for custom structures
interface TelemetryLog {
  id: string;
  timestamp: string;
  service: string;
  level: "INFO" | "WARN" | "ERROR" | "CRITICAL";
  message: string;
}

interface PipelineNode {
  id: string;
  name: string;
  icon: any;
  status: "healthy" | "warning" | "critical";
  latency: string;
  throughput: string;
  errorRate: string;
  heartbeat: string;
  role: string;
  details: Record<string, string>;
}

export const CloudPage: React.FC = () => {
  // Live Tick State for UI Fluctuation
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<"normal" | "fast" | "hyper">("normal");
  const [selectedNode, setSelectedNode] = useState<string | null>("s3");
  
  // Custom interactive trigger states that skew data for live presentation
  const [sqsDelayTriggered, setSqsDelayTriggered] = useState(false);
  const [aiOverloadTriggered, setAiOverloadTriggered] = useState(false);
  const [s3FailureTriggered, setS3FailureTriggered] = useState(false);
  const [attackSpikeTriggered, setAttackSpikeTriggered] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  // In-memory scrolling security log stream
  const [logs, setLogs] = useState<TelemetryLog[]>([
    { id: "1", timestamp: "07:35:10", service: "ZEEK", level: "INFO", message: "Parsed 480 connections on conn.log" },
    { id: "2", timestamp: "07:35:12", service: "FILEBEAT", level: "INFO", message: "Successfully shipped 1,204 batch payloads to S3" },
    { id: "3", timestamp: "07:35:15", service: "S3", level: "INFO", message: "Archive multipart upload completed for bucket us-east-1-zeek-raw" },
    { id: "4", timestamp: "07:35:18", service: "SQS", level: "INFO", message: "Batch message dequeue. Batch size: 10 messages. Backlog: 0" },
    { id: "5", timestamp: "07:35:21", service: "AI_ENGINE", level: "INFO", message: "ONNX Runtime model inputs balanced for AI1, AI2A, AI2B" },
    { id: "6", timestamp: "07:35:24", service: "FUSION", level: "INFO", message: "Aggregated 15 alerts into alert ID: FUS-9214" },
    { id: "7", timestamp: "07:35:28", service: "RDS", level: "INFO", message: "PostgreSQL buffer write: 4 incident records successfully inserted" },
    { id: "8", timestamp: "07:35:31", service: "WEBSOCKET", level: "INFO", message: "Broadcasted 1 active alert payload to 3 active SOC clients" },
  ]);

  // Dynamic Chart Chronology data generator
  const [chartData, setChartData] = useState<any[]>([]);

  // Timer interval for real-time tick-based update
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = simulationSpeed === "normal" ? 2000 : simulationSpeed === "fast" ? 1000 : 400;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed]);

  // Synchronous log stream appending & metric recalculating on tick
  useEffect(() => {
    if (tick === 0) {
      // Build initial 7 historical data points
      const initial = Array.from({ length: 15 }).map((_, i) => generateTelemetryPoint(i, false, false, false, false));
      setChartData(initial);
      return;
    }

    // Append new chart data point
    setChartData(prev => {
      const copy = [...prev];
      if (copy.length >= 20) copy.shift();
      copy.push(generateTelemetryPoint(tick, sqsDelayTriggered, aiOverloadTriggered, s3FailureTriggered, attackSpikeTriggered));
      return copy;
    });

    // Append log event
    const services = ["ZEEK", "FILEBEAT", "S3", "SQS", "AI_ENGINE", "FUSION", "RDS", "WEBSOCKET"];
    const chosenService = services[Math.floor(Math.random() * services.length)];
    
    let level: TelemetryLog["level"] = "INFO";
    let message = "Telemetry stream pulse OK";

    // Warp behavior on interactive triggers
    if (s3FailureTriggered && Math.random() > 0.4) {
      level = "CRITICAL";
      message = "S3 Ingestion Failure: log parser error writing to us-east-1-zeek-raw due to malformed header format";
    } else if (sqsDelayTriggered && Math.random() > 0.4) {
      level = "WARN";
      message = "SQS Queue Delay Spike: message backlog elevated. Consumer lag detected in FastAPI consumer instance";
    } else if (aiOverloadTriggered && Math.random() > 0.4) {
      level = "WARN";
      message = "AI Engine Overload: Inference batch processing queue bottleneck in model ONNX_AI2B";
    } else if (attackSpikeTriggered && Math.random() > 0.5) {
      level = "WARN";
      message = "Attack Traffic Anomaly Spike: Ingested high volumes of DDoS activity. EC2 scaling thresholds checked";
    } else {
      // Normal logs
      const randVal = Math.random();
      if (randVal > 0.92) {
        level = "WARN";
        message = `FastAPI consumer thread utilization high (${(82 + Math.random() * 15).toFixed(1)}%)`;
      } else if (randVal > 0.85) {
        level = "INFO";
        message = `Inference query completed on model AI1 in ${(8 + Math.random() * 4).toFixed(1)}ms`;
      } else {
        const throughputVal = (1500 + Math.sin(tick) * 200).toFixed(0);
        message = `Logs parser ingest rate nominal: ${throughputVal} conn/s | ${chosenService} stream healthy`;
      }
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog: TelemetryLog = {
      id: String(Date.now()),
      timestamp: timeStr,
      service: chosenService,
      level,
      message,
    };

    setLogs(prev => {
      const copy = [newLog, ...prev];
      if (copy.length > 50) copy.pop();
      return copy;
    });

  }, [tick]);

  // Helper to generate chart telemetry values
  function generateTelemetryPoint(i: number, sqs: boolean, ai: boolean, s3: boolean, attack: boolean) {
    const baseLatency = 45; // ms
    const s3ErrorSkew = s3 ? 40 : 0;
    const sqsDelaySkew = sqs ? 150 : 0;
    const aiOverloadSkew = ai ? 280 : 0;
    const attackSkew = attack ? 90 : 0;

    const finalLatency = baseLatency + sqsDelaySkew + aiOverloadSkew + s3ErrorSkew + attackSkew + Math.sin(i * 0.8) * 15;
    
    // Ingestion rates
    const baseIngest = 1624;
    const attackIngestVal = attack ? 3850 : 0;
    const s3IngestVal = s3 ? -1200 : 0;
    const finalIngest = Math.max(200, baseIngest + attackIngestVal + s3IngestVal + Math.cos(i * 1.1) * 80);

    // AI latency breakdown
    const ai1 = 8 + (ai ? 35 : 0) + Math.sin(i) * 1.5;
    const ai2a = 15 + (ai ? 85 : 0) + Math.cos(i) * 2.5;
    const ai2b = 22 + (ai ? 160 : 0) + Math.sin(i * 1.5) * 3;

    // SQS queue backlog
    const baseBacklog = 2;
    const sqsBacklogSpike = sqs ? 280 : 0;
    const backlog = Math.max(0, baseBacklog + sqsBacklogSpike + Math.floor(Math.sin(i) * 1.8));

    // Daily simulated Finops Cost (pro-rated in cents per tick)
    const baseCost = 4.2;
    const attackCostSkew = attack ? 9.8 : 0;
    const cost = baseCost + attackCostSkew + Math.random() * 0.3;

    return {
      name: `T-${20 - i}`,
      latency: parseFloat(finalLatency.toFixed(1)),
      ingest: Math.floor(finalIngest),
      ai1: parseFloat(ai1.toFixed(1)),
      ai2a: parseFloat(ai2a.toFixed(1)),
      ai2b: parseFloat(ai2b.toFixed(1)),
      backlog: backlog,
      cost: parseFloat(cost.toFixed(2)),
      failureRate: s3 ? 42.5 : sqs ? 8.2 : ai ? 12.8 : 0.02 + Math.random() * 0.1
    };
  }

  // Calculated SOC Core metrics
  const logsInflight = chartData[chartData.length - 1]?.ingest || 1624;
  const inFlightMessages = sqsDelayTriggered ? 2850 : 4;
  const delayedMessages = sqsDelayTriggered ? 824 : 0;
  const batchEfficiency = sqsDelayTriggered ? "50 msg (Max)" : "10 msg";
  const pipelineLag = sqsDelayTriggered ? "4200ms (Delayed)" : "42ms (Nominal)";

  const aiTotalUtilization = aiOverloadTriggered ? 98.4 : 36.2;
  const onnxInferenceThroughput = aiOverloadTriggered ? 450 : 1620;

  const rawLogsStored = s3FailureTriggered ? "14.28 TB" : "14.32 TB";
  const rdsAlertsCount = 82405 + (tick * 4);
  const rdsDailyGrowth = s3FailureTriggered ? "0.2 GB/day" : "4.8 GB/day";

  const cloudRiskScore = s3FailureTriggered ? 89 : sqsDelayTriggered ? 58 : aiOverloadTriggered ? 45 : 12;

  // AWS Availability breakdown
  const awsUptime = s3FailureTriggered ? 99.42 : 100.00;
  const pipelineUptime = s3FailureTriggered ? 78.4 : sqsDelayTriggered ? 92.1 : 100.00;
  const websocketUptime = 100.00;

  // Pipeline Flow Architecture configuration mapping
  const pipelineNodes: PipelineNode[] = [
    {
      id: "zeek",
      name: "Zeek Sensors",
      icon: Radio,
      status: s3FailureTriggered ? "critical" : "healthy",
      latency: "0.2ms",
      throughput: `${logsInflight} ev/s`,
      errorRate: s3FailureTriggered ? "34.2%" : "0.00%",
      heartbeat: "Active",
      role: "Log Collector Engine",
      details: {
        "Sensor Fleet": "14 Active Nodes",
        "Capture Format": "Raw Layer 7 Parsing",
        "BFF Ingestion Link": "FastAPI Streamer",
        "Packet Loss Stream": "0.001%"
      }
    },
    {
      id: "filebeat",
      name: "Filebeat Agents",
      icon: Layers,
      status: s3FailureTriggered ? "critical" : "healthy",
      latency: "1.1ms",
      throughput: `${Math.max(10, logsInflight - 4)} ev/s`,
      errorRate: s3FailureTriggered ? "12.4%" : "0.00%",
      heartbeat: "Active",
      role: "Log Shipping Shipper",
      details: {
        "Container Deployment": "DeamonSet",
        "Registry Ships": "S3 Raw Logs Destination",
        "Batch Shipping Size": "2,048 events",
        "Compression": "gzip (Level 6)"
      }
    },
    {
      id: "s3",
      name: "S3 Logs Bucket",
      icon: HardDrive,
      status: s3FailureTriggered ? "critical" : "healthy",
      latency: s3FailureTriggered ? "154ms" : "2.4ms",
      throughput: s3FailureTriggered ? "2 MB/s" : "24 MB/s",
      errorRate: s3FailureTriggered ? "98.5%" : "0.00%",
      heartbeat: s3FailureTriggered ? "Stale" : "Active",
      role: "Raw Log Cold Buffer",
      details: {
        "Bucket Name": "aws-s3-zeek-raw-lake",
        "Objects Count": "4,821,902 objects",
        "Storage Class": "S3 Standard",
        "Lifecycle Policy": "Transition to Glacier: 14 days",
        "Size Count": rawLogsStored
      }
    },
    {
      id: "sqs",
      name: "SQS Threat Queue",
      icon: Activity,
      status: sqsDelayTriggered ? "warning" : "healthy",
      latency: sqsDelayTriggered ? "2.4s" : "0.8ms",
      throughput: sqsDelayTriggered ? "12 msg/s" : "180 msg/s",
      errorRate: "0.00%",
      heartbeat: "Active",
      role: "Message Batch Queue Base",
      details: {
        "Queue Type": "Amazon SQS FIFO Queue",
        "Visibility Timeout": "30 Seconds",
        "Dead Letter Queue": "aws-sqs-dlq-zeek",
        "Batch Size Target": batchEfficiency,
        "Current Queue Depth": String(inFlightMessages)
      }
    },
    {
      id: "ai_eng",
      name: "ONNX AI Engines",
      icon: Cpu,
      status: aiOverloadTriggered ? "warning" : "healthy",
      latency: aiOverloadTriggered ? "420ms" : "4.2ms",
      throughput: `${onnxInferenceThroughput} query/s`,
      errorRate: aiOverloadTriggered ? "14.2%" : "0.01%",
      heartbeat: "Active",
      role: "AI Model Runtime Executor",
      details: {
        "Models Mounted": "AI1 (DeepConn), AI2A (HTTPAnomaly), AI2B (DGA)",
        "ONNX Runtime Execution": "GPU DirectML Threading",
        "v3.0 Release": "Production Release v3.0.4",
        "Thread Allotments": "48 Execution Contexts",
        "CPU Load Capacity": `${aiTotalUtilization}%`
      }
    },
    {
      id: "fusion",
      name: "Fusion Layer",
      icon: ShieldAlert,
      status: aiOverloadTriggered ? "warning" : "healthy",
      latency: "0.5ms",
      throughput: "14 incident/s",
      errorRate: "0.00%",
      heartbeat: "Active",
      role: "Alert Correlation Aggregator",
      details: {
        "FCAJ Correlation Ruleset": "v3.0.12 Compliance",
        "Deduplication Engine": "IP-Time Heuristic Mode",
        "Time Slice Windows": "15 Seconds Sliding",
        "Aggregate FP Reduction": "87.4% Efficiency"
      }
    },
    {
      id: "db",
      name: "RDS (Postgres)",
      icon: Database,
      status: "healthy",
      latency: "0.9ms",
      throughput: "42 IOPS",
      errorRate: "0.00%",
      heartbeat: "Active",
      role: "Durable Postgres Storage Host",
      details: {
        "Engine Instance": "db.m6i.xlarge (Multi-AZ)",
        "Conns Active": "14 Active Threads",
        "Alert DB Capacity": `${(8.4 + tick * 0.001).toFixed(3)} GB`,
        "Alert Table Count": `${rdsAlertsCount} alerts`
      }
    },
    {
      id: "websocket",
      name: "WebSocket Gateway",
      icon: Server,
      status: "healthy",
      latency: "4.8ms",
      throughput: "3 clients",
      errorRate: "0.00%",
      heartbeat: "Active",
      role: "Live Relay Socket Node",
      details: {
        "Adapter Stack": "FastAPI uvicorn webserver",
        "Relayed Feed Size": "4 kb JSON packets",
        "Client Subscriptions": "SOC Operator Console",
        "Heartbeat Cadence": "30 Seconds Echo ping"
      }
    },
    {
      id: "dash",
      name: "SOC Dashboard",
      icon: Cloud,
      status: "healthy",
      latency: "5.1ms",
      throughput: "UI Live",
      errorRate: "0.00%",
      heartbeat: "Active",
      role: "Client-side Command View",
      details: {
        "UI Version": "React v19.0.1",
        "Telemetry Model Sync": "WebSocket Channel Linked",
        "Refresh Pipeline": "Immediate render engine"
      }
    }
  ];

  // Active selected node configuration details reader
  const currentNode = pipelineNodes.find(n => n.id === selectedNode) || pipelineNodes[2];

  // Cloud Incident Alert Feed - dynamic simulation matching interactive trigger
  const incidentsList = [
    {
      id: "INC-9502",
      timestamp: "07:35:14",
      service: "S3",
      alert: "S3 Ingestion Failure",
      severity: "CRITICAL",
      impact: "Log parser failure writing to archive; incoming raw log stream is bottlenecked.",
      status: s3FailureTriggered ? "ACTIVE" : "RESOLVED",
      resolution: "Investigate log parser regex mapping configuration immediately."
    },
    {
      id: "INC-8421",
      timestamp: "07:34:42",
      service: "SQS",
      alert: "SQS Queue Delay Spike",
      severity: "HIGH",
      impact: "Large queues backlogged in pipeline. Delayed threat alerts in Active SOC board.",
      status: sqsDelayTriggered ? "ACTIVE" : "RESOLVED",
      resolution: "FastAPI consumer scale task launched automatically by Auto Scaling Group."
    },
    {
      id: "INC-7155",
      timestamp: "07:32:05",
      service: "AI_ENGINE",
      alert: "AI Engine Overload",
      severity: "MEDIUM",
      impact: "Inference queue latency exceeds thresholds. Deep DGA analysis model is delayed.",
      status: aiOverloadTriggered ? "ACTIVE" : "RESOLVED",
      resolution: "Unassigned low-priority prediction payloads fallback to local regex matcher."
    },
    {
      id: "INC-6042",
      timestamp: "07:30:12",
      service: "RDS",
      alert: "RDS Connection Saturation",
      severity: "HIGH",
      impact: "Database thread pools saturated, delayed transaction commits for mitigation rules.",
      status: "RESOLVED",
      resolution: "Garbage collection thread re-allocated DB connectors gracefully."
    },
    {
      id: "INC-5120",
      timestamp: "07:28:19",
      service: "ZEEK",
      alert: "Zeek Sensor Drop Detected",
      severity: "MEDIUM",
      impact: "VPC Subnet B Mirroring failed. Security analytics missing 12% server egress logs.",
      status: "RESOLVED",
      resolution: "AWS Route 53 health probe successfully failed over to backup mirror subnet."
    }
  ];

  // Alert Correlation Matrix Map
  const correlationMap = [
    { trigger: "SQS Queue Delay Spike", target: "Delayed Threat Detection", code: "COR-01", status: sqsDelayTriggered ? "Impact Elevated" : "Protected", level: "HIGH" },
    { trigger: "AI Engine Overload Alert", target: "Increased False Negative Risk", code: "COR-02", status: aiOverloadTriggered ? "Impact Elevated" : "Protected", level: "CRITICAL" },
    { trigger: "S3 Collector Ingestion Fail", target: "Telemetry Blackout (Blind Spots)", code: "COR-03", status: s3FailureTriggered ? "Critically Impacted" : "Protected", level: "CRITICAL" },
    { trigger: "RDS Postgres Slow Commit", target: "Delayed Incident Creation", code: "COR-04", status: "Protected", level: "MEDIUM" }
  ];

  // FinOps Resource Distribution mock data
  const finopsCosts = [
    { service: "EC2 (AI Engine Hosts)", percent: 54, cost: attackSpikeTriggered ? "$194.20/day" : "$94.50/day" },
    { service: "S3 Standard", percent: 22, cost: "$38.20/day" },
    { service: "RDS PostgreSQL db.m6i", percent: 18, cost: "$31.40/day" },
    { service: "SQS & Network Requests", percent: 6, cost: attackSpikeTriggered ? "$24.90/day" : "$11.20/day" },
  ];

  // Deployment Status
  const deploymentEnvironments = [
    { name: "Local Lab (Zeek + Suricata)", uptime: "99.98%", dataRate: "420 ev/s", model: "v3.0-lab", lastDeploy: "2026-06-05", status: "Healthy" },
    { name: "Staging (AWS Simulation)", uptime: "99.95%", dataRate: "1,240 ev/s", model: "v3.0.4-rc2", lastDeploy: "2026-06-07", status: "Healthy" },
    { name: "Production (SOC Deployment)", uptime: "99.99%", dataRate: `${logsInflight} ev/s`, model: "v3.0.4-stable", lastDeploy: "2026-06-08 (Current)", status: s3FailureTriggered ? "Degraded" : "Healthy" }
  ];

  // Reset interactive triggers to healthy state
  const resetSimulation = () => {
    setIsWiping(true);
    setTimeout(() => {
      setSqsDelayTriggered(false);
      setAiOverloadTriggered(false);
      setS3FailureTriggered(false);
      setAttackSpikeTriggered(false);
      setIsWiping(false);
    }, 800);
  };

  return (
    <div className="space-y-6 text-foreground select-none" id="cloud-ops-center">
      {/* HEADER SECTION WITH SIMULATION CONTROLS */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-border/20 pb-4 gap-4" id="cloud-header-section">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 rounded border border-cyan-500/30">
              <Cloud className="w-5 h-5 text-cyan-500" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-foreground">
              CLOUD CONTROL CENTER
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            AWS Ingestion Pipeline Telemetry & ONNX Deep AI Threat Processing Operations
          </p>
        </div>

        {/* CONTROLS TRAY */}
        <div className="flex flex-wrap items-center gap-3 bg-secondary/20 p-2 border border-border/30 rounded-xl" id="cloud-controls-tray">
          <div className="flex items-center gap-1.5 border-r border-border/30 pr-3 mr-1">
            <span className="text-[9px] font-mono text-muted-foreground uppercase font-black">Controls:</span>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded transition-all ${isPlaying ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-550/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'}`}
              title={isPlaying ? "Pause Stream Monitoring" : "Resume Stream Monitoring"}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button 
              onClick={resetSimulation}
              disabled={isWiping}
              className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-500 rounded transition-all"
              title="Reset Simulated Outages and Vulnerabilities"
            >
              <RefreshCw size={13} className={isWiping ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-muted-foreground uppercase font-black mr-1">Speed:</span>
            {(["normal", "fast", "hyper"] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-black transition-all border ${
                  simulationSpeed === spd 
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-sm" 
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                }`}
              >
                {spd}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOP CONFIGURABLE OUTAGES / INJECTORS BOX */}
      <div className="bg-linear-to-r from-red-950/10 via-amber-950/10 to-transparent border border-amber-500/20 rounded-xl p-4" id="adversary-injection-dock">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Sliders className="w-5 h-5 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
            <div>
              <h3 className="text-xs font-black uppercase text-amber-500 font-mono">SOC SCENARIO ADVERSARY INJECTOR</h3>
              <p className="text-[10px] text-muted-foreground">
                Trigger cloud infrastructure stress points to verify pipeline tolerance constraints, alert delivery cascades, and routing fallback states in real-time.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setS3FailureTriggered(!s3FailureTriggered);
                if (!s3FailureTriggered) {
                  // Auto-deactivate other contradictory states
                  setAttackSpikeTriggered(false);
                }
              }}
              className={`px-3 py-1.5 border rounded-lg text-[9.5px] uppercase font-black tracking-wider transition-all flex items-center gap-1.5 ${
                s3FailureTriggered 
                  ? "bg-red-500/20 text-red-400 border-red-500/50 pulse-error shadow-sm" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <AlertTriangle size={11} />
              S3 Collector Failure
            </button>

            <button
              onClick={() => setSqsDelayTriggered(!sqsDelayTriggered)}
              className={`px-3 py-1.5 border rounded-lg text-[9.5px] uppercase font-black tracking-wider transition-all flex items-center gap-1.5 ${
                sqsDelayTriggered 
                  ? "bg-amber-550/20 text-amber-400 border-amber-500/50 pulse-warn shadow-sm" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <Clock size={11} />
              SQS Backlog Delay
            </button>

            <button
              onClick={() => setAiOverloadTriggered(!aiOverloadTriggered)}
              className={`px-3 py-1.5 border rounded-lg text-[9.5px] uppercase font-black tracking-wider transition-all flex items-center gap-1.5 ${
                aiOverloadTriggered 
                  ? "bg-amber-550/20 text-amber-400 border-amber-500/50 pulse-warn shadow-sm" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <Cpu size={11} />
              ONNX Model Jam
            </button>

            <button
              onClick={() => setAttackSpikeTriggered(!attackSpikeTriggered)}
              className={`px-3 py-1.5 border rounded-lg text-[9.5px] uppercase font-black tracking-wider transition-all flex items-center gap-1.5 ${
                attackSpikeTriggered 
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-550/50 shadow-sm" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <Zap size={11} />
              Attack Volume Spike
            </button>
          </div>
        </div>
      </div>

      {/* TOP KPI SECTION (SOC-GRADE METRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6" id="top-kpi-ops-section">
        <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* KPI 1: Ingestion Throughput */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">Ingestion rate</span>
              <span className="text-[7.5px] bg-cyan-500/10 text-cyan-500 border border-cyan-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">conn.log + http.log</span>
            </div>
            <div className="my-2.5">
              <span className="text-xl font-black tracking-tight font-mono text-cyan-400">
                {logsInflight.toLocaleString()} <span className="text-xs">ev/s</span>
              </span>
              <span className="text-[7.5px] text-muted-foreground block mt-0.5">Live Filebeat sync rate</span>
            </div>
            <div className="h-6 flex items-end">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.slice(-10)}>
                  <Area type="monotone" dataKey="ingest" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={1} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 2: SQS Queue Health */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">AWS SQS Health</span>
              <span className={`text-[7.5px] border px-1.5 py-0.5 rounded uppercase font-black font-mono ${sqsDelayTriggered ? 'bg-amber-500/10 text-amber-500 border-amber-500/15 animate-pulse' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'}`}>
                {sqsDelayTriggered ? 'Delay alert' : 'nominal'}
              </span>
            </div>
            <div className="my-2">
              <div className="text-xs font-mono font-bold leading-tight">
                Backlog: <span className="text-foreground font-extrabold">{inFlightMessages} msg</span>
              </div>
              <div className="text-[8px] text-muted-foreground font-mono mt-0.5">
                Delayed: {delayedMessages} | Size: {batchEfficiency}
              </div>
              <div className="text-[8px] text-cyan-500 font-mono mt-1 font-black">
                Transit Lag: {pipelineLag}
              </div>
            </div>
            <div className="h-6 flex items-end">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-10)}>
                  <Bar dataKey="backlog" fill={sqsDelayTriggered ? "#f59e0b" : "#10b981"} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 3: AI Pipeline Load */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">AI Model Processing</span>
              <span className="text-[7.5px] bg-purple-neon/10 text-purple-400 border border-purple-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">AI1 + AI2A + AI2B</span>
            </div>
            <div className="my-2">
              <div className="text-sm font-mono font-black text-purple-400">
                {aiTotalUtilization.toFixed(1)}% <span className="text-[9px] text-muted-foreground">utilization</span>
              </div>
              <div className="text-[8px] text-muted-foreground font-mono">
                ONNX throughput: <strong className="text-foreground">{onnxInferenceThroughput} FPS</strong>
              </div>
              <div className="text-[8px] text-slate-500 font-mono">
                GPU DirectML: Threadpool ACTIVE
              </div>
            </div>
            <div className="h-6 flex items-end">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.slice(-10)}>
                  <Area type="monotone" dataKey="ai2a" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} strokeWidth={1} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 4: Storage Usage */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">Storage (S3 + RDS)</span>
              <span className="text-[7.5px] bg-cyan-500/10 text-cyan-500 border border-cyan-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">PRO-INDEXED</span>
            </div>
            <div className="my-2">
              <div className="text-sm font-mono font-black text-foreground">
                S3 Storage: <span className="text-cyan-400">{rawLogsStored}</span>
              </div>
              <div className="text-[8.5px] font-mono leading-tight text-muted-foreground mt-1">
                RDS DB: {rdsAlertsCount.toLocaleString()} rows logged
              </div>
              <div className="text-[8px] font-mono text-emerald-400 font-bold mt-0.5">
                Growth: {rdsDailyGrowth}
              </div>
            </div>
          </div>

          {/* KPI 5: Cloud Security Score */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">PLATFORM RISK INDEX</span>
              <span className="text-[7.5px] bg-red-500/10 text-red-500 border border-red-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">RISK SCORE</span>
            </div>
            <div className="my-2 flex items-center gap-3">
              <div className="relative flex items-center justify-center w-12 h-12 bg-background border border-border rounded-full font-mono font-black text-base">
                <span className={cloudRiskScore > 40 ? "text-amber-500" : cloudRiskScore > 80 ? "text-red-500" : "text-emerald-500"}>
                  {cloudRiskScore}
                </span>
                <span className="text-[7px] text-muted-foreground absolute bottom-1">/ 100</span>
              </div>
              <div className="text-[8px] text-muted-foreground leading-normal uppercase">
                <span className="block text-foreground font-black">
                  {cloudRiskScore < 20 ? "SECURE NOMINAL" : cloudRiskScore < 65 ? "DEGRADED CAUTION" : "CRITICAL RISK WARNING"}
                </span>
                incident metrics matched
              </div>
            </div>
          </div>

          {/* KPI 6: System Availability */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">Availability (SLA)</span>
              <span className="text-[7.5px] bg-emerald-550/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">LIVE SLAS</span>
            </div>
            <div className="my-2 text-[8px] font-mono space-y-1">
              <div className="flex justify-between">
                <span>AWS Services:</span>
                <span className={awsUptime < 100 ? "text-red-400" : "text-emerald-400"}>{awsUptime.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Pipeline Ingestion:</span>
                <span className={pipelineUptime < 100 ? "text-amber-400" : "text-emerald-400"}>{pipelineUptime.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>WebSocket Link:</span>
                <span className="text-emerald-400">{websocketUptime.toFixed(2)}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE CARD: CLOUD OPS STATUS */}
        <div className="lg:col-span-4 bg-linear-to-b from-card to-background border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">CLOUD OPS STATUS</h3>
              <span className={`px-2 py-0.5 rounded text-[7.5px] font-black font-mono uppercase border ${
                s3FailureTriggered 
                  ? 'bg-red-550/10 text-red-500 border-red-500/30 animate-pulse' 
                  : sqsDelayTriggered || aiOverloadTriggered 
                  ? 'bg-amber-550/10 text-amber-500 border-amber-500/30' 
                  : 'bg-emerald-550/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {s3FailureTriggered ? "CRITICAL OUTAGE" : sqsDelayTriggered || aiOverloadTriggered ? "DEGRADED OPS" : "HEALTHY"}
              </span>
            </div>

            <div className="py-4 space-y-3 font-mono">
              {/* Grid statuses */}
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">Ingestion Layer</span>
                <span className={`text-[8px] font-black uppercase ${s3FailureTriggered ? "text-red-400" : "text-emerald-400"}`}>
                  {s3FailureTriggered ? "SHUTDOWN" : "HEALTHY (Nominal)"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">Queue Layer (SQS)</span>
                <span className={`text-[8px] font-black uppercase ${sqsDelayTriggered ? "text-amber-400" : "text-emerald-400"}`}>
                  {sqsDelayTriggered ? "CONGESTED" : "HEALTHY (Empty Queue)"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">AI Layer (ONNX Hosts)</span>
                <span className={`text-[8px] font-black uppercase ${aiOverloadTriggered ? "text-amber-400" : "text-emerald-400"}`}>
                  {aiOverloadTriggered ? "CPU BOUND BOTTLENECK" : "HEALTHY (Nominal)"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">Storage Layer (S3-RDS)</span>
                <span className={`text-[8px] font-black uppercase ${s3FailureTriggered ? "text-red-400" : "text-emerald-400"}`}>
                  {s3FailureTriggered ? "S3 PARSE ERRORS" : "HEALTHY (Sync Lock)"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">Fusion Layer Core</span>
                <span className="text-[8px] font-black text-emerald-400 uppercase">ACTIVE SYNCING</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/10">
            <p className="text-[8px] font-mono text-muted-foreground uppercase text-center">
              ACTIVE FAULT TOLLERANCE RULESETS V3.0 DEPLOYED
            </p>
          </div>
        </div>
      </div>

      {/* CORE CLOUD ARCHITECTURE VISUALIZATION BOARD */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none" id="cloud-architecture-board">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/20 pb-3 mb-4 gap-3">
          <div>
            <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
              LIVE DATA FLOW ARCHITECTURE VIEW
            </h2>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              Click any node in the AWS v3.0 data plane to mount specific S3 configs, SQS visibilities, or ONNX engine attributes.
            </p>
          </div>
          <span className="text-[8px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-black">
            PIPELINE CONDUITS NOMINAL
          </span>
        </div>

        {/* DATA PATH GRAPH FLOW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* FLOW CHART COMPONENT */}
          <div className="lg:col-span-8 bg-secondary/10 border border-border/20 rounded-xl p-3 flex flex-col justify-center min-h-90 relative overflow-hidden">
            
            {/* Grid Matrix overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[14px_24px]" />

            <div className="relative z-10 flex flex-col gap-4">
              
              {/* TOP ROW: Ingestion Path */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 font-mono">
                
                {/* Node 1: Zeek */}
                <div 
                  onClick={() => setSelectedNode("zeek")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 'zeek' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : s3FailureTriggered 
                      ? 'bg-red-500/5 border-red-500/30' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Radio className={`w-3.5 h-3.5 ${s3FailureTriggered ? "text-red-400" : "text-cyan-500"}`} />
                    <span className="text-[8px] font-black text-foreground uppercase">Zeek</span>
                  </div>
                  <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">SENSORS</span>
                  <div className={`mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black ${s3FailureTriggered ? "bg-red-500/10 text-red-500" : "bg-[#10b981]/10 text-emerald-400"}`}>
                    {s3FailureTriggered ? "S3 DROP" : "1624 ev/s"}
                  </div>
                </div>

                <div className="hidden md:block text-muted-foreground/45"><ArrowRight size={14} /></div>

                {/* Node 2: Filebeat */}
                <div 
                  onClick={() => setSelectedNode("filebeat")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 'filebeat' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : s3FailureTriggered 
                      ? 'bg-red-500/5 border-red-500/30' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className={`w-3.5 h-3.5 ${s3FailureTriggered ? "text-red-400" : "text-cyan-400"}`} />
                    <span className="text-[8px] font-black text-foreground uppercase">Filebeat</span>
                  </div>
                  <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">SHIPPERS</span>
                  <div className={`mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black ${s3FailureTriggered ? "bg-red-500/10 text-red-500" : "bg-[#10b981]/10 text-emerald-400"}`}>
                    {s3FailureTriggered ? "DEGRADED" : "NOMINAL"}
                  </div>
                </div>

                <div className="hidden md:block text-muted-foreground/45"><ArrowRight size={14} /></div>

                {/* Node 3: S3 Bucket */}
                <div 
                  onClick={() => setSelectedNode("s3")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 's3' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : s3FailureTriggered 
                      ? 'bg-red-950/20 border-red-500 pulse-error' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <HardDrive className={`w-3.5 h-3.5 ${s3FailureTriggered ? "text-red-500 animate-bounce" : "text-cyan-500"}`} />
                    <span className="text-[8.5px] font-black text-foreground uppercase">S3 Bucket</span>
                  </div>
                  <span className="text-[7px] text-muted-foreground uppercase tracking-widest mt-1 block">COLD STORAGE</span>
                  <div className={`mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black ${s3FailureTriggered ? "bg-red-500/20 text-red-400" : "bg-[#10b981]/10 text-emerald-400"}`}>
                    {s3FailureTriggered ? "PARSING FAILED" : "14.32 TB"}
                  </div>
                </div>

              </div>

              {/* ROUTEE CONNECTOR ARROW FOR VERTICAL PATH SHIFT */}
              <div className="flex justify-center my-1 z-10">
                <div className="h-6 w-[1.5px] bg-linear-to-b from-cyan-500 to-indigo-500/60 flex items-center justify-center relative">
                  <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-ping" />
                </div>
              </div>

              {/* MIDDLE ROW: Processing Path */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 font-mono">
                
                {/* Node 4: SQS */}
                <div 
                  onClick={() => setSelectedNode("sqs")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 'sqs' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : sqsDelayTriggered 
                      ? 'bg-amber-950/25 border-amber-500 pulse-warn' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Activity className={`w-3.5 h-3.5 ${sqsDelayTriggered ? "text-amber-500" : "text-cyan-400"}`} />
                    <span className="text-[8.5px] font-black text-foreground uppercase">SQS Queue</span>
                  </div>
                  <span className="text-[7px] text-muted-foreground uppercase tracking-widest mt-1 block">FIFO BUFFER</span>
                  <div className={`mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black ${sqsDelayTriggered ? "bg-amber-500/15 text-amber-400" : "bg-[#10b981]/10 text-emerald-400"}`}>
                    {sqsDelayTriggered ? "BACKLOG SPIKE" : "0.8ms lag"}
                  </div>
                </div>

                <div className="hidden md:block text-indigo-500/40"><ArrowRight size={14} /></div>

                {/* Node 5: AI Engine */}
                <div 
                  onClick={() => setSelectedNode("ai_eng")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 'ai_eng' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : aiOverloadTriggered 
                      ? 'bg-amber-950/25 border-amber-500 pulse-warn' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Cpu className={`w-3.5 h-3.5 ${aiOverloadTriggered ? "text-amber-500 animate-spin" : "text-purple-400"}`} />
                    <span className="text-[8px] font-black text-foreground uppercase">AI Engine</span>
                  </div>
                  <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">ONNX RUNTIME</span>
                  <div className={`mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black ${aiOverloadTriggered ? "bg-amber-500/15 text-amber-400" : "bg-purple-500/10 text-purple-400"}`}>
                    {aiOverloadTriggered ? "CPU OVERLOAD" : "v3.0.4"}
                  </div>
                </div>

                <div className="hidden md:block text-indigo-500/40"><ArrowRight size={14} /></div>

                {/* Node 6: Fusion Layer */}
                <div 
                  onClick={() => setSelectedNode("fusion")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 'fusion' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : aiOverloadTriggered 
                      ? 'bg-amber-950/5 border-amber-500/30' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[8.5px] font-black text-foreground uppercase">Fusion Layer</span>
                  </div>
                  <span className="text-[7px] text-muted-foreground uppercase tracking-widest mt-1 block">FCAJ CORRELATOR</span>
                  <div className="mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black bg-emerald-500/10 text-emerald-400">
                    87.4% FP-Red
                  </div>
                </div>

              </div>

              {/* ROUTEE CONNECTOR ARROW FOR VERTICAL PATH SHIFT */}
              <div className="flex justify-center my-1 z-10">
                <div className="h-6 w-[1.5px] bg-linear-to-b from-indigo-500/60 to-purple-500/50 flex items-center justify-center relative">
                  <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-ping" />
                </div>
              </div>

              {/* BOTTOM ROW: Output Path */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 font-mono">
                
                {/* Node 7: RDS */}
                <div 
                  onClick={() => setSelectedNode("db")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 'db' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[8.5px] font-black text-foreground uppercase">Postgres DB</span>
                  </div>
                  <span className="text-[7px] text-muted-foreground uppercase tracking-widest mt-1 block">RDS STORAGE</span>
                  <div className="mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black bg-[#10b981]/10 text-emerald-400">
                    Nominal IOPS
                  </div>
                </div>

                <div className="hidden md:block text-purple-400/40"><ArrowRight size={14} /></div>

                {/* Node 8: WebSocket */}
                <div 
                  onClick={() => setSelectedNode("websocket")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 'websocket' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-purple-450" />
                    <span className="text-[8px] font-black text-foreground uppercase">WebSocket</span>
                  </div>
                  <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">GATEWAY</span>
                  <div className="mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black bg-[#10b981]/10 text-emerald-400">
                    Live RELAY
                  </div>
                </div>

                <div className="hidden md:block text-purple-450/40"><ArrowRight size={14} /></div>

                {/* Node 9: Dashboard */}
                <div 
                  onClick={() => setSelectedNode("dash")}
                  className={`cursor-pointer px-3 py-2 rounded-xl border flex flex-col items-center justify-center w-28 h-20 text-center transition-all ${
                    selectedNode === 'dash' 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : 'bg-background border-border hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="text-[8.5px] font-black text-foreground uppercase">Dashboard</span>
                  </div>
                  <span className="text-[7px] text-muted-foreground uppercase tracking-widest mt-1 block">SOC DASH</span>
                  <div className="mt-1 text-[7px] px-1.5 py-0.2 rounded font-mono font-black bg-[#10b981]/10 text-emerald-400">
                    HMR Synced
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ACTIVE NODE CONTROLLER DETAILS */}
          <div className="lg:col-span-4 bg-secondary/15 border border-border/30 rounded-xl p-4 flex flex-col justify-between font-mono">
            <div>
              <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-3">
                <currentNode.icon className={`w-5 h-5 ${
                  currentNode.status === 'critical' ? 'text-red-500' : currentNode.status === 'warning' ? 'text-amber-500' : 'text-cyan-500'
                }`} />
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase">{currentNode.name} Details</h3>
                  <span className="text-[8.5px] text-muted-foreground uppercase">{currentNode.role}</span>
                </div>
              </div>

              {/* Status and core variables */}
              <div className="space-y-3 py-2 text-[9px] leading-relaxed select-text">
                <div className="flex justify-between border-b border-border/10 pb-1">
                  <span className="text-muted-foreground">Node Status:</span>
                  <span className={`font-black uppercase flex items-center gap-1 ${
                    currentNode.status === 'critical' ? 'text-red-500' : currentNode.status === 'warning' ? 'text-amber-450' : 'text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentNode.status === 'critical' ? 'bg-red-500 animate-ping' : currentNode.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {currentNode.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/10 pb-1">
                  <span className="text-muted-foreground">Log Latency:</span>
                  <span className="text-cyan-400 font-bold">{currentNode.latency}</span>
                </div>
                <div className="flex justify-between border-b border-border/10 pb-1">
                  <span className="text-muted-foreground">Throughput:</span>
                  <span className="text-foreground font-bold">{currentNode.throughput}</span>
                </div>
                <div className="flex justify-between border-b border-border/10 pb-1">
                  <span className="text-muted-foreground">Error Rate:</span>
                  <span className={parseFloat(currentNode.errorRate) > 5 ? "text-red-400 font-bold" : "text-emerald-400"}>{currentNode.errorRate}</span>
                </div>
                <div className="flex justify-between border-b border-border/10 pb-1">
                  <span className="text-muted-foreground">Heartbeat Timestamp:</span>
                  <span className="text-slate-400 font-bold">{new Date().toLocaleString('en-US', { hour12: false })}</span>
                </div>

                <div className="pt-2 bg-background/50 border border-border/20 rounded-lg p-2.5 mt-2 space-y-1.5">
                  <span className="text-[7.5px] text-cyan-500 uppercase font-black block tracking-wider">RAW AWS CONFIG / PARAMETERS</span>
                  {Object.entries(currentNode.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-[8px] border-b border-border/5 pb-0.5 leading-tight">
                      <span className="text-[#a1a1aa] font-bold">{key}:</span>
                      <span className="text-foreground font-black truncate max-w-37.5">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/10 text-[7px] text-muted-foreground uppercase leading-tight text-center mt-3 opacity-60">
              Select other nodes in the live pipeline map to overlay storage caps or model layers.
            </div>
          </div>

        </div>
      </div>

      {/* DATA FLOW HEALTH & PATH DEVIATIONS BREAKDOWN */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm" id="data-flow-health-breakdown">
        <div className="border-b border-border/20 pb-2 mb-4">
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#10b981] animate-pulse" />
            DATA FLOW INTEGRITY & STAGE HEALTH (Required Core Section)
          </h3>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            Detailed inspection of intermediate network links, write speeds, microsecond queues, and websocket payloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Path 1: Zeek -> S3 */}
          <div className={`p-3 bg-secondary/15 border rounded-xl leading-relaxed font-mono text-[8.5px] hover:border-cyan-500/20 transition-all ${
            s3FailureTriggered ? "border-red-500/40 bg-red-950/10" : "border-border"
          }`}>
            <span className="block text-muted-foreground text-[7.5px] uppercase font-black mb-1">Zeek → Filebeat → S3</span>
            <div className="text-sm font-black tracking-tight font-mono mb-1.5 flex items-center justify-between">
              <span className={s3FailureTriggered ? "text-red-400" : "text-emerald-400"}>
                {s3FailureTriggered ? "65.8%" : "99.99%"}
              </span>
              <span className="text-[7.5px] font-normal text-muted-foreground uppercase">Success</span>
            </div>
            <div className="text-[8px] text-slate-400 space-y-0.5 leading-none">
              <div className="flex justify-between">
                <span>Packet Loss:</span>
                <span className={s3FailureTriggered ? "text-red-400" : "text-emerald-400"}>
                  {s3FailureTriggered ? "34.2%" : "0.001%"}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Log Mode:</span>
                <span>Active Mirror</span>
              </div>
            </div>
          </div>

          {/* Path 2: S3 -> SQS */}
          <div className={`p-3 bg-secondary/15 border rounded-xl leading-relaxed font-mono text-[8.5px] hover:border-cyan-500/20 transition-all ${
            sqsDelayTriggered ? "border-amber-500/40 bg-amber-950/10" : "border-border"
          }`}>
            <span className="block text-muted-foreground text-[7.5px] uppercase font-black mb-1">S3 Bucket → SQS FIFO</span>
            <div className="text-sm font-black tracking-tight font-mono mb-1.5 flex items-center justify-between">
              <span className={sqsDelayTriggered ? "text-amber-400 font-extrabold" : "text-cyan-400"}>
                {sqsDelayTriggered ? "154 ms" : "1.8 ms"}
              </span>
              <span className="text-[7.5px] font-normal text-slate-400 uppercase">Transit Delay</span>
            </div>
            <div className="text-[8px] text-slate-400 space-y-0.5 leading-none">
              <div className="flex justify-between">
                <span>Delay Trigger:</span>
                <span className={sqsDelayTriggered ? "text-amber-400" : "text-emerald-400"}>
                  {sqsDelayTriggered ? "Active" : "None"}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Polling Interv:</span>
                <span>Immediate</span>
              </div>
            </div>
          </div>

          {/* Path 3: SQS -> AI Engine */}
          <div className={`p-3 bg-secondary/15 border rounded-xl leading-relaxed font-mono text-[8.5px] hover:border-cyan-500/20 transition-all ${
            sqsDelayTriggered || aiOverloadTriggered ? "border-amber-500/40 bg-amber-950/10" : "border-border"
          }`}>
            <span className="block text-muted-foreground text-[7.5px] uppercase font-black mb-1">SQS Queue → ONNX Engine</span>
            <div className="text-sm font-black tracking-tight font-mono mb-1.5 flex items-center justify-between">
              <span className={sqsDelayTriggered || aiOverloadTriggered ? "text-amber-450Font opacity-95 text-amber-405 font-black" : "text-cyan-400"}>
                {sqsDelayTriggered ? "4200 ms" : aiOverloadTriggered ? "2800 ms" : "12.4 ms"}
              </span>
              <span className="text-[7.5px] font-normal text-slate-400 uppercase">Wait Time</span>
            </div>
            <div className="text-[8px] text-slate-400 space-y-0.5 leading-none">
              <div className="flex justify-between">
                <span>Queue Backlog:</span>
                <span className={sqsDelayTriggered ? "text-amber-400 font-bold" : "text-emerald-400"}>
                  {sqsDelayTriggered ? "2850 tasks" : "Empty"}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Batch Efficiency:</span>
                <span>{batchEfficiency}</span>
              </div>
            </div>
          </div>

          {/* Path 4: AI -> Fusion Layer */}
          <div className={`p-3 bg-secondary/15 border rounded-xl leading-relaxed font-mono text-[8.5px] hover:border-cyan-500/20 transition-all ${
            aiOverloadTriggered ? "border-amber-500/40 bg-amber-950/10" : "border-border"
          }`}>
            <span className="block text-muted-foreground text-[7.5px] uppercase font-black mb-1">AI Engine → Fusion Core</span>
            <div className="text-sm font-black tracking-tight font-mono mb-1.5 flex items-center justify-between">
              <span className={aiOverloadTriggered ? "text-amber-400" : "text-cyan-400"}>
                {aiOverloadTriggered ? "420.5 ms" : "4.2 ms"}
              </span>
              <span className="text-[7.5px] font-normal text-slate-400 uppercase">Inference Time</span>
            </div>
            <div className="text-[8px] text-slate-400 space-y-0.5 leading-none">
              <div className="flex justify-between">
                <span>Model Threading:</span>
                <span>GPU Bound</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Classification:</span>
                <span className="text-purple-400">Multi-Model Fusion</span>
              </div>
            </div>
          </div>

          {/* Path 5: Fusion -> RDS */}
          <div className="p-3 bg-secondary/15 border border-border rounded-xl leading-relaxed font-mono text-[8.5px] hover:border-cyan-500/20 transition-all">
            <span className="block text-muted-foreground text-[7.5px] uppercase font-black mb-1">Fusion Layer → RDS DB</span>
            <div className="text-sm font-black tracking-tight font-mono mb-1.5 flex items-center justify-between">
              <span className="text-cyan-400">0.9 ms</span>
              <span className="text-[7.5px] font-normal text-slate-400 uppercase">Write Latency</span>
            </div>
            <div className="text-[8px] text-slate-400 space-y-0.5 leading-none">
              <div className="flex justify-between">
                <span>RDS Commit:</span>
                <span className="text-emerald-450 hover:opacity-100 opacity-90 text-emerald-400">Successful</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Engine DB Type:</span>
                <span>Postgres Base</span>
              </div>
            </div>
          </div>

          {/* Path 6: RDS -> Dashboard (Websocket) */}
          <div className="p-3 bg-secondary/15 border border-border rounded-xl leading-relaxed font-mono text-[8.5px] hover:border-cyan-500/20 transition-all">
            <span className="block text-muted-foreground text-[7.5px] uppercase font-black mb-1">RDS Postgres → Dashboard</span>
            <div className="text-sm font-black tracking-tight font-mono mb-1.5 flex items-center justify-between">
              <span className="text-cyan-400">4.8 ms</span>
              <span className="text-[7.5px] font-normal text-slate-400 uppercase">Socket Buffer</span>
            </div>
            <div className="text-[8px] text-slate-400 space-y-0.5 leading-none">
              <div className="flex justify-between">
                <span>Active Clients:</span>
                <span>3 Operator Cons</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Relay Latency:</span>
                <span>Nominal Echo</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PIPELINE PERFORMANCE ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="performance-charts-analytics">
        
        {/* CHART 1: End-to-End Log Pipeline Latency */}
        <div className="lg:col-span-6 bg-card border border-border rounded-xl p-4 shadow-sm select-none">
          <div className="border-b border-border/20 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">End-to-End Log Ingest Latency</h3>
              <span className="text-[8px] text-muted-foreground">Zeek log event mirror ingestion to Final Fusion Correlation Delay</span>
            </div>
            <span className="text-[8px] font-mono text-cyan-400 font-extrabold uppercase bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              MS / REAL-TIME
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={8} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={8} tickLine={false} domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', fontSize: '10px', color: '#f4f4f5' }}
                  labelClassName="font-bold text-cyan-400"
                />
                <Area type="monotone" dataKey="latency" name="E2E Latency (ms)" stroke="#06b6d4" strokeWidth={2} fill="url(#latencyGlow)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: SQS Batch Efficiency Optimizer */}
        <div className="lg:col-span-6 bg-card border border-border rounded-xl p-4 shadow-sm select-none">
          <div className="border-b border-border/20 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">SQS Batch Size Efficiency</h3>
              <span className="text-[8px] text-muted-foreground">FastAPI Consumer throughput comparison metrics mapped against queue depths</span>
            </div>
            <span className="text-[8px] font-mono text-cyan-400 font-extrabold uppercase bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              OPTIMIZER MODE
            </span>
          </div>
          <div className="h-56 flex flex-col justify-between font-mono">
            {/* Efficiency benchmark graph bar view */}
            <div className="space-y-3.5 my-auto">
              <div>
                <div className="flex justify-between items-center text-[8.5px] uppercase mb-1">
                  <span>Batch Capacity Mode: 1 Message (Default AWS standard)</span>
                  <span className="text-red-400 font-black">1.4 ms transit lag | Low efficiency</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: "12%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[8.5px] uppercase mb-1">
                  <span>Batch Capacity Mode: 10 Messages (Sync Pipeline nominal)</span>
                  <span className="text-amber-400 font-black">0.8 ms transit lag | Optimal normal load</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: "62%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[8.5px] uppercase mb-1">
                  <span>Batch Capacity Mode: 50 Messages (FCAJ Bulk Ingestion Core)</span>
                  <span className="text-emerald-400 font-black">0.2 ms transit lag | Overload Shield mode</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: "98%" }} />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-background/50 border border-border/20 text-[8.5px] rounded-lg mt-2 leading-relaxed">
              <strong className="text-cyan-400 uppercase block mb-0.5">SOC Grading Note:</strong>
              Under massive anomaly loads, SQS FIFO automatically buffers events up to size 50 messages to reduce FastAPI socket read load, bypassing standard AWS pro-rata cost thresholds.
            </div>
          </div>
        </div>

        {/* CHART 3: AI Inference Latency Performance (Line) */}
        <div className="lg:col-span-6 bg-card border border-border rounded-xl p-4 shadow-sm select-none">
          <div className="border-b border-border/20 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">ONNX Inference Latency Profiler</h3>
              <span className="text-[8px] text-muted-foreground">Inference delay comparison: AI1 (DeepConn) vs AI2A (HTTP Anomaly) vs AI2B (DGA Classifier)</span>
            </div>
            <span className="text-[8px] font-mono text-purple-400 font-extrabold uppercase bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded">
              ONNX RUNTIME
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={8} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={8} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', fontSize: '10px', color: '#f4f4f5' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="ai1" name="AI1 DeepConn" stroke="#06b6d4" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="ai2a" name="AI2A HTTP Anomaly" stroke="#a855f7" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="ai2b" name="AI2B DGA Classifier" stroke="#ec4899" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Dropped / Retry Analysis */}
        <div className="lg:col-span-6 bg-card border border-border rounded-xl p-4 shadow-sm select-none">
          <div className="border-b border-border/20 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">Pipeline Failure & Retry Rate</h3>
              <span className="text-[8px] text-muted-foreground">Real-time mapping of unacknowledged packets, timeout faults, and inference retry tasks</span>
            </div>
            <span className="text-[8px] font-mono text-red-400 font-extrabold uppercase bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
              FAULT CHART
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={8} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={8} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', fontSize: '10px', color: '#f4f4f5' }}
                />
                <Bar dataKey="failureRate" name="Dropped Message Retry %" fill={s3FailureTriggered ? "#ef4444" : "#e11d48"} radius={[1, 1, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* DISSECTED AWS SERVICES MONITORING GRID */}
      <div className="space-y-4" id="aws-dissected-monitoring-dashboard">
        <div className="border-b border-border/25 pb-1">
          <h2 className="text-xs font-black uppercase text-foreground leading-none tracking-[0.25em] font-mono">
            AWS PRO-GRADE SOC RESOURCE MONITORS
          </h2>
          <p className="text-[9.5px] text-muted-foreground mt-1">
            Granular state inspectors mapping security rules, sub-allocated resources, write cycles, and IAM permission audits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* S3 Storage */}
          <div className="bg-linear-to-b from-card to-background border border-border rounded-xl p-4 font-mono select-none">
            <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-3">
              <span className="text-[9px] font-black uppercase text-foreground flex items-center gap-1.5 leading-none">
                <HardDrive className="w-4 h-4 text-cyan-500" />
                1. Amazon S3 Storage
              </span>
              <span className={`w-2 h-2 rounded-full ${s3FailureTriggered ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            </div>
            <div className="text-[8.5px] space-y-2 leading-relaxed">
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Service Health Class:</span>
                <span className={s3FailureTriggered ? "text-red-400 font-extrabold" : "text-emerald-400"}>
                  {s3FailureTriggered ? "MALFORMED PARSING" : "AWS S3 Standard"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Object Log Write ops:</span>
                <span className="text-foreground font-black">{s3FailureTriggered ? "1 IOPS (STUCK)" : "142 writes/sec"}</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Server Encryption:</span>
                <span className="text-emerald-550 dark:text-emerald-450 text-emerald-400">AWS-KMS Activated</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Lifecycle Status:</span>
                <span className="text-cyan-400">14-Day Glacier Transition ok</span>
              </div>
            </div>
          </div>

          {/* SQS Queue details */}
          <div className="bg-linear-to-b from-card to-background border border-border rounded-xl p-4 font-mono select-none">
            <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-3">
              <span className="text-[9px] font-black uppercase text-foreground flex items-center gap-1.5 leading-none">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                2. Amazon SQS Queues
              </span>
              <span className={`w-2 h-2 rounded-full ${sqsDelayTriggered ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            </div>
            <div className="text-[8.5px] space-y-2 leading-relaxed">
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Backlog Deep Depth:</span>
                <span className={sqsDelayTriggered ? "text-amber-400 font-bold" : "text-foreground"}>
                  {inFlightMessages} messages
                </span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">FastAPI Consumer lag:</span>
                <span className={sqsDelayTriggered ? "text-amber-400 font-bold animate-pulse" : "text-emerald-400"}>
                  {sqsDelayTriggered ? "Cons Delay (HIGH)" : "0.5ms Lag (Nominal)"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Visibility Timeout:</span>
                <span className="text-foreground">30-seconds FIFO rules</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">DLQ Dead Letter logs:</span>
                <span className="text-emerald-400">0 dropped messages</span>
              </div>
            </div>
          </div>

          {/* EC2 Compute host */}
          <div className="bg-linear-to-b from-card to-background border border-border rounded-xl p-4 font-mono select-none">
            <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-3">
              <span className="text-[9px] font-black uppercase text-foreground flex items-center gap-1.5 leading-none">
                <Cpu className="w-4 h-4 text-purple-400" />
                3. EC2 (ONNX AI Host VM)
              </span>
              <span className={`w-2 h-2 rounded-full ${aiOverloadTriggered ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            </div>
            <div className="text-[8.5px] space-y-2 leading-relaxed">
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">CPU Core Thread Load:</span>
                <span className={aiOverloadTriggered ? "text-amber-400 font-bold" : "text-foreground font-black"}>
                  {aiOverloadTriggered ? "98.4% (Bound)" : "36.2% (Comfortable)"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">System Memory Load:</span>
                <span className="text-foreground">11.4 GB / 32 GB allocated</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">GPU DirectML Threads:</span>
                <span className="text-cyan-400">Active (4 CUDA-co-cores)</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Machine Host Uptime:</span>
                <span className="text-slate-400">14 days, 22 hours</span>
              </div>
            </div>
          </div>

          {/* RDS Postgres SQL */}
          <div className="bg-linear-to-b from-card to-background border border-border rounded-xl p-4 font-mono select-none">
            <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-3">
              <span className="text-[9px] font-black uppercase text-foreground flex items-center gap-1.5 leading-none">
                <Database className="w-4 h-4 text-blue-400" />
                4. RDS PostgreSQL
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[8.5px] space-y-2 leading-relaxed">
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Active Connection threads:</span>
                <span className="text-foreground font-black">14 database connections</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Query Commit Latency:</span>
                <span className="text-cyan-400">0.9 ms (Indexing Active)</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Durable Storage Size:</span>
                <span className="text-foreground">{(8.4 + tick * 0.001).toFixed(3)} GB / 250 GB Auto-Scale</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Postgres IOPS health:</span>
                <span className="text-emerald-450 hover:opacity-100 opacity-90 text-emerald-400 font-bold uppercase">Nominal / 3000 IOPS</span>
              </div>
            </div>
          </div>

          {/* CloudWatch Logs */}
          <div className="bg-linear-to-b from-card to-background border border-border rounded-xl p-4 font-mono select-none">
            <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-3">
              <span className="text-[9px] font-black uppercase text-foreground flex items-center gap-1.5 leading-none">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                5. AWS CloudWatch Logs
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[8.5px] space-y-2 leading-relaxed">
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">CloudWatch Streaming:</span>
                <span className="text-foreground">12 log streams synchronized</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Alarm Anomaly triggers:</span>
                <span className={s3FailureTriggered || sqsDelayTriggered ? "text-amber-400 font-semibold" : "text-emerald-400"}>
                  {s3FailureTriggered ? "S3 Outage Event Active" : sqsDelayTriggered ? "Queue Backup Alarm" : "No triggers active"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Logs retention period:</span>
                <span className="text-foreground">90 days audit archiving</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Subscription Filters:</span>
                <span className="text-cyan-405 opacity-90 text-cyan-400">Active (AWS SNS Link)</span>
              </div>
            </div>
          </div>

          {/* IAM Security Panel */}
          <div className="bg-linear-to-b from-card to-background border border-border rounded-xl p-4 font-mono select-none">
            <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-3">
              <span className="text-[9px] font-black uppercase text-foreground flex items-center gap-1.5 leading-none">
                <Lock className="w-4 h-4 text-[#e11d48]" />
                6. IAM Security Panel
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[8.5px] space-y-2 leading-relaxed">
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">S3-SQS IAM Roles:</span>
                <span className="text-emerald-400">Strict Least-Privilege</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">EC2 Instance Connect:</span>
                <span className="text-foreground font-black">Authorized (KMS Authenticated)</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">CloudTrail Audits:</span>
                <span className="text-foreground">0 suspicious access events</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-0.5">
                <span className="text-muted-foreground">Credentials Rotate:</span>
                <span className="text-cyan-400">Valid (34 days remaining)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CLOUD ALARMS & CORRELATION LEDGER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="alarms-and-correlation-ledger">
        
        {/* CLOUD SECURITY INCIDENT FEED */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="border-b border-border/20 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">
                CLOUD INCIDENT FEED & ALARMS
              </h3>
              <span className="text-[8px] text-muted-foreground">Active event queue mapping infrastructural pipeline degradation indices</span>
            </div>
            <span className="text-[8px] font-mono bg-red-500/10 text-red-500 border border-red-500/15 px-2 py-0.5 rounded font-black animate-pulse">
              LIVE SOC STREAM
            </span>
          </div>

          <div className="overflow-x-auto select-text font-mono">
            <table className="w-full text-left border-collapse text-[9.5px]">
              <thead>
                <tr className="border-b border-border/20 text-muted-foreground uppercase text-[8px] tracking-wider">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 px-2">Service</th>
                  <th className="py-2 px-2">Alarm Name</th>
                  <th className="py-2 px-2">Severity</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {incidentsList.map((inc) => (
                  <React.Fragment key={inc.id}>
                    <tr className="hover:bg-secondary/20 transition-all group">
                      <td className="py-2.5 pr-2 font-black text-slate-400 group-hover:text-cyan-400">{inc.id}</td>
                      <td className="py-2.5 px-2 font-black text-foreground">{inc.service}</td>
                      <td className="py-2.5 px-2 text-slate-203 uppercase font-bold">{inc.alert}</td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[7px] font-black ${
                          inc.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 
                          inc.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15' : 
                          'bg-cyan-500/10 text-cyan-500 border border-cyan-500/15'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`font-black ${inc.status === 'ACTIVE' ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                    {inc.status === 'ACTIVE' && (
                      <tr className="bg-red-950/10">
                        <td colSpan={5} className="p-3 border-none rounded-lg text-[8.5px] leading-relaxed text-slate-300">
                          <div className="border-l-2 border-red-500 pl-2.5 space-y-1">
                            <div><strong className="text-red-400 uppercase">Impact breakdown:</strong> {inc.impact}</div>
                            <div><strong className="text-cyan-400 uppercase">Recommended Actions:</strong> {inc.resolution}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ALERT CORRELATION MAPPER with system-critical outputs */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="border-b border-border/20 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">
                ALERT CORRELATION MATRIX
              </h3>
              <span className="text-[8px] text-muted-foreground">Infrastructure Event → Downstream SOC Security Impact Mapping</span>
            </div>
            <span className="text-[8px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-black">
              FCAJ V3 SCORE
            </span>
          </div>

          <div className="space-y-3 font-mono">
            {correlationMap.map((cell) => {
              const isImpacted = cell.status !== "Protected";
              return (
                <div 
                  key={cell.code}
                  className={`p-2.5 border rounded-xl leading-relaxed text-[8.5px] transition-all ${
                    isImpacted 
                      ? "bg-red-500/5 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.05)]" 
                      : "bg-secondary/20 border-border hover:border-cyan-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[7.5px] font-bold text-slate-450 uppercase">{cell.code} Correlation Chain</span>
                    <span className={`px-1.5 py-0.2 rounded text-[7px] font-black ${
                      isImpacted ? "bg-red-500/15 text-red-400 animate-pulse" : "bg-emerald-555 dark:bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {cell.status}
                    </span>
                  </div>
                  <div className="text-[9px] text-foreground leading-normal flex flex-wrap items-center">
                    <span className="font-extrabold text-[#e1e1e6]">{cell.trigger}</span>
                    <ArrowRight size={10} className="mx-1.5 text-muted-foreground/50" />
                    <span className={isImpacted ? "text-red-400 font-extrabold" : "text-slate-400"}>{cell.target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* COST ANALYSIS (SIMULATED FINOPS) & ENVIRONMENT DEPLOYMENTS STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="finops-cost-and-environments">
        
        {/* FINOPS SEGMENT */}
        <div className="lg:col-span-6 bg-card border border-border rounded-xl p-4 shadow-sm select-none">
          <div className="border-b border-border/20 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">
                SIMULATED FINOPS & PIPELINE COST ESTIMATE
              </h3>
              <span className="text-[8px] text-muted-foreground">Correlating threat anomalies to AWS pro-rata request logs pricing metrics</span>
            </div>
            <span className="text-[8px] font-mono text-cyan-405 opacity-90 text-cyan-400 font-extrabold uppercase bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              FINANCIAL AUDIT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Pie-like bar percentage map */}
            <div className="space-y-3 font-mono">
              <span className="text-[8px] tracking-wider uppercase text-muted-foreground block mb-2">Resource Cost Distribution:</span>
              {finopsCosts.map((res) => (
                <div key={res.service} className="text-[9px]">
                  <div className="flex justify-between items-center mb-0.5 leading-none">
                    <span className="text-[#a1a1aa] font-bold">{res.service}</span>
                    <span className="text-foreground font-black">{res.cost}</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${res.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Daily cost metrics display box */}
            <div className="p-3 bg-secondary/15 border border-border/30 rounded-xl leading-relaxed text-[9px] font-mono font-bold space-y-2">
              <div className="border-b border-border/10 pb-1 flex justify-between items-center">
                <span className="text-[8px] uppercase text-muted-foreground">Aggregated Daily Cost:</span>
                <span className="text-base text-cyan-400 font-black">
                  {attackSpikeTriggered ? "$268.50" : "$155.30"}
                </span>
              </div>
              <div className="text-[8.5px] leading-relaxed text-slate-300">
                <span className="text-amber-400 font-black uppercase mb-1 flex items-center gap-1">
                  <TrendingUp size={11} />
                  SOC FinOps Insight:
                </span>
                {attackSpikeTriggered ? (
                  <span className="text-red-400 font-semibold leading-normal block">
                    Under active attack anomalies, high VPC flow log frequencies and high-scale ONNX CPU execution has scaled pro-rata EC2 costs.
                  </span>
                ) : (
                  <span>
                    Idle data rates and optimized SQS FIFO batching parameters hold AWS standard networking fees completely minimal.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ENVIRONMENTS DEPLOYMENT BLOCK */}
        <div className="lg:col-span-6 bg-card border border-border rounded-xl p-4 shadow-sm select-none">
          <div className="border-b border-border/20 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">
                DEPLOYMENT & ENVIRONMENT STATUS
              </h3>
              <span className="text-[8px] text-muted-foreground">SOC pipeline release builds across hybrid environments</span>
            </div>
            <span className="text-[8px] font-mono text-cyan-400 font-extrabold uppercase bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              PROD PIPELINE
            </span>
          </div>

          <div className="space-y-3 font-mono">
            {deploymentEnvironments.map((env) => (
              <div 
                key={env.name} 
                className="p-2.5 bg-secondary/15 border border-border/30 rounded-xl text-[8.5px] flex items-center justify-between hover:border-cyan-500/20 transition-all"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${env.status === "Healthy" ? "bg-emerald-500" : "bg-red-500 animate-ping"}`} />
                    <span className="text-[9.5px] font-black text-[#f4f4f5]">{env.name}</span>
                  </div>
                  <div className="text-muted-foreground space-x-3">
                    <span>Rate: <strong className="text-foreground">{env.dataRate}</strong></span>
                    <span>Model release: <strong className="text-purple-400">{env.model}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-[#f4f4f5]">SLA Uptime: {env.uptime}</span>
                  <span className="text-slate-500 text-[8px] mt-0.5 block">Last Sync: {env.lastDeploy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER COLOURED WEBSOCKET DYNAMIC TELEMETRY FEED */}
      <div className="bg-black/40 border border-border/40 rounded-xl p-4 shadow-inner" id="websocket-dynamic-feed">
        <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-[10.5px] font-black text-foreground uppercase tracking-[0.2em] font-mono">
              REAL-TIME CLOUD TELEMETRY LOGGER (FastAPI WS Gateway Mock)
            </h3>
          </div>
          <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-400 font-extrabold">Stream Connected</span>
          </div>
        </div>

        {/* LOG SCREEN */}
        <div className="bg-black/90 rounded-lg p-3 h-48 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-1.5 select-text">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 leading-relaxed"
              >
                <span className="text-slate-500 shrink-0 font-bold">[{log.timestamp}]</span>
                <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-black shrink-0 ${
                  log.level === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                  log.level === 'WARN' ? 'bg-amber-500/25 text-amber-500' :
                  'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {log.level}
                </span>
                <span className="text-cyan-600 dark:text-cyan-500 font-black uppercase shrink-0">[{log.service}]</span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="pt-2 flex items-center justify-between text-[7px] font-mono uppercase text-muted-foreground leading-none tracking-widest pl-1 mt-2 opacity-60">
          <span>Logs pro-rate buffer limit: 50 packets</span>
          <span>Websocket channel ID: ws://localhost:3000/api/v3/cloud-telemetry</span>
        </div>
      </div>

    </div>
  );
};

export default CloudPage;
