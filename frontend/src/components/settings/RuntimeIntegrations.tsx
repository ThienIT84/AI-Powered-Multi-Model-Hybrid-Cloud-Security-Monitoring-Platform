import { Cloud, Cpu, Database, KeyRound, LockKeyhole, MessageSquare, Server } from "lucide-react";
import { RuntimeSettingsStatus } from "../../services/settings.service";

interface RuntimeIntegrationsProps {
  runtime: RuntimeSettingsStatus;
  updatedAt: string | null;
}

function configurationLabel(value: boolean | null): string {
  if (value === true) return "Configured";
  if (value === false) return "Not configured";
  return "Not reported";
}

function configurationClass(value: boolean | null): string {
  if (value === true) return "border-cyan-500/25 bg-cyan-500/10 text-cyan-500";
  return "border-border bg-muted/30 text-muted-foreground";
}

export function RuntimeIntegrations({ runtime, updatedAt }: RuntimeIntegrationsProps) {
  const resources = [
    { id: "sqs", name: "Amazon SQS Telemetry Queue", icon: MessageSquare, configured: runtime.sqsConfigured },
    { id: "s3", name: "Amazon S3 Data Bucket", icon: Cloud, configured: runtime.s3DataBucketConfigured },
    { id: "rds", name: "Amazon RDS for PostgreSQL", icon: Database, configured: runtime.rdsConfigured },
    { id: "hmac", name: "Ingestion HMAC secret", icon: KeyRound, configured: runtime.ingestHmacConfigured },
  ];
  const predictorModes = Object.entries(runtime.predictorModes).sort(([left], [right]) => left.localeCompare(right));

  return (
    <div className="space-y-6" id="runtime-integrations-panel">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground font-mono">
          <Server className="h-4 w-4 text-cyan-500" />
          Backend runtime configuration
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Read-only configuration flags reported by the backend. Connectivity and health are not inferred from configuration alone.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] text-amber-600 dark:text-amber-400">
        <div className="flex items-start gap-2">
          <LockKeyhole size={14} className="mt-0.5 shrink-0" />
          <p>
            Queue URLs, database endpoints, credentials and HMAC values are controlled by IAM, environment configuration and AWS Secrets Manager. They are intentionally never editable or returned here.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3">
            <Cloud size={14} className="text-cyan-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Deployment</h4>
          </div>
          <dl className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Target</dt><dd className="font-bold uppercase">{runtime.deploymentTarget}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">AWS Region</dt><dd className="font-bold">{runtime.awsRegion ?? "Not reported"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Settings updated</dt><dd className="font-bold">{updatedAt ? new Date(updatedAt).toLocaleString() : "Not yet saved"}</dd></div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3">
            <Cpu size={14} className="text-cyan-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">AI adapter modes</h4>
          </div>
          {predictorModes.length === 0 ? (
            <p className="text-xs text-muted-foreground">No adapter modes reported.</p>
          ) : (
            <div className="space-y-2">
              {predictorModes.map(([name, mode]) => (
                <div key={name} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs">
                  <span className="font-black">{name}</span><span className="font-mono uppercase text-muted-foreground">{mode}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server-side resources</div>
        <div className="divide-y divide-border">
          {resources.map(({ id, name, icon: Icon, configured }) => (
            <div key={id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3"><Icon size={14} className="text-cyan-500" /><span className="text-sm font-bold">{name}</span></div>
              <span className={`rounded border px-2 py-1 text-[8px] font-black uppercase ${configurationClass(configured)}`}>{configurationLabel(configured)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RuntimeIntegrations;
