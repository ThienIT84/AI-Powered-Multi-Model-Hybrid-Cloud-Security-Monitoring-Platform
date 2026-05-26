import React, { useState, useEffect, useRef } from "react";
import { Playbook, PlaybookAction } from "../components/playbooks/playbooksConfig";
import { PlaybookFilters } from "../components/playbooks/PlaybookFilters";
import { PlaybookList } from "../components/playbooks/PlaybookList";
import { PlaybookModal } from "../components/playbooks/PlaybookModal";
import { 
  Workflow, 
  PlayCircle, 
  Activity, 
  HelpCircle,
  Terminal,
  Cpu,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RefreshCw
} from "lucide-react";

const initialPlaybooks: Playbook[] = [
  {
    id: "pb-1",
    name: "Auto-Isolate Compromised EC2",
    description: "Automatically isolate compromised EC2 instances by disconnecting VPC subnets when AI detects high Anomaly Scores in Zeek traffic logs.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "IF: AI Anomaly Score of Zeek records > 0.88",
    executions: 124,
    updatedAt: "3 hours ago",
    severity: "critical",
    avgDurationMs: 121,
    confidenceThreshold: 92,
    riskScoreThreshold: 88,
    lastExecutionStatus: "success",
    lastExecutedTime: "3 hours ago",
    actions: [
      {
        id: "pb1-act-1",
        step: 1,
        name: "Virtual Subnet Connection Severance",
        description: "Call AWS EC2 API to disconnect network interfaces from production subnets",
        type: "isolate",
        status: "completed",
        target: "vpc-subnet-941a",
        severity: "critical"
      },
      {
        id: "pb1-act-2",
        step: 2,
        name: "Slack Incident Response Dispatcher",
        description: "Send isolation reports and payload logs to the #critical-soc-responses channel",
        type: "slack",
        status: "completed",
        target: "#critical-soc-responses",
        severity: "medium"
      }
    ]
  },
  {
    id: "pb-2",
    name: "Block Brute Force IP via pfSense",
    description: "Detect systematic credential brute force and automatically block culprit source IPs in the pfSense firewall rule table using Suricata alert details.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "IF: Suricata Signature Category === Brute Force",
    executions: 312,
    updatedAt: "1 day ago",
    severity: "high",
    avgDurationMs: 84,
    confidenceThreshold: 94,
    riskScoreThreshold: 80,
    lastExecutionStatus: "success",
    lastExecutedTime: "1 day ago",
    actions: [
      {
        id: "pb2-act-1",
        step: 1,
        name: "pfSense Firewall Alias Block List Injector",
        description: "Inject offender IP into firewall block dynamic lists (Alias Block List)",
        type: "firewall",
        status: "completed",
        target: "WAN_Block_Alias",
        severity: "high"
      },
      {
        id: "pb2-act-2",
        step: 2,
        name: "Jira Threat Tracking Ticket Creator",
        description: "Generate automatically an incident response ticket inside Jira Software for SOC L1 analysts",
        type: "jira",
        status: "completed",
        target: "SEC-JIRA-INTEG",
        severity: "low"
      }
    ]
  },
  {
    id: "pb-3",
    name: "Slack Alert & Critical Incident Creation",
    description: "Identify remote code execution or SQL injection exploits and notify SecOps teams instantly via Slack while logging incidents inside internal SOC tickets.",
    status: "inactive",
    triggerType: "automated",
    triggerCondition: "IF: AI2B Web Attack Confidence Score > 0.95",
    executions: 45,
    updatedAt: "4 days ago",
    severity: "medium",
    avgDurationMs: 142,
    confidenceThreshold: 95,
    riskScoreThreshold: 78,
    lastExecutionStatus: "warning",
    lastExecutedTime: "4 days ago",
    actions: [
      {
        id: "pb3-act-1",
        step: 1,
        name: "Broadcast Alerts on WebSec Teams",
        description: "Send alert payload logs to targeted DevSecOps communication rooms",
        type: "slack",
        status: "completed",
        target: "#sec-emergency",
        severity: "high"
      },
      {
        id: "pb3-act-2",
        step: 2,
        name: "Urgent Incident Board Registration",
        description: "Automatically log incident details inside custom project boards",
        type: "jira",
        status: "completed",
        target: "DEV-SEC-BOARDS",
        severity: "medium"
      }
    ]
  },
  {
    id: "pb-4",
    name: "Revoke Leaked AWS IAM Session",
    description: "Revoke active temporal tokens and block credential access immediately upon detection of anomalous AWS activity.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "IF: AWS CloudTrail anomalies detected by AI Optimizer",
    executions: 18,
    updatedAt: "Just now",
    severity: "high",
    avgDurationMs: 115,
    confidenceThreshold: 90,
    riskScoreThreshold: 82,
    lastExecutionStatus: "success",
    lastExecutedTime: "Just now",
    actions: [
      {
        id: "pb4-act-1",
        step: 1,
        name: "AWS Temporal Session Access Invalidation",
        description: "Deactivate leaked credentials and apply explicit deny policy on the compromise IAM user",
        type: "aws_iam",
        status: "completed",
        target: "arn:aws:iam::user/AdminLeak",
        severity: "critical"
      },
      {
        id: "pb4-act-2",
        step: 2,
        name: "Emergency Email To AWS Administrators",
        description: "Send compromise context and mitigation details directly to cloud engineers",
        type: "email",
        status: "completed",
        target: "aws-alerts@company.com",
        severity: "medium"
      }
    ]
  }
];

