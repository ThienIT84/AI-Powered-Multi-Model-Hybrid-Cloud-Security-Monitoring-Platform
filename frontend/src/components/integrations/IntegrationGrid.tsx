import React from "react";
import { Integration } from "./integrationsConfig";
import { IntegrationCard } from "./IntegrationCard";
import { Puzzle } from "lucide-react";

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
      <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/80 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-full text-slate-500 shadow-inner animate-pulse">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 002 2h3a2 2 0 012 2v3a2 2 0 002 2v1a2 2 0 11-4 0v-1a2 2 0 00-2-2h-3a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-black text-white uppercase tracking-widest font-mono">
            No Integrations Found
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Không tìm thấy công cụ hoặc kênh kết nối dữ liệu phù hợp với điều kiện lọc.
          </p>
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
