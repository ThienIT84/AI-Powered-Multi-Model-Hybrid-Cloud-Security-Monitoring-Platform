import React, { useState } from "react";
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
  AlertOctagon
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

  // Manage configuring saves
  const handleSaveConfiguration = (id: string, config: IntegrationConfig) => {
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
    setIsModalOpen(false);
  };

  // Disconnect existing configuration
  const handleDisconnectConfiguration = (id: string) => {
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
    setIsModalOpen(false);
  };

  const handleConfigureClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  const activeConnectedCount = integrations.filter(item => item.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.25em] text-cyan-500 uppercase">
              DATA INGESTION & GATEWAY DISPATCH
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none">
            System Integrations (External Connections)
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 bg-slate-800 w-px" />
          <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest bg-slate-900 border border-slate-850 px-2.5 py-1 rounded">
            SIEM_GATE_V3.8
          </span>
        </div>
      </div>

      {/* Integration Overview boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connected services */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase block mb-1">
              Connected Channels
            </span>
            <span className="text-xl font-black font-mono text-white">
              {activeConnectedCount} <strong className="text-slate-500 font-medium text-xs">/ {integrations.length} ESTABLISHED</strong>
            </span>
          </div>
        </div>

        {/* Not Configured metrics */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase block mb-1">
              Configure Pending
            </span>
            <span className="text-xl font-black font-mono text-white">
              {integrations.length - activeConnectedCount} <strong className="text-slate-500 font-medium text-xs">NOT PLUGGED</strong>
            </span>
          </div>
        </div>

        {/* Aggregate Network EPS */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase block mb-1">
              Active Log Pipelines
            </span>
            <span className="text-xl font-black font-mono text-white">
              3 ACTIVE <strong className="text-slate-500 font-medium text-xs font-mono">SOURCES</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic filter bar */}
      <IntegrationTabs
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Grid of integrations */}
      <IntegrationGrid
        integrations={integrations}
        searchQuery={searchQuery}
        activeTab={activeTab}
        onConfigureClick={handleConfigureClick}
      />

      {/* System Helper Box */}
      <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/80 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase block">
            SIEM Collector & API Guidelines
          </span>
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
            To maintain paramount security compliance across the SIEM/SOC, all private keys, access configurations, and secret tokens are statefully encrypted using AES-256 and SSL/TLS pipelines.
          </p>
        </div>
      </div>

      {/* Dynamic Connector configuration Modal Form */}
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
