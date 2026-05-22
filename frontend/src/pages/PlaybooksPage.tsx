import React, { useState } from "react";
import { Playbook, PlaybookAction } from "../components/playbooks/playbooksConfig";
import { PlaybookFilters } from "../components/playbooks/PlaybookFilters";
import { PlaybookList } from "../components/playbooks/PlaybookList";
import { PlaybookModal } from "../components/playbooks/PlaybookModal";
import { 
  Terminal, 
  Workflow, 
  PlayCircle, 
  Settings, 
  Activity, 
  CheckCircle,
  HelpCircle
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
    actions: [
      {
        id: "pb1-act-1",
        step: 1,
        name: "Virtual Subnet Connection Severance",
        description: "Call AWS EC2 API to disconnect network interfaces from production subnets",
        type: "isolate",
        status: "completed"
      },
      {
        id: "pb1-act-2",
        step: 2,
        name: "Slack Incident Response Dispatcher",
        description: "Send isolation reports and payload logs to the #critical-soc-responses channel",
        type: "slack",
        status: "completed"
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
    actions: [
      {
        id: "pb2-act-1",
        step: 1,
        name: "pfSense Firewall Alias Block List Injector",
        description: "Inject offender IP into firewall block dynamic lists (Alias Block List)",
        type: "firewall",
        status: "completed"
      },
      {
        id: "pb2-act-2",
        step: 2,
        name: "Jira Threat Tracking Ticket Creator",
        description: "Generate automatically an incident response ticket inside Jira Software for SOC L1 analysts",
        type: "jira",
        status: "completed"
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
    actions: [
      {
        id: "pb3-act-1",
        step: 1,
        name: "Broadcast Alerts on WebSec Teams",
        description: "Send alert payload logs to targeted DevSecOps communication rooms",
        type: "slack",
        status: "completed"
      },
      {
        id: "pb3-act-2",
        step: 2,
        name: "Urgent Incident Board Registration",
        description: "Automatically log incident details inside custom project boards",
        type: "jira",
        status: "completed"
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
    actions: [
      {
        id: "pb4-act-1",
        step: 1,
        name: "AWS Temporal Session Access Invalidation",
        description: "Deactivate leaked credentials and apply explicit deny policy on the compromise IAM user",
        type: "aws_iam",
        status: "completed"
      },
      {
        id: "pb4-act-2",
        step: 2,
        name: "Emergency Email To AWS Administrators",
        description: "Send compromise context and mitigation details directly to cloud engineers",
        type: "email",
        status: "completed"
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

  // Toggle switch status handler
  const handleToggleStatus = (id: string, newStatus: "active" | "inactive") => {
    setPlaybooks(prev =>
      prev.map(pb => (pb.id === id ? { ...pb, status: newStatus, updatedAt: "Just now" } : pb))
    );
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
        // Update existing
        return prev.map(pb => pb.id === savedPlaybook.id ? savedPlaybook : pb);
      } else {
        // Create new
        return [savedPlaybook, ...prev];
      }
    });
    setIsModalOpen(false);
  };

  const activePlaybooksCount = playbooks.filter(pb => pb.status === "active").length;
  const automatedPlaybooksCount = playbooks.filter(pb => pb.triggerType === "automated").length;
  const totalExecutions = playbooks.reduce((acc, pb) => acc + pb.executions, 0);

  return (
    <div className="space-y-6">
      {/* Playbook Header Title Spec */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.25em] text-blue-500 uppercase">
              SOAR ORCHESTRATION ENGINE
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none">
            Automated Response Playbooks (SOAR)
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 bg-slate-800 w-px" />
          <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest bg-slate-900 border border-slate-850 px-2.5 py-1 rounded">
            SOAR_CORE_V2.1
          </span>
        </div>
      </div>

      {/* SOAR Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase block mb-1">
              Active Playbooks
            </span>
            <span className="text-xl font-black font-mono text-white">
              {activePlaybooksCount} <strong className="text-slate-500 font-medium text-xs">/ {playbooks.length} TOTAL</strong>
            </span>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase block mb-1">
              Automated Flow Ratio
            </span>
            <span className="text-xl font-black font-mono text-white">
              {((automatedPlaybooksCount / playbooks.length) * 100).toFixed(0)}% <strong className="text-slate-500 font-medium text-xs">AUTOMATED</strong>
            </span>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase block mb-1">
              Total SOAR Actions Fired
            </span>
            <span className="text-xl font-black font-mono text-white">
              {totalExecutions} <strong className="text-slate-500 font-medium text-xs font-mono">FIRES RUN</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Component bar */}
      <PlaybookFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        triggerFilter={triggerFilter}
        onTriggerFilterChange={setTriggerFilter}
        onCreateClick={handleCreateClick}
      />

      {/* Playbook List Grid Render */}
      <PlaybookList
        playbooks={playbooks}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        triggerFilter={triggerFilter}
        onCardClick={handleCardClick}
        onToggleStatus={handleToggleStatus}
      />

      {/* System Warning/Notice Box */}
      <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/80 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase block">
            SOAR Orchestration System Guide
          </span>
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
            Automated playbooks are triggered directly from the Fusion Layer AI decision framework. To execute playbooks manually, administrators can set the trigger type to "Manual Only" in the configurations tab.
          </p>
        </div>
      </div>

      {/* Interactive Creation/Edit Playbook Modal */}
      <PlaybookModal
        isOpen={isModalOpen}
        playbook={selectedPlaybook}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlaybook}
      />
    </div>
  );
}
