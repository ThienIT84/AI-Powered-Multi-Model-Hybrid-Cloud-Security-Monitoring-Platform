import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Case, CaseStatus, CaseSeverity } from "../components/caseManagement/caseTypes";
import { INITIAL_CASES } from "../components/caseManagement/caseDataMock";
import { CaseManagementHeader } from "../components/caseManagement/CaseManagementHeader";
import { CaseQueuePanel } from "../components/caseManagement/CaseQueuePanel";
import { CaseInvestigationPanel } from "../components/caseManagement/CaseInvestigationPanel";
import { CaseActionPanel } from "../components/caseManagement/CaseActionPanel";
import { Bell } from "lucide-react";

// Robust mapping of raw real-time socket alert items into our strict Case schema
function mapAlertToCase(alert: any): Case {
  const attackType = alert.attackType || "Unclassified Port Anomaly";
  const rawSev = alert.severity;
  const severity: CaseSeverity = (rawSev === "Critical" || rawSev === "High" || rawSev === "Medium" || rawSev === "Low")
    ? rawSev
    : "Medium";
  const rawStatus = alert.status;
  const status: CaseStatus = (rawStatus === "Open" || rawStatus === "In Progress" || rawStatus === "Resolved" || rawStatus === "Pending Review")
    ? rawStatus
    : "Open";

  const connLog = [
    `${alert.timestamp} - duration: ${alert.zeekData?.duration || "0.45s"}, conn_state: ${alert.zeekData?.connState || "SF"}, orig_bytes: ${alert.zeekData?.origBytes || 30120}`
  ];
  
  const httpLog = alert.payload ? [
    `METHOD: POST | URI: /auth/gateway | PAYLOAD: ${alert.payload}`
  ] : undefined;

  const signatures = alert.suricataData?.signatureId 
    ? [`SID: ${alert.suricataData.signatureId} - Threat pattern category match: ${alert.suricataData.category || "Initial Reconnaissance"}`]
    : ["SID: [1:201043:2] L7 malicious signature triggered inside internal subnet"];

  const events = alert.timeline?.map((item: any) => `${item.timestamp} - ${item.description}`) || [
    `${alert.timestamp} - Automated threat parser parsed packet sequence.`
  ];

  return {
    id: alert.id || `CASE-${Date.now().toString().slice(-4)}`,
    title: alert.description || `Suspicious ${attackType} footprint observed`,
    severity,
    status,
    assignedTo: alert.assignedAnalyst || undefined,
    timestamp: alert.timestamp || new Date().toISOString(),
    source_ip: alert.sourceIp || "192.168.1.1",
    destination_ip: alert.destIp || "10.0.12.15",
    attack_type: attackType,
    zeek: {
      conn_log: connLog,
      http_log: httpLog,
      flows: Math.floor(Math.random() * 80) + 20
    },
    detection: {
      ai1: {
        label: parseFloat(alert.aiDecision?.ai1 || "0.5") > 0.75 ? "ANOMALY" : "NORMAL",
        score: parseFloat(alert.aiDecision?.ai1 || "0.62")
      },
      ai2a: {
        class: alert.aiDecision?.ai2a || attackType,
        confidence: Math.round((alert.confidence || 0.88) * 100)
      },
      ai2b: alert.aiDecision?.ai2b ? {
        class: alert.aiDecision?.ai2b,
        confidence: Math.round((alert.confidence || 0.82) * 100)
      } : undefined
    },
    suricata: {
      signatures
    },
    timeline: {
      events
    },
    comments: [],
    isIpBlocked: false,
    notes: "Dynamic network telemetry stream record."
  };
}

