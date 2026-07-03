import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlusCircle, X, ShieldCheck } from "lucide-react";
import { Playbook, PlaybookCategory, PlaybookUsageEvent } from "../components/playbooks/types";
import { MOCK_PLAYBOOKS, MOCK_USAGES } from "../components/playbooks/playbookMockData";

// NIST-aligned FCAJ Cloud Internship 2025 v3.0 Playbook Modules
import { PlaybooksHeader } from "../components/playbooks/PlaybooksHeader";
import { PlaybooksKPIs } from "../components/playbooks/PlaybooksKPIs";
import { ResponseProcedureLibrary } from "../components/playbooks/ResponseProcedureLibrary";
import { IncidentResponseWorkflow } from "../components/playbooks/IncidentResponseWorkflow";
import { PlaybookCoverageMatrix } from "../components/playbooks/PlaybookCoverageMatrix";
import { PlaybookEffectivenessCards } from "../components/playbooks/PlaybookEffectivenessCards";
import { PlaybookAdvisorPanel } from "../components/playbooks/PlaybookAdvisorPanel";
import { EvidencePackageSummary } from "../components/playbooks/EvidencePackageSummary";
import { PlaybookDetailDrawer } from "../components/playbooks/PlaybookDetailDrawer";
import { appConfig } from "../config";
import { DataModeNotice, EmptyState, ErrorState } from "../components/common/DataState";

