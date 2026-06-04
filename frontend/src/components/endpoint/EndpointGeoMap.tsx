import React, { useMemo, useState } from "react";
import { Globe, Shield, Terminal, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { EndpointFCAJItem } from "./endpointFCAJData";
import { CONTINENT_PATHS } from "./EndpointConstants";
import { geoToXY } from "./EndpointUtils";

interface EndpointGeoMapProps {
  endpoints: EndpointFCAJItem[];
  selectedEndpointObj: EndpointFCAJItem | undefined;
  onSelectEndpoint: (id: string) => void;
}

export const EndpointGeoMap: React.FC<EndpointGeoMapProps> = ({ 
  endpoints,
  selectedEndpointObj, 
  onSelectEndpoint 
}) => {
  const [hoveredEp, setHoveredEp] = useState<EndpointFCAJItem | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Convert current selected trace route coordinates
  const pathCoordinates = useMemo(() => {
    if (!selectedEndpointObj || selectedEndpointObj.status === "Offline") return null;
    const { srcCoords, destCoords } = selectedEndpointObj.geoInfo;
    const srcXY = geoToXY(srcCoords[0], srcCoords[1]);
    const destXY = geoToXY(destCoords[0], destCoords[1]);
    return { 
      srcX: srcXY.x, 
      srcY: srcXY.y, 
      destX: destXY.x, 
      destY: destXY.y 
    };
  }, [selectedEndpointObj]);

  // Compute coordinate centers for all active/online endpoints
  const activeNodes = useMemo(() => {
    return endpoints.map(ep => {
      const { destCoords } = ep.geoInfo;
      const xy = geoToXY(destCoords[0], destCoords[1]);
      return {
        endpoint: ep,
        x: xy.x,
        y: xy.y
      };
    });
  }, [endpoints]);

  // Handle grid line iterations
  const gridLines = useMemo(() => {
    const vertical = Array.from({ length: 9 }, (_, i) => (i + 1) * 100);
    const horizontal = Array.from({ length: 7 }, (_, i) => (i + 1) * 50);
    return { vertical, horizontal };
  }, []);

  // Dynamic calculation for tooltip placement: top, bottom, left, right to prevent boundary overflows
  const tooltipStyle = useMemo(() => {
    if (!hoveredEp) return null;
    const { x, y } = hoverPos;
    
    let placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
    
    if (x < 220) {
      placement = "right";
    } else if (x > 780) {
      placement = "left";
    } else if (y < 120) {
      placement = "bottom";
    } else {
      placement = "top";
    }

    const styleObj: React.CSSProperties = {
      left: `${x / 10}%`,
      top: `${y / 4}%`,
    };

    let transformVal = "";
    let caretClassStr = "";

    switch (placement) {
      case "top":
        transformVal = "translate(-50%, -100%)";
        styleObj.marginTop = "-14px";
        caretClassStr = "bottom-[-6px] left-1/2 -translate-x-1/2 border-r border-b";
        break;
      case "bottom":
        transformVal = "translate(-50%, 0%)";
        styleObj.marginTop = "14px";
        caretClassStr = "top-[-6px] left-1/2 -translate-x-1/2 border-l border-t";
        break;
      case "left":
        transformVal = "translate(-100%, -50%)";
        styleObj.marginLeft = "-14px";
        caretClassStr = "right-[-6px] top-1/2 -translate-y-1/2 border-r border-t";
        break;
      case "right":
        transformVal = "translate(0%, -50%)";
        styleObj.marginLeft = "14px";
        caretClassStr = "left-[-6px] top-1/2 -translate-y-1/2 border-l border-b";
        break;
    }

    styleObj.transform = transformVal;

    return {
      style: styleObj,
      caretClass: caretClassStr,
      placement
    };
  }, [hoveredEp, hoverPos]);

  return (
    <div className="bg-card border border-border p-5 rounded-xl shadow-xs space-y-4 relative" id="endpoint-geomap-container">
      {/* 2D Geo Dashboard Title bar */}
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div className="flex gap-2 items-center">
          <Globe size={14} className="text-indigo-600 dark:text-cyan-400 animate-spin-slow" />
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Interactive Global Cyber-Range Map</h3>
            <p className="text-[8px] font-sans text-muted-foreground uppercase leading-none">High-Fidelity 2D Satellite Top Down Coordinate Grid</p>
          </div>
        </div>
        <div className="flex gap-3 items-center text-[8px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground uppercase">Healthy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-muted-foreground uppercase">Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-muted-foreground uppercase">Threat</span>
          </div>
        </div>
      </div>

      {/* Map visualization Frame */}
      <div className="h-115 md:h-125 border border-border bg-slate-50/70 dark:bg-slate-950/95 rounded-lg relative overflow-hidden select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
        
        {/* Dynamic Coordinate read-outs at the borders */}
        <div className="absolute top-2 left-3 font-mono text-[8px] text-slate-400 dark:text-muted-foreground/40 uppercase pointer-events-none tracking-widest">
          SECURE SECTOR // INGRESS STACK
        </div>
        <div className="absolute bottom-2 right-3 font-mono text-[8px] text-slate-400 dark:text-muted-foreground/40 uppercase pointer-events-none tracking-widest">
          SYSTEM REF: FCAJ_GEO_MATRIX_V3
        </div>

        {/* SVG Topographic Radar Display */}
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="w-full h-full text-slate-400/10 dark:text-foreground/3">
          
          <defs>
            {/* Soft grid matrix style pattern */}
            <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="currentColor" fillOpacity="0.12" />
            </pattern>
          </defs>

          {/* Grid pattern fill in oceans */}
          <rect width="1000" height="400" fill="url(#dotGrid)" className="text-slate-350/50 dark:text-cyan-500/10" />

          {/* Latitude & Longitude Coordinate Lines */}
          <g className="stroke-slate-300/30 dark:stroke-slate-800/50 stroke-1 pointer-events-none">
            {/* Longitude Vertical lines */}
            {gridLines.vertical.map(x => (
              <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={400} strokeDasharray="3 3" />
            ))}
            {/* Latitude Horizontal lines */}
            {gridLines.horizontal.map(y => (
              <line key={`h-${y}`} x1={0} y1={y} x2={1000} y2={y} strokeDasharray="3 3" />
            ))}
          </g>

          {/* Geographical Axis markings labels */}
          <g className="fill-slate-450 dark:fill-muted-foreground/30 font-mono text-[7px] pointer-events-none">
            <text x="505" y="15" textAnchor="start">PRIME MERIDIAN 0°00'</text>
            <text x="5" y="205" textAnchor="start">EQUATOR 0°00'</text>
            <text x="900" y="205" textAnchor="end">INTELLIGENCE REGION VII</text>
            <text x="110" y="105" textAnchor="start">120° W</text>
            <text x="710" y="105" textAnchor="start">60° E</text>
          </g>

          {/* Continental landmass boundaries with higher definition */}
          <g>
            {CONTINENT_PATHS.map((continent, idx) => (
              <path
                key={idx}
                d={continent.d}
                strokeWidth="1"
                className="transition-all duration-500 cursor-default fill-slate-200/90 dark:fill-slate-800/45 stroke-slate-300/80 dark:stroke-cyan-500/20 hover:fill-indigo-100 hover:stroke-indigo-400 dark:hover:fill-cyan-950/70 dark:hover:stroke-cyan-400"
              >
                <title>{continent.name}</title>
              </path>
            ))}
          </g>

          {/* 1. SECTOR INGRESS ATTACK THREAT PATH TRACE */}
          {pathCoordinates && (
            <g className="pointer-events-none">
              {/* Path glow backdrop line */}
              <path 
                d={`M ${pathCoordinates.srcX.toFixed(1)} ${pathCoordinates.srcY.toFixed(1)} Q ${(pathCoordinates.srcX + pathCoordinates.destX) / 2} ${(pathCoordinates.srcY + pathCoordinates.destY) / 2 - 80} ${pathCoordinates.destX.toFixed(1)} ${pathCoordinates.destY.toFixed(1)}`}
                fill="none"
                stroke={selectedEndpointObj?.status === "Critical" ? "#ef4444" : "#f59e0b"}
                strokeWidth="3.5"
                strokeOpacity="0.25"
              />

              {/* Path connector core dashed vector */}
              <path 
                d={`M ${pathCoordinates.srcX.toFixed(1)} ${pathCoordinates.srcY.toFixed(1)} Q ${(pathCoordinates.srcX + pathCoordinates.destX) / 2} ${(pathCoordinates.srcY + pathCoordinates.destY) / 2 - 80} ${pathCoordinates.destX.toFixed(1)} ${pathCoordinates.destY.toFixed(1)}`}
                fill="none"
                stroke={selectedEndpointObj?.status === "Critical" ? "#ef4444" : "#f59e0b"}
                strokeWidth="1.5"
                strokeDasharray="5 3"
                className="animate-pulse"
              />

              {/* Source Ingress IP Pin */}
              <circle cx={pathCoordinates.srcX.toFixed(1)} cy={pathCoordinates.srcY.toFixed(1)} r="4" fill="#ef4444">
                <animate attributeName="r" values="3;9;3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Connection flow wave */}
              <circle cx={pathCoordinates.srcX.toFixed(1)} cy={pathCoordinates.srcY.toFixed(1)} r="8" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeOpacity="0.8">
                <animate attributeName="r" values="4;16;4" dur="3s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* 2. DYNAMIC INTERACTIVE DEVICE NODES PLOTTING */}
          <g>
            {activeNodes.map(({ endpoint, x, y }) => {
              const isSelected = selectedEndpointObj?.id === endpoint.id;
              const isOffline = endpoint.status === "Offline";
              const isCritical = endpoint.status === "Critical";
              const isWarning = endpoint.status === "Warning";

              // Dot colors
              const color = 
                isOffline ? "#71717a" : // zinc-500
                isCritical ? "#ef4444" : // red-500
                isWarning ? "#f59e0b" : // amber-500
                "#10b981"; // emerald-500

              return (
                <g 
                  key={endpoint.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectEndpoint(endpoint.id)}
                  onMouseEnter={() => {
                    setHoveredEp(endpoint);
                    setHoverPos({ x, y });
                  }}
                  onMouseLeave={() => setHoveredEp(null)}
                >
                  {/* Selected device radiating telemetry ring */}
                  {isSelected && (
                    <circle 
                      cx={x.toFixed(1)} 
                      cy={y.toFixed(1)} 
                      r="12" 
                      fill="none" 
                      stroke={color} 
                      strokeWidth="1.2" 
                      className="animate-ping" 
                    />
                  )}

                  {/* Node trigger zone for friendly hover */}
                  <circle 
                    cx={x.toFixed(1)} 
                    cy={y.toFixed(1)} 
                    r="10" 
                    fill="transparent" 
                  />

                  {/* Status Indicator Core Dot */}
                  <circle 
                    cx={x.toFixed(1)} 
                    cy={y.toFixed(1)} 
                    r={isSelected ? "5.5" : "4.5"} 
                    fill={color}
                    className="transition-all duration-300 group-hover:scale-130"
                    stroke="#020617"
                    strokeWidth="1"
                  />

                  {/* Mini label annotation on hover */}
                  <text
                    x={x.toFixed(1)}
                    y={(y - 8).toFixed(1)}
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 fill-slate-800 dark:fill-slate-200 text-[8px] font-mono pointer-events-none transition-opacity bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1 rounded uppercase tracking-wider font-extrabold"
                  >
                    {endpoint.hostname}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Tooltip Balloon Overlay */}
        {hoveredEp && tooltipStyle && (
          <div 
            className="absolute bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-[10px] p-3 rounded-lg shadow-2xl pointer-events-none z-30 font-mono flex flex-col gap-1 w-64 max-w-sm"
            style={tooltipStyle.style}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-37.5 uppercase">{hoveredEp.hostname}</span>
              <span className={cn(
                "px-2 py-0.2 rounded text-[8px] font-black uppercase text-white",
                hoveredEp.status === "Critical" ? "bg-red-500 animate-pulse" :
                hoveredEp.status === "Warning" ? "bg-amber-500" :
                hoveredEp.status === "Offline" ? "bg-zinc-650" : "bg-emerald-500"
              )}>
                {hoveredEp.status}
              </span>
            </div>

            {/* Content data rows */}
            <div className="space-y-1 text-[8.5px] leading-tight text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-450 dark:text-slate-500">IP ADDRESS:</span>
                <span className="font-bold">{hoveredEp.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450 dark:text-slate-500">MACHINE ROLE:</span>
                <span className="font-bold truncate text-indigo-500 dark:text-indigo-400">{hoveredEp.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450 dark:text-slate-500">RISK CONSENSUS:</span>
                <span className={cn(
                  "font-bold font-mono",
                  hoveredEp.riskScore > 75 ? "text-red-500" : hoveredEp.riskScore > 40 ? "text-amber-500" : "text-emerald-500 dark:text-emerald-400"
                )}>
                  {hoveredEp.riskScore}% Factor
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450 dark:text-slate-500">LOCATION SITE:</span>
                <span className="font-bold uppercase tracking-tight">{hoveredEp.geoInfo.destCountry} ({hoveredEp.geoInfo.destCode})</span>
              </div>
            </div>

            <div className="text-[7.5px] text-slate-400 dark:text-muted-foreground/60 border-t border-slate-100 dark:border-slate-850 mt-1.5 pt-1.5 uppercase text-center leading-none">
              Click node to trigger live profiling
            </div>

            {/* Tiny caret dynamically directed based on alignment */}
            <div className={cn(
              "absolute w-3 h-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rotate-45",
              tooltipStyle.caretClass
            )} />
          </div>
        )}

        {/* Selected endpoint HUD sidebar panel */}
        {selectedEndpointObj && selectedEndpointObj.status !== "Offline" && (
          <div className="absolute inset-0 p-3 font-mono text-[8px] flex flex-col justify-between pointer-events-none uppercase">
            <div className="flex justify-between items-start">
              {/* Left label: Threat origin source country */}
              <div className="bg-white/95 dark:bg-red-950/70 border border-slate-200 dark:border-red-500/20 px-2.5 py-1.5 rounded-lg text-red-500 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                <Terminal size={10} className="text-red-500" />
                <div>
                  <p className="font-extrabold text-[7px] leading-none text-red-400/80">ATTACK VECTOR ORIGIN</p>
                  <p className="font-black text-[9px] leading-tight text-red-650 dark:text-red-400">{selectedEndpointObj.geoInfo.srcCountry} ({selectedEndpointObj.geoInfo.srcCode})</p>
                </div>
              </div>

              {/* Right label: Destination node site info */}
              <div className="bg-white/95 dark:bg-blue-955/65 border border-slate-200 dark:border-blue-500/20 px-2.5 py-1.5 rounded-lg text-blue-500 dark:text-blue-400 text-right backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                <div>
                  <p className="font-extrabold text-[7px] leading-none text-blue-400/80">TARGET PROTECTED ENDPOINT</p>
                  <p className="font-black text-[9px] leading-tight text-blue-650 dark:text-blue-400">{selectedEndpointObj.geoInfo.destCountry} ({selectedEndpointObj.geoInfo.destCode})</p>
                </div>
                <Shield size={10} className="text-blue-500 dark:text-blue-400" />
              </div>
            </div>

            {/* Bottom selected trace HUD info bar */}
            <div className="bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-border/80 p-2.5 px-4 rounded-lg self-center text-center max-w-sm shadow-md flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <div>
                <p className="text-slate-800 dark:text-slate-200 font-extrabold text-[9px] tracking-wide">
                  ROUTE STREAM: {selectedEndpointObj.hostname}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-[7.5px] lowercase flex items-center justify-center gap-1">
                  <span>{selectedEndpointObj.ip}</span>
                  <ArrowRight size={8} className="text-slate-400" />
                  <span>{selectedEndpointObj.mac}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Offline placeholder HUD prompt */}
        {(!selectedEndpointObj || selectedEndpointObj.status === "Offline") && (
          <div className="absolute inset-x-4 bottom-4 flex justify-center pointer-events-none">
            <div className="bg-white/95 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[8.5px] font-mono p-2.5 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center shadow-md">
              Active Sensor Range Online. Select any online host node to inspect route trace.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
