import React from "react";
import { Integration } from "./integrationsConfig";
import { IntegrationCard } from "./IntegrationCard";
import { Puzzle, AlertTriangle, RefreshCw } from "lucide-react";

interface IntegrationGridProps {
  integrations: Integration[];
  searchQuery: string;
  activeTab: "all" | "inbound" | "notifications" | "security_actions";
  onConfigureClick: (integration: Integration) => void;
}

export function IntegrationGrid({
  integrations,
  searchQuery,
  activeTab,
  onConfigureClick,
}: IntegrationGridProps) {
  
  // Filter core logic
  const filteredList = integrations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = activeTab === "all" || item.category === activeTab;
    
    return matchesSearch && matchesType;
  });

  if (filteredList.length === 0) {
    return (
      <div className="bg-card/70 backdrop-blur-md border border-border rounded-xl p-16 text-center flex flex-col items-center justify-center space-y-5 relative overflow-hidden">
        {/* Subtle background tech radar animation lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02)_0%,transparent_70%)]" />
        
        <div className="p-4 bg-muted border border-border rounded-full text-muted-foreground shadow-inner relative z-10">
          <AlertTriangle className="w-9 h-9 text-amber-500/80 animate-pulse" />
        </div>
        
        <div className="space-y-2 relative z-10 max-w-md">
          <h3 className="text-sm font-black font-mono text-foreground uppercase tracking-widest leading-none">
            SIEM INGESTION MATCH NOT FOUND
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono leading-relaxed">
            No integrated system nodes, firewall rulesets, or incident webhooks matched your pipeline filters. Reset queries or check category classification labels.
          </p>
        </div>

        <div className="pt-2 relative z-10">
          <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-black bg-muted px-3 py-1.5 border border-border rounded">
            OPERATIONAL HEADROOM: IDLE STATE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredList.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          onConfigureClick={onConfigureClick}
        />
      ))}
    </div>
  );
}
