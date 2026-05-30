import React from "react";
import { PSIScoreCard } from "./PSIScoreCard";
import { DatasetComparisonChart } from "./DatasetComparisonChart";
import { ModelDegradationChart } from "./ModelDegradationChart";
import { BarChart2, RefreshCw } from "lucide-react";

export function DriftDashboard() {
  return (
    <div className="space-y-6">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm leading-none">
        <div>
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <BarChart2 size={16} className="text-cyan-500 animate-pulse" />
            Dataset Drift & model degradation dashboard
          </h2>
          <p className="text-[9.5px] font-black text-muted-foreground uppercase tracking-wider mt-1">
             LONGITUDINAL POPULATION DRIFT METRICS AND SYNTHETIC BASELINE EVALUATIONS
          </p>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-border border border-border rounded-lg text-[9.5px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all cursor-pointer leading-none"
        >
          <RefreshCw size={11} />
          Sync Drift Baselines
        </button>
      </div>

      {/* 2. PSI scoring indicators (top row) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <PSIScoreCard />
      </div>

      {/* 3. Breakdown visualizations (Double Column) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        {/* Histograms card */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <DatasetComparisonChart />
        </div>

        {/* Longitudinal Accuracy card */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <ModelDegradationChart />
        </div>
      </div>
    </div>
  );
}
export default DriftDashboard;
