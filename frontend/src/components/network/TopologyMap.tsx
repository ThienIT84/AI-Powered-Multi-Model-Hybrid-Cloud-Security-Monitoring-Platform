import React, { useMemo, useState } from "react";
import { 
  Network, 
  MapPin, 
  Server, 
  Cloud, 
  Laptop, 
  Globe, 
  ShieldAlert, 
  RefreshCw,
  Info
} from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";

interface TopologyMapProps {
  logs: NetworkLog[];
  onSelectNodeIP: (ip: string | null) => void;
  selectedNodeIP: string | null;
}

interface NodeItem {
  id: string;
  label: string;
  ip: string;
  type: "external" | "internal-vm" | "aws-service" | "web-server" | "user-vm";
  x: number;
  y: number;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({ 
  logs, 
  onSelectNodeIP,
  selectedNodeIP
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Define static SOC Node layout parameters
  const nodes: NodeItem[] = [
    { id: "ext-1", label: "External Proxy Node", ip: "185.190.240.8", type: "external", x: 100, y: 120 },
    { id: "ext-2", label: "Offshore Bucket Server", ip: "45.227.254.12", type: "external", x: 100, y: 280 },
    { id: "aws-1", label: "AWS S3 Cloudfront Core", ip: "13.224.29.89", type: "aws-service", x: 380, y: 80 },
    { id: "web-1", label: "Corporate Web Server", ip: "10.0.12.24", type: "web-server", x: 380, y: 200 },
    { id: "db-1", label: "SIEM Core PostgreSQL", ip: "10.0.12.3", type: "web-server", x: 380, y: 320 },
    { id: "user-1", label: "Developer Workstation", ip: "192.168.1.109", type: "user-vm", x: 660, y: 120 },
    { id: "user-2", label: "HR Department Subnet", ip: "192.168.1.45", type: "user-vm", x: 660, y: 280 },
  ];

  // Define edges representing network connections
  const edges = [
    { from: "ext-1", to: "web-1" },
    { from: "ext-1", to: "db-1" },
    { from: "ext-2", to: "db-1" },
    { from: "web-1", to: "db-1" },
    { from: "aws-1", to: "web-1" },
    { from: "user-1", to: "web-1" },
    { from: "user-2", to: "web-1" },
    { from: "user-1", to: "db-1" },
  ];

  // Evaluate the compromise status and volume weight of each node dynamically based on logs:
  const nodeStates = useMemo(() => {
    const states: Record<string, { status: "normal" | "suspicious" | "compromised"; volume: number }> = {};

    // Initialize
    nodes.forEach(n => {
      states[n.ip] = { status: "normal", volume: 1000 };
    });

    // Compute states
    logs.forEach(log => {
      // Map Volume
      if (states[log.srcIp]) states[log.srcIp].volume += log.origBytes;
      if (states[log.destIp]) states[log.destIp].volume += log.origBytes;

      // Map Statuses based on AI anomaly decisions:
      if (log.verdict === "ANOMALY") {
        if (log.severity === "CRITICAL") {
          if (states[log.srcIp]) states[log.srcIp].status = "compromised";
          if (states[log.destIp]) states[log.destIp].status = "compromised";
        } else {
          // Suspicious for medium / high / low anomalies
          if (states[log.srcIp] && states[log.srcIp].status !== "compromised") {
            states[log.srcIp].status = "suspicious";
          }
          if (states[log.destIp] && states[log.destIp].status !== "compromised") {
            states[log.destIp].status = "suspicious";
          }
        }
      }
    });

    return states;
  }, [logs]);

  // Node type icon generator
  const getNodeColorClass = (status: "normal" | "suspicious" | "compromised", element: "fill" | "stroke" | "text" | "glow") => {
    if (status === "compromised") {
      switch (element) {
        case "fill": return "fill-red-500 text-red-500 bg-red-950/40 border-red-500/50";
        case "stroke": return "stroke-red-500";
        case "text": return "text-red-400";
        case "glow": return "rgba(239, 68, 68, 0.45)";
      }
    }
    if (status === "suspicious") {
      switch (element) {
        case "fill": return "fill-amber-500 text-amber-500 bg-amber-950/20 border-amber-500/40";
        case "stroke": return "stroke-amber-500";
        case "text": return "text-amber-400";
        case "glow": return "rgba(245, 158, 11, 0.35)";
      }
    }
    // Normal / Clean status:
    switch (element) {
      case "fill": return "fill-emerald-500 text-emerald-500 bg-slate-900 border-slate-800";
      case "stroke": return "stroke-emerald-500";
      case "text": return "text-emerald-400";
      case "glow": return "rgba(16, 185, 129, 0.2)";
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "external": return <Globe className="w-3.5 h-3.5" />;
      case "aws-service": return <Cloud className="w-3.5 h-3.5" />;
      case "user-vm": return <Laptop className="w-3.5 h-3.5" />;
      default: return <Server className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div 
      className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm flex flex-col justify-between font-mono relative overflow-hidden h-95" 
      id="topology-graph-container"
    >
      {/* Absolute Header HUD */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 z-10 relative">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '40s' }} />
          <div>
            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest block">SIEM RECONSTRUCTION</span>
            <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
              DYNAMIC NETWORK TOPOLOGY GRAPH
            </h3>
          </div>
        </div>

        {/* Selected Indicator Clear */}
        {selectedNodeIP && (
          <button 
            onClick={() => onSelectNodeIP(null)}
            className="text-[9px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 hover:text-slate-100 cursor-pointer"
          >
            Clear Filter: <strong className="text-emerald-450">{selectedNodeIP}</strong>
          </button>
        )}
      </div>

      {/* Topology Map Graph Space SVG Wrapper */}
      <div className="flex-1 relative min-h-55">
        {/* Absolute Hint Panel */}
        <div className="absolute top-1 left-1 bg-slate-900/60 p-1.5 rounded border border-slate-900 text-[8px] max-w-42.5 space-y-1 pointer-events-none z-10">
          <div className="text-slate-500 font-extrabold flex items-center gap-1">
            <Info className="w-2.5 h-2.5 text-emerald-500" />
            <span>TOPOLOGY GUIDE</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-slate-400">Normal Nodes</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-slate-400">Suspicious Alert</span>
          </div>
          <div className="flex gap-1.5 items-center text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-red-500 relative" /> <span>Compromised Node</span>
          </div>
        </div>

        <svg className="w-full h-full" id="topology-svg" style={{ minHeight: "240px" }}>
          {/* SVG DEFINITIONS & FILTERS */}
          <defs>
            <filter id="shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
            </filter>
            
            {/* Edge line gradients */}
            <linearGradient id="normalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#02f5a0" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.35" />
            </linearGradient>
            
            <linearGradient id="dangerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* BACKGROUND GRAPH GRID */}
          <g stroke="rgba(148,163,184,0.015)" strokeWidth="1">
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`lh-${i}`} x1="0%" y1={`${i * 7}%`} x2="100%" y2={`${i * 7}%`} />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`lv-${i}`} x1={`${i * 7}%`} y1="0%" x2={`${i * 7}%`} y2="100%" />
            ))}
          </g>