export function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(initialPlaybooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [triggerFilter, setTriggerFilter] = useState<"all" | "automated" | "manual">("all");

  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UTC Clock state
  const [systemTime, setSystemTime] = useState("");

  // Live event ticker state
  const [logsList, setLogsList] = useState<string[]>([
    "SEC_CORE: Active threat response loop initialized successfully. Frame ready.",
    "SURICATA_MONITOR: Standing by on WAN sub-interfaces. Rulesets synced (24,195 signatures).",
    "FUSION_NODE: Connecting local telemetry to Central Command. Engine ping: 2ms."
  ]);

  // Handle ticking system clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle active running security alerts event stream
  useEffect(() => {
    const eventsPool = [
      "AI_DETECTOR: Web anomaly score checked on /api/auth. Risk evaluation score: 0.14 [CLEAN]",
      "PFSENSE_FIREWALL: Syncing rules with dynamic cloud block alias table... OK",
      "AWS_CLOUD_TRAIL: Evaluated session role AWS_L1_SecOps token lifespan. Standing by.",
      "ZEEK_PARSER: Parsed 842 connection records. Anomaly index matches steady state parameters.",
      "AUTOMATION_RUNNER: Scheduled maintenance scan of high-severity playbooks... [0 errors found]",
      "SIEM_GATEWAY: Heartbeat sent to central enterprise controller. Standby operational: online.",
      "THREAT_INTEL: Pulled fresh reputation indicators from MITRE ATT&CK integration. Loaded.",
      "pfSense: Injected block list integrity verified. 14 Culprit IPs actively blocked."
    ];

    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * eventsPool.length);
      const timestamp = new Date().toISOString().substring(11, 19);
      const newEvent = `[${timestamp}] ${eventsPool[index]}`;
      
      setLogsList(prev => {
        const nextList = [...prev, newEvent];
        if (nextList.length > 5) {
          return nextList.slice(nextList.length - 5);
        }
        return nextList;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Toggle switch status handler
  const handleToggleStatus = (id: string, newStatus: "active" | "inactive") => {
    const timestampPool = ["Just now", "seconds ago", "Under evaluation"];
    const randomTime = timestampPool[Math.floor(Math.random() * timestampPool.length)];
    
    setPlaybooks(prev =>
      prev.map(pb => (pb.id === id ? { 
        ...pb, 
        status: newStatus, 
        updatedAt: "Just now",
        lastExecutedTime: newStatus === "active" ? randomTime : pb.lastExecutedTime
      } : pb))
    );

    const timestamp = new Date().toISOString().substring(11, 19);
    const playbookName = playbooks.find(p => p.id === id)?.name || "Playbook";
    setLogsList(prev => [
      ...prev,
      `[${timestamp}] SOAR_ENGINE: PLAYBOOK "${playbookName.toUpperCase()}" STATE MODIFIED TO [${newStatus.toUpperCase()}]`
    ].slice(-5));
  };

  // Double click or view detail
  const handleCardClick = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setIsModalOpen(true);
  };

  // Create Playbook click
  const handleCreateClick = () => {
    setSelectedPlaybook(null);
    setIsModalOpen(true);
  };

  // Save/Update playbook logic
  const handleSavePlaybook = (savedPlaybook: Playbook) => {
    setPlaybooks(prev => {
      const exists = prev.some(pb => pb.id === savedPlaybook.id);
      if (exists) {
        // Update existing & append metadata if needed
        return prev.map(pb => pb.id === savedPlaybook.id ? {
          ...pb,
          ...savedPlaybook,
          updatedAt: "Just now",
          lastExecutedTime: "Just now"
        } : pb);
      } else {
        // Create new
        return [savedPlaybook, ...prev];
      }
    });

    const timestamp = new Date().toISOString().substring(11, 19);
    setLogsList(prev => [
      ...prev,
      `[${timestamp}] PROVISIONER: SUCCESSFULLY DEPLOYED NESTED CONFIG MODEL FOR: "${savedPlaybook.name.toUpperCase()}"`
    ].slice(-5));

    setIsModalOpen(false);
  };

  const activePlaybooksCount = playbooks.filter(pb => pb.status === "active").length;
  const automatedPlaybooksCount = playbooks.filter(pb => pb.triggerType === "automated").length;
  const totalExecutions = playbooks.reduce((acc, pb) => acc + pb.executions, 0);

  return (
    <div className="space-y-6">
      {/* Decorative Top-level Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b border-border gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-blue-400 uppercase">
              SOAR COORDINATOR OPERATIONAL NODE
            </span>
          </div>
          <h2 className="text-2xl font-mono font-black text-foreground tracking-tight uppercase leading-none">
            DEFENCE REMEDIATION PLAYBOOKS
          </h2>
        </div>

        {/* Live System Time Telemetry readout */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-card border border-border rounded-lg px-4 py-2 font-mono text-right">
            <span className="text-[8px] font-black tracking-widest text-muted-foreground block uppercase mb-0.5">
              SYSTEM ENGINE CLOCK
            </span>
            <span className="text-xs font-bold text-cyan-550 dark:text-cyan-400">
              {systemTime || "WAITING FOR HEARTBEAT..."}
            </span>
          </div>
          <div className="h-8 bg-border w-px" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest bg-card border border-border px-3 py-2 rounded-lg">
            ORCH_SYS_V2.5
          </span>
        </div>
      </div>

      {/* Cyber stats row banner layout with visual design upgrades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-lg group hover:border-border/80 transition duration-305">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-blue-500/2 to-transparent pointer-events-none" />
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl relative z-10 shadow-inner">
            <Workflow className="w-5.5 h-5.5" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
              SOAR ENGINES ENGAGED
            </span>
            <span className="text-2xl font-black font-mono text-foreground leading-none block">
              {activePlaybooksCount} <strong className="text-muted-foreground/60 font-bold text-sm">/ {playbooks.length} TOTAL</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0 animate-pulse">
            LOAD: 12%
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-lg group hover:border-border/80 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-cyan-500/2to-transparent pointer-events-none" />
          <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-550 dark:text-cyan-400 rounded-xl relative z-10 shadow-inner">
            <Activity className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
              AUTOMATION DURATION RATIO
            </span>
            <span className="text-2xl font-black font-mono text-foreground leading-none block">
              {((automatedPlaybooksCount / playbooks.length) * 100).toFixed(0)}% <strong className="text-muted-foreground/60 font-bold text-xs uppercase font-mono">STAND-BY</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0">
            AUTO DISPATCH
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-lg group hover:border-border/80 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-emerald-500/2 to-transparent pointer-events-none" />
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-550 dark:text-emerald-400 rounded-xl relative z-10 shadow-inner">
            <PlayCircle className="w-5.5 h-5.5" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
              COMPLETED SEC REMEDIATIONS
            </span>
            <span className="text-2xl font-black font-mono text-foreground leading-none block">
              {totalExecutions} <strong className="text-muted-foreground/60 font-bold text-xs font-mono uppercase">RUN CHECKS</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0">
            SUCCESS: 100%
          </span>
        </div>
      </div>

      {/* Live active cybersecurity SOAR streams monitor console (EXECUTION & AUTOMATION FEEDBACK) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-2 mb-3.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-550 dark:text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-muted-foreground tracking-widest uppercase">
              LIVE CORE EXECUTOR AND THREAT AUDIT FEED STREAM
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
              POLLING SYSTEM METRIC LOGS ACTIVE
            </span>
          </div>
        </div>

        {/* Streaming Event Blocks */}
        <div className="space-y-2 bg-muted/30 p-3.5 rounded-lg border border-border max-h-35px overflow-y-auto custom-scrollbar font-mono text-[9px] uppercase tracking-wide">
          {logsList.map((log, id) => {
            let textColor = "text-muted-foreground";
            if (log.includes("[SUCCESS]") || log.includes("successfully") || log.includes("remediated")) {
              textColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 rounded";
            } else if (log.includes("critical") || log.includes("offender") || log.includes("Blocked")) {
              textColor = "text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 rounded";
            } else if (log.includes("AI_DETECTOR") || log.includes("FUSION_NODE")) {
              textColor = "text-cyan-600 dark:text-cyan-400/90";
            }

            return (
              <div key={id} className={`flex items-start gap-2 py-0.5 border-b border-border/10 ${textColor}`}>
                <span className="text-muted-foreground/40 font-bold shrink-0">&gt;&gt;</span>
                <span className="leading-normal">{log}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cyber filter control systems */}
      <PlaybookFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        triggerFilter={triggerFilter}
        onTriggerFilterChange={setTriggerFilter}
        onCreateClick={handleCreateClick}
      />

      {/* Playbook List components mapping */}
      <PlaybookList
        playbooks={playbooks}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        triggerFilter={triggerFilter}
        onCardClick={handleCardClick}
        onToggleStatus={handleToggleStatus}
      />

      {/* Warning/Manual explanation footnote */}
      <div className="bg-muted/10 border border-border rounded-xl p-4 flex items-start gap-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.03),transparent)] pointer-events-none" />
        <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-1.5 relative z-10">
          <span className="text-[9px] font-mono font-black tracking-widest text-muted-foreground uppercase block">
            SOAR DISPATCH SECURITY COMPLIANCE POLICY GUIDE
          </span>
          <p className="text-[10px] text-muted-foreground leading-normal uppercase">
            All playbooks with triggers classified under "automated" are initiated immediately by the correlation decision framework algorithms. Playbooks configured for "manual" are strictly accessible through local SECOPS operators inside the incident command center.
          </p>
        </div>
      </div>

      {/* Playbook creator & inspector workspace modal popup */}
      <PlaybookModal
        isOpen={isModalOpen}
        playbook={selectedPlaybook}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlaybook}
      />
    </div>
  );
}
