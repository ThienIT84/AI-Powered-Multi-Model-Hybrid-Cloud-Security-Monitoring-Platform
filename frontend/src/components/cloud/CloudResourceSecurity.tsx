import React, { useState, useMemo } from "react";
import { CloudAsset } from "./types";
import { MOCK_CLOUD_ASSETS } from "./mockData";
import { SERVICE_HEALTH_LIST, ServiceHealthItem } from "./csocData";
import {
  ShieldAlert,
  Server,
  Heart,
  Database,
  ExternalLink,
  Shield,
  Layers,
  Key,
  Wifi,
  Radio,
  Eye,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface CloudResourceSecurityProps {
  onSelectAsset?: (assetName: string) => void;
}

export function CloudResourceSecurity({ onSelectAsset }: CloudResourceSecurityProps) {
  // Use MOCK_CLOUD_ASSETS for Panel A table items
  const [assetList, setAssetList] = useState<CloudAsset[]>(MOCK_CLOUD_ASSETS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assetList.slice(0, 5);
    return assetList.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [assetList, searchTerm]);

  // Risk coloring helper
  const getRiskStyle = (score: number) => {
    if (score >= 80) return "text-red-500 font-black";
    if (score >= 50) return "text-amber-500 font-bold";
    return "text-emerald-555 font-semibold";
  };

  const getServiceBadgeColor = (service: string) => {
    switch (service) {
      case "EKS": return "bg-indigo-505/10 text-indigo-500 border-indigo-500/20";
      case "S3": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "EC2": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "RDS": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Lambda": return "bg-purple-500/10 text-purple-500 border-purple-500/10";
      default: return "bg-zinc-500/10 text-zinc-400";
    }
  };

  // Helper colors for health statuses
  const getHealthStatusBadge = (status: "Healthy" | "Warning" | "Critical") => {
    switch (status) {
      case "Healthy":
        return "bg-emerald-550/10 text-emerald-500 border border-emerald-500/20 font-bold";
      case "Warning":
        return "bg-amber-500/10 text-amber-550 border border-amber-500/20 font-bold";
      case "Critical":
        return "bg-red-500/10 text-red-500 border border-red-500/30 font-black animate-pulse";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="cloud-resource-security-row">
      
      {/* ----------------- PANEL A: CLOUD ASSET INVENTORY ----------------- */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between" id="panel-asset-inventory">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
            <div className="flex items-center gap-2 select-none">
              <Server size={14} className="text-cyan-500" />
              <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
                Cloud Asset Inventory
              </h3>
            </div>
            
            {/* Tiny interactive search trigger */}
            <input
              type="text"
              placeholder="Filter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-muted/40 border border-border/80 rounded px-1.5 py-0.2 text-[8px] font-mono outline-hidden focus:border-cyan-500 w-17.5 transition-all"
            />
          </div>

          {/* Compact Asset list table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[8.5px] border-collapse">
              <thead>
                <tr className="border-b border-border/10 select-none text-muted-foreground uppercase text-[7.5px] font-black">
                  <th className="pb-1.5">Asset</th>
                  <th className="pb-1.5 w-11.25">Type</th>
                  <th className="pb-1.5 w-12.5">Env</th>
                  <th className="pb-1.5 w-8.75 text-center">Risk</th>
                  <th className="pb-1.5 w-11.25 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-muted/5 cursor-pointer"
                    onClick={() => onSelectAsset?.(asset.name)}
                  >
                    <td className="py-2 font-black text-foreground truncate max-w-21.25" title={asset.name}>
                      {asset.name}
                    </td>
                    <td className="py-2">
                      <span className={`px-1 rounded text-[7px] border font-black uppercase ${getServiceBadgeColor(asset.service)}`}>
                        {asset.service}
                      </span>
                    </td>
                    <td className="py-2 text-zinc-500 font-bold uppercase text-[7.5px]">
                      {asset.environment.slice(0, 4)}._
                    </td>
                    <td className={`py-2 text-center font-extrabold ${getRiskStyle(asset.riskScore)}`}>
                      {asset.riskScore}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`text-[7px] uppercase font-black ${asset.status === "Active" ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-mono mt-3.5 uppercase font-bold select-none flex items-center justify-between">
          <span>Row limit: 5 visible assets</span>
          <span>Asset database sync: OK</span>
        </div>
      </div>


      {/* ----------------- PANEL B: CLOUD SECURITY POSTURE ----------------- */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between" id="panel-security-posture">
        <div>
          <div className="flex items-center gap-2 border-b border-border/20 pb-2.5 mb-3.5 select-none">
            <Shield size={14} className="text-amber-500" />
            <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
              Cloud Security Posture
            </h3>
          </div>

          {/* Categorized Findings */}
          <div className="space-y-3 font-mono text-[8.5px]">
            {/* Group 1: Configuration */}
            <div className="flex items-start gap-2">
              <span className="p-1 rounded bg-red-500/10 text-red-500 shrink-0 select-none">
                <AlertOctagon size={11} />
              </span>
              <div className="space-y-0.5">
                <div className="font-extrabold text-foreground uppercase text-[8px] tracking-tight">Active Misconfigurations</div>
                <p className="text-muted-foreground leading-normal font-medium font-sans">
                  S3 public overrides disabled; EKS master endpoint publicly resolvable without source CIDR block constraints.
                </p>
              </div>
            </div>

            {/* Group 2: Identity Risks */}
            <div className="flex items-start gap-2">
              <span className="p-1 rounded bg-amber-500/10 text-amber-550 shrink-0 select-none">
                <Key size={11} />
              </span>
              <div className="space-y-0.5">
                <div className="font-extrabold text-foreground uppercase text-[8px] tracking-tight">Privilege & Identity Risks</div>
                <p className="text-muted-foreground leading-normal font-medium font-sans">
                  Administrators mapped to DNS control lack hardware MFA; IAM profile possesses raw wildcard permissions block.
                </p>
              </div>
            </div>

            {/* Group 3: Network Risks */}
            <div className="flex items-start gap-2">
              <span className="p-1 rounded bg-amber-550/15 text-amber-500 shrink-0 select-none">
                <Radio size={11} />
              </span>
              <div className="space-y-0.5">
                <div className="font-extrabold text-foreground uppercase text-[8px] tracking-tight">Network & Firewall Risks</div>
                <p className="text-muted-foreground leading-normal font-medium font-sans">
                  SSH permits broad global transit from 0.0.0.0/0 on port 22 on staging security configuration endpoints.
                </p>
              </div>
            </div>

            {/* Group 4: Storage Risks */}
            <div className="flex items-start gap-2">
              <span className="p-1 rounded bg-blue-500/10 text-blue-500 shrink-0 select-none">
                <Database size={11} />
              </span>
              <div className="space-y-0.5">
                <div className="font-extrabold text-foreground uppercase text-[8px] tracking-tight">Unencrypted Storage Risks</div>
                <p className="text-muted-foreground leading-normal font-medium font-sans">
                  Raw backup EBS mount volume blocks found running inside unencrypted local clusters at rest.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-mono mt-3 uppercase font-bold select-none flex items-center justify-between">
          <span>Priority: 4 High Concern Vectors</span>
          <span>Posture level: High Alarm</span>
        </div>
      </div>


      {/* ----------------- PANEL C: CLOUD SERVICE HEALTH ----------------- */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between" id="panel-service-health">
        <div>
          <div className="flex items-center gap-2 border-b border-border/20 pb-2.5 mb-3.5 select-none">
            <Heart size={14} className="text-emerald-500 animate-pulse" />
            <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
              Cloud Service Health
            </h3>
          </div>

          {/* Service status health matrix */}
          <div className="grid grid-cols-2 gap-2.5 font-mono text-[9px]">
            {SERVICE_HEALTH_LIST.map((service) => (
              <div
                key={service.name}
                className="bg-muted/10 border border-border/45 rounded-lg p-2.5 flex items-center justify-between gap-1 hover:bg-muted/20 transition-all cursor-pointer"
                title={`${service.fullName} is currently operating in ${service.status} state`}
              >
                <div>
                  <strong className="text-foreground uppercase text-[9.5px] tracking-tight block">
                    {service.name}
                  </strong>
                  <span className="text-[7px] text-zinc-500 block font-bold leading-none mt-0.5 uppercase">
                    Checks: {service.activeChecks}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`px-1.5 py-0.2 rounded text-[7px] block border uppercase ${getHealthStatusBadge(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-mono mt-3 uppercase font-bold select-none flex items-center justify-between border-t border-border/10 pt-2">
          <span>Telemetry Source: CloudTrail Link</span>
          <span>Errors Raised: 3</span>
        </div>
      </div>

    </div>
  );
}
export default CloudResourceSecurity;
