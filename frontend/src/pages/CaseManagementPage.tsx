import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Case } from "../components/caseManagement/caseTypes";
import { CaseManagementHeader } from "../components/caseManagement/CaseManagementHeader";
import { CaseQueuePanel } from "../components/caseManagement/CaseQueuePanel";
import { CaseInvestigationPanel } from "../components/caseManagement/CaseInvestigationPanel";
import { CaseActionPanel } from "../components/caseManagement/CaseActionPanel";
import { Bell } from "lucide-react";
import { DataMode } from "../config";
import { DataModeBanner } from "../components/common/DataModeBanner";
import { casesService } from "../services/cases.service";

interface CaseManagementPageProps {
  dataMode: DataMode;
  routeCaseId?: string | null;
  onRouteCaseChange?: (caseId: string | null) => void;
}

export function CaseManagementPage({ dataMode, routeCaseId, onRouteCaseChange }: CaseManagementPageProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(routeCaseId ?? null);
  const [alertNotification, setAlertNotification] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    casesService.listCases(dataMode)
      .then((items) => {
        if (!isMounted) return;
        setCases(items);
        const nextActive = routeCaseId ?? items[0]?.id ?? null;
        setActiveCaseId(nextActive);
        if (nextActive) onRouteCaseChange?.(nextActive);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load cases");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [dataMode, onRouteCaseChange, routeCaseId]);

  useEffect(() => {
    if (routeCaseId) setActiveCaseId(routeCaseId);
  }, [routeCaseId]);

  const selectCase = (caseId: string | null) => {
    setActiveCaseId(caseId);
    onRouteCaseChange?.(caseId);
  };

  // Memoize assignees list to restrict unnecessary computations
  const assignees: string[] = useMemo(() => {
    return Array.from(
      new Set(cases.map((c) => c.assignedTo).filter((a): a is string => !!a))
    );
  }, [cases]);

  const handleUpdateCase = async (caseId: string, updates: Partial<Case>) => {
    const previousCases = cases;
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
    try {
      await casesService.updateCase(caseId, updates, dataMode);
    } catch (error) {
      setCases(previousCases);
      triggerToast(error instanceof Error ? error.message : "Case update failed");
    }
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
      <DataModeBanner dataMode={dataMode} label="Case records are replay data" />
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-500">
        Case API state is process-local: it is not shared across EC2 instances and disappears when the backend process restarts. Final Alerts are stored separately in RDS.
      </div>
      {isLoading && (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Loading cases...
        </div>
      )}
      {loadError && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500">
          {loadError}
        </div>
      )}
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
            onSelectCase={selectCase}
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
