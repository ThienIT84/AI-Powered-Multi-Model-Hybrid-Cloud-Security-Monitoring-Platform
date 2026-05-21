import React from "react";
import { Playbook } from "./playbooksConfig";
import { PlaybookCard } from "./PlaybookCard";
import { Terminal, ShieldX } from "lucide-react";

interface PlaybookListProps {
  playbooks: Playbook[];
  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";
  triggerFilter: "all" | "automated" | "manual";
  onCardClick: (playbook: Playbook) => void;
  onToggleStatus: (id: string, newStatus: "active" | "inactive") => void;
}

export function PlaybookList({
  playbooks,
  searchQuery,
  statusFilter,
  triggerFilter,
  onCardClick,
  onToggleStatus,
}: PlaybookListProps) {
  // Apply filtering rules
  const filteredPlaybooks = playbooks.filter((pb) => {
    // Search filter
    const matchesSearch =
      pb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.triggerCondition.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || pb.status === statusFilter;

    // Trigger type filter
    const matchesTrigger =
      triggerFilter === "all" || pb.triggerType === triggerFilter;

    return matchesSearch && matchesStatus && matchesTrigger;
  });

  if (filteredPlaybooks.length === 0) {
    return (
      <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/85 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-full text-slate-500 shadow-inner">
          <ShieldX className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-black text-white tracking-widest uppercase font-mono">
            No SOAR Playbooks Found
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase font-sans">
            Không tìm thấy kịch bản nào khớp với bộ lọc hoặc từ khóa tìm kiếm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filteredPlaybooks.map((playbook) => (
        <PlaybookCard
          key={playbook.id}
          playbook={playbook}
          onCardClick={onCardClick}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