export function CaseManagementPage() {
  const [cases, setCases] = useState<Case[]>(INITIAL_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(INITIAL_CASES[0]?.id || null);
  const [alertNotification, setAlertNotification] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  // WebSocket Integration - Highly Scoped updating of Case Queue only
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const socket = new WebSocket(`${protocol}//${host}`);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "NEW_ALERT") {
          const newCase = mapAlertToCase(message.data);
          
          setCases((prev) => {
            // Guarantee no duplicates
            if (prev.some((c) => c.id === newCase.id)) {
              return prev;
            }
            // Keep queue clean, capped at 60 entries
            return [newCase, ...prev].slice(0, 60);
          });

          // Post brief non-disruptive feedback regarding incoming logs
          triggerToast(`Real-time telemetry event registered: ${newCase.id}`);
        }
      } catch (err) {
        console.warn("Scoped SOC WebSocket frame decoding skipped", err);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  // Memoize assignees list to restrict unnecessary computations
  const assignees: string[] = useMemo(() => {
    return Array.from(
      new Set(cases.map((c) => c.assignedTo).filter((a): a is string => !!a))
    );
  }, [cases]);

  const handleUpdateCase = (caseId: string, updates: Partial<Case>) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          if (updates.status && updates.status !== c.status) {
            triggerToast(`Incident status updated to [${updates.status}]`);
          } else if (updates.assignedTo && updates.assignedTo !== c.assignedTo) {
            triggerToast(`Delegated incident to: ${updates.assignedTo}`);
          } else if (updates.isIpBlocked !== undefined && updates.isIpBlocked !== c.isIpBlocked) {
            triggerToast(
              updates.isIpBlocked
                ? `Global firewall block rule active on source host IP`
                : `Gateway firewall rule removed`
            );
          } else if (updates.comments) {
            triggerToast(`Analyst comment logged in stream`);
          } else {
            triggerToast(`Incident record updated`);
          }
          return { ...c, ...updates };
        }
        return c;
      })
    );
  };

  const triggerToast = (msg: string) => {
    setAlertNotification(msg);
    setTimeout(() => {
      setAlertNotification(null);
    }, 3500);
  };

  // Export as JSON action
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cases, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `comprehensive_workspace_dump_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Audit logs packet exported successfully");
  };

  // Filter pipeline execution
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Search Query filter (ID, Title, IPs, Attack Category)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const match =
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.source_ip.includes(q) ||
          c.destination_ip.includes(q) ||
          c.attack_type.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Severity Filter
      if (severityFilter !== "ALL" && c.severity !== severityFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== "ALL" && c.status !== statusFilter) {
        return false;
      }

      // 4. Assignee Filter
      if (assigneeFilter !== "ALL") {
        if (assigneeFilter === "UNASSIGNED") {
          if (c.assignedTo !== undefined) return false;
        } else if (c.assignedTo !== assigneeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [cases, searchQuery, severityFilter, statusFilter, assigneeFilter]);

  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === activeCaseId) || null;
  }, [cases, activeCaseId]);

  return (
    <motion.div
      key="case-management-workspace"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-4 pb-16 select-none relative w-full"
    >
      {/* Toast alert system banner */}
      <AnimatePresence>
        {alertNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-200 max-w-sm border border-border text-[9.5px] font-black uppercase tracking-widest text-[#06b6d4] bg-[#020617]/95 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono"
          >
            <Bell size={13} className="text-cyan-500 animate-bounce shrink-0" />
            <span>{alertNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. COMPACT FILTER HEADER */}
      <CaseManagementHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        onExport={handleExport}
        assignees={assignees}
      />

      {/* 2. THREE-PANEL INCIDENT LIFECYCLE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full">
        {/* LEFT COMPONENT: Case List Queue (lg:col-span-4) */}
        <div className="lg:col-span-4 w-full flex flex-col h-fit">
          <CaseQueuePanel
            cases={filteredCases}
            selectedCaseId={activeCaseId}
            onSelectCase={setActiveCaseId}
          />
        </div>

        {/* CENTER COMPONENT: Case Deep Forensic Investigation (lg:col-span-5) */}
        <div className="lg:col-span-5 w-full">
          <CaseInvestigationPanel activeCase={activeCase} />
        </div>

        {/* RIGHT COMPONENT: Playbooks status & IP Blocking actions (lg:col-span-3) */}
        <div className="lg:col-span-3 w-full">
          <CaseActionPanel activeCase={activeCase} onUpdateCase={handleUpdateCase} />
        </div>
      </div>
    </motion.div>
  );
}

export default CaseManagementPage;
