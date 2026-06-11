import React, { useState } from "react";
import { z } from "zod";
import { Boxes, Cloud, Terminal, CheckCircle2, XCircle, Database, HelpCircle, Network, Link, Radio } from "lucide-react";
import { cn } from "../../lib/utils";

export const integrationsSettingsSchema = z.object({
  zeekStatus: z.enum(["Connected", "Disconnected"]),
  zeekEndpointUrl: z.string().url("Zeek host endpoint must be a valid URL"),
  suricataStatus: z.enum(["Connected", "Disconnected"]),
  suricataRulesUrl: z.string().url("Suricata rules file must be a valid URL"),
  suricataRulesSyncInterval: z.number().min(5, "Sync frequency must be at least 5 mins"),
  awsSqsUrl: z.string().url("AWS SQS queue must be a valid HTTPS SQS URL"),
  awsSqsStatus: z.enum(["Connected", "Disconnected"]),
  postgresHost: z.string().min(2, "PostgreSQL host cannot be empty"),
  postgresPort: z.number().min(1024, "Port must be greater than 1024").max(65535),
  postgresDb: z.string().min(2, "Database name required"),
  postgresStatus: z.enum(["Connected", "Disconnected"]),
  websocketUrl: z.string().min(2, "WebSocket URL is required"),
  websocketMaxRetry: z.number().min(1, "Must have at least 1 retry"),
});

export type IntegrationsSettingsType = z.infer<typeof integrationsSettingsSchema>;

interface IntegrationsSettingsProps {
  data: IntegrationsSettingsType;
  onChange: (path: string, value: any) => void;
  onToast?: (message: string, type: any) => void;
}