export function PlaybooksPage() {
  // Master procedure database list state
  const [playbooks, setPlaybooks] = useState<Playbook[]>(MOCK_PLAYBOOKS);

  // Chronological usage log state
  const [usages, setUsages] = useState<PlaybookUsageEvent[]>(MOCK_USAGES);

  // Selection inspection target for standard detail drawer
  const [inspectedPlaybookId, setInspectedPlaybookId] = useState<string | null>("pb-sqli");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Creation overlay dialog visibility state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create Form interactive inputs state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<PlaybookCategory>("Web Attacks");
  const [newSeverity, setNewSeverity] = useState<Playbook["severity"]>("medium");
  const [newStatus, setNewStatus] = useState<Playbook["status"]>("Published");
  const [newPurpose, setNewPurpose] = useState("");
  const [newEstTime, setNewEstTime] = useState("20m");
  const [newOwner, setNewOwner] = useState("SOC Core Team");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3500);
  };

  // UTC system time ticker
  const [utcTime, setUtcTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const yr = now.getUTCFullYear();
      const mo = String(now.getUTCMonth() + 1).padStart(2, "0");
      const dy = String(now.getUTCDate()).padStart(2, "0");
      const hr = String(now.getUTCHours()).padStart(2, "0");
      const mi = String(now.getUTCMinutes()).padStart(2, "0");
      const se = String(now.getUTCSeconds()).padStart(2, "0");
      setUtcTime(`${yr}-${mo}-${dy} ${hr}:${mi}:${se} UTC`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handler for inspecting a playbook document from any element
  const handleInspectPlaybook = (id: string) => {
    setInspectedPlaybookId(id);
    setIsDrawerOpen(true);
  };

  // Handler for custom playbooks file import
  const handleImportPlaybook = (importedData: Record<string, unknown>) => {
    if (!importedData || typeof importedData !== "object") {
      showActionMessage("Invalid JSON data parsed during procedure import.");
      return;
    }

    // Check basic parameters mapping schema
    const requiredFields = ["name", "category", "severity", "purpose"];
    const missing = requiredFields.filter((f) => !importedData[f]);
    if (missing.length > 0) {
      showActionMessage(`Invalid Playbook schema. Missing key properties: ${missing.join(", ")}`);
      return;
    }

    const newId = `imported-${Date.now()}`;
    const importedPlaybook: Playbook = {
      id: newId,
      name: String(importedData.name),
      category: (importedData.category as PlaybookCategory) || "Web Attacks",
      severity: (importedData.severity as Playbook["severity"]) || "medium",
      version: String(importedData.version || "v1.0"),
      lastUpdated: new Date().toISOString().split("T")[0],
      status: (importedData.status as Playbook["status"]) || "Published",
      purpose: String(importedData.purpose),
      estimatedTime: String(importedData.estimatedTime || "20m"),
      owner: String(importedData.owner || "Imported Analyst Role"),
      detectionSources: Array.isArray(importedData.detectionSources) ? importedData.detectionSources : ["Imported Log Hook"],
      triageSteps: Array.isArray(importedData.triageSteps) ? importedData.triageSteps : ["Verify inbound vectors."],
      investigationSteps: Array.isArray(importedData.investigationSteps) ? importedData.investigationSteps : ["Check database transactions."],
      containmentProcedures: Array.isArray(importedData.containmentProcedures) ? importedData.containmentProcedures : ["Block source subnets."],
      eradicationProcedures: Array.isArray(importedData.eradicationProcedures) ? importedData.eradicationProcedures : ["Reset passwords."],
      recoveryProcedures: Array.isArray(importedData.recoveryProcedures) ? importedData.recoveryProcedures : ["Confirm system baselines."],
      lessonsLearnedTemplate: Array.isArray(importedData.lessonsLearnedTemplate) ? importedData.lessonsLearnedTemplate : ["Compile post-mortem logs."],
    };

    setPlaybooks((prev) => [importedPlaybook, ...prev]);

    // Prepend a usage action log
    const now = Date.now();
    const newUsageEvent: PlaybookUsageEvent = {
      id: `EV-I${now}`,
      timestamp: `${new Date().toISOString().replace("T", " ").substring(0, 19)} UTC`,
      playbookName: importedPlaybook.name,
      relatedCase: `CASE-${String(now).slice(-6)}`,
      analyst: "phutd0212@gmail.com",
      status: "APPLIED"
    };
    setUsages((prev) => [newUsageEvent, ...prev]);

    handleInspectPlaybook(newId);
  };

  // Submit and log new Playbook procedure documentation
  const handleCreatePlaybookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPurpose.trim()) return;

    const newId = `pb-u-${Date.now()}`;
    const generatedPlaybook: Playbook = {
      id: newId,
      name: newName,
      category: newCategory,
      severity: newSeverity,
      version: "v1.0",
      lastUpdated: new Date().toISOString().split("T")[0],
      status: newStatus,
      purpose: newPurpose,
      estimatedTime: newEstTime,
      owner: newOwner,
      detectionSources: [
        "SIEM gateway alerts",
        "Peripheral routing telemetry rulesets"
      ],
      triageSteps: [
        "Audit signature triggers inside local network registers.",
        "Check source parameters format schema mapping anomalies."
      ],
      investigationSteps: [
        "Identify and log compromised machine profiles.",
        "Decompress historical data frames from server clusters."
      ],
      containmentProcedures: [
        "Limit egress traffic on target destination ports.",
        "Insert micro-firewall drop rules isolating client workstations."
      ],
      eradicationProcedures: [
        "Purge unauthorized tasks and scripts from administrative repositories.",
        "Perform global password resets on compromised user names."
      ],
      recoveryProcedures: [
        "Validate database partition states.",
        "Reinstate standard network routing priorities."
      ],
      lessonsLearnedTemplate: [
        "Enforce strict least privilege access criteria.",
        "Optimize routing exception triggers."
      ]
    };

    setPlaybooks((prev) => [generatedPlaybook, ...prev]);

    // Trigger usage event log
    const newUsageEvent: PlaybookUsageEvent = {
      id: `EV-N${Date.now()}`,
      timestamp: `${new Date().toISOString().replace("T", " ").substring(0, 19)} UTC`,
      playbookName: generatedPlaybook.name,
      relatedCase: "CASE-INIT",
      analyst: "phutd0212@gmail.com",
      status: "ACTIVE"
    };
    setUsages((prev) => [newUsageEvent, ...prev]);

    setIsCreateModalOpen(false);

    // Reset fields
    setNewName("");
    setNewPurpose("");
    setNewEstTime("20m");
    setNewOwner("SOC Core Team");

    // Auto inspect
    handleInspectPlaybook(newId);
  };

  const inspectedPlaybook = playbooks.find((p) => p.id === inspectedPlaybookId) || playbooks[0];

  if (appConfig.dataMode === "live") {
    return (
      <motion.div
        key="playbooks-page-canvas"
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="space-y-6 pb-20 select-none relative"
        id="playbooks-workspace"
      >
        <PlaybooksHeader
          onOpenCreateModal={() => showActionMessage("Live playbook authoring requires backend playbook service.")}
          onImportTrigger={() => showActionMessage("Live playbook import requires backend playbook service.")}
          utcTime={utcTime}
        />
        <DataModeNotice mode={appConfig.dataMode} />
        <ErrorState label="Live playbook service is not connected." />
        <EmptyState label="Waiting for live playbook catalog and run history." />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="playbooks-page-canvas"
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="space-y-6 pb-20 select-none relative"
      id="playbooks-workspace"
    >
      {actionMessage && (
        <div className="fixed top-5 right-5 z-60 bg-card border border-amber-500/25 text-amber-500 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl">
          {actionMessage}
        </div>
      )}

      {/* 1. Page Header with actions & clock */}
      <PlaybooksHeader
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onImportTrigger={handleImportPlaybook}
        utcTime={utcTime}
      />

      {/* 2. Page KPI Metrics */}
      <PlaybooksKPIs playbooks={playbooks} />

      {/* 3. Playbook Effectiveness Dashboard */}
      <PlaybookEffectivenessCards />

      {/* 4. Main Split Structure Grid: Archive Tables & AI Matching Advisor */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch relative">
        {/* Core Catalog Registry Database Table */}
        <div className="xl:col-span-8">
          <ResponseProcedureLibrary
            playbooks={playbooks}
            selectedId={inspectedPlaybookId}
            onSelect={handleInspectPlaybook}
          />
        </div>

        {/* Playbook AI matching query advisory tool */}
        <div className="xl:col-span-4">
          <PlaybookAdvisorPanel />
        </div>
      </div>

      {/* 5. Incident Real-Time Evidence packet statistics */}
      <EvidencePackageSummary
        playbookId={inspectedPlaybookId}
        playbookName={inspectedPlaybook ? inspectedPlaybook.name : "None Selected"}
      />

      {/* 6. Incident Response Workflow template sequence */}
      <IncidentResponseWorkflow />

      {/* 7. Standardized Threat Response Coverage matrix */}
      <PlaybookCoverageMatrix />

      {/* Standard slide-out SOP details inspector drawer */}
      <PlaybookDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        playbook={inspectedPlaybook || null}
      />

      {/* CREATE WORKFLOW OVERLAY */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 transition-all cursor-pointer"
              id="modal-backdrop-overlay"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 sm:p-6 z-55 font-mono select-none"
              id="create-playbook-dialog"
            >
              {/* Modal Title */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <PlusCircle size={14} className="text-cyan-500 shrink-0" />
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider leading-none">
                    Log New Playbook Document
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 hover:text-rose-500 cursor-pointer transition-colors text-muted-foreground"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleCreatePlaybookSubmit} className="space-y-4 text-[9px]">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
                    Playbook Procedure Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., BRUTE FORCE MITIGATION WORKFLOW"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-cyan-500 rounded-lg text-[9px] text-foreground font-mono placeholder:text-muted-foreground/50 transition-all uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category select */}
                  <div className="space-y-1.5">
                    <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
                      Vector Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as PlaybookCategory)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-cyan-500 rounded-lg text-[9px] text-foreground font-mono outline-hidden cursor-pointer uppercase font-black"
                    >
                      <option value="Web Attacks">Web Attacks</option>
                      <option value="Network Attacks">Network Attacks</option>
                      <option value="Authentication Attacks">Authentication Attacks</option>
                      <option value="Cloud Security">Cloud Security</option>
                      <option value="Data Exposure">Data Exposure</option>
                      <option value="Malware">Malware</option>
                      <option value="Insider Threat">Insider Threat</option>
                    </select>
                  </div>

                  {/* Severity select */}
                  <div className="space-y-1.5">
                    <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
                      Incident Severity
                    </label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value as Playbook["severity"])}
                      className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-cyan-500 rounded-lg text-[9px] text-foreground font-mono outline-hidden cursor-pointer uppercase font-black"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Estimated SLA duration */}
                  <div className="space-y-1.5">
                    <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
                      Est. Duration SLA
                    </label>
                    <input
                      type="text"
                      required
                      value={newEstTime}
                      onChange={(e) => setNewEstTime(e.target.value)}
                      placeholder="e.g., 25m"
                      className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-cyan-500 rounded-lg text-[9px] text-foreground font-mono placeholder:text-muted-foreground/50 transition-all uppercase"
                    />
                  </div>

                  {/* Owner squad */}
                  <div className="space-y-1.5">
                    <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
                      Procedure Owner
                    </label>
                    <input
                      type="text"
                      required
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      placeholder="e.g., SecOps Core"
                      className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-cyan-500 rounded-lg text-[9px] text-foreground font-mono placeholder:text-muted-foreground/50 transition-all uppercase"
                    />
                  </div>
                </div>

                {/* Status selection */}
                <div className="space-y-1.5">
                  <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
                    Publication Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Playbook["status"])}
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-cyan-500 rounded-lg text-[9px] text-foreground font-mono outline-hidden cursor-pointer uppercase font-black"
                  >
                    <option value="Published">Published (Active)</option>
                    <option value="Draft">Draft (In Review)</option>
                  </select>
                </div>

                {/* Purpose text box */}
                <div className="space-y-1.5">
                  <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
                    Procedure Purpose & Outline Descriptions *
                  </label>
                  <textarea
                    required
                    placeholder="DEFINE THE GENERAL PURPOSES MAPPED TO THE PROTOCOL LIFECYCLE..."
                    rows={3}
                    value={newPurpose}
                    onChange={(e) => setNewPurpose(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-cyan-500 rounded-lg text-[9px] text-foreground font-mono placeholder:text-muted-foreground/50 transition-all uppercase h-20 resize-none leading-relaxed"
                  />
                </div>

                {/* Confirm actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-2 hover:bg-muted border border-transparent rounded-lg text-[8.5px] font-black cursor-pointer uppercase transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[8.5px] font-black uppercase tracking-wider shadow-sm cursor-pointer transition-colors"
                  >
                    Save Playbook Document
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
export default PlaybooksPage;
