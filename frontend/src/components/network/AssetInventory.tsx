import React, { useState, useMemo } from "react";
import { 
  Server, 
  Search, 
  HelpCircle, 
  ShieldAlert, 
  Activity, 
  CheckCircle, 
  Info,
  ChevronRight,
  Database,
  Terminal,
  Compass
} from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";

interface AssetInventoryProps {
  logs: NetworkLog[];
  onSelectAssetIP?: (ip: string | null) => void;
  selectedAssetIP?: string | null;
}

interface LabAsset {
  hostname: string;
  ip: string;
  role: string;
  status: "ACTIVE" | "PROBED" | "COMPROMISED" | "OFFLINE";
  lastSeen: string;
  riskScore: number;
  attackCount: number;
  cpuRam: string;
  details: string;
}

export const AssetInventory: React.FC<AssetInventoryProps> = ({ 
  logs, 
  onSelectAssetIP,
  selectedAssetIP 
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Compute live attack counts targeting assets based on logs
  const assetAttackStats = useMemo(() => {
    const stats: Record<string, number> = {};
    logs.forEach(l => {
      if (l.verdict === "ANOMALY") {
        stats[l.destIp] = (stats[l.destIp] || 0) + 1;
        stats[l.srcIp] = (stats[l.srcIp] || 0) + 1;
      }
    });
    return stats;
  }, [logs]);

  // LAB DEPLOYED ASSETS MODEL DATA
  const assets: LabAsset[] = useMemo(() => {
    return [
      {
        hostname: "kali-attacker-external",
        ip: "185.190.240.8",
        role: "Adversary External C2 Peer",
        status: logs.some(l => l.srcIp === "185.190.240.8" && l.verdict === "ANOMALY") ? "ACTIVE" : "ACTIVE",
        lastSeen: "Just Now",
        riskScore: 94,
        attackCount: assetAttackStats["185.190.240.8"] || 5,
        cpuRam: "8 Cores / 16 GB",
        details: "Dynamic Russian proxy exit node identified sweep probing SSH databases and routing exfiltrated proprietary backups."
      },
      {
        hostname: "ubuntu-server-web",
        ip: "10.0.1.18",
        role: "Secure Corporation Web Host",
        status: logs.some(l => l.destIp === "10.0.1.18" && l.verdict === "ANOMALY") ? "PROBED" : "ACTIVE",
        lastSeen: "Just Now",
        riskScore: 42,
        attackCount: assetAttackStats["10.0.1.18"] || 2,
        cpuRam: "16 Cores / 32 GB",
        details: "DMZ webserver launching secure node pipelines. Target of recent synthetic port sweep storms."
      },
      {
        hostname: "windows-target-ad",
        ip: "192.168.1.109",
        role: "Windows Active Directory Domain Controller",
        status: logs.some(l => l.srcIp === "192.168.1.109" && l.verdict === "ANOMALY") ? "COMPROMISED" : "ACTIVE",
        lastSeen: "Just Now",
        riskScore: 88,
        attackCount: assetAttackStats["192.168.1.109"] || 4,
        cpuRam: "24 Cores / 64 GB",
        details: "Core organizational directory domain root server. Exhibiting UDP Onion proxy tunneling on port 9001."
      },
      {
        hostname: "pfsense-gateway-fw",
        ip: "10.0.12.3",
        role: "Internal PostgreSQL Master Database Node",
        status: logs.some(l => l.destIp === "10.0.12.3" && l.verdict === "ANOMALY") ? "COMPROMISED" : "ACTIVE",
        lastSeen: "1s ago",
        riskScore: 78,
        attackCount: assetAttackStats["10.0.12.3"] || 8,
        cpuRam: "4 Cores / 8 GB",
        details: "Corporate database storage. Primary point of SSH credential guessing and postgres exfiltration spill."
      }
    ];
  }, [logs, assetAttackStats]);

  // Handle Search Filtering
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const term = searchText.toLowerCase().trim();
      if (!term) return true;
      return a.hostname.toLowerCase().includes(term) || 
             a.ip.includes(term) || 
             a.role.toLowerCase().includes(term);
    });
  }, [assets, searchText]);

  const activeAssetDetail = useMemo(() => {
    return assets.find(a => a.ip === selectedAssetId) || null;
  }, [assets, selectedAssetId]);

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm text-slate-100 font-mono space-y-4 text-[11px]" id="asset-inventory-root">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">VIRTUAL LAB DEMO SYSTEM NETWORKS</span>
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              LAB NETWORK ASSET INVENTORY
            </h3>
          </div>
        </div>
        <div className="text-[8px] text-slate-500 uppercase tracking-widest font-black">
          {filteredAssets.length} Virtualized Hosts Node Directory
        </div>
      </div>

      {/* Selector input search bar bar */}
      <div className="flex bg-slate-900/40 border border-slate-900 rounded p-1.5 text-[10px] items-center text-slate-400 gap-2">
        <Search className="w-3.5 h-3.5 text-slate-650 ml-1" />
        <input 
          type="text" 
          placeholder="Search Virtual Asset Hostnames, IP, Roles..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="bg-transparent border-none outline-none focus:ring-0 w-full text-slate-100 text-[10.5px]"
        />
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Table List Column */}
        <div className="lg:col-span-8 space-y-2">
          <span className="text-[8.5px] font-bold text-slate-500 uppercase block pl-1">VIRTUALIZED NODE DIRECTORY</span>
          
          <div className="overflow-x-auto border border-slate-900 rounded bg-slate-950/40 custom-scrollbar pr-1 max-h-42.5">
            <table className="w-full text-left truncate">
              <thead className="bg-slate-900 sticky top-0 z-10 text-[8px] uppercase text-slate-500 font-bold border-b border-slate-900">
                <tr>
                  <th className="px-3 py-2">Host IP Node</th>
                  <th className="px-3 py-2">System Hostnames</th>
                  <th className="px-3 py-2">Operational Role</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-[9px] font-mono leading-none">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500 italic">
                      No matching container host virtual asset found.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((a) => {
                    const isSelected = a.ip === selectedAssetId;
                    const isIsolated = a.ip === selectedAssetIP;

                    return (
                      <tr 
                        key={a.ip}
                        onClick={() => setSelectedAssetId(isSelected ? null : a.ip)}
                        className={`hover:bg-slate-900/60 cursor-pointer h-7 ${
                          isSelected ? "bg-indigo-950/15" : ""
                        }`}
                      >
                        <td className="px-3 py-1 text-slate-205 font-black whitespace-nowrap flex items-center gap-1.5 h-full">
                          {isIsolated && <Compass className="w-3 h-3 text-cyan-405 animate-spin" />}
                          {a.ip}
                        </td>
                        <td className="px-3 py-1 text-slate-400 font-bold whitespace-nowrap">{a.hostname}</td>
                        <td className="px-3 py-1 text-slate-500 whitespace-nowrap truncate max-w-37.5">{a.role}</td>
                        <td className="px-3 py-1 text-center whitespace-nowrap">
                          <span className={`px-1 py-0.2 rounded text-[8px] font-black tracking-widest border uppercase ${
                            a.status === "COMPROMISED" 
                              ? "bg-red-952 text-red-400 border-red-500/15 animate-pulse" 
                              : a.status === "PROBED" 
                              ? "bg-amber-952 text-amber-500 border-amber-500/15" 
                              : "bg-emerald-952 text-emerald-450 border-emerald-500/10"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-3 py-1 text-right font-black whitespace-nowrap">
                          <span className={a.riskScore > 75 ? "text-red-400 font-black" : "text-emerald-500"}>
                            {a.riskScore}/100
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Details Expansion Column */}
        <div className="lg:col-span-4">
          {activeAssetDetail ? (
            <div className="bg-slate-900/35 border border-slate-850 p-3.5 rounded-lg space-y-3 animate-fade-in text-[10.5px] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                  <span className="text-[8.5px] font-bold text-slate-500 uppercase">ASSET SYSTEM CONSOLE</span>
                  <span className="text-cyan-405 font-black text-[9px]">IP: {activeAssetDetail.ip}</span>
                </div>
                <strong className="text-slate-105 font-mono text-[11px] block text-slate-100 uppercase leading-normal">{activeAssetDetail.hostname}</strong>
              </div>

              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Role:</span>
                  <span className="text-slate-300 leading-none">{activeAssetDetail.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Specs:</span>
                  <span className="text-slate-350">{activeAssetDetail.cpuRam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Metrics alerts:</span>
                  <span className="text-rose-450 font-extrabold">{activeAssetDetail.attackCount} interferences</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[8.5px] font-black text-slate-550 uppercase">Asset description:</span>
                <p className="bg-slate-950/70 p-2 border border-slate-900 rounded font-sans leading-normal text-slate-300 text-[10px]">
                  {activeAssetDetail.details}
                </p>
              </div>

              <div className="flex gap-2.5 pt-1.5 border-t border-slate-800/40">
                {/* Isolate active flow filter toggle */}
                <button
                  onClick={() => {
                    if (onSelectAssetIP) {
                      onSelectAssetIP(selectedAssetIP === activeAssetDetail.ip ? null : activeAssetDetail.ip);
                    }
                  }}
                  className={`flex-1 py-1 text-center font-black rounded uppercase text-[8.5px] border cursor-pointer transition-colors ${
                    selectedAssetIP === activeAssetDetail.ip 
                      ? "bg-cyan-950 text-cyan-405 border-cyan-500/20" 
                      : "bg-slate-900 hover:bg-slate-800 text-slate-205 border-slate-800"
                  }`}
                >
                  {selectedAssetIP === activeAssetDetail.ip ? "Audit Active: Clear flow filter" : "Filter connection logs"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/10 border border-slate-900 border-dashed rounded-lg p-9 text-center text-slate-650 flex flex-col items-center justify-center gap-1.5 h-full min-h-42.5" id="asset-inventory-fallback">
              <Compass size={18} className="text-slate-800 animate-pulse" />
              <span>SELECT LAB HOST IP ROW IN DIRECTORY TABLE TO DEPLOY CONSOLE FORENSIC AUDITING.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
