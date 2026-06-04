import React, { useMemo, useCallback } from "react";
import { useEndpointState } from "../hooks/useEndpointState";
import { EndpointPageHeader } from "../components/endpoint/EndpointPageHeader";
import { EndpointOverviewCards } from "../components/endpoint/EndpointOverviewCards";
import { EndpointInventoryTable } from "../components/endpoint/EndpointInventoryTable";
import { EndpointDetailDrawer } from "../components/endpoint/EndpointDetailDrawer";
import { EndpointTelemetryRow } from "../components/endpoint/EndpointTelemetryRow";
import { EndpointDetectorRow } from "../components/endpoint/EndpointDetectorRow";
import { EndpointGeoMap } from "../components/endpoint/EndpointGeoMap";
import { EndpointTrafficProfileCharts } from "../components/endpoint/EndpointTrafficProfileCharts";
import { EndpointIncidentsTable } from "../components/endpoint/EndpointIncidentsTable";
import { EndpointIncidentEvidenceModal } from "../components/endpoint/EndpointIncidentEvidenceModal";
import { EndpointAlertToast } from "../components/endpoint/EndpointAlertToast";
import { ATTACK_COLORS } from "../components/endpoint/EndpointConstants";

export function EndpointPage() {
  const {
    endpoints,
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
  } = useEndpointState();

  const selectedEndpointObj = useMemo(() => {
    return endpoints.find(e => e.id === selectedId);
  }, [endpoints, selectedId]);

  // Derived datasets for Heatmatrix and Top Risky systems
  const matrixEndPoints = useMemo(() => {
    // Show top 18 endpoints in matrix heatmap to keep density readable
    return endpoints.slice(0, 18);
  }, [endpoints]);

  const topRiskyData = useMemo(() => {
    return [...endpoints]
      .filter(e => e.status !== "Offline")
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10)
      .map(e => ({ hostname: e.hostname, riskScore: e.riskScore }));
  }, [endpoints]);

  // Compiled values for Zeek Log Traffic charts
  const trafficProfile = useMemo(() => {
    if (!selectedEndpointObj) return [{ name: "TCP", value: 45 }, { name: "UDP", value: 15 }, { name: "ICMP", value: 5 }];
    return [
      { name: "TCP", value: selectedEndpointObj.protocols.TCP },
      { name: "UDP", value: selectedEndpointObj.protocols.UDP },
      { name: "ICMP", value: selectedEndpointObj.protocols.ICMP }
    ];
  }, [selectedEndpointObj]);

  const serviceIndex = useMemo(() => {
    if (!selectedEndpointObj) return [
      { name: "HTTP", value: 12 }, { name: "DNS", value: 35 }, { name: "SSH", value: 4 },
      { name: "FTP", value: 1 }, { name: "HTTPS", value: 50 }, { name: "OTHER", value: 18 }
    ];
    return [
      { name: "HTTP", value: selectedEndpointObj.services.HTTP },
      { name: "DNS", value: selectedEndpointObj.services.DNS },
      { name: "SSH", value: selectedEndpointObj.services.SSH },
      { name: "FTP", value: selectedEndpointObj.services.FTP },
      { name: "HTTPS", value: selectedEndpointObj.services.HTTPS },
      { name: "OTHER", value: selectedEndpointObj.services.OTHER }
    ];
  }, [selectedEndpointObj]);

  const topSourceHosts = useMemo(() => {
    if (!selectedEndpointObj || selectedEndpointObj.status === "Offline") {
      // fallback generic stats
      return [
        { ip: "10.100.1.15", count: 42, bytes: 512204 },
        { ip: "10.100.2.22", count: 28, bytes: 210450 },
        { ip: "10.100.1.99", count: 19, bytes: 14209 }
      ];
    }
    return selectedEndpointObj.zeekConnLogs.slice(0, 3).map(l => ({
      ip: l.src_ip,
      count: Math.round(l.packets * 1.5 + 2),
      bytes: l.bytes
    }));
  }, [selectedEndpointObj]);

  const topDestHosts = useMemo(() => {
    if (!selectedEndpointObj || selectedEndpointObj.status === "Offline") {
      return [
        { ip: "203.0.113.88", count: 34, bytes: 412095 },
        { ip: "34.120.45.192", count: 21, bytes: 30204 },
        { ip: "192.168.1.99", count: 12, bytes: 9140 }
      ];
    }
    return selectedEndpointObj.zeekConnLogs.slice(2, 5).map(l => ({
      ip: l.dest_ip,
      count: Math.round(l.packets * 1.2 + 1),
      bytes: l.bytes
    }));
  }, [selectedEndpointObj]);

  // Doughnut compiled statistics for Alert Distribution
  const doughnutData = useMemo(() => {
    const counts: { [key: string]: number } = {
      "XSS Injection Web Payload": 0,
      "SQLi URI Database Probe": 0,
      "Cryptomining Activity Alerts": 0,
      "Cobalt Strike Active Beacon": 0,
      "SSH Brute Force External IP": 0,
      "Malicious Landing Redirect": 0,
    };

    endpoints.forEach(ep => {
      if (ep.status !== "Offline" && ep.alertCount > 0) {
        const sig = ep.suricata.signature;
        if (sig.includes("Drupal XML-RPC")) counts["XSS Injection Web Payload"] += ep.alertCount;
        else if (sig.includes("SQL Injection")) counts["SQLi URI Database Probe"] += ep.alertCount;
        else if (sig.includes("Cryptomining")) counts["Cryptomining Activity Alerts"] += ep.alertCount;
        else if (sig.includes("Cobalt Strike")) counts["Cobalt Strike Active Beacon"] += ep.alertCount;
        else if (sig.includes("SSH brute force")) counts["SSH Brute Force External IP"] += ep.alertCount;
        else counts["Malicious Landing Redirect"] += ep.alertCount;
      }
    });

    const categories = Object.keys(counts);
    return categories.map((cat, idx) => ({
      name: cat,
      value: counts[cat] || (idx * 5 + 4), // fallback baseline mock count
      color: ATTACK_COLORS[idx % ATTACK_COLORS.length]
    }));
  }, [endpoints]);

  // Export CSV files
  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Hostname", "IP Address", "Device Type", "OS", "Role", "Risk Score", "Health Score", "Status"];
    const rows = filteredEndpoints.map(e => [
      e.id,
      e.hostname,
      e.ip,
      e.deviceType,
      e.os,
      e.role,
      e.riskScore,
      e.healthScore,
      e.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fcaj_endpoint_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredEndpoints]);

  const handleSelectIncident = useCallback((inc: any) => {
    setSelectedIncident(inc);
    setIsModalOpen(true);
  }, [setSelectedIncident, setIsModalOpen]);

  return (
    <div className="w-full min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* 1. Header and Swapping controls */}
      <EndpointPageHeader 
        activeSegment={activeSegment} 
        setActiveSegment={setActiveSegment} 
      />

      {/* 2. Overview status metrics widgets */}
      <EndpointOverviewCards stats={stats} />

      {/* Conditional Segment Switching block */}
      {activeSegment === "inventory" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={isDrawerOpen && selectedEndpointObj ? "lg:col-span-8" : "lg:col-span-12"}>
              <EndpointInventoryTable
                filteredEndpoints={filteredEndpoints}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortField={sortField}
                setSortField={setSortField}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                visibleCols={visibleCols}
                setVisibleCols={setVisibleCols}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onIsolate={handleIsolate}
                onBlockIp={handleBlockIp}
                onExportCSV={handleExportCSV}
              />
            </div>

            <EndpointDetailDrawer
              selectedEndpointObj={selectedEndpointObj}
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
            />
          </div>

          {/* 3. Indicators: Health Score Gauge, Attack Path Tree, Device Chronicle Timeline */}
          <EndpointTelemetryRow 
            selectedEndpointObj={selectedEndpointObj} 
            timelineZoom={timelineZoom} 
            setTimelineZoom={setTimelineZoom} 
          />

          {/* 4. Incident / Threat Heatmap & Horizontal bar charts */}
          <EndpointDetectorRow 
            matrixEndPoints={matrixEndPoints} 
            topRiskyData={topRiskyData} 
            setSelectedId={setSelectedId} 
            setIsDrawerOpen={setIsDrawerOpen} 
          />

          {/* 5. SVG continental world map tracking */}
          <EndpointGeoMap 
            endpoints={endpoints}
            selectedEndpointObj={selectedEndpointObj} 
            onSelectEndpoint={(id) => {
              setSelectedId(id);
              setIsDrawerOpen(true);
            }}
          />

          {/* 6. Zeek connection logs flow spectrometers & Suricata taxonomy doughnut */}
          <EndpointTrafficProfileCharts
            trafficProfile={trafficProfile}
            serviceIndex={serviceIndex}
            topSourceHosts={topSourceHosts}
            topDestHosts={topDestHosts}
            doughnutData={doughnutData}
          />
        </div>
      ) : (
        <EndpointIncidentsTable 
          incidents={endpoints.flatMap(e => 
            e.timeline
              .filter(t => t.severity === "Critical" || t.severity === "High")
              .map(t => ({
                id: `INC-${t.id}`,
                timestamp: `2026-05-31T${t.time}:00Z`,
                endpointId: e.id,
                hostname: e.hostname,
                ip: e.ip,
                attackType: t.event.split(" ").slice(0, 2).join(" "),
                severity: t.severity,
                riskScore: e.riskScore,
                aiSource: "FCAJ Engine Consensus v3",
                zeekLogs: {
                  conn: e.zeekConnLogs[0] || {
                    id: `conn-${t.id}`,
                    timestamp: `2026-05-31T${t.time}:00Z`,
                    duration: 4.8,
                    bytes: 84102,
                    packets: 75,
                    conn_state: "SF",
                    proto: "TCP" as const,
                    service: "HTTPS" as const,
                    src_ip: e.ip,
                    dest_ip: "34.120.45.192",
                    src_port: 50401,
                    dest_port: 443
                  },
                  http: e.zeekHttpLogs[0]
                },
                suricataAlert: e.alertCount > 0 ? {
                  id: `alert-${t.id}`,
                  timestamp: `2026-05-31T${t.time}:00Z`,
                  signature: e.suricata.signature,
                  category: e.suricata.category,
                  severity: e.suricata.severity,
                  src_ip: e.ip,
                  dest_ip: "34.120.45.192",
                  src_port: 50401,
                  dest_port: 443
                } : undefined
              }))
          )}
          onSelectIncident={handleSelectIncident}
        />
      )}

      {/* Consensus Evidence dialog */}
      <EndpointIncidentEvidenceModal 
        selectedIncident={selectedIncident} 
        isModalOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Real-time Toast Threat updates popup */}
      <EndpointAlertToast 
        alertPopup={alertPopup} 
        onClose={() => setAlertPopup(null)} 
      />
    </div>
  );
}
export default EndpointPage;
