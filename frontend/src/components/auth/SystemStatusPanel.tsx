import { useEffect, useState } from "react";
import { Activity, Cloud, Cpu, Network, Server, Shield } from "lucide-react";
import { apiRequest } from "../../api/client";

type HealthState =
  | { status: "checking"; deploymentTarget: null }
  | { status: "available"; deploymentTarget: "local" | "aws" | null }
  | { status: "unavailable"; deploymentTarget: null };

function parseDeploymentTarget(payload: unknown): "local" | "aws" | null {
  if (!payload || typeof payload !== "object") return null;
  const value = (payload as { deploymentTarget?: unknown }).deploymentTarget;
  return value === "local" || value === "aws" ? value : null;
}

function isLiveResponse(payload: unknown): boolean {
  return Boolean(
    payload
      && typeof payload === "object"
      && (payload as { status?: unknown }).status === "ok",
  );
}

export function SystemStatusPanel() {
  const [health, setHealth] = useState<HealthState>({ status: "checking", deploymentTarget: null });

  useEffect(() => {
    const controller = new AbortController();

    void apiRequest<unknown>("/api/health/live", {
      authenticated: false,
      signal: controller.signal,
    })
      .then((payload) => {
        if (!isLiveResponse(payload)) throw new Error("Unexpected liveness response");
        setHealth({ status: "available", deploymentTarget: parseDeploymentTarget(payload) });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHealth({ status: "unavailable", deploymentTarget: null });
        }
      });

    return () => controller.abort();
  }, []);

  const capabilities = [
    {
      icon: Network,
      title: "Zeek telemetry ingestion",
      subtitle: "Normalized network events enter through the authenticated ingestion API.",
    },
    {
      icon: Cpu,
      title: "Multi-model detection",
      subtitle: "AI1, AI2A and AI2B outputs are combined by the Fusion Layer.",
    },
    {
      icon: Cloud,
      title: "Local and AWS deployment",
      subtitle: "The same dashboard supports the local lab and the CloudFront-hosted environment.",
    },
  ];

  const healthLabel = health.status === "checking"
    ? "Checking"
    : health.status === "available"
      ? "Available"
      : "Unavailable";
  const healthClasses = health.status === "available"
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    : health.status === "checking"
      ? "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "border-slate-300 bg-slate-100 text-slate-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500";

  return (
    <div className="space-y-6 text-left font-mono" id="system-status-hero-deck">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          <Shield size={9} className="stroke-[2.5]" />
          Hybrid Cloud SOC
        </div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Security monitoring workspace
        </h3>
        <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-zinc-400 font-sans">
          Sign in to inspect backend-reported alerts, model results and integration health.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="border-b border-slate-100 pb-2 text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:border-zinc-900/60 dark:text-zinc-500">
          Platform capabilities
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {capabilities.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-zinc-900/50 dark:bg-zinc-950/20">
              <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-cyan-400">
                <Icon size={14} className="stroke-2" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-black uppercase text-slate-800 dark:text-zinc-200">{title}</span>
                <span className="block text-[9.5px] leading-snug text-slate-500 dark:text-zinc-500">{subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="border-b border-slate-100 pb-2 text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:border-zinc-900/60 dark:text-zinc-500">
          Backend liveness
        </h4>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            {health.status === "checking" ? <Activity size={12} className="animate-pulse text-amber-500" /> : <Server size={12} className="text-slate-400 dark:text-zinc-600" />}
            <div>
              <span className="block text-[9.5px] font-bold uppercase text-slate-700 dark:text-zinc-400">FastAPI service</span>
              <span className="block text-[8px] text-slate-400 dark:text-zinc-600">
                {health.deploymentTarget ? `Reported target: ${health.deploymentTarget}` : "No dependency health inferred"}
              </span>
            </div>
          </div>
          <span className={`rounded border px-2 py-1 text-[8.5px] font-black uppercase ${healthClasses}`}>{healthLabel}</span>
        </div>
        <p className="text-[8px] leading-relaxed text-slate-400 dark:text-zinc-600">
          Liveness confirms only that the backend responded. It does not claim Zeek, Amazon SQS, Amazon RDS, storage, or AI models are healthy.
        </p>
      </div>
    </div>
  );
}
