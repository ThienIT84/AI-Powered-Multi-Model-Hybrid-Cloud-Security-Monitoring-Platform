import React from "react";
import { Integration } from "./integrationsConfig";
import { 
  Cloud, 
  Activity, 
  ShieldCheck, 
  MessageSquare, 
  ShieldAlert, 
  Mail, 
  Settings2, 
  Link2,
  Lock,
  Cpu,
  Unlink
} from "lucide-react";

interface IntegrationCardProps {
  key?: string;
  integration: Integration;
  onConfigureClick: (integration: Integration) => void;
}

export function IntegrationCard({ integration, onConfigureClick }: IntegrationCardProps) {
  const isConnected = integration.status === "connected";

  // Select icon dynamically
  const getLogoIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "aws":
        return <Cloud className="w-8 h-8 text-sky-400" />;
      case "zeek":
        return <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />;
      case "suricata":
        return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
      case "slack":
        return <MessageSquare className="w-8 h-8 text-purple-400" />;
      case "pfsense":
        return <ShieldAlert className="w-8 h-8 text-rose-500" />;
      case "smtp":
      case "twilio":
        return <Mail className="w-8 h-8 text-amber-500" />;
      default:
        return <Cpu className="w-8 h-8 text-slate-400" />;
    }
  };

  const getCategoryEnglish = (categ: string) => {
    switch (categ) {
      case "inbound":
        return "Log Daemon Ingestion";
      case "notifications":
        return "Alert Dispatches";
      case "security_actions":
        return "SOAR IP Containment";
      default:
        return categ;
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col justify-between h-[250px] relative transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.03)] group select-none">
      
      {/* Upper info section */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl group-hover:border-cyan-500/20 transition-colors">
            {getLogoIcon(integration.iconName)}
          </div>
          
          {/* Status Indicator */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${
            isConnected 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.05)]" 
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span>{isConnected ? "CONNECTED" : "NOT CONFIG"}</span>
          </span>
        </div>

        <div className="mt-4 space-y-1">
          <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block">
            {getCategoryEnglish(integration.category)}
          </span>
          <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono group-hover:text-cyan-400 transition-colors">
            {integration.name}
          </h3>
          <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 uppercase font-sans tracking-wide">
            {integration.description}
          </p>
        </div>
      </div>

      {/* Button footer actions */}
      <div className="border-t border-slate-850/60 pt-3 flex items-center justify-between">
        <span className="text-[8px] font-mono text-slate-500 uppercase">
          {isConnected && integration.configuredAt ? `Active: ${integration.configuredAt}` : "Unconfigured"}
        </span>

        <button
          onClick={() => onConfigureClick(integration)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition duration-300 ${
            isConnected
              ? "bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60"
              : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{isConnected ? "Manage" : "Configure"}</span>
        </button>
      </div>

    </div>
  );
}
