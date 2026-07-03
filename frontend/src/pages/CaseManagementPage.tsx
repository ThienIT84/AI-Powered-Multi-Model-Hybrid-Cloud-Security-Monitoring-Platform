import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { Case } from "../components/caseManagement/caseTypes";
import { CaseManagementHeader } from "../components/caseManagement/CaseManagementHeader";
import { CaseQueuePanel } from "../components/caseManagement/CaseQueuePanel";
import { CaseInvestigationPanel } from "../components/caseManagement/CaseInvestigationPanel";
import { CaseActionPanel } from "../components/caseManagement/CaseActionPanel";
import { Bell } from "lucide-react";
import { getCaseDetail, listCases, updateCase } from "../services/cases.service";
import { ErrorState, LoadingState, EmptyState } from "../components/common/DataState";
import { useAuth } from "../hooks/useAuth";

export function CaseManagementPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(params.id ?? null);
  const [alertNotification, setAlertNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  const loadCases = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await listCases();
      let merged = next;
      if (params.id && !next.some((item) => item.id === params.id)) {
        const detail = await getCaseDetail(params.id);
        if (detail) merged = [detail, ...next];
      }
      setCases(merged);
      setActiveCaseId((current) => params.id ?? current ?? merged[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Case records unavailable.");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Memoize assignees list to restrict unnecessary computations
  const assignees: string[] = useMemo(() => {
    return Array.from(
      new Set(cases.map((c) => c.assignedTo).filter((a): a is string => !!a))
    );
  }, [cases]);

  const handleUpdateCase = async (caseId: string, updates: Partial<Case>, persist?: () => Promise<Case>) => {
    const previous = cases;
    const current = cases.find((item) => item.id === caseId);
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, ...updates } : c)));
    try {
      const updated = persist ? await persist() : await updateCase(caseId, updates);
      setCases((prev) => prev.map((c) => (c.id === caseId ? updated : c)));
      if (updates.status && updates.status !== current?.status) {
        triggerToast(`Incident status updated to [${updates.status}]`);
      } else if (updates.assignedTo && updates.assignedTo !== current?.assignedTo) {
        triggerToast(`Delegated incident to: ${updates.assignedTo}`);
      } else if (updates.comments) {
        triggerToast(`Analyst comment logged in stream`);
      } else {
        triggerToast(`Incident record updated`);
      }
    } catch (err) {
      setCases(previous);
      triggerToast(`Case update failed: ${err instanceof Error ? err.message : "service unavailable"}`);
    }
  };

  const triggerToast = (msg: string) => {
    setAlertNotification(msg);
    setTimeout(() => {
      setAlertNotification(null);
    }, 3500);
  };

  const handleSelectCase = (caseId: string | null) => {
    setActiveCaseId(caseId);
    if (caseId) navigate(`/cases/${encodeURIComponent(caseId)}`);
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
      {isLoading && <LoadingState label="Loading case queue..." />}
      {error && <ErrorState label={error} onRetry={loadCases} />}
      {!isLoading && !error && filteredCases.length === 0 && <EmptyState label="No cases match the current filters." />}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full">
        {/* LEFT COMPONENT: Case List Queue (lg:col-span-4) */}
        <div className="lg:col-span-4 w-full flex flex-col h-fit">
          <CaseQueuePanel
            cases={filteredCases}
            selectedCaseId={activeCaseId}
            onSelectCase={handleSelectCase}
          />
        </div>

        {/* CENTER COMPONENT: Case Deep Forensic Investigation (lg:col-span-5) */}
        <div className="lg:col-span-5 w-full">
          <CaseInvestigationPanel activeCase={activeCase} />
        </div>

        {/* RIGHT COMPONENT: Playbooks status & IP Blocking actions (lg:col-span-3) */}
        <div className="lg:col-span-3 w-full">
          <CaseActionPanel activeCase={activeCase} onUpdateCase={handleUpdateCase} userRole={user?.role} />
        </div>
      </div>
    </motion.div>
  );
}

export default CaseManagementPage;