          {/* RENDER EDGES */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            // Determine if edge flows are suspicious/compromised
            const fromState = nodeStates[fromNode.ip] || { status: "normal", volume: 1000 };
            const toState = nodeStates[toNode.ip] || { status: "normal", volume: 1000 };
            const isCompromised = fromState.status === "compromised" || toState.status === "compromised";
            const isSuspicious = fromState.status === "suspicious" || toState.status === "suspicious";

            let strokeColor = "url(#normalGrad)";
            if (isCompromised) strokeColor = "url(#dangerGrad)";
            else if (isSuspicious) strokeColor = "url(#amberGrad)";

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor === "url(#normalGrad)" ? "rgba(16,185,129,0.15)" : isCompromised ? "rgba(239, 68, 68, 0.45)" : "rgba(245, 158, 11, 0.35)"}
                  strokeWidth={isCompromised ? 1.8 : isSuspicious ? 1.2 : 1.0}
                  strokeDasharray={isCompromised ? "4 4" : isSuspicious ? "5 3" : undefined}
                />
                
                {/* Active vector motion flow indicator particles */}
                <circle r={1.6} fill={isCompromised ? "#f43f5e" : isSuspicious ? "#fbbf24" : "#10b981"}>
                  <animateMotion
                    dur={isCompromised ? "1.8s" : isSuspicious ? "2.5s" : "4.2s"}
                    repeatCount="indefinite"
                    path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                  />
                </circle>
              </g>
            );
          })}

          {/* RENDER NODES */}
          {nodes.map((node) => {
            const state = nodeStates[node.ip] || { status: "normal", volume: 1000 };
            const isSelected = selectedNodeIP === node.ip;
            const isHovered = hoveredNode === node.id;

            // Size scales strictly based on traffic volume
            const volumeWeight = Math.min(12, Math.round(Math.log10(state.volume) * 2));
            const radius = 18 + volumeWeight;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectNodeIP(isSelected ? null : node.ip)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer group"
                filter="url(#shadow-filter)"
              >
                {/* Outer pulsing ring for suspicious/compromised nodes */}
                {state.status === "compromised" && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={radius}
                  fill={state.status === "compromised" ? "#450a0a" : state.status === "suspicious" ? "#451a03" : "#020617"}
                  stroke={isSelected ? "#38bdf8" : state.status === "compromised" ? "#f43f5e" : state.status === "suspicious" ? "#f59e0b" : "#1e293b"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2.0 : 1.5}
                  style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                />

                {/* Inside icon container */}
                <g transform="translate(-7, -7)" className={getNodeColorClass(state.status, "text")}>
                  <foreignObject width="14" height="14">
                    <div className="flex items-center justify-center p-0">
                      {getIconForType(node.type)}
                    </div>
                  </foreignObject>
                </g>

                {/* Popout Metadata Tooltip when hovered */}
                {isHovered && (
                  <g transform={`translate(0, ${radius + 15})`} className="z-40">
                    <rect
                      x={-90}
                      y={-6}
                      width={180}
                      height={40}
                      rx={3}
                      fill="#020617"
                      stroke="#1e293b"
                      strokeWidth={1}
                    />
                    <text
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize={8}
                      fontWeight="bold"
                      fontFamily="monospace"
                      y={6}
                    >
                      {node.label}
                    </text>
                    <text
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize={7}
                      fontFamily="monospace"
                      y={16}
                    >
                      IP: {node.ip}
                    </text>
                    <text
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize={7}
                      fontFamily="monospace"
                      y={26}
                    >
                      FLOW VOL: {state.volume.toLocaleString()} B ({state.status.toUpperCase()})
                    </text>
                  </g>
                )}

                {/* Node Label Text under circle */}
                {!isHovered && (
                  <text
                    y={radius + 11}
                    textAnchor="middle"
                    fill={state.status === "compromised" ? "#f87171" : state.status === "suspicious" ? "#fbbf24" : "#94a3b8"}
                    fontSize={7.5}
                    fontWeight={isSelected ? "bold" : "normal"}
                    fontFamily="monospace"
                  >
                    {node.ip}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Metadata Display */}
      <div className="bg-slate-900 border border-slate-900 p-2 rounded text-[9px] text-slate-400 mt-2 flex items-center justify-between">
        <span>Click node to filter Event explorer list.</span>
        <div className="flex items-center gap-1.5 uppercase text-[8px] font-bold text-slate-500">
          <span className="w-1.5 h-1.5 bg-emerald-505 rounded-full animate-pulse" />
          <span>Topology Live</span>
        </div>
      </div>
    </div>
  );
};
