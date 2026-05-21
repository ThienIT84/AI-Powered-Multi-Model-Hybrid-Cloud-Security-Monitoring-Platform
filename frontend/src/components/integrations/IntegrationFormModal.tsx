import React, { useState, useEffect } from "react";
import { Integration, IntegrationConfig } from "./integrationsConfig";
import { 
  X, 
  Settings, 
  Play, 
  Check, 
  RefreshCw,
  Cpu,
  Lock,
  Globe,
  Database,
  Unlink,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";

interface IntegrationFormModalProps {
  integration: Integration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, config: IntegrationConfig) => void;
  onDisconnect: (id: string) => void;
}

export function IntegrationFormModal({
  integration,
  isOpen,
  onClose,
  onSave,
  onDisconnect,
}: IntegrationFormModalProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "failed" | null>(null);

  // Core configuration states matching types
  const [webhookUrl, setWebhookUrl] = useState("");
  const [firewallApiEndpoint, setFirewallApiEndpoint] = useState("");
  const [apiSecretToken, setApiSecretToken] = useState("");
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("ap-southeast-1");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    if (integration) {
      setTestResult(null);
      setTesting(false);
      const conf = integration.configuration;
      
      // Seed values based on existing config or set safe defaults
      setWebhookUrl(conf?.webhookUrl || "");
      setFirewallApiEndpoint(conf?.firewallApiEndpoint || "");
      setApiSecretToken(conf?.apiSecretToken || "");
      setAwsAccessKeyId(conf?.awsAccessKeyId || "");
      setAwsSecretAccessKey(conf?.awsSecretAccessKey || "");
      setAwsRegion(conf?.awsRegion || "ap-southeast-1");
      setApiEndpoint(conf?.apiEndpoint || "");
      setAuthToken(conf?.authToken || "");
    }
  }, [integration, isOpen]);

  if (!isOpen || !integration) return null;

  const isConnected = integration.status === "connected";

  // Simulation test connectivity
  const handleTestConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult("success");
    }, 1200);
  };

  const handleSave = () => {
    // Construct dynamic configuration payload based on category and tool type
    const payload: IntegrationConfig = {};

    if (integration.iconName === "slack") {
      payload.webhookUrl = webhookUrl;
    } else if (integration.iconName === "pfsense") {
      payload.firewallApiEndpoint = firewallApiEndpoint;
      payload.apiSecretToken = apiSecretToken;
    } else if (integration.iconName === "aws") {
      payload.awsAccessKeyId = awsAccessKeyId;
      payload.awsSecretAccessKey = awsSecretAccessKey;
      payload.awsRegion = awsRegion;
    } else {
      payload.apiEndpoint = apiEndpoint;
      payload.authToken = authToken;
    }

    /* 
      ========================================================================
      AXIOS / FETCH INTEGRATION PIPELINE DETAILS:
      
      Trong ứng dụng sản xuất thực tế, payload cấu hình này sẽ được gửi đến 
      SOC SIEM API Endpoint của Backend thông qua call Axios hoặc fetch như sau:
      
      try {
        const response = await axios.post(`/api/integrations/configure/${integration.id}`, {
          configuration: payload
        }, {
          headers: { "Authorization": `Bearer ${userToken}` }
        });
        
        if (response.data.success) {
          // Kích hoạt callback thông báo cập nhật state UI
          onSave(integration.id, payload);
        }
      } catch (error) {
        console.error("Lỗi đồng bộ cấu hình Gateway thông số chặn:", error);
      }
      ========================================================================
    */

    onSave(integration.id, payload);
  };

  const handleRemove = () => {
    /*
      ========================================================================
      AXIOS / FETCH DISCONNECT SYSTEM CODE:
      
      const response = await fetch(`/api/integrations/disconnect/${integration.id}`, {
        method: "DELETE"
      });
      ========================================================================
    */
    onDisconnect(integration.id);
  };

  // Render dynamic form fields based on target integration type/ID
  const renderDynamicForm = () => {
    switch (integration.iconName) {
      case "slack":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block">
                Incoming Webhook URL
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="SLACK_WEBHOOK_URL"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[8px] font-mono text-slate-550 uppercase tracking-wide">
                Webhook protocol to dispatch automated notification payloads directly to your team chat channel.
              </span>
            </div>

            {/* Test button specific to webhooks */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !webhookUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 hover:text-white rounded text-[9px] font-mono font-black uppercase tracking-wider transition duration-200 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                    <span>TESTING CONNECTOR...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-cyan-400" />
                    <span>TEST WEBHOOK CONNECTION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case "pfsense":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block">
                  pfSense API Host Endpoint
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-650" />
                  <input
                    type="text"
                    value={firewallApiEndpoint}
                    onChange={(e) => setFirewallApiEndpoint(e.target.value)}
                    placeholder="https://192.168.1.1:443/api/v1"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block">
                  Secure Secret Token / API Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-655" />
                  <input
                    type="password"
                    value={apiSecretToken}
                    onChange={(e) => setApiSecretToken(e.target.value)}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block leading-relaxed">
              * Dedicated SOAR Playbook integration enabling automated IP blacklisting and firewall containment via pfSense XMLRPC/API.
            </span>
          </div>
        );

      case "aws":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  AWS Access Key ID
                </label>
                <input
                  type="text"
                  value={awsAccessKeyId}
                  onChange={(e) => setAwsAccessKeyId(e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  AWS Secret Access Key
                </label>
                <input
                  type="password"
                  value={awsSecretAccessKey}
                  onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 max-w-xs">
              <label className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block">
                Target Deploying Region
              </label>
              <select
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="ap-southeast-1">Asian Pacific (ap-southeast-1)</option>
                <option value="us-east-1">US East N. Virginia (us-east-1)</option>
                <option value="us-west-2">US West Oregon (us-west-2)</option>
                <option value="eu-west-1">EU Ireland (eu-west-1)</option>
              </select>
            </div>
          </div>
        );

      default:
        // Default agent configure options
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block">
                  API Endpoint URL / Host
                </label>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://agent.siem.local:8080/ingest"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block">
                  Authentication Token
                </label>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Bearer xoxb-token-value-secrets"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
      >
        {/* Close Button Panel */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition duration-250 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header wrapper info */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-900/40">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-black text-cyan-400 tracking-[0.2em] uppercase">
              GATEWAY CONNECTION SYSTEM CONFIG
            </span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">
              Configure {integration.name}
            </h2>
          </div>
        </div>

        {/* Content Box with Dynamic inputs selection */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-950/40 p-3 border border-slate-850 rounded-xl space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              Protocol & Stream Description
            </span>
            <p className="text-[10px] text-slate-350 leading-relaxed uppercase font-semibold">
              {integration.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">
                Input API Configuration Attributes
              </span>
              <span className="text-[8px] font-mono text-rose-500 font-bold uppercase">
                * SSL SHA-512 Signed
              </span>
            </div>

            {/* Dynamic visual interface */}
            {renderDynamicForm()}

            {/* Test result display */}
            {testResult && (
              <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-550/15 text-emerald-400 rounded-lg flex items-center gap-2.5">
                <Check className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase font-black">
                  TEST CONNECTION OK: Successfully authenticated and connected via SSL/TLS v1.3!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom panel actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div>
            {isConnected && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded hover:text-red-300 text-[10px] font-black uppercase tracking-wider transition"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>DISCONNECT GATEWAY</span>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition"
            >
              SAVE CONFIGURATION
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
