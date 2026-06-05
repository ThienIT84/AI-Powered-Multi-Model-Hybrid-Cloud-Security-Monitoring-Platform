import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Playbook } from "../components/playbooks/playbooksConfig";
import { 
  initialPlaybooks, 
  mockIncidents as initialIncidents, 
  MockIncident 
} from "../components/playbooks/playbookMockData";

// Modular Sub-sections imports in FCAJ playbooks page
import { HeaderSection } from "../components/playbooks/HeaderSection";
import { HeroStatsGrid } from "../components/playbooks/HeroStatsGrid";
import { WorkspaceTab } from "../components/playbooks/WorkspaceTab";
import { LibraryTab } from "../components/playbooks/LibraryTab";
import { AnalyticsTab } from "../components/playbooks/AnalyticsTab";
import { InspectorDialog } from "../components/playbooks/InspectorDialog";

export function PlaybooksPage() {
  // Navigation Tabs state: overview, workspace, analytics
  const [activeTab, setActiveTab] = useState<"overview" | "workspace" | "analytics">("workspace");

  // Playbook Library state
  const [playbooks, setPlaybooks] = useState<Playbook[]>(initialPlaybooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [layoutStyle, setLayoutStyle] = useState<"grid" | "table">("grid");
  
  // MITRE Matrix State - technique filter matching
  const [selectedMitreId, setSelectedMitreId] = useState<string | null>(null);

  // SOC Workspace state
  const [incidents, setIncidents] = useState<MockIncident[]>(initialIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidents[0]?.id || "INC-9011");
  const [terminalLogs, setTerminalLogs] = useState<{ [incidentId: string]: string[] }>({
    "INC-9011": [
      "[10:20:15] [ALERT_INGRESS] Detected raw packet payload targeting authentication gateway.",
      "[10:20:15] [AI_ENGINE] Deep evaluation: XSS confidence 98.2%. Severity level set to Critical.",
      "[10:20:16] [FUSION_LAYER] Aggregating Zeek http.log and Suricata Alert. Consensus achieved.",
      "[10:20:16] [STANDBY] Ready for SOC Analyst investigation protocols."
    ]
  });

  // Playbook detail modal state
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<"general" | "detection" | "steps" | "history">("general");

  // Attack Campaign selected
  const [campaignId, setCampaignId] = useState("camp-1");

  // UTC master clock time tracker ticker state
  const [utcTime, setUtcTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, "0");
      const day = String(now.getUTCDate()).padStart(2, "0");
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const mins = String(now.getUTCMinutes()).padStart(2, "0");
      const secs = String(now.getUTCSeconds()).padStart(2, "0");
      setUtcTime(`${year}-${month}-${day} ${hours}:${mins}:${secs} UTC`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Open detailed playbook workbook modal dialog
  const inspectPlaybook = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setModalActiveTab("general");
    setIsModalOpen(true);
  };

  return (
    <motion.div
      key="playbooks"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6 pb-20 select-none relative"
      id="playbooks-page-container"
    >
      
      {/* TOP SCRAWLER TITLE & LIVE COORDINATES CLOCK */}
      <HeaderSection 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        utcTime={utcTime} 
      />

      {/* METRICS COUNTER TILES INDICATOR */}
      <HeroStatsGrid 
        playbooks={playbooks} 
        incidents={incidents} 
      />

      {/* CORE INTERACTIVE WRAPPER SECTIONS */}
      <div className="mt-2">
        {activeTab === "workspace" && (
          <WorkspaceTab
            incidents={incidents}
            setIncidents={setIncidents}
            selectedIncidentId={selectedIncidentId}
            setSelectedIncidentId={setSelectedIncidentId}
            terminalLogs={terminalLogs}
            setTerminalLogs={setTerminalLogs}
          />
        )}

        {activeTab === "overview" && (
          <LibraryTab
            playbooks={playbooks}
            setPlaybooks={setPlaybooks}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
            layoutStyle={layoutStyle}
            setLayoutStyle={setLayoutStyle}
            selectedMitreId={selectedMitreId}
            setSelectedMitreId={setSelectedMitreId}
            inspectPlaybook={inspectPlaybook}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab
            campaignId={campaignId}
            setCampaignId={setCampaignId}
          />
        )}
      </div>

      {/* POPUP COGNITIVE WORKSPACE INTERACTIVE MODAL */}
      <InspectorDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlaybook={selectedPlaybook}
        modalActiveTab={modalActiveTab}
        setModalActiveTab={setModalActiveTab}
      />

    </motion.div>
  );
}
