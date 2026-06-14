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
  status: "ACTIVE" | "OFFLINE";
  lastSeen: string;
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

  // LAB DEPLOYED ASSETS MODEL DATA
  const assets: LabAsset[] = useMemo(() => {
    return [
      {
        hostname: "kali-attacker-external",
        ip: "185.190.240.8",
        role: "Adversary External C2 Peer",
        status: "ACTIVE",
        lastSeen: "Just Now",
        cpuRam: "8 Cores / 16 GB",
        details: "External IP node active. Mapping outbound connections and proxy exits."
      },
      {
        hostname: "ubuntu-server-web",
        ip: "10.0.1.18",
        role: "Secure Corporation Web Host",
        status: "ACTIVE",
        lastSeen: "Just Now",
        cpuRam: "16 Cores / 32 GB",
        details: "Active DMZ web server routing corporate node pipelines & load balancers."
      },
      {
        hostname: "windows-target-ad",
        ip: "192.168.1.109",
        role: "Windows Active Directory Domain Controller",
        status: "ACTIVE",
        lastSeen: "Just Now",
        cpuRam: "24 Cores / 64 GB",
        details: "Organizational directory controller system. High-capacity corporate directory master."
      },
      {
        hostname: "pfsense-gateway-fw",
        ip: "10.0.12.3",
        role: "Internal PostgreSQL Master Database Node",
        status: "ACTIVE",
        lastSeen: "1s ago",
        cpuRam: "4 Cores / 8 GB",
        details: "Core relational SQL asset processing transactional logs and analytical entries."
      }
    ];
  }, []);

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
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm text-foreground font-mono space-y-4 text-[11px]" id="asset-inventory-root">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-550 dark:text-indigo-400" />
          <div>
            <span className="text-[9px] text-muted-foreground font-bold block uppercase tracking-widest leading-none font-sans">VIRTUAL LAB DEMO SYSTEM NETWORKS</span>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
              LAB NETWORK ASSET INVENTORY
            </h3>
          </div>
        </div>
        <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-black font-sans">
          {filteredAssets.length} Virtualized Hosts Node Directory
        </div>
      </div>

      {/* Selector input search bar bar */}
      <div className="flex bg-secondary/40 border border-border rounded p-1.5 text-[10px] items-center text-muted-foreground gap-2">
        <Search className="w-3.5 h-3.5 text-muted-foreground/60 ml-1" />
        <input 
          type="text" 
          placeholder="Search Virtual Asset Hostnames, IP, Roles..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="bg-transparent border-none outline-none focus:ring-0 w-full text-foreground text-[10.5px]"
        />
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Table List Column */}
        <div className="lg:col-span-8 space-y-2">
          <span className="text-[8.5px] font-bold text-muted-foreground uppercase block pl-1 font-sans">VIRTUALIZED NODE DIRECTORY</span>
          
          <div className="overflow-x-auto border border-border rounded bg-secondary/15 dark:bg-slate-950/40 custom-scrollbar pr-1 max-h-42.5">
            <table className="w-full text-left truncate">
              <thead className="bg-secondary dark:bg-slate-900 sticky top-0 z-10 text-[8px] uppercase text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-3 py-2 border-r border-border/10">Host IP Node</th>
                  <th className="px-3 py-2 border-r border-border/10">System Hostnames</th>
                  <th className="px-3 py-2 border-r border-border/10">Operational Role</th>
                  <th className="px-3 py-2 text-center font-sans">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-[9px] font-mono leading-none">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground italic col-span-4">
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
                        className={`hover:bg-secondary/40 dark:hover:bg-slate-900/60 cursor-pointer h-7 ${
                          isSelected 
                            ? "bg-indigo-550/10 dark:bg-indigo-950/15 border-l-2 border-indigo-500" 
                            : ""
                        }`}
                      >
                        <td className="px-3 py-1 text-slate-800 dark:text-slate-205 font-black whitespace-nowrap flex items-center gap-1.5 h-full border-r border-border/10">
                          {isIsolated && <Compass className="w-3 h-3 text-cyan-600 dark:text-cyan-405 animate-spin" />}
                          {a.ip}
                        </td>
                        <td className="px-3 py-1 text-muted-foreground font-bold whitespace-nowrap border-r border-border/10">{a.hostname}</td>
                        <td className="px-3 py-1 text-muted-foreground whitespace-nowrap truncate max-w-37.5 border-r border-border/10">{a.role}</td>
                        <td className="px-3 py-1 text-center whitespace-nowrap font-sans">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest border uppercase bg-emerald-550/10 dark:bg-emerald-922 text-emerald-600 dark:text-emerald-450 border-emerald-500/10">
                            {a.status}
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
            <div className="bg-secondary/35 dark:bg-slate-900/30 border border-border p-3.5 rounded-lg space-y-3 animate-fade-in text-[10.5px] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1.5">
                  <span className="text-[8.5px] font-bold text-muted-foreground uppercase font-sans">ASSET SYSTEM CONSOLE</span>
                  <span className="text-cyan-600 dark:text-cyan-405 font-black text-[9px]">IP: {activeAssetDetail.ip}</span>
                </div>
                <strong className="font-mono text-[11px] block text-foreground uppercase leading-normal">{activeAssetDetail.hostname}</strong>
              </div>

              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold">Role:</span>
                  <span className="text-slate-700 dark:text-slate-350 leading-tight text-right max-w-37.5 pr-1">{activeAssetDetail.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold">Specs:</span>
                  <span className="text-slate-700 dark:text-slate-350">{activeAssetDetail.cpuRam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold">State:</span>
                  <span className="text-emerald-500 font-extrabold uppercase">{activeAssetDetail.status} SEEN</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[8.5px] font-black text-muted-foreground uppercase font-sans">Asset description:</span>
                <p className="bg-background p-2 border border-border rounded font-sans leading-normal text-muted-foreground text-[10px]">
                  {activeAssetDetail.details}
                </p>
              </div>

              <div className="flex gap-2.5 pt-1.5 border-t border-border">
                {/* Isolate active flow filter toggle */}
                <button
                  onClick={() => {
                    if (onSelectAssetIP) {
                      onSelectAssetIP(selectedAssetIP === activeAssetDetail.ip ? null : activeAssetDetail.ip);
                    }
                  }}
                  className={`flex-1 py-1 text-center font-black rounded uppercase text-[8.5px] border cursor-pointer transition-colors ${
                    selectedAssetIP === activeAssetDetail.ip 
                      ? "bg-cyan-550/10 text-cyan-600 dark:text-cyan-405 border-cyan-500/20" 
                      : "bg-secondary hover:bg-secondary text-foreground border-border"
                  }`}
                >
                  {selectedAssetIP === activeAssetDetail.ip ? "Audit Active: Clear flow filter" : "Filter connection logs"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/10 border border-border border-dashed rounded-lg p-9 text-center text-muted-foreground flex flex-col items-center justify-center gap-1.5 h-full min-h-42.5" id="asset-inventory-fallback">
              <Compass size={18} className="text-muted-foreground animate-pulse" />
              <span className="font-sans text-[10px]">SELECT LAB HOST IP ROW IN DIRECTORY TABLE TO DEPLOY CONSOLE FORENSIC AUDITING.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
