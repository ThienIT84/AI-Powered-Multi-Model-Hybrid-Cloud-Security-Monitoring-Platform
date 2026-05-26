import React from "react";
import { Playbook } from "./playbooksConfig";
import { PlaybookCard } from "./PlaybookCard";
import { ShieldX, Terminal } from "lucide-react";

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
      <div className="bg-card/75 border border-border rounded-xl p-16 text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden shadow-2xl">
        {/* Animated backdrop grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(244,244,244,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(244,244,244,0.015)_1px,transparent_1px)] bg-size[20px_20px] pointer-events-none opacity-40" />
        
        {/* Cyber target scanner decoration */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full border border-dashed border-cyan-500/20 animate-[spin_10s_linear_infinite]" />
          <div className="absolute w-28 h-28 rounded-full border border-border" />
          <div className="p-4 bg-muted border border-border rounded-xl text-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.05)] relative z-10">
            <ShieldX className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2 max-w-md relative z-10">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-muted-foreground font-extrabold uppercase mb-1">
            <Terminal className="w-3 h-3 text-cyan-500" />
            SOAR_REMEDIATION_NULL_STATE
          </div>
          <h3 className="text-sm font-mono font-black text-foreground tracking-widest uppercase">
            No Security Playbooks Tracked
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium tracking-wide leading-relaxed uppercase">
            Không tìm thấy kịch bản phản ứng sự cố nào khớp với bộ lọc bảo mật hoặc truy vấn tìm kiếm hiện tại. Hãy tạo kịch bản mới để cấu hình quy trình điều phối.
          </p>
        </div>

        {/* Micro code snippet display */}
        <div className="bg-muted border border-border rounded px-4 py-2 font-mono text-[8px] text-muted-foreground uppercase tracking-widest max-w-xs relative z-10">
          SYSTEM: STANDBY_MODE // ACTIVE_RE_EVALUATIONS
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
