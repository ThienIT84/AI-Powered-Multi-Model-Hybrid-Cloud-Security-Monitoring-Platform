import React, { useState } from "react";
import { ThreatActor } from "./types";
import { User, ShieldAlert, Globe, Crosshair, Tag, Eye, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ThreatActorProfilesProps {
  actors: ThreatActor[];
  onActorSelect?: (actor: ThreatActor) => void;
}

export function ThreatActorProfiles({ actors, onActorSelect }: ThreatActorProfilesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActorId, setSelectedActorId] = useState<string>("apt28");

  // Inline filter for search
  const filteredActors = actors.filter((actor) => {
    const term = searchTerm.toLowerCase();
    return (
      actor.name.toLowerCase().includes(term) ||
      actor.origin.toLowerCase().includes(term) ||
      actor.aliases.some((alias) => alias.toLowerCase().includes(term)) ||
      actor.industries.some((ind) => ind.toLowerCase().includes(term))
    );
  });

  const selectedActor = actors.find((a) => a.id === selectedActorId) || actors[0];

  const handleActorClick = (actor: ThreatActor) => {
    setSelectedActorId(actor.id);
    if (onActorSelect) {
      onActorSelect(actor);
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="threat-actors-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <User size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              Threat Actor Intelligence
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Strategic profiles of monitored global syndicates
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Filter actors (e.g. APT28, Lazarus, Government...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-muted/40 border border-border focus:border-purple-500 rounded-lg px-3 py-1.5 text-[10px] placeholder:text-muted-foreground outline-hidden tracking-normal font-mono text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1">
        {/* Compact List */}
        <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
          {filteredActors.length === 0 ? (
            <p className="text-[10px] text-muted-foreground font-mono italic p-2 text-center">
              No matching profiles found.
            </p>
          ) : (
            filteredActors.map((actor) => {
              const isSelected = selectedActorId === actor.id;
              return (
                <button
                  key={actor.id}
                  onClick={() => handleActorClick(actor)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-purple-500/10 border-purple-500/50 dark:bg-purple-950/20"
                      : "bg-muted/20 border-border/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-foreground tracking-tight">
                        {actor.name}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">
                        ({actor.aliases[0]})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Globe size={10} className="text-slate-400" />
                        {actor.origin.split(" ")[0]}
                      </span>
                      <span>•</span>
                      <span>Active: {actor.lastSeen.split(" ")[0]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded font-mono ${getRiskBadgeColor(actor.riskLevel)}`}>
                      {actor.riskLevel}
                    </span>
                    <ChevronRight size={12} className="text-muted-foreground" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Profile Detail Panel (Lazy Loaded details layout) */}
        <AnimatePresence mode="wait">
          {selectedActor && (
            <motion.div
              key={selectedActor.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="bg-muted/20 border border-border/80 rounded-lg p-3 flex flex-col justify-between font-mono text-[9px] leading-relaxed"
            >
              <div>
                <div className="flex items-start justify-between border-b border-border/40 pb-2 mb-2">
                  <div>
                    <h4 className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-tight">
                      {selectedActor.name} Details
                    </h4>
                    <span className="text-[8px] text-muted-foreground">
                      Aliases: {selectedActor.aliases.join(", ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[7px] uppercase font-semibold">Risk Level</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${getRiskBadgeColor(selectedActor.riskLevel)}`}>
                      {selectedActor.riskLevel}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-[8.5px] mb-2 text-justify uppercase tracking-tight leading-relaxed font-sans font-medium">
                  {selectedActor.bio}
                </p>

                <div className="space-y-2 mt-2">
                  <div>
                    <span className="text-[8px] font-black text-foreground uppercase tracking-wider block mb-1">
                      Target Sectors
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedActor.industries.map((sec, i) => (
                        <span
                          key={i}
                          className="bg-muted/60 border border-border px-1.5 py-0.5 rounded text-[8px] text-foreground uppercase font-semibold"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] font-black text-foreground uppercase tracking-wider block mb-1">
                      Motivation
                    </span>
                    <span className="text-foreground font-semibold uppercase text-[8px] bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">
                      {selectedActor.motivation}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] font-black text-foreground uppercase tracking-wider block mb-1">
                      Observed Tactics & Techniques
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedActor.techniques.map((tech, i) => (
                        <span
                          key={i}
                          className="bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded text-[7.5px] text-slate-600 dark:text-slate-300 font-semibold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/40 pt-2.5 mt-3 flex items-center justify-between text-[8px] text-muted-foreground">
                <span>Origin: {selectedActor.origin}</span>
                <span>Last Seen: {selectedActor.lastSeen}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
