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
    name: "AUTO-ISOLATE COMPROMISED EC2",
    description: "AUTOMATICALLY ISOLATE COMPROMISED EC2 INSTANCES BY DISCONNECTING VPC SUBNETS WHEN AI DETECTS HIGH ANOMALY SCORES IN ZEEK TRAFFIC LOGS.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "AI ANOMALY SCORE OF ZEEK RECORDS > 0.88",
    executions: 124,
    updatedAt: "3 hours ago",
    severity: "critical",
    avgDurationMs: 123,
    confidenceThreshold: 92,
    riskScoreThreshold: 88,
    lastExecutionStatus: "success",
    lastExecutedTime: "3 HOURS AGO",
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
    name: "BLOCK BRUTE FORCE IP VIA PFSENSE",
    description: "DETECT SYSTEMATIC CREDENTIAL BRUTE FORCE AND AUTOMATICALLY BLOCK CULPRIT SOURCE IPS IN THE PFSENSE FIREWALL RULE TABLE USING SURICATA ALERT DETAILS.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "SURICATA SIGNATURE CATEGORY === BRUTE FORCE",
    executions: 312,
    updatedAt: "1 day ago",
    severity: "high",
    avgDurationMs: 84,
    confidenceThreshold: 90,
    riskScoreThreshold: 80,
    lastExecutionStatus: "success",
    lastExecutedTime: "1 DAY AGO",
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
    name: "SLACK ALERT & CRITICAL INCIDENT CREATION",
    description: "IDENTIFY REMOTE CODE EXECUTION OR SQL INJECTION EXPLOITS AND NOTIFY SECOPS TEAMS INSTANTLY VIA SLACK WHILE LOGGING INCIDENTS INSIDE INTERNAL SOC TICKETS.",
    status: "inactive",
    triggerType: "automated",
    triggerCondition: "AI2B WEB ATTACK CONFIDENCE SCORE > 0.95",
    executions: 45,
    updatedAt: "4 days ago",
    severity: "medium",
    avgDurationMs: 142,
    confidenceThreshold: 95,
    riskScoreThreshold: 75,
    lastExecutionStatus: "warning",
    lastExecutedTime: "4 DAYS AGO",
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
    name: "REVOKE LEAKED AWS IAM SESSION",
    description: "REVOKE ACTIVE TEMPORAL TOKENS AND BLOCK CREDENTIAL ACCESS IMMEDIATELY UPON DETECTION OF ANOMALOUS AWS ACTIVITY.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "AWS CLOUDTRAIL ANOMALIES DETECTED BY AI OPTIMIZER",
    executions: 18,
    updatedAt: "Just now",
    severity: "high",
    avgDurationMs: 115,
    confidenceThreshold: 92,
    riskScoreThreshold: 82,
    lastExecutionStatus: "success",
    lastExecutedTime: "JUST NOW",
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

  // Auto Scroll state for terminal logs
  const [autoScroll, setAutoScroll] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Live event ticker state
  const [logsList, setLogsList] = useState<string[]>([
    "SEC_CORE: ACTIVE THREAT RESPONSE LOOP INITIALIZED SUCCESSFULLY. FRAME READY.",
    "SURICATA_MONITOR: STANDBY ON WAN SUB-INTERFACES. RULESETS SYNCED (24,195 SIGNATURES).",
    "FUSION_NODE: CONNECTING LOCAL TELEMETRY TO CENTRAL COMMAND. ENGINE PING: 2MS.",
    "[03:59:20] THREAT_INTEL: PULLED FRESH REPUTATION INDICATORS FROM MITRE ATT&CK INTEGRATION. LOADED."
  ]);

  // Handle ticking system clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // format: 2026-05-29 03:59:27 UTC
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, "0");
      const day = String(now.getUTCDate()).padStart(2, "0");
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      setSystemTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Stateful scroll posture keeper
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logsList, autoScroll]);

  // Handle active running security alerts event stream
  useEffect(() => {
    const eventsPool = [
      "AI_DETECTOR: WEB ANOMALY SCORE CHECKED ON /API/AUTH. RISK EVALUATION SCORE: 0.14 [CLEAN]",
      "PFSENSE_FIREWALL: SYNCING RULES WITH DYNAMIC CLOUD BLOCK ALIAS TABLE... OK",
      "AWS_CLOUD_TRAIL: EVALUATED SESSION ROLE AWS_L1_SECOPS TOKEN LIFESPAN. STANDBY.",
      "ZEEK_PARSER: PARSED 842 CONNECTION RECORDS. ANOMALY INDEX MATCHES STEADY STATE PARAMETERS.",
      "AUTOMATION_RUNNER: SCHEDULED MAINTENANCE SCAN OF HIGH-SEVERITY PLAYBOOKS... [0 ERRORS FOUND]",
      "SIEM_GATEWAY: HEARTBEAT SENT TO CENTRAL ENTERPRISE CONTROLLER. STANDBY OPERATIONAL: ONLINE.",
      "THREAT_INTEL: PULLED FRESH REPUTATION INDICATORS FROM MITRE ATT&CK INTEGRATION. LOADED.",
      "PFSENSE: INJECTED BLOCK LIST INTEGRITY VERIFIED. 14 CULPRIT IPS ACTIVELY BLOCKED."
    ];

    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * eventsPool.length);
      const now = new Date();
      const timestamp = String(now.getUTCHours()).padStart(2, "0") + ":" + 
                        String(now.getUTCMinutes()).padStart(2, "0") + ":" + 
                        String(now.getUTCSeconds()).padStart(2, "0");
      const newEvent = `[${timestamp}] ${eventsPool[index]}`;
      
      setLogsList(prev => {
        const nextList = [...prev, newEvent];
        if (nextList.length > 8) {
          return nextList.slice(nextList.length - 8);
        }
        return nextList;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Toggle switch status handler
  const handleToggleStatus = (id: string, newStatus: "active" | "inactive") => {
    const timestampPool = ["JUST NOW", "SECONDS AGO", "UNDER EVALUATION"];
    const randomTime = timestampPool[Math.floor(Math.random() * timestampPool.length)];
    
    setPlaybooks(prev =>
      prev.map(pb => (pb.id === id ? { 
        ...pb, 
        status: newStatus, 
        updatedAt: "JUST NOW",
        lastExecutedTime: newStatus === "active" ? randomTime : pb.lastExecutedTime
      } : pb))
    );

    const now = new Date();
    const timestamp = String(now.getUTCHours()).padStart(2, "0") + ":" + 
                      String(now.getUTCMinutes()).padStart(2, "0") + ":" + 
                      String(now.getUTCSeconds()).padStart(2, "0");
    const playbookName = playbooks.find(p => p.id === id)?.name || "Playbook";
    setLogsList(prev => [
      ...prev,
      `[${timestamp}] SOAR_ENGINE: PLAYBOOK "${playbookName.toUpperCase()}" STATE MODIFIED TO [${newStatus.toUpperCase()}]`
    ].slice(-8));
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
          updatedAt: "JUST NOW",
          lastExecutedTime: "JUST NOW"
        } : pb);
      } else {
        // Create new
        return [savedPlaybook, ...prev];
      }
    });

    const now = new Date();
    const timestamp = String(now.getUTCHours()).padStart(2, "0") + ":" + 
                      String(now.getUTCMinutes()).padStart(2, "0") + ":" + 
                      String(now.getUTCSeconds()).padStart(2, "0");
    setLogsList(prev => [
      ...prev,
      `[${timestamp}] PROVISIONER: SUCCESSFULLY DEPLOYED NESTED CONFIG MODEL FOR: "${savedPlaybook.name.toUpperCase()}"`
    ].slice(-8));

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
              SOAR COORDINATOR OPERATIONAL NODE / DEFENCE REMEDIATION PLAYBOOKS
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
              {systemTime || "2026-05-29 03:59:27 UTC"} <span className="text-muted-foreground/35">|</span> ORCH_SYS_V2.5
            </span>
          </div>
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
              {activePlaybooksCount} <strong className="text-muted-foreground/60 font-bold text-sm">/ {playbooks.length} ACTIVE</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0 animate-pulse">
            LOAD: 12%
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-lg group hover:border-border/80 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-cyan-500/2 to-transparent pointer-events-none" />
          <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-550 dark:text-cyan-400 rounded-xl relative z-10 shadow-inner">
            <Activity className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
              AUTOMATION DURATION RATIO
            </span>
            <span className="text-2xl font-black font-mono text-foreground leading-none block">
              100% <strong className="text-muted-foreground/60 font-bold text-xs uppercase font-mono">STANDBY</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0">
            AUTO DISPATCH ENABLED
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-lg group hover:border-border/80 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-emerald-500/2 to-transparent pointer-events-none" />
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-550 dark:text-emerald-400 rounded-xl relative z-10 shadow-inner">
            <PlayCircle className="w-5.5 h-5.5" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
              COMPLETED REMEDIATIONS
            </span>
            <span className="text-2xl font-black font-mono text-foreground leading-none block">
              {totalExecutions} <strong className="text-muted-foreground/60 font-bold text-xs font-mono uppercase">RUN CHECKS</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0">
            SUCCESS RATE: 100%
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
          <div className="flex items-center gap-3">
            {/* Scroll control button */}
            <button
              onClick={() => setAutoScroll(prev => !prev)}
              className={`px-2 py-0.5 rounded text-[8px] font-mono font-black transition-all border tracking-wider select-none ${
                autoScroll 
                  ? "bg-cyan-500/15 text-cyan-500 border-cyan-500/30 dark:text-cyan-400" 
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              AUTO SCROLL: {autoScroll ? "ON" : "OFF"}
            </button>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />
              <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
                POLLING SYSTEM METRIC LOGS ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Streaming Event Blocks */}
        <div 
          ref={logsContainerRef}
          className="space-y-2 bg-muted/30 p-3.5 rounded-lg border border-border max-h-35 overflow-y-auto custom-scrollbar font-mono text-[9px] uppercase tracking-wide scroll-smooth"
        >
          {logsList.map((log, id) => {
            let textColor = "text-muted-foreground/80 dark:text-muted-foreground/90";
            if (log.includes("[SUCCESS]") || log.includes("successfully") || log.includes("remediated") || log.includes("SUCCESSFULLY")) {
              textColor = "text-emerald-700 dark:text-emerald-450 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10";
            } else if (log.includes("critical") || log.includes("offender") || log.includes("Blocked") || log.includes("MODIFIED")) {
              textColor = "text-rose-700 dark:text-rose-450 font-bold bg-rose-500/5 px-1.5 py-0.5 rounded border border-rose-500/10";
            } else if (log.includes("AI_DETECTOR") || log.includes("FUSION_NODE") || log.includes("THREAT_INTEL")) {
              textColor = "text-cyan-700 dark:text-cyan-455 font-bold";
            }

            return (
              <div key={id} className={`flex items-start gap-2 py-0.5 border-b border-border/5 ${textColor}`}>
                <span className="text-muted-foreground/45 font-bold shrink-0">&gt;&gt;</span>
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
          <p className="text-[10px] text-muted-foreground leading-normal font-medium first-letter:uppercase">
            Automated playbooks are executed instantly by correlation engine. Manual playbooks require SOC operator approval inside incident console.
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
