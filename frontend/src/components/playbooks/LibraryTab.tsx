import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Search, 
  X, 
  Filter, 
  ShieldAlert, 
  Grid, 
  List 
} from "lucide-react";
import { Playbook } from "./playbooksConfig";
import { mitreTechniques } from "./playbookMockData";

export interface LibraryTabProps {
  playbooks: Playbook[];
  setPlaybooks: React.Dispatch<React.SetStateAction<Playbook[]>>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  severityFilter: string;
  setSeverityFilter: (sev: string) => void;
  layoutStyle: "grid" | "table";
  setLayoutStyle: (style: "grid" | "table") => void;
  selectedMitreId: string | null;
  setSelectedMitreId: (id: string | null) => void;
  inspectPlaybook: (playbook: Playbook) => void;
}

export function LibraryTab({
  playbooks,
  setPlaybooks,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  severityFilter,
  setSeverityFilter,
  layoutStyle,
  setLayoutStyle,
  selectedMitreId,
  setSelectedMitreId,
  inspectPlaybook
}: LibraryTabProps) {

  // Sync active playbook triggered on MITRE Click
  const handleMitreClick = (techId: string) => {
    if (selectedMitreId === techId) {
      setSelectedMitreId(null); // Clear filter
    } else {
      setSelectedMitreId(techId);
      setCategoryFilter("all"); // Reset category filter to view MITRE technique items
      // Auto-scrolling down to library container
      const libSection = document.getElementById("playbooks-library-anchor");
      if (libSection) {
        libSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Playbook activation toggle
  const togglePlaybookState = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaybooks(prev => prev.map(pb => {
      if (pb.id === id) {
        const nextStatus = pb.status === "active" ? "inactive" : "active";
        return { ...pb, status: nextStatus, updatedAt: "Just now" };
      }
      return pb;
    }));
  };

  // Filtered Playbooks computed
  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter(pb => {
      // MITRE override filter
      if (selectedMitreId) {
        const matchingTech = mitreTechniques.find(m => m.id === selectedMitreId);
        if (matchingTech && !matchingTech.playbooks.includes(pb.id)) {
          return false;
        }
      }
      
      // Search Box text Filter
      const matchedText = searchQuery === "" || 
        pb.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pb.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pb.triggerCondition.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pb.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Category matches
      const matchesCategory = categoryFilter === "all" || 
        (categoryFilter === "web" && (pb.id === "pb-1" || pb.id === "pb-2" || pb.id === "pb-14")) ||
        (categoryFilter === "recon" && (pb.id === "pb-3" || pb.id === "pb-12" || pb.id === "pb-21")) ||
        (categoryFilter === "auth" && (pb.id === "pb-4" || pb.id === "pb-15" || pb.id === "pb-16")) ||
        (categoryFilter === "dos" && (pb.id === "pb-5" || pb.id === "pb-18")) ||
        (categoryFilter === "c2" && (pb.id === "pb-6" || pb.id === "pb-19")) ||
        (categoryFilter === "exfil" && (pb.id === "pb-7" || pb.id === "pb-10" || pb.id === "pb-11"));

      // Severity matches
      const matchesSeverity = severityFilter === "all" || pb.severity === severityFilter;

      return matchedText && matchesCategory && matchesSeverity;
    });
  }, [playbooks, searchQuery, categoryFilter, severityFilter, selectedMitreId]);

  return (
    <div className="space-y-6" id="playbooks-library-tab">
      {/* INTERACTIVE MITRE ATT&CK MATRIX HUB (ITEM 4) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-border pb-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 text-purple-500">
              <Shield className="w-4 h-4 shrink-0" /> MITRE ATT&CK Mapping matrix - Interactive Matrix
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal max-w-2xl">
              Click any technique card below to automatically filter and reveal related defensive playbooks inside our SOAR Library database below.
            </p>
          </div>
          {selectedMitreId && (
            <button
              type="button"
              onClick={() => setSelectedMitreId(null)}
              className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-mono text-[9px] font-black uppercase flex items-center gap-1 hover:bg-rose-500/20 transition cursor-pointer"
            >
              Clear Filter ({selectedMitreId}) <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* MITRE SIX COLUMNS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {mitreTechniques.map(tech => {
            const isSelected = selectedMitreId === tech.id;
            return (
              <button
                type="button"
                key={tech.id}
                onClick={() => handleMitreClick(tech.id)}
                className={`text-left p-3 rounded-lg border transition duration-200 select-none ${isSelected ? "border-purple-500 bg-muted/95 shadow-md flex-1" : "border-border bg-card/60 hover:bg-muted/40"}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8px] font-mono font-black tracking-widest text-muted-foreground uppercase">{tech.tactic}</span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: tech.color }} 
                  />
                </div>
                <div className="text-[10.5px] font-mono font-black text-foreground uppercase tracking-tight line-clamp-1 mb-1">
                  {tech.id}
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-2 leading-tight uppercase font-mono tracking-wide">
                  {tech.name}
                </div>
                <div className="mt-2 text-[8px] font-semibold font-mono text-purple-500 uppercase tracking-widest">
                  {tech.playbooks.length} SOAR Playbooks
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* NEW CONTAINER BLOCK FOR SECTIONS SEARCH AND LIST */}
      <div id="playbooks-library-anchor" className="space-y-4">
        {/* FILTERING CONTROLLERS ROW (ITEM 18 & ITEM 2) */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search query box */}
          <div className="flex-1 flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-cyan-500">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search Playbook Library... (Name, Severity, MITRE, Tags)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-[11px] font-mono placeholder:text-muted-foreground focus:outline-none text-foreground"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters chips select */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter dropdown style */}
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-2 py-1 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-mono focus:outline-none text-foreground font-black uppercase tracking-wide cursor-pointer"
              >
                <option value="all">ALL CATEGORIES</option>
                <option value="web">WEB EXPLOITATION</option>
                <option value="recon">RECON / DISCOVERY</option>
                <option value="auth">AUTHENTICATION DEFS</option>
                <option value="dos">SYN DOS MITIGATION</option>
                <option value="c2">BEACON / C2 SYSTEMS</option>
                <option value="exfil">DATA SECURITY</option>
              </select>
            </div>

            {/* Severity level filter */}
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-2 py-1 rounded-lg">
              <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-mono focus:outline-none text-foreground font-black uppercase tracking-wide cursor-pointer"
              >
                <option value="all">ALL SEVERITIES</option>
                <option value="critical">CRITICAL</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            {/* Table vs Grid toggle button */}
            <div className="bg-muted p-0.5 rounded-lg border border-border flex gap-0.5">
              <button
                type="button"
                onClick={() => setLayoutStyle("grid")}
                className={`p-1.5 rounded transition ${layoutStyle === "grid" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid Cards Layout"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutStyle("table")}
                className={`p-1.5 rounded transition ${layoutStyle === "table" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="Tabular Dense List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* DYNAMIC VIEW SWAPPER (GRID VS TABLE CARD BOILERPLATE) */}
        <AnimatePresence mode="wait">
          {layoutStyle === "grid" ? (
            <motion.div 
              key="grid-canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredPlaybooks.map(pb => {
                const isActive = pb.status === "active";
                const severityColors = {
                  critical: "text-red-500 border-red-500/20 bg-red-500/5",
                  high: "text-orange-500 border-orange-500/20 bg-orange-500/5",
                  medium: "text-yellow-500 border-yellow-500/20 bg-yellow-500/5",
                  low: "text-blue-500 border-blue-500/20 bg-blue-500/5"
                }[pb.severity];

                return (
                  <div
                    key={pb.id}
                    onClick={() => inspectPlaybook(pb)}
                    className={`bg-card border rounded-xl p-5 select-none transition cursor-pointer relative overflow-hidden group hover:-translate-y-1 ${isActive ? "border-cyan-500/25 shadow-md shadow-cyan-500/2" : "border-border/60 opacity-60 hover:opacity-100"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border ${severityColors}`}>
                          {pb.severity}
                        </span>
                        <span className="text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border bg-muted text-muted-foreground">
                          {pb.triggerType}
                        </span>
                      </div>

                      {/* Active switch */}
                      <button
                        type="button"
                        onClick={(e) => togglePlaybookState(pb.id, e)}
                        className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition focus:outline-none ${isActive ? "bg-cyan-500" : "bg-muted border-border"}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${isActive ? "translate-x-4" : "translate-x-0"} mt-px`} />
                      </button>
                    </div>

                    <h3 className="text-xs font-mono font-black uppercase tracking-widest text-foreground group-hover:text-cyan-550 dark:group-hover:text-cyan-400 mb-1.5 transition-colors">
                      {pb.name}
                    </h3>
                    
                    <p className="text-[10px] text-muted-foreground leading-normal font-sans line-clamp-2 uppercase tracking-wide mb-4">
                      {pb.description}
                    </p>

                    {/* Trigger condition logic row */}
                    <div className="bg-muted/45 p-2 rounded border border-border/80 font-mono text-[8.5px] text-amber-600 dark:text-amber-400 mb-3 block truncate">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold mr-1">IF</span>
                      {pb.triggerCondition}
                    </div>

                    <div className="border-t border-border pt-3.5 flex items-center justify-between text-[8px] font-mono text-muted-foreground">
                      <span>RUN TIMELINES: <strong className="text-foreground font-black">{pb.executions}</strong></span>
                      <span>{pb.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="table-canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted text-[8.5px] font-mono text-muted-foreground font-semibold uppercase border-b border-border">
                      <th className="p-3.5">ID / Name</th>
                      <th className="p-3.5">Trigger Condition</th>
                      <th className="p-3.5">Severity</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Executions</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right font-mono">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[10px] font-mono">
                    {filteredPlaybooks.map(pb => {
                      const isActive = pb.status === "active";
                      return (
                        <tr 
                          key={pb.id}
                          onClick={() => inspectPlaybook(pb)}
                          className="hover:bg-muted/30 cursor-pointer transition"
                        >
                          <td className="p-3.5">
                            <div className="font-bold text-foreground uppercase tracking-tight">{pb.name}</div>
                            <div className="text-[8px] text-muted-foreground mt-0.5">{pb.id}</div>
                          </td>
                          <td className="p-3.5 text-amber-600 dark:text-amber-400 max-w-55 truncate">
                            {pb.triggerCondition}
                          </td>
                          <td className="p-3.5 uppercase">{pb.severity}</td>
                          <td className="p-3.5 uppercase text-muted-foreground">{pb.triggerType}</td>
                          <td className="p-3.5 font-bold text-foreground">{pb.executions}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 text-[8px] font-bold rounded border ${isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
                              {pb.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => togglePlaybookState(pb.id, e)}
                              className={`px-2 py-1 rounded font-mono text-[9px] font-bold uppercase border ${isActive ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20" : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20"}`}
                            >
                              {isActive ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
