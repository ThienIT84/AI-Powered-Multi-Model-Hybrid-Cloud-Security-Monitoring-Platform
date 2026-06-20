import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  MITRE_ALERT_MAPPINGS,
  MITRE_TECH_SUMMARIES,
} from "../components/mitre/mitreConfig";
import { MitreAlertMappingTable } from "../components/mitre/MitreAlertMappingTable";
import { MitreTechniqueSummary } from "../components/mitre/MitreTechniqueSummary";
import { FusionMitreMappingReference } from "../components/mitre/FusionMitreMappingReference";
import { TechniqueDetailDrawer } from "../components/mitre/TechniqueDetailDrawer";

export function MitreAttackPage() {
  const [alertMappings] = useState(MITRE_ALERT_MAPPINGS);
  const [summaries] = useState(MITRE_TECH_SUMMARIES);

  // Set initial selected technique ID to the first item in the summaries
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(
    summaries[0]?.techniqueId || null
  );

  // Derive active summary for the selected technique
  const activeSummary = useMemo(() => {
    if (!selectedTechniqueId) return null;
    return (
      summaries.find((s) => s.techniqueId === selectedTechniqueId) || null
    );
  }, [selectedTechniqueId, summaries]);

  // Filter alert mappings that match the currently selected technique ID
  const relatedAlerts = useMemo(() => {
    if (!selectedTechniqueId) return [];
    return alertMappings.filter(
      (a) => a.techniqueId === selectedTechniqueId
    );
  }, [selectedTechniqueId, alertMappings]);

  const handleSelectTechniqueId = (id: string) => {
    setSelectedTechniqueId(id);
  };

  return (
    <motion.div
      key="mitre-attack-mapping-center"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-5"
    >
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between pb-3.5 border-b border-border select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-mono font-black tracking-[0.25em] text-[#06b6d4] uppercase">
              FUSION LAYER CORRELATION CENTER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase leading-none">
            MITRE ATT&amp;CK MAPPING
          </h2>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            Fusion Alert Correlation &amp; Technique Mapping
          </p>
        </div>
      </div>

      {/* ── Top Layout Row: 3-column Grid side-by-side ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch w-full">
        {/* Column 1: Technique Summary List */}
        <MitreTechniqueSummary
          summaries={summaries}
          selectedTechniqueId={selectedTechniqueId}
          onSelectTechniqueId={handleSelectTechniqueId}
        />

        {/* Column 2: Policy translation code reference */}
        <FusionMitreMappingReference />

        {/* Column 3: Selected dynamic detail examiner drawer */}
        <TechniqueDetailDrawer
          techniqueId={selectedTechniqueId}
          techniqueName={activeSummary ? activeSummary.techniqueName : "Unknown Technique"}
          tactic={activeSummary ? activeSummary.tactic : "Unknown Tactic"}
          detectionSources={activeSummary ? activeSummary.detectionSources : []}
          relatedAlerts={relatedAlerts}
        />
      </div>

      {/* ── Bottom Layout Row: Full Width Alert Mapping Table ── */}
      <div className="w-full">
        <MitreAlertMappingTable
          alerts={alertMappings}
          selectedTechniqueId={selectedTechniqueId}
          onSelectTechniqueId={handleSelectTechniqueId}
        />
      </div>
    </motion.div>
  );
}

export default MitreAttackPage;
