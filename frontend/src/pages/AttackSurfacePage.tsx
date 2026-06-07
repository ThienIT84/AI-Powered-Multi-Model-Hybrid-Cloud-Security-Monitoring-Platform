import React from "react";
import { useAttackSurface } from "../components/attackSurface/useAttackSurface";
import { AttackSurfaceHeader } from "../components/attackSurface/AttackSurfaceHeader";
import { AttackSurfaceKpiCards } from "../components/attackSurface/AttackSurfaceKpiCards";
import { AttackSurfaceMap } from "../components/attackSurface/AttackSurfaceMap";
import { AttackPathVisualizer } from "../components/attackSurface/AttackPathVisualizer";
import { HighRiskAssetsPanel } from "../components/attackSurface/HighRiskAssetsPanel";
import { LiveCorrelationFeed } from "../components/attackSurface/LiveCorrelationFeed";
import { ExposureDistributionChart } from "../components/attackSurface/ExposureDistributionChart";
import { AttackSurfaceAnalyticsTrends } from "../components/attackSurface/AttackSurfaceAnalyticsTrends";
import { AwsCompliancePanel } from "../components/attackSurface/AwsCompliancePanel";
import { AssetForensicDrawer } from "../components/attackSurface/AssetForensicDrawer";

export function AttackSurfacePage() {
  const {
    assets,
    awsServices,
    correlations,
    selectedAssetId,
    setSelectedAssetId,
    selectedPathId,
    setSelectedPathId,
    timeRange,
    setTimeRange,
    searchTerm,
    setSearchTerm,
    secondsSinceUpdate,
    activeAsset,
    filteredAssetsTable,
    averageExposureMultiplier
  } = useAttackSurface();

  // DERIVED METRICS FOR KPINUMBERS
  const totalAssetsCount = 326;
  const internetFacingCount = 42;
  const activeAttackPathsCount = 18;
  const highRiskAssetsCount = assets.filter((a) => a.riskScore >= 75).length + 18;

  return (
    <div className="min-h-screen bg-slate-55 dark:bg-[#0B1220] text-slate-800 dark:text-gray-100 p-3 sm:p-6 font-sans antialiased overflow-hidden leading-normal selection:bg-rose-500/30 selection:text-white transition-colors duration-150">
      {/* ─── 1. TOP STATS OVERVIEW SECTION ───────────────────────────────────── */}
      <AttackSurfaceHeader
        secondsSinceUpdate={secondsSinceUpdate}
        averageExposureMultiplier={averageExposureMultiplier}
      />

      {/* ─── OVERVIEW KPI CARDS ──────────────────────────────────────────────── */}
      <AttackSurfaceKpiCards
        totalAssetsCount={totalAssetsCount}
        internetFacingCount={internetFacingCount}
        activeAttackPathsCount={activeAttackPathsCount}
        highRiskAssetsCount={highRiskAssetsCount}
        averageExposureMultiplier={averageExposureMultiplier}
      />

      {/* ─── MAIN CONTENT COLUMN LAYOUT ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Map, path, risk list, correlation (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <AttackSurfaceMap
            assets={assets}
            selectedAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
          />
          
          <AttackPathVisualizer
            selectedPathId={selectedPathId}
            setSelectedPathId={setSelectedPathId}
          />
          
          <HighRiskAssetsPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredAssetsTable={filteredAssetsTable}
            selectedAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
          />
          
          <LiveCorrelationFeed correlations={correlations} />
        </div>

        {/* RIGHT COLUMN: Pie metrics, trends, AWS Cloud (Span 1) */}
        <div className="space-y-6">
          <ExposureDistributionChart averageExposureMultiplier={averageExposureMultiplier} />
          
          <AttackSurfaceAnalyticsTrends
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />
          
          <AwsCompliancePanel awsServices={awsServices} />
        </div>

      </div>

      {/* ─── 8. ASSET DETAIL DRAWER SLIDE-OUT PANEL ───────────────────────── */}
      <AssetForensicDrawer
        activeAsset={activeAsset}
        setSelectedAssetId={setSelectedAssetId}
      />
    </div>
  );
}
