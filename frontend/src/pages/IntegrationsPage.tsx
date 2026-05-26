import React, { useState, useEffect } from "react";
import { Integration, IntegrationConfig } from "../components/integrations/integrationsConfig";
import { IntegrationTabs } from "../components/integrations/IntegrationTabs";
import { IntegrationGrid } from "../components/integrations/IntegrationGrid";
import { IntegrationFormModal } from "../components/integrations/IntegrationFormModal";
import { 
  Puzzle, 
  Settings, 
  Network, 
  Cpu, 
  HelpCircle,
  Database,
  CheckCircle,
  AlertOctagon,
  Terminal,
  Activity,
  Radio,
  Clock,
  Wifi,
  Signal,
  RefreshCw
} from "lucide-react";

const initialIntegrations: Integration[] = [
  {
    id: "aws-cloudwatch",
    name: "AWS CloudWatch/CloudTrail Ingestion Gateway",
    category: "inbound",
    description: "Ingest real-time cloud infrastructure logs including EC2 metric monitors, VPC flow logs, and AWS Identity authentication events.",
    status: "connected",
    iconName: "aws",
    configuredAt: "2 days ago",
    configuration: {
      awsAccessKeyId: "AKIAIOSFODNN7EXAMPLE",
      awsSecretAccessKey: "••••••••••••••••••••••••••••••••",
      awsRegion: "ap-southeast-1"
    }
  },
  {
    id: "zeek-telemetry",
    name: "Zeek Network Intrusion Agent",
    category: "inbound",
    description: "High-velocity syslog ingestion stream containing Zeek conn.log, http.log, and dns.log events for intelligent AI security classification.",
    status: "connected",
    iconName: "zeek",
    configuredAt: "5 days ago",
    configuration: {
      apiEndpoint: "https://zeek-sensor-prod.domain.local/api/v2",
      authToken: "••••••••••••••••••••"
    }
  },
  {
    id: "suricata-ids",
    name: "Suricata Signature IDS Engine",
    category: "inbound",
    description: "Rule-based IDS alert logs signature delivery streams, feeding network threat notifications directly from edge Suricata sensors to the central core.",
    status: "connected",
    iconName: "suricata",
    configuredAt: "1 week ago",
    configuration: {
      apiEndpoint: "https://suricata-detector-prod.domain.local:8080/push",
      authToken: "••••••••••••••••••••"
    }
  },
  {
    id: "slack-webhook",
    name: "Slack Critical Dispatcher",
    category: "notifications",
    description: "Automated webhook integration tool to dispatch critical cybersecurity incident payloads directly to corporate Slack channels.",
    status: "connected",
    iconName: "slack",
    configuredAt: "3 hours ago",
    configuration: {
      webhookUrl: "https://hooks.slack.com/services/T0000/B0000/XXXXXXXXXXXXXXXXXX"
    }
  },
  {
    id: "pfsense-fw",
    name: "pfSense Firewall Block Orchestrator",
    category: "security_actions",
    description: "Configure API access on pfSense routers/firewalls to automate real-time IP blacklisting and source isolation directly from SOAR playbook actions.",
    status: "not_configured",
    iconName: "pfsense"
  },
  {
    id: "twilio-smtp",
    name: "Twilio SMS / Email Gateway",
    category: "notifications",
    description: "Multi-channel notification gateway for dispatching secure 2FA verification tokens or periodic security reports directly to SOC supervisors.",
    status: "not_configured",
    iconName: "twilio"
  }
];

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "inbound" | "notifications" | "security_actions">("all");

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UTC clock state
  const [systemTime, setSystemTime] = useState("");

  // Live syslog ticker stream matching playbooks console layout
  const [logsList, setLogsList] = useState<string[]>([
    "SYS_MONITOR: Standing by on telemetry aggregation pipeline. Port 3000 mapping: active.",
    "INGESTION_GW: AWS CloudTrail credentials authorized over SSL/TLS. Feed sync rate check: 1,240 EPS.",
    "PROBE_ENGINE: Local syslog sensors linked successfully. No telemetry framing errors found."
  ]);

  // Sync real-time UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll synthetic logs to raise integration platform realism
  useEffect(() => {
    const streamPool = [
      "AWS_CLOUDTRAIL: Pulsed dynamic metric ingestion packet. Heartbeat acknowledged: 200 OK",
      "ZEEK_DEAMON: Parse routine conn.log matched 14 unique SSL handshakes. Clean telemetry verified.",
      "SURICATA_IDS: Heartbeat broadcasted on dynamic signature database. Loaded 24,195 triggers.",
      "SOAR_DISPATCHER: Standing by for pfSense / Firewall remote XMLRPC socket initialization request.",
      "SMTP_NOTIFY: Recalibrating Twilio SMS queuing engine latency. Outbox state: 0 tasks in queue.",
      "SLACK_WEBHOOK: Verified notification pipeline state. Outbound dispatch test pattern: PASSED."
    ];

    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * streamPool.length);
      const stamp = new Date().toISOString().substring(11, 19);
      const statement = `[${stamp}] ${streamPool[index]}`;

      setLogsList(prev => {
        const appended = [...prev, statement];
        if (appended.length > 5) {
          return appended.slice(appended.length - 5);
        }
        return appended;
      });
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Configure target integration callbacks 
  const handleSaveConfiguration = (id: string, config: IntegrationConfig) => {
    const name = integrations.find(it => it.id === id)?.name || "Target Node";
    
    setIntegrations(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: "connected",
            configuredAt: "Just now",
            configuration: config
          };
        }
        return item;
      })
    );

    const stamp = new Date().toISOString().substring(11, 19);
    setLogsList(prev => [
      ...prev,
      `[${stamp}] COMPONENT_ENGINE: PLUGGED NODE COORD FOR "${name.toUpperCase()}" [SUCCESS]`
    ].slice(-5));

    setIsModalOpen(false);
  };

  // Disconnect target configuration callback
  const handleDisconnectConfiguration = (id: string) => {
    const name = integrations.find(it => it.id === id)?.name || "Target Node";

    setIntegrations(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: "not_configured",
            configuredAt: undefined,
            configuration: undefined
          };
        }
        return item;
      })
    );

    const stamp = new Date().toISOString().substring(11, 19);
    setLogsList(prev => [
      ...prev,
      `[${stamp}] COMPONENT_ENGINE: SEVERED CONNECTOR PIPELINE FOR "${name.toUpperCase()}" [DISCONNECTED]`
    ].slice(-5));

    setIsModalOpen(false);
  };

  const handleConfigureClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  const activeConnectedCount = integrations.filter(item => item.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Decorative Top Title banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b border-border gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-cyan-550 dark:text-cyan-400 uppercase">
              SIEM & SOAR INGESTION ROUTING PLANE
            </span>
          </div>
          <h2 className="text-2xl font-mono font-black text-foreground tracking-tight uppercase leading-none">
            CENTRAL SERVICE INTEGRATIONS
          </h2>
        </div>

        {/* Real-time UTC System Clock matching PlaybooksPage */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-card border border-border rounded-lg px-4 py-2 font-mono text-right">
            <span className="text-[8px] font-black tracking-widest text-muted-foreground block uppercase mb-0.5">
              TELEMETRY ENGINE CLOCK
            </span>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
              {systemTime || "WAITING FOR HEARTBEAT..."}
            </span>
          </div>
          <div className="h-8 bg-border w-px" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest bg-card border border-border px-3 py-2 rounded-lg">
            ORCH_SYS_V2.5
          </span>
        </div>
      </div>

      {/* Futuristic Enterprise integration dashboard telemetry indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Connected services */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-sm group hover:border-border transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-emerald-500/2 to-transparent pointer-events-none" />
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-xl relative z-10 shadow-inner">
            <CheckCircle className="w-5.5 h-5.5" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
              ESTABLISHED NODES
            </span>
            <span className="text-2xl font-black font-mono text-foreground leading-none block">
              {activeConnectedCount} <strong className="text-muted-foreground/60 font-bold text-sm">/ {integrations.length} ACTIVE</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0">
            SYNC: 100%
          </span>
        </div>

        {/* Configure Pending Indicator */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-sm group hover:border-border transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-500/2 to-transparent pointer-events-none" />
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl relative z-10 shadow-inner">
            <AlertOctagon className="w-5.5 h-5.5" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
              PENDING REGISTRATION
            </span>
            <span className="text-2xl font-black font-mono text-foreground leading-none block">
              {integrations.length - activeConnectedCount} <strong className="text-muted-foreground/60 font-bold text-sm">UNPLUGGED</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0">
            WAITING
          </span>
        </div>

        {/* Aggregate Network EPS telemetry */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-sm group hover:border-border transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-cyan-500/2 to-transparent pointer-events-none" />
          <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl relative z-10 shadow-inner">
            <Database className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="text-[9px] font-mono font-black text-muted-foreground tracking-widest uppercase block mb-1">
              LIVE SYSTEM EPS VOLUME
            </span>
            <span className="text-2xl font-black font-mono text-foreground leading-none block">
              3 ACTIVE <strong className="text-muted-foreground/60 font-bold text-xs font-mono uppercase">TUNNELS</strong>
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded shrink-0">
            PORT: 3000
          </span>
        </div>
      </div>

      {/* Live Active Systems integration logging console (Raises platform realism) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
        <div className="flex items-center justify-between border-b border-border pb-2 mb-3.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-muted-foreground tracking-widest uppercase">
              LIVE CENTRAL SIEM AGGREGATION & GATEWAY TRANSIT DISPATCH FEED
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-muted-foreground/60 animate-spin" />
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
              POOLING RE-SUBSCRIBE CHECKS ACTIVE
            </span>
          </div>
        </div>

        {/* Real-time Logger stream render */}
        <div className="space-y-2 bg-muted/40 p-3.5 rounded-lg border border-border max-h-35 overflow-y-auto custom-scrollbar font-mono text-[9px] uppercase tracking-wide">
          {logsList.map((log, index) => {
            let logTypeColor = "text-muted-foreground";
            if (log.includes("[SUCCESS]") || log.includes("success") || log.includes("PASSED")) {
              logTypeColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/20 px-1.5 rounded";
            } else if (log.includes("DISCONNECTED") || log.includes("NOT_CONFIGURED") || log.includes("unplug")) {
              logTypeColor = "text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-950/20 px-1.5 rounded";
            } else if (log.includes("AWS_CLOUDTRAIL") || log.includes("ZEEK_DEAMON")) {
              logTypeColor = "text-cyan-600 dark:text-cyan-400 font-semibold";
            }

            return (
              <div key={index} className="flex items-start gap-2 py-0.5 border-b border-border/20 last:border-0">
                <span className="text-muted-foreground/45 font-bold shrink-0">&gt;&gt;</span>
                <span className={`leading-relaxed ${logTypeColor}`}>{log}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Inbound / Outbound filter tabs */}
      <IntegrationTabs
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Connection elements Grid mapping */}
      <IntegrationGrid
        integrations={integrations}
        searchQuery={searchQuery}
        activeTab={activeTab}
        onConfigureClick={handleConfigureClick}
      />

      {/* Cyber Security Footnotes helper guide */}
      <div className="bg-muted/40 border border-border rounded-xl p-4 flex items-start gap-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.03),transparent)] pointer-events-none" />
        <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-1.5 relative">
          <span className="text-[9px] font-mono font-black tracking-widest text-muted-foreground uppercase block">
            SIEM DATASTREAM ENCRYPTION POLICY & SHIELDING GUIDELINES
          </span>
          <p className="text-[10px] text-muted-foreground/80 leading-normal uppercase">
            All ingestion pipelines, security credentials, and webhook tokens are encrypted locally. External API channels utilize dynamic TLS state transitions to maintain paramount security parameters across critical cloud nodes.
          </p>
        </div>
      </div>

      {/* Form configurator Modal */}
      {selectedIntegration && (
        <IntegrationFormModal
          isOpen={isModalOpen}
          integration={selectedIntegration}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveConfiguration}
          onDisconnect={handleDisconnectConfiguration}
        />
      )}
    </div>
  );
}
