import React, { useState } from "react";
import { Cloud, HelpCircle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface AwsSettingsTabProps {
  data: {
    awsSqsUrl: string;
    awsSqsStatus: "Connected" | "Disconnected" | "Connecting";
    awsSqsMessages: number;
    awsS3Bucket: string;
    awsS3Status: "Connected" | "Disconnected";
    awsRdsDatabase: string;
    awsRdsStatus: "Connected" | "Disconnected";
    awsCloudWatchStatus: "Connected" | "Disconnected";
  };
  onChange: (path: string, value: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function AwsSettingsTab({ data, onChange, onToast }: AwsSettingsTabProps) {
  const [testingServices, setTestingServices] = useState<Record<string, boolean>>({});

  const simulateTestConnection = (serviceKey: string, endpointName: string) => {
    setTestingServices((prev) => ({ ...prev, [serviceKey]: true }));
    onToast(`ESTABLISHING ENCRYPTED AWS TRACEWAY ON: ${endpointName.toUpperCase()}...`, "info");
    
    setTimeout(() => {
      setTestingServices((prev) => ({ ...prev, [serviceKey]: false }));
      onToast(`AWS SERVICE "${endpointName.toUpperCase()}" PING SUCCESSFUL!`, "success");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-500" />
          AWS Cloud Infrastructure Integrations
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Configure real-time log ingestion queues, databases, cloudwatch collectors, and diagnostic pathways
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SQS QUEUE CONFIG */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff9900]" />
              Amazon SQS FIFO Ingestion queue
            </span>
            <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-bold">
              {data.awsSqsStatus}
            </span>
          </div>

          <div className="space-y-3.5 text-[10px] font-mono">
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest">
                FIFO Queue URL Path
              </label>
              <input
                type="text"
                value={data.awsSqsUrl}
                onChange={(e) => onChange("awsSqsUrl", e.target.value)}
                className="w-full bg-muted border border-border rounded-xl p-2.5 pl-3 text-[11px] font-mono text-foreground focus:outline-none"
                placeholder="https://sqs.us-east-1.amazonaws.com/123456789012/soc-zeek-queue.fifo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                <span className="text-muted-foreground block text-[8px] uppercase">Waiting Payloads</span>
                <span className="text-[14px] font-black text-foreground font-mono">{data.awsSqsMessages} PACKETS</span>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                <span className="text-muted-foreground block text-[8px] uppercase">Transport Mode</span>
                <span className="text-[14px] font-black text-cyan-400 font-mono">FIFO STREAM</span>
              </div>
            </div>

            <button
              onClick={() => simulateTestConnection("sqs", "SQS FIFO Queue")}
              disabled={testingServices["sqs"]}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-[9px] font-mono font-black tracking-widest text-foreground hover:text-cyan-400 border border-border/60 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingServices["sqs"] ? "animate-spin" : ""}`} />
              TEST SQS CONNECTION PROTOCOL
            </button>
          </div>
        </div>

        {/* AMAZON S3 BUCKET STORAGE */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff9900]" />
              Amazon S3 Secure Log Repository
            </span>
            <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-bold">
              {data.awsS3Status}
            </span>
          </div>

          <div className="space-y-3.5 text-[10px] font-mono">
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Target S3 Bucket Location
              </label>
              <input
                type="text"
                value={data.awsS3Bucket}
                onChange={(e) => onChange("awsS3Bucket", e.target.value)}
                className="w-full bg-muted border border-border rounded-xl p-2.5 pl-3 text-[11px] font-mono text-foreground focus:outline-none"
                placeholder="soc-log-storage"
              />
            </div>

            <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
              <span className="text-muted-foreground block text-[8px] uppercase">Storage Class Settings</span>
              <span className="text-foreground tracking-widest uppercase text-[10px] font-black">S3 STANDARD IA (INFREQUENT ACCESS)</span>
            </div>

            <button
              onClick={() => simulateTestConnection("s3", "S3 Log Storage")}
              disabled={testingServices["s3"]}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-[9px] font-mono font-black tracking-widest text-foreground hover:text-cyan-400 border border-border/60 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingServices["s3"] ? "animate-spin" : ""}`} />
              TEST S3 INGEST PATHWAY
            </button>
          </div>
        </div>

        {/* AMAZON RDS DATABASE */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff9900]" />
              Amazon RDS Core Database Node
            </span>
            <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-bold">
              {data.awsRdsStatus}
            </span>
          </div>

          <div className="space-y-3.5 text-[10px] font-mono">
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Database Engine Type
              </label>
              <input
                type="text"
                value={data.awsRdsDatabase}
                onChange={(e) => onChange("awsRdsDatabase", e.target.value)}
                className="w-full bg-muted border border-border rounded-xl p-2.5 pl-3 text-[11px] font-mono text-foreground focus:outline-none"
                placeholder="PostgreSQL"
              />
            </div>

            <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
              <span className="text-muted-foreground block text-[8px] uppercase">Node Instance Details</span>
              <span className="text-foreground tracking-widest uppercase text-[10px] font-black">db.r6g.large (CLUSTER-NODE-01)</span>
            </div>

            <button
              onClick={() => simulateTestConnection("rds", "RDS Database")}
              disabled={testingServices["rds"]}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-[9px] font-mono font-black tracking-widest text-foreground hover:text-cyan-400 border border-border/60 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingServices["rds"] ? "animate-spin" : ""}`} />
              TEST RDS HANDSHAKE TUNNEL
            </button>
          </div>
        </div>

        {/* AMAZON CLOUDWATCH ALARM AGGREGATOR */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff9900]" />
              Amazon CloudWatch Metrics Stream
            </span>
            <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-bold">
              {data.awsCloudWatchStatus}
            </span>
          </div>

          <div className="space-y-3.5 text-[10px] font-mono">
            <div className="bg-muted/30 p-4 border border-border/40 rounded-xl text-[9px] text-muted-foreground uppercase leading-relaxed">
              CloudWatch receives instant telemetry metric logs from CloudTrail events and passes them through to the SOC platform aggregator node for real-time traffic evaluations.
            </div>

            <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
              <span className="text-muted-foreground block text-[8px] uppercase">Metric Sync Frequency</span>
              <span className="text-foreground tracking-widest uppercase text-[9px] font-black">Sub-Minute Polling (Live Streaming)</span>
            </div>

            <button
              onClick={() => simulateTestConnection("cw", "CloudWatch Metrics")}
              disabled={testingServices["cw"]}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-[9px] font-mono font-black tracking-widest text-foreground hover:text-cyan-400 border border-border/60 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingServices["cw"] ? "animate-spin" : ""}`} />
              PING METADATA AGENT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
