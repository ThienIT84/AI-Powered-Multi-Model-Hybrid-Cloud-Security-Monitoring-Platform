import React from "react";
import { Link2, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { Integration } from "./types";
import { cn } from "../../lib/utils";

interface IntegrationInventoryTableProps {
  integrations: Integration[];
  selectedId: string | null;
  onSelect: (integration: Integration) => void;
}

export function IntegrationInventoryTable({
  integrations,
  selectedId,
  onSelect
}: IntegrationInventoryTableProps) {
  const statusStyles = {
    Connected: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Disconnected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
  };

  const healthStyles = {
    Healthy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border-emerald-500/25",
    Warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border-amber-500/25",
    Critical: "bg-red-500/10 text-red-600 dark:text-red-400 font-black border-red-500/25 animate-pulse"
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between select-none h-95">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5">
          <Link2 size={12} className="text-cyan-500" />
          <div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              Integration Inventory
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Configured Security Telemetry Sources & Ecosystem Ingress Plugs
            </span>
          </div>
        </div>
        <span className="text-[8px] font-mono text-muted-foreground/60 uppercase">
          {integrations.length} total integrations
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar my-2.5 text-[9px] font-mono min-h-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground/80 font-black uppercase text-[7.5px] tracking-wider sticky top-0 bg-card select-none">
              <th className="py-2 pr-2">Integration Name</th>
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2 text-center">Status</th>
              <th className="py-2 px-2 text-center">Last Sync</th>
              <th className="py-2 px-2">Data Type</th>
              <th className="py-2 pl-2 text-right">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {integrations.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={cn(
                    "hover:bg-muted/35 cursor-pointer transition-colors duration-100 group",
                    isSelected ? "bg-muted/50 border-l-2 border-l-cyan-500 pl-1.5" : ""
                  )}
                >
                  <td className="py-2.5 pr-2 font-bold text-foreground">
                    <span className="group-hover:text-cyan-500 group-hover:underline flex items-center gap-0.5 truncate max-w-42.5">
                      {item.name}
                      <ArrowUpRight size={8} className="text-muted-foreground/60 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground uppercase text-[8px] truncate max-w-27.5">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={cn("text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border leading-none inline-block", statusStyles[item.status] || "bg-muted text-muted-foreground border-border")}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-muted-foreground uppercase text-[8.2px]">
                    {item.lastSync}
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground/90 font-bold truncate max-w-35" title={item.dataType}>
                    {item.dataType}
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <span className={cn("text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border leading-none inline-block", healthStyles[item.health])}>
                      {item.health}
                    </span>
                  </td>
                </tr>
              );
            })}

            {integrations.length === 0 && (
              <tr>
                <td colSpan={6} className="py-14 text-center text-muted-foreground/60 uppercase tracking-widest text-[8.5px]">
                  No integrations match current criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-1 text-[7.5px] font-mono text-muted-foreground/50 uppercase tracking-widest border-t border-border/20 pt-1.5">
        <Info size={9} />
        <span>Click any integration row to load connected details and schemas.</span>
      </div>
    </div>
  );
}
