import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  generateFCAJData, 
  EndpointFCAJItem, 
  ZeekConnLog, 
  SuricataAlert, 
  IncidentFCAJ 
} from "../components/endpoint/endpointFCAJData";
import { appConfig } from "../config";

export const useEndpointState = () => {
  const isSimulated = appConfig.dataMode !== "live";
  // 1. Core dataset loaded from FCAJ mock database engine
  const [data] = useState(() => isSimulated ? generateFCAJData() : {
    endpoints: [] as EndpointFCAJItem[],
    flows: [] as ZeekConnLog[],
    alerts: [] as SuricataAlert[],
    incidents: [] as IncidentFCAJ[],
  });
  const [endpoints, setEndpoints] = useState<EndpointFCAJItem[]>(() => data.endpoints);
  const [flows] = useState<ZeekConnLog[]>(() => data.flows);
  const [alerts] = useState<SuricataAlert[]>(() => data.alerts);
  const [incidents] = useState<IncidentFCAJ[]>(() => data.incidents);

  // Interaction States
  const [selectedId, setSelectedId] = useState<string | null>(isSimulated ? "EP-FCAJ-2012" : null); // defaults to high threat EP
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentFCAJ | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"inventory" | "incidents">("inventory");

  // Filter systems
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<keyof EndpointFCAJItem>("riskScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Visible columns state
  const [visibleCols, setVisibleCols] = useState({
    hostname: true,
    ip: true,
    deviceType: true,
    os: true,
    role: true,
    alertCount: true,
    riskScore: true,
    healthScore: true,
    status: true,
  });

  // Timeline zoom state
  const [timelineZoom, setTimelineZoom] = useState<number>(100); // percentage time scale window

  // Active custom threat campaign popup
  const [alertPopup, setAlertPopup] = useState<{
    id: string;
    title: string;
    message: string;
    severity: "Critical" | "High" | "Medium";
  } | null>(null);

  // Real-time background update simulation (updates every 4 seconds)
  useEffect(() => {
    if (!isSimulated) return;
    const timer = setInterval(() => {
      // Pick a random healthy endpoint and tick its traffic & metrics
      setEndpoints(prev => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const ep = { ...next[randomIndex] };

        // Ensure offline endpoints don't simulate real-time live hits unless booting up
        if (ep.status !== "Offline") {
          ep.totalConnections += Math.floor(Math.random() * 8) + 1;
          ep.totalBytes += Math.floor(Math.random() * 5000) + 1200;
          ep.riskScore = Math.min(100, Math.max(0, ep.riskScore + (Math.random() > 0.65 ? (Math.random() > 0.5 ? 2 : -2) : 0)));
          ep.healthScore = Math.max(5, Math.min(100, 100 - Math.round(ep.riskScore * 0.9)));
          
          if (Math.random() > 0.85) {
            ep.alertCount += 1;
            const newAlertTypes = ["XSS Probe Hits", "SQLi Injection Vector", "Dreaded Brute Force Execution", "Unusual Beaconing Detected"];
            const selectedAlert = newAlertTypes[Math.floor(Math.random() * newAlertTypes.length)];
            
            ep.timeline = [
              {
                id: `t-sim-${Date.now()}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                event: `Simulated: ${selectedAlert}`,
                severity: "High"
              },
              ...ep.timeline
            ];

            // Trigger visual overlay notification block
            setAlertPopup({
              id: `pop-${Date.now()}`,
              title: `REAL-TIME THREAT: ${ep.hostname}`,
              message: `AI/Fusion system flagged ${selectedAlert} targeting endpoint ${ep.ip}.`,
              severity: ep.riskScore > 75 ? "Critical" : "High"
            });
          }
          next[randomIndex] = ep;
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isSimulated]);

  // Cleanup alert popup toast automatically
  useEffect(() => {
    if (alertPopup) {
      const timeout = setTimeout(() => {
        setAlertPopup(null);
      }, 5500);
      return () => clearTimeout(timeout);
    }
  }, [alertPopup]);

  // Isolate machine callback helper
  const handleIsolate = useCallback((ep: EndpointFCAJItem) => {
    if (!isSimulated) {
      setAlertPopup({
        id: `act-${Date.now()}`,
        title: "ACTION UNAVAILABLE",
        message: "Live endpoint response requires backend EDR integration.",
        severity: "Medium"
      });
      return;
    }
    setEndpoints(prev => 
      prev.map(item => 
        item.id === ep.id 
          ? {
              ...item,
              status: "Offline",
              riskScore: 0,
              healthScore: 100,
              timeline: [
                { id: `iso-${Date.now()}`, time: "JUST NOW", event: "VPC ISOLATION POLICY ENFORCED", severity: "Critical" },
                ...item.timeline
              ]
            }
          : item
      )
    );
    setAlertPopup({
      id: `act-${Date.now()}`,
      title: `NODE RETRACTED: ${ep.hostname}`,
      message: `Quarantine logic dispatched to vpc domain controller. Node completely isolated.`,
      severity: "Medium"
    });
  }, [isSimulated]);

  // Block router IP helper
  const handleBlockIp = useCallback((ep: EndpointFCAJItem) => {
    setAlertPopup({
      id: `act-block-${Date.now()}`,
      title: `GATEWAY ACCESS DENIED`,
      message: `Inbound routing from external vector dropping rules for ${ep.ip}.`,
      severity: "Medium"
    });
  }, []);

  // Memoized statistical calculations for 1. ENDPOINT OVERVIEW CARDS
  const stats = useMemo(() => {
    const total = endpoints.length;
    const active = endpoints.filter(e => e.status !== "Offline").length;
    const alertList = endpoints.filter(e => e.alertCount > 0).length;
    const critical = endpoints.filter(e => e.status === "Critical").length;
    const newCount = isSimulated ? Math.floor(total * 0.08) + 1 : 0; // demo/replay telemetry
    return { total, active, alertList, critical, newCount };
  }, [endpoints, isSimulated]);

  // Pagination page state
  const [currentPage, setCurrentPage] = useState(1);

  // Filter application & list formatting for 2. ENDPOINT INVENTORY TABLE
  const filteredEndpoints = useMemo(() => {
    let list = [...endpoints];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.hostname.toLowerCase().includes(q) || 
        e.ip.toLowerCase().includes(q) || 
        e.id.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== "ALL") {
      list = list.filter(e => e.deviceType === typeFilter);
    }

    if (roleFilter !== "ALL") {
      list = list.filter(e => e.role === roleFilter);
    }

    if (statusFilter !== "ALL") {
      list = list.filter(e => e.status === statusFilter);
    }

    // Sorting
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc" 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });

    return list;
  }, [endpoints, searchQuery, typeFilter, roleFilter, statusFilter, sortField, sortOrder]);

  return {
    endpoints,
    setEndpoints,
    flows,
    alerts,
    incidents,
    selectedId,
    setSelectedId,
    isDrawerOpen,
    setIsDrawerOpen,
    selectedIncident,
    setSelectedIncident,
    isModalOpen,
    setIsModalOpen,
    activeSegment,
    setActiveSegment,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    visibleCols,
    setVisibleCols,
    timelineZoom,
    setTimelineZoom,
    alertPopup,
    setAlertPopup,
    handleIsolate,
    handleBlockIp,
    stats,
    filteredEndpoints,
    currentPage,
    setCurrentPage,
    isSimulated,
    dataMode: appConfig.dataMode
  };
};
