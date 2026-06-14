import React from "react";
import { Filter, X, Search } from "lucide-react";
import { motion } from "motion/react";

interface FilterSidepanelProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  searchIP: string;
  setSearchIP: (ip: string) => void;
  selectedSeverities: string[];
  toggleSeveritySelection: (sev: string) => void;
  selectedAttackTypes: string[];
  toggleAttackTypeSelection: (atk: string) => void;
  selectedAISources: string[];
  toggleAISourceSelection: (src: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedService: string;
  setSelectedService: (service: string) => void;
  filteredAlertRecordsLength: number;
}

export function FilterSidepanel({
  isSidebarOpen,
  setIsSidebarOpen,
  searchIP,
  setSearchIP,
  selectedSeverities,
  toggleSeveritySelection,
  selectedAttackTypes,
  toggleAttackTypeSelection,
  selectedAISources,
  toggleAISourceSelection,
  selectedCountry,
  setSelectedCountry,
  selectedService,
  setSelectedService,
  filteredAlertRecordsLength,
}: FilterSidepanelProps) {
  if (!isSidebarOpen) return null;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0, marginLeft: -24 }}
      animate={{ width: 280, opacity: 1, marginLeft: 0 }}
      exit={{ width: 0, opacity: 0, marginLeft: -24 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="bg-card border border-border/80 rounded-xl p-4 shrink-0 overflow-y-auto max-h-[85vh] sticky top-4 space-y-5 shadow-lg select-none font-mono text-slate-800 dark:text-slate-100"
    >
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-black uppercase text-cyan-500 dark:text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Core Segment Filters
        </span>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="text-slate-400 dark:text-slate-500 hover:text-rose-500 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Keyword IP Search Input */}
      <div className="space-y-1">
        <span className="text-[8.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Source Hacker IP</span>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchIP}
            onChange={(e) => setSearchIP(e.target.value)}
            placeholder="e.g. 185.220.101.5"
            className="w-full pl-8 pr-2 py-1.5 text-[10px] bg-slate-50 dark:bg-[#090c14] border border-border dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 uppercase font-mono tracking-widest placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Severity Selection Block */}
      <div className="space-y-1.5">
        <span className="text-[8.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Incident Severity Target</span>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "critical", label: "Critical", color: "border-rose-500/25 text-rose-600 dark:text-rose-450 bg-rose-500/5 hover:bg-rose-500/10" },
            { id: "high", label: "High", color: "border-amber-500/25 text-amber-600 dark:text-amber-450 bg-amber-500/5 hover:bg-amber-500/10" },
            { id: "medium", label: "Medium", color: "border-yellow-500/25 text-yellow-600 dark:text-yellow-450 bg-yellow-500/5 hover:bg-yellow-500/10" },
            { id: "low", label: "Low", color: "border-sky-500/25 text-sky-600 dark:text-sky-450 bg-sky-500/5 hover:bg-sky-500/10" }
          ].map(term => (
            <button
              key={term.id}
              onClick={() => toggleSeveritySelection(term.id)}
              className={`text-[9px] border uppercase px-2 py-1.5 rounded transition font-black flex items-center justify-between ${selectedSeverities.includes(term.id) ? term.color : "border-border dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-755 dark:hover:text-slate-350 bg-slate-50 dark:bg-[#090c15]"}`}
            >
              <span>{term.label}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedSeverities.includes(term.id) ? "bg-cyan-500 dark:bg-cyan-400" : "bg-transparent border border-slate-300 dark:border-slate-700"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Attack Type Toggles block */}
      <div className="space-y-1.5">
        <span className="text-[8.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Attack Vector Classification</span>
        <div className="grid grid-cols-1 gap-1">
          {["XSS", "SQLi", "Port Scan", "DoS", "Brute Force", "Unknown Anomaly"].map(atk => {
            const isChecked = selectedAttackTypes.includes(atk);
            return (
              <button
                key={atk}
                onClick={() => toggleAttackTypeSelection(atk)}
                className={`text-[9.5px] px-2.5 py-1.5 rounded border text-left font-semibold flex items-center justify-between transition ${isChecked ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" : "bg-slate-50 dark:bg-[#090c14] border-border dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"}`}
              >
                <span>{atk}</span>
                <div className={`w-3 h-3 rounded-sm border ${isChecked ? "bg-cyan-500 dark:bg-cyan-400 border-cyan-500 dark:border-cyan-400 flex items-center justify-center text-slate-950 font-black text-[8px]" : "border-slate-300 dark:border-slate-700"}`}>
                  {isChecked && "✓"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Pipeline Segment Filtering */}
      <div className="space-y-1.5">
        <span className="text-[8.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">ML Pipeline Evaluators</span>
        <div className="grid grid-cols-1 gap-1">
          {[
            { id: "AI1", label: "AI1 Anomaly Eng" },
            { id: "AI2A", label: "AI2A Net Attack Class" },
            { id: "AI2B", label: "AI2B Web Attack Det" },
            { id: "Fusion Layer", label: "Fusion Consensus Lab" }
          ].map(ai => {
            const isChecked = selectedAISources.includes(ai.id);
            return (
              <button
                key={ai.id}
                onClick={() => toggleAISourceSelection(ai.id)}
                className={`text-[9.5px] px-2.5 py-1.5 rounded border text-left font-semibold flex items-center justify-between transition ${isChecked ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-slate-55 dark:bg-[#090c14] border-border dark:border-slate-800 text-slate-500 dark:text-slate-550 hover:text-slate-800 dark:hover:text-slate-350"}`}
              >
                <span>{ai.label}</span>
                <div className={`w-3 h-3 rounded-sm border ${isChecked ? "bg-purple-500 dark:bg-purple-400 border-purple-500 dark:border-purple-400 flex items-center justify-center text-slate-950 font-black text-[8px]" : "border-slate-300 dark:border-slate-700"}`}>
                  {isChecked && "✓"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Country Selection list */}
      <div className="space-y-1">
        <span className="text-[8.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Regional Country Origin</span>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full text-[10px] bg-slate-50 dark:bg-[#090c14] border border-border dark:border-slate-800 rounded px-2 py-1.5 uppercase font-mono tracking-widest text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value="ALL" className="bg-card text-foreground">ALL COUNTRIES</option>
          <option value="VN" className="bg-card text-foreground">VN - Vietnam</option>
          <option value="US" className="bg-card text-foreground">US - United States</option>
          <option value="CN" className="bg-card text-foreground">CN - China</option>
          <option value="RU" className="bg-card text-foreground">RU - Russia</option>
          <option value="DE" className="bg-card text-foreground">DE - Germany</option>
        </select>
      </div>

      {/* Service Destination selection */}
      <div className="space-y-1">
        <span className="text-[8.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Destination Microservice Access</span>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full text-[10px] bg-slate-50 dark:bg-[#090c14] border border-border dark:border-slate-800 rounded px-2 py-1.5 uppercase font-mono tracking-widest text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value="ALL" className="bg-card text-foreground">ALL SERVICES</option>
          <option value="HTTP" className="bg-card text-foreground">HTTP Gateway</option>
          <option value="HTTPS" className="bg-card text-foreground">HTTPS Core Web</option>
          <option value="DNS" className="bg-card text-foreground">DNS Name Resolver</option>
          <option value="SSH" className="bg-card text-foreground">SSH Bastion Tunnel</option>
          <option value="FTP" className="bg-card text-foreground">FTP Backup storage</option>
        </select>
      </div>

      {/* Stats Counters Summary inside sidebar */}
      <div className="border-t border-border/80 pt-3 space-y-1 text-[9.5px]">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-bold">Matching Reports:</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-black">{filteredAlertRecordsLength} records</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-bold">Unfiltered Baseline:</span>
          <span className="text-slate-600 dark:text-slate-450 font-black">12,543 alerts</span>
        </div>
      </div>
    </motion.div>
  );
}
