import React from "react";
import { FolderGit, BookOpen, FileEdit, Network, RefreshCw } from "lucide-react";
import { Playbook } from "./types";

interface PlaybooksKPIsProps {
  playbooks: Playbook[];
}

export function PlaybooksKPIs({ playbooks }: PlaybooksKPIsProps) {
  const total = playbooks.length;
  const published = playbooks.filter((p) => p.status === "Published").length;
  const drafts = playbooks.filter((p) => p.status === "Draft").length;
  
  const categoriesList = Array.from(new Set(playbooks.map((p) => p.category)));
  const categoriesCount = categoriesList.length;

  // Let's compute recently updated count within 30 days or simply standard mock counter here
  const recentlyUpdatedCount = playbooks.filter(p => {
    // Treat any playbook updated after 2026-05-15 as recently updated
    return new Date(p.lastUpdated) >= new Date("2026-05-15");
  }).length;

  const kpis = [
    {
      id: "total",
      label: "Total Playbooks",
      value: total,
      subText: "Procedures Available",
      icon: BookOpen,
      iconColor: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      id: "published",
      label: "Published",
      value: published,
      subText: "Active Sign-off Docs",
      icon: FolderGit,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      id: "drafts",
      label: "Draft",
      value: drafts,
      subText: "Pending Author Review",
      icon: FileEdit,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/15"
    },
    {
      id: "categories",
      label: "Categories",
      value: categoriesCount,
      subText: "Mapped Security Sectors",
      icon: Network,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      id: "recently-updated",
      label: "Recently Updated",
      value: recentlyUpdatedCount,
      subText: "Updated Last 30 Days",
      icon: RefreshCw,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 select-none">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <div
            key={k.id}
            id={`kpi-card-${k.id}`}
            className="bg-card border border-border/80 rounded-xl p-3.5 flex flex-col justify-between shadow-xs h-50 md:h-26.25"
          >
            <div className="flex items-center justify-between">
              <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest font-black">
                {k.label}
              </span>
              <div className={`${k.bgColor} ${k.iconColor} p-1.5 rounded-lg shrink-0`}>
                <Icon size={12} />
              </div>
            </div>

            <div className="mt-2 text-left">
              <span className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-none block">
                {k.value}
              </span>
              <span className="text-[7px] font-mono text-muted-foreground/80 uppercase tracking-wider block mt-1 leading-none font-bold">
                {k.subText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
