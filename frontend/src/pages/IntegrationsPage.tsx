import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

// Types & Mock Data
import { Integration, SyncEvent } from "../components/integrations/types";
import { MOCK_INTEGRATIONS, MOCK_SYNC_EVENTS } from "../components/integrations/integrationFCAJData";

// Refactored Subcomponents
import { IntegrationPageHeader } from "../components/integrations/IntegrationPageHeader";
import { IntegrationKPIs } from "../components/integrations/IntegrationKPIs";
import { IntegrationInventoryTable } from "../components/integrations/IntegrationInventoryTable";
import { TelemetrySourcesPanel } from "../components/integrations/TelemetrySourcesPanel";
import { CloudIntegrationsPanel } from "../components/integrations/CloudIntegrationsPanel";
import { ConnectivityMap } from "../components/integrations/ConnectivityMap";
import { IntegrationEventFeed } from "../components/integrations/IntegrationEventFeed";
import { IntegrationDetailDrawer } from "../components/integrations/IntegrationDetailDrawer";
import { appConfig } from "../config";
import { DataModeNotice, EmptyState, ErrorState } from "../components/common/DataState";

export function IntegrationsPage() {
  const isSimulated = appConfig.dataMode !== "live";
  // --- States ---
  const [integrations, setIntegrations] = useState<Integration[]>(() => isSimulated ? MOCK_INTEGRATIONS : []);
  const [events, setEvents] = useState<SyncEvent[]>(() => isSimulated ? MOCK_SYNC_EVENTS : []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(isSimulated ? null : "Live integration inventory service is not connected.");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState("JUST NOW");
  const [lastSyncSec, setLastSyncSec] = useState(0);

  // --- Clock Ticker ---
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(
        now.getUTCFullYear() + "-" + 
        String(now.getUTCMonth() + 1).padStart(2, '0') + "-" + 
        String(now.getUTCDate()).padStart(2, '0') + " " + 
        String(now.getUTCHours()).padStart(2, '0') + ":" + 
        String(now.getUTCMinutes()).padStart(2, '0') + ":" + 
        String(now.getUTCSeconds()).padStart(2, '0') + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Synchronization Live Timer ---
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncSec((p) => {
        const next = p + 1;
        if (next === 0) setLastSyncText("JUST NOW");
        else setLastSyncText(`${next}S AGO`);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Periodic Telemetry Updates (Lightweight Polling Mock) ---
  useEffect(() => {
    if (!isSimulated) return;
    const simTimer = setInterval(() => {
      // 1. Randomly update 1 status or health to show dynamic reactivity
      setIntegrations((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        return prev.map((item, idx) => {
          if (idx === randomIndex) {
            // Pick a random status or health update
            const randomType = Math.random() > 0.65 ? "status" : "health";
            if (randomType === "status") {
              const nextStatus = Math.random() > 0.85 ? "Warning" : "Connected";
              return { ...item, status: nextStatus, lastSync: "Just Now" };
            } else {
              const nextHealth = Math.random() > 0.85 ? "Warning" : "Healthy";
              return { ...item, health: nextHealth, lastSync: "Just Now" };
            }
          }
          return item;
        });
      });

      // 2. Add an audit event occasionally
      if (Math.random() > 0.7) {
        const syncLogsList = [
          "Zeek network stream heartbeat synchronized",
          "Filebeat local buffer connection confirmed",
          "Suricata eve.json stream verified",
          "AWS SQS message packet sync succeeded",
          "AWS RDS PostgreSQL metadata indexed",
          "AWS S3 bucket persistence mapping checked"
        ];
        const randomInt = MOCK_INTEGRATIONS[Math.floor(Math.random() * MOCK_INTEGRATIONS.length)];
        const randomMsg = syncLogsList[Math.floor(Math.random() * syncLogsList.length)];
        
        const newEvent: SyncEvent = {
          id: Math.random().toString(),
          timestamp: "JUST NOW",
          integration: randomInt.name,
          event: randomMsg,
          status: Math.random() > 0.9 ? "Warning" : "Success"
        };

        setEvents((prev) => {
          // Keep top 7 events max
          const next = [newEvent, ...prev.map(e => {
            if (e.timestamp === "JUST NOW") return { ...e, timestamp: "30S AGO" };
            if (e.timestamp.includes("S AGO")) {
              const secs = parseInt(e.timestamp) + 30;
              return { ...e, timestamp: `${secs}S AGO` };
            }
            return e;
          })];
          return next.slice(0, 10);
        });

        // Reset the main sync timer text
        setLastSyncSec(0);
        setLastSyncText("JUST NOW");
      }
    }, 6000);

    return () => clearInterval(simTimer);
  }, [isSimulated]);

  // --- Manual Force Refresh Handler ---
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (!isSimulated) {
        setError("Live integration inventory service is not connected.");
        return;
      }
      setLastSyncSec(0);
      setLastSyncText("JUST NOW");

      // Reset all status to Connected and Healthy
      setIntegrations((prev) => prev.map(item => ({
        ...item,
        status: "Connected",
        health: "Healthy",
        lastSync: "Just Now"
      })));

      // Add audit refresh log
      const refreshEvent: SyncEvent = {
        id: Math.random().toString(),
        timestamp: "JUST NOW",
        integration: "Ecosystem Ingestion Sync Engine",
        event: "Manual global boundary health check completed, all connections synchronized.",
        status: "Success"
      };
      setEvents((prev) => [refreshEvent, ...prev].slice(0, 10));
    }, 700);
  }, [isSimulated]);

  // --- Filtered Integrations ---
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      const matchSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dataType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [integrations, searchQuery, selectedCategory]);

  // --- Selected Integration item details ---
  const activeIntegration = useMemo(() => {
    if (!selectedId) return null;
    return integrations.find(i => i.id === selectedId) || null;
  }, [integrations, selectedId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground p-3 sm:p-6 font-sans antialiased space-y-6 transition-colors duration-300 pb-16"
    >
      {/* ─── Header Section ─── */}
      <IntegrationPageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        systemTime={systemTime}
      />

      <DataModeNotice mode={appConfig.dataMode} />
      {error && <ErrorState label={error} onRetry={handleRefresh} />}
      {!error && filteredIntegrations.length === 0 && (
        <EmptyState label="Waiting for integration telemetry." />
      )}

      {/* ─── KPI Section ─── */}
      {isSimulated && (
        <>
      <IntegrationKPIs
        integrations={integrations}
        lastSyncText={lastSyncText}
      />

      {/* ─── Connectivity Map (Full Width) ─── */}
      <div className="w-full">
        <ConnectivityMap integrations={integrations} />
      </div>

      {/* ─── Main Content Workspace Grid (Split 8 + 4 cols or similar) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* Left Section: table inventory (resembles normal operation view) */}
        <div className={cn(
          "transition-all duration-300 w-full",
          selectedId ? "lg:col-span-8" : "lg:col-span-12"
        )}>
          <IntegrationInventoryTable
            integrations={filteredIntegrations}
            selectedId={selectedId}
            onSelect={(item) => setSelectedId(item.id)}
          />
        </div>

        {/* Right Section: slide-in context details profile */}
        {selectedId && (
          <div className="lg:col-span-4 w-full h-full animate-fade-in">
            <IntegrationDetailDrawer
              integration={activeIntegration}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>

      {/* ─── Secondary Detail Panels with Telemetry Sources & Cloud Integrations ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Telemetry Sources (Zeek, Suricata, Filebeat) */}
        <TelemetrySourcesPanel
          integrations={integrations}
          onSelect={(id) => setSelectedId(id)}
        />

        {/* Cloud integrations monitoring (SQS, S3, RDS, CloudWatch) */}
        <CloudIntegrationsPanel
          integrations={integrations}
          onSelect={(id) => setSelectedId(id)}
        />

        {/* Event feeds */}
        <IntegrationEventFeed
          events={events}
        />
      </div>
        </>
      )}

    </motion.div>
  );
}