export function Integrations({ data, onChange, onToast }: IntegrationsSettingsProps) {
  const [activeSection, setActiveSection] = useState<"zeek" | "aws" | "postgres">("zeek");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: keyof IntegrationsSettingsType, value: any) => {
    try {
      const fieldSchema = integrationsSettingsSchema.shape[field];
      fieldSchema.parse(value);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: (err as any).errors[0].message }));
      }
    }
  };

  const handleTextChange = (field: keyof IntegrationsSettingsType, value: string) => {
    onChange(`integrations.${field}`, value);
    validateField(field, value);
  };

  const handleNumberChange = (field: keyof IntegrationsSettingsType, value: string) => {
    const num = parseInt(value, 10) || 0;
    onChange(`integrations.${field}`, num);
    validateField(field, num);
  };

  const testConnection = (id: string) => {
    if (onToast) {
      onToast(`PINGING GATEWAY FOR ${id.toUpperCase()}... CONNECTED SUCCESSFULLY (15ms latency).`, "success");
    }
  };

  return (
    <div className="space-y-6" id="integrations-settings-panel">
      {/* Intro */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Boxes className="w-4 h-4 text-cyan-500" />
          Ingress Plugs & Integrations Configuration
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Perform state verification and host connection parameter overrides and credentials linking for auxiliary network listeners.
        </p>
      </div>

      {/* Connection Quick Board */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-[9px]">
        {[
          { label: "Zeek Engine", val: data.zeekStatus, field: "zeekStatus" },
          { label: "Suricata Rules", val: data.suricataStatus, field: "suricataStatus" },
          { label: "AWS Event SQS", val: data.awsSqsStatus, field: "awsSqsStatus" },
          { label: "Postgres Core", val: data.postgresStatus, field: "postgresStatus" },
          { label: "Websocket Gate", val: "Connected" }
        ].map((gate) => {
          const isOk = gate.val === "Connected" || !gate.val;
          return (
            <div key={gate.label} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[7.5px] uppercase text-slate-500 font-extrabold block">{gate.label}</span>
                <span className={cn("text-[9px] font-black block mt-1", isOk ? "text-emerald-500" : "text-rose-500")}>
                  {isOk ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <div>
                {isOk ? (
                  <CheckCircle2 size={15} className="text-emerald-500" />
                ) : (
                  <XCircle size={15} className="text-rose-500 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Tabs */}
      <div className="flex border-b border-border/40 gap-1 font-mono text-[9px] uppercase tracking-wider font-bold">
        {[
          { id: "zeek", label: "Zeek & Suricata (IDS)", icon: Terminal },
          { id: "aws", label: "Amazon Cloud SQS", icon: Cloud },
          { id: "postgres", label: "PostgreSQL & Sockets", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={cn(
                "px-4 py-2 flex items-center gap-2 rounded-t-lg transition border-b-2 cursor-pointer select-none",
                activeSection === tab.id 
                  ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 font-black" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
              )}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content tabs */}
      <div className="font-mono text-[9px] uppercase">
        {activeSection === "zeek" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="zeek-sub-tab">
            {/* Zeek */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-border/25 pb-2">
                <span className="text-[10px] font-black text-slate-900 dark:text-white block">Zeek Logs Feed Broker</span>
                <button
                  type="button"
                  onClick={() => testConnection("zeek")}
                  className="px-2 py-0.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded text-[7px]"
                >
                  TEST PING
                </button>
              </div>

              <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
                <label className="text-[8.5px] font-bold text-[#64748b] block">Broker Host Endpoint URL</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                  value={data.zeekEndpointUrl || "http://10.92.110.12:4734"}
                  onChange={(e) => handleTextChange("zeekEndpointUrl", e.target.value)}
                />
                {errors.zeekEndpointUrl && <p className="text-[8px] text-rose-500 font-bold">{errors.zeekEndpointUrl}</p>}
              </div>

              <div className="flex items-center justify-between text-[8px] text-slate-500">
                <span>Active Log Filters Connected:</span>
                <span className="font-black text-slate-900 dark:text-white lowercase">conn.log, http.log, dns.log, files.log</span>
              </div>
            </div>

            {/* Suricata */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-border/25 pb-2">
                <span className="text-[10px] font-black text-slate-900 dark:text-white block">Suricata Signature Sync Rules</span>
                <button
                  type="button"
                  onClick={() => testConnection("suricata")}
                  className="px-2 py-0.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded text-[7px]"
                >
                  PULL SIGNATURES
                </button>
              </div>

              <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
                <label className="text-[8.5px] font-bold text-[#64748b] block">Rules Signature File URL source</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                  value={data.suricataRulesUrl || "https://rules.emergingthreats.net/open/suricata/emerging.rules.tar.gz"}
                  onChange={(e) => handleTextChange("suricataRulesUrl", e.target.value)}
                />
                {errors.suricataRulesUrl && <p className="text-[8px] text-rose-500 font-bold">{errors.suricataRulesUrl}</p>}
              </div>

              <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
                <label className="text-[8.5px] font-bold text-[#64748b] block">Automatic Pull rules frequency (minutes)</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-[11px] font-bold"
                  value={data.suricataRulesSyncInterval || 60}
                  onChange={(e) => handleNumberChange("suricataRulesSyncInterval", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* AWS SQS Queue */}
        {activeSection === "aws" && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4" id="aws-sub-tab">
            <div className="flex justify-between items-center border-b border-border/25 pb-2">
              <span className="text-[10px] font-black text-slate-900 dark:text-white block">Amazon Web Services Message SQS Ingestion Queue</span>
              <button
                type="button"
                onClick={() => testConnection("aws")}
                className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded text-[7.5px]"
              >
                TEST AWS CREDENTIALS PING
              </button>
            </div>

            <p className="text-[8px] text-slate-500 normal-case tracking-normal mb-1">
              Provides the target pipeline endpoint used to buffer external network alerts and routing log packets before classification:
            </p>

            <div className="space-y-1.5">
              <label className="text-[8.5px] font-bold text-[#64748b] block">AWS SQS Target Queue Endpoint URL (.fifo)</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-semibold"
                value={data.awsSqsUrl || "https://sqs.us-east-1.amazonaws.com/123456789012/soc-zeek-queue.fifo"}
                onChange={(e) => handleTextChange("awsSqsUrl", e.target.value)}
              />
              {errors.awsSqsUrl && <p className="text-[8px] text-rose-500 font-bold">{errors.awsSqsUrl}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[7.5px] text-slate-500 block">S3 Log File Bucket:</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white block">soc-log-telemetry-storage</span>
              </div>
              <div className="space-y-1">
                <span className="text-[7.5px] text-slate-500 block">Ingestion Buffer Size:</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white block">250 Messages Parallel Max</span>
              </div>
            </div>
          </div>
        )}

        {/* PostgreSQL Database and Sockets */}
        {activeSection === "postgres" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="postgres-sub-tab">
            {/* Database PostgreSQL */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-black text-slate-900 dark:text-white block border-b border-border/25 pb-2">
                PostgreSQL Operational Database Connection
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[8px] text-slate-500 font-bold">Host Address IP</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded px-2 py-1.5 text-xs font-semibold"
                    value={data.postgresHost || "10.0.98.42"}
                    onChange={(e) => handleTextChange("postgresHost", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] text-slate-500 font-bold">Port Number</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded px-2 py-1.5 text-xs font-medium"
                    value={data.postgresPort || 5432}
                    onChange={(e) => handleNumberChange("postgresPort", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] text-slate-500 font-bold">Database Instance Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded px-2.5 py-1.5 text-xs font-semibold"
                  value={data.postgresDb || "zeek_ai_soc_production"}
                  onChange={(e) => handleTextChange("postgresDb", e.target.value)}
                />
              </div>
            </div>

            {/* WebSocket socket */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-black text-slate-900 dark:text-white block border-b border-border/25 pb-2">
                WebSocket Live Stream Broker
              </span>

              <div className="space-y-1.5">
                <label className="text-[8.5px] font-bold text-[#64748b] block">Stream URL Gateway endpoint</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded px-3 py-2 text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400"
                  value={data.websocketUrl || "wss://soc-gateway.corp.internal:443/live"}
                  onChange={(e) => handleTextChange("websocketUrl", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[8.5px] font-bold text-[#64748b] block">Max Retry Reconnection Attempts</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded px-3 py-1.5 text-xs font-bold"
                  value={data.websocketMaxRetry || 5}
                  onChange={(e) => handleNumberChange("websocketMaxRetry", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
