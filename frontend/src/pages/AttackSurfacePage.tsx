import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Server, ShieldCheck, RefreshCw } from "lucide-react";
import { Asset, CloudResource } from "../components/attackSurface/types";
import { INITIAL_ASSETS, CLOUD_RESOURCES_MOCK } from "../components/attackSurface/mockData";
import { AssetInventoryTable } from "../components/attackSurface/AssetInventoryTable";
import { InfrastructureMap } from "../components/attackSurface/InfrastructureMap";
import { AssetTypeDistribution } from "../components/attackSurface/AssetTypeDistribution";
import { AssetZoneDistribution } from "../components/attackSurface/AssetZoneDistribution";
import { InternetFacingAssetsPanel } from "../components/attackSurface/InternetFacingAssetsPanel";
import { FusionRiskInventory } from "../components/attackSurface/FusionRiskInventory";
import { CloudResourceStatus } from "../components/attackSurface/CloudResourceStatus";
import { AssetDetailDrawer } from "../components/attackSurface/AssetDetailDrawer";
import { appConfig } from "../config";
import { DataModeNotice, EmptyState } from "../components/common/DataState";

export function AttackSurfacePage() {
  const isSimulated = appConfig.dataMode !== "live";
  const [assets, setAssets] = useState<Asset[]>(() => isSimulated ? INITIAL_ASSETS : []);
  const [cloudResources, setCloudResources] = useState<CloudResource[]>(() => isSimulated ? CLOUD_RESOURCES_MOCK : []);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [lastUpdateSec, setLastUpdateSec] = useState<number>(0);

  // Periodic Telemetry Simulator to simulate WebSocket asset status changes
  useEffect(() => {
    if (!isSimulated) return;
    // Increment timer
    const secondsTimer = setInterval(() => {
      setLastUpdateSec((p) => p + 1);
    }, 1000);

    // Asset status / risk score updater
    const simulationTimer = setInterval(() => {
      setAssets((prevAssets) => {
        // Pick a random asset to update risk and status
        const randomIndex = Math.floor(Math.random() * prevAssets.length);
        return prevAssets.map((asset, idx) => {
          if (idx === randomIndex) {
            const shift = Math.floor(Math.random() * 7) - 3; // -3 to +3
            const newScore = Math.min(99, Math.max(10, asset.riskScore + shift));
            
            let newStatus: "Normal" | "Warning" | "Critical" = "Normal";
            if (newScore >= 80) newStatus = "Critical";
            else if (newScore >= 45) newStatus = "Warning";

            return {
              ...asset,
              riskScore: newScore,
              status: newStatus,
              lastSeen: "Just now"
            };
          }
          return asset;
        });
      });
      setLastUpdateSec(0);
    }, 6000);

    return () => {
      clearInterval(secondsTimer);
      clearInterval(simulationTimer);
    };
  }, [isSimulated]);

  // Compute Active selected asset object
  const activeAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return assets.find((a) => a.id === selectedAssetId) || null;
  }, [assets, selectedAssetId]);

  // KPI Calculations
  const totalAssetsCount = assets.length;
  const internetFacingCount = useMemo(() => assets.filter((a) => a.zone === "DMZ").length, [assets]);
  const cloudAssetsCount = useMemo(() => assets.filter((a) => a.zone === "AWS Cloud").length, [assets]);
  const highFusionRiskAssetsCount = useMemo(() => assets.filter((a) => a.riskScore >= 80).length, [assets]);
  const averageFusionRiskScore = useMemo(() => {
    if (assets.length === 0) return 0;
    const sum = assets.reduce((acc, a) => acc + a.riskScore, 0);
    return Math.round(sum / assets.length);
  }, [assets]);

  if (!isSimulated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background text-foreground p-3 sm:p-6 font-sans antialiased space-y-6 transition-colors duration-300"
      >
        <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-3 border-b border-border/20 pb-4_">
          <div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-xs shrink-0" />
              Asset Discovery & Attack Surface Inventory
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-1 uppercase tracking-wider">
              Enterprise Hybrid Cloud Visibility & Risk Inventory Layer
            </p>
          </div>
          <div className="flex items-center gap-2.5 font-mono text-[9px] bg-background border border-border px-3 py-1.5 rounded-lg select-none">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block" />
            <span className="text-muted-foreground uppercase">Discovery Engine:</span>
            <span className="text-foreground tracking-widest font-black uppercase">Waiting for telemetry</span>
          </div>
        </div>
        <DataModeNotice mode={appConfig.dataMode} />
        <EmptyState label="Waiting for live asset discovery telemetry." />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground p-3 sm:p-6 font-sans antialiased space-y-6 transition-colors duration-300"
    >
      {/* ─── 1. PAGE TITLE HEADER ─── */}
      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-3 border-b border-border/20 pb-4_">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-xs shrink-0 animate-pulse" />
            ASSET DISCOVERY & ATTACK SURFACE INVENTORY
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-1 uppercase tracking-wider">
            Enterprise Hybrid Cloud Visibility & Risk Inventory Layer (SOC v3 Compliant)
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[9px] bg-background border border-border px-3 py-1.5 rounded-lg select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block animate-ping" />
          <span className="text-muted-foreground uppercase">ZEEK TELEMETRY DISCOVERY ENGINE:</span>
          <span className="text-foreground tracking-widest font-black uppercase">
            {isSimulated ? (lastUpdateSec === 0 ? "RECEIVED UPDATE" : `${lastUpdateSec}S AGO`) : "WAITING FOR TELEMETRY"}
          </span>
        </div>
      </div>

      <DataModeNotice mode={appConfig.dataMode} />
      {!isSimulated && assets.length === 0 && (
        <EmptyState label="Waiting for live asset discovery telemetry." />
      )}

      {/* ─── 2. HEADER KPI BAR ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 select-none w-full">
        {/* Total Assets */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Total Assets
          </p>
          <p className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400 leading-none">
            {totalAssetsCount}
          </p>
          <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
            Discovered nodes
          </p>
        </div>

        {/* Internet-Facing Assets */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Internet Facing Assets
          </p>
          <p className="text-2xl font-mono font-black text-amber-600 dark:text-amber-450 leading-none">
            {internetFacingCount}
          </p>
          <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
            Exposed in DMZ
          </p>
        </div>

        {/* Cloud Assets */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Cloud Assets
          </p>
          <p className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400 leading-none">
            {cloudAssetsCount}
          </p>
          <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
            AWS cloud resource count
          </p>
        </div>

        {/* High Fusion Risk Assets */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            High Fusion Risk Assets
          </p>
          <p className="text-2xl font-mono font-black text-red-600 dark:text-red-400 leading-none">
            {highFusionRiskAssetsCount}
          </p>
          <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
            Fusion Score &gt;= 80
          </p>
        </div>

        {/* Average Fusion Risk */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 col-span-2 md:col-span-1 relative overflow-hidden">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Average Fusion Risk
          </p>
          <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-450 leading-none">
            {averageFusionRiskScore}
          </p>
          <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
            Aggregated metric
          </p>
        </div>
      </div>

      {/* ─── ROW 1: INFRASTRUCTURE MAP & ASSET INVENTORY (WITH RIGHT DETAIL DRAWER ACTION) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Topo and Table stacked or split depending on selection */}
        <div className={`transition-all duration-300 w-full ${selectedAssetId ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <div className="flex flex-col gap-6 w-full">
            {/* Infrastructure Map */}
            <InfrastructureMap
              assets={assets}
              selectedAssetId={selectedAssetId}
              onSelectAssetId={setSelectedAssetId}
            />

            {/* Asset Inventory */}
            <AssetInventoryTable
              assets={assets}
              selectedAssetId={selectedAssetId}
              onSelectAssetId={setSelectedAssetId}
            />
          </div>
        </div>

        {/* Right Column: Dynamic Asset Detail Drawer (Inline, Toggleable) */}
        {selectedAssetId && (
          <div className="lg:col-span-4 w-full h-full animate-fade-in">
            <AssetDetailDrawer
              asset={activeAsset}
              onClose={() => setSelectedAssetId(null)}
            />
          </div>
        )}
      </div>

      {/* ─── ROW 2: ASSET TYPE DISTRIBUTION & ASSET ZONE DISTRIBUTION & INTERNET FACING ASSETS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Asset Type Distribution */}
        <AssetTypeDistribution assets={assets} />

        {/* Asset Zone Distribution */}
        <AssetZoneDistribution assets={assets} />

        {/* Internet Facing Assets */}
        <InternetFacingAssetsPanel assets={assets} onSelectAssetId={setSelectedAssetId} />
      </div>

      {/* ─── ROW 3: HIGH FUSION RISK ASSETS & CLOUD RESOURCE STATUS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* High Fusion Risk Assets inventory */}
        <FusionRiskInventory assets={assets} onSelectAssetId={setSelectedAssetId} />

        {/* Cloud operational resource status */}
        <CloudResourceStatus assets={assets} cloudResources={cloudResources} />
      </div>
    </motion.div>
  );
}
