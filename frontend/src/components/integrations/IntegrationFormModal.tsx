import React, { useState, useEffect, useRef } from "react";
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
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Activity,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<"success" | "failed" | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Core configuration states matching types
  const [webhookUrl, setWebhookUrl] = useState("");
  const [firewallApiEndpoint, setFirewallApiEndpoint] = useState("");
  const [apiSecretToken, setApiSecretToken] = useState("");
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("ap-southeast-1");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [authToken, setAuthToken] = useState("");

  // Keep terminal logs in sync
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [testLogs]);

  useEffect(() => {
    if (integration) {
      setTestResult(null);
      setTesting(false);
      setTestLogs([]);
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
  const handleTestConnection = async () => {
    if (testing) return;
    setTesting(true);
    setTestResult(null);
    setTestLogs([
      `[SOC_DIAG] STANDING UP TESTING SEQUENCE FOR GATEWAY INTERFACE: "${integration.id.toUpperCase()}"`,
      `[SOC_DIAG] INITIATING SECURE SOCKET PIPELINE HANDSHAKE OVER SSL/TLS V1.3...`,
      `[SOC_DIAG] RESOLVING ENDPOINT... OK`
    ]);

    await new Promise(resolve => setTimeout(resolve, 600));

    // Dynamic log feedback based on type
    if (integration.iconName === "slack") {
      setTestLogs(prev => [
        ...prev,
        `[SLACK_CLIENT] VERIFYING WEBHOOK URL: "${webhookUrl ? webhookUrl.substring(0, 30) + '...' : 'NULL'}"`,
        `[SLACK_CLIENT] DISPATCHING SECURE TEST JSON ENCRYPTED PALOAD TO SLACK GATEWAY...`
      ]);
      await new Promise(resolve => setTimeout(resolve, 700));
      if (!webhookUrl) {
        setTestLogs(prev => [
          ...prev,
          `[ERROR] INCOMING WEBHOOK URI PARAMETER IS EMPTY! ABORTING INGESTION.`,
          `[SOC_DIAG] INTEGRATION HANDSHAKE CRITICAL ERROR.`
        ]);
        setTestResult("failed");
        setTesting(false);
        return;
      }
    } else if (integration.iconName === "pfsense") {
      setTestLogs(prev => [
        ...prev,
        `[PFSENSE_XML] TESTING CONNECTION ON CLIENT: "${firewallApiEndpoint || 'NULL'}"`,
        `[PFSENSE_XML] VERIFYING SHA-512 SECRET CREDENTIAL AUTHORIZATION CHALLENGE...`
      ]);
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!firewallApiEndpoint || !apiSecretToken) {
        setTestLogs(prev => [
          ...prev,
          `[ERROR]pfSense API TARGET HOST OR API TOKEN REJECTED. CHECK XMLRPC CAPABILITIES.`,
          `[SOC_DIAG] CONNECTION PROTOCOL FAILED.`
        ]);
        setTestResult("failed");
        setTesting(false);
        return;
      }
    } else {
      setTestLogs(prev => [
        ...prev,
        `[TELEMETRY_INGEST] CONNECTING TO LOCAL SERVER DEPLOYMENT: "${apiEndpoint || 'NULL'}"`,
        `[TELEMETRY_INGEST] PIPELINE HANDSHAKE TESTING AUTHORIZATION BEARER SEED...`
      ]);
      await new Promise(resolve => setTimeout(resolve, 750));
    }

    setTestLogs(prev => [
      ...prev,
      `[SUCCESS] DECRYPTED CHALLENGE RESPONSES RECEIVED INDEPENDENTLY.`,
      `[SUCCESS] RESOLVED HANDSHAKE. INTEGRATION GATEWAY OPERATES UNDER STABLE COMPLIANT HEADROOM.`
    ]);
    setTestResult("success");
    setTesting(false);
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

    onSave(integration.id, payload);
  };

  const handleRemove = () => {
    onDisconnect(integration.id);
  };

  // Render dynamic form fields based on target integration type/ID
  const renderDynamicForm = () => {
    switch (integration.iconName) {
      case "slack":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black font-mono text-muted-foreground uppercase tracking-wider block">
                Slack Incoming Webhook URL Endpoint
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="Enter Slack webhook URL"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[8.5px] font-mono text-muted-foreground uppercase tracking-wider block leading-relaxed">
                * Configure Slack incoming webhook keys to automate the delivery of playbooks response signals on specific incident rooms.
              </span>
            </div>
          </div>
        );

      case "pfsense":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-muted-foreground uppercase tracking-wider block">
                  pfSense API Host Gateway Target
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={firewallApiEndpoint}
                    onChange={(e) => setFirewallApiEndpoint(e.target.value)}
                    placeholder="https://192.168.1.1:443/api/v1"
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-muted-foreground uppercase tracking-wider block">
                  XMLRPC Access Key ID / Security Token
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="password"
                    value={apiSecretToken}
                    onChange={(e) => setApiSecretToken(e.target.value)}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>
            <span className="text-[8.5px] font-mono text-muted-foreground uppercase tracking-wider block leading-relaxed">
              * To execute dynamic IP source isolation and active block listing, ensure the xmlrpc and core-api packages are enabled in pfSense.
            </span>
          </div>
        );

      case "aws":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-muted-foreground uppercase tracking-wider block">
                  AWS IAM Access Key ID
                </label>
                <input
                  type="text"
                  value={awsAccessKeyId}
                  onChange={(e) => setAwsAccessKeyId(e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-cyan-500 font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-muted-foreground uppercase tracking-wider block">
                  AWS IAM Secret Access Key
                </label>
                <input
                  type="password"
                  value={awsSecretAccessKey}
                  onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-cyan-550 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 max-w-xs">
              <label className="text-[9px] font-black font-mono text-muted-foreground uppercase tracking-wider block">
                Regional AWS Endpoint
              </label>
              <select
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="ap-southeast-1">Asian Pacific Core (ap-southeast-1)</option>
                <option value="us-east-1">US East N. Virginia (us-east-1)</option>
                <option value="us-west-2">US West Oregon (us-west-2)</option>
                <option value="eu-west-1">EU Zone Ireland (eu-west-1)</option>
              </select>
            </div>
          </div>
        );

      default:
        // Default telemetry daemon config rules
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-muted-foreground uppercase tracking-wider block">
                  Ingestion syslog Destination API Host
                </label>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://agent.siem.local:8080/ingest"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-mono text-muted-foreground uppercase tracking-wider block">
                  Secret Telemetry Access Token Seed
                </label>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Bearer token-payload-sec-val"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      {/* Cinematic Modal Shell */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-card border border-border rounded-xl w-full max-w-4xl overflow-hidden shadow-xl relative max-h-[90vh] flex flex-col"
      >
        {/* Subtle cyan glow accent top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-cyan-500 to-transparent" />

        {/* Modal Header Panel */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl">
              <Server className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black text-cyan-600 dark:text-cyan-405 tracking-[0.25em] uppercase block mb-0.5">
                SOC TELEMETRY PORT CONTROL CENTER
              </span>
              <h2 className="text-sm font-mono font-black text-foreground uppercase tracking-wider leading-none">
                Configure {integration.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground bg-muted border border-border rounded-lg transition duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal scrollable body layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left partition Column - Config fields */}
          <div className="lg:col-span-7 space-y-5">
            {/* Service brief definition banner */}
            <div className="bg-muted/45 p-4 border border-border rounded-xl space-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-white/1 to-transparent pointer-events-none" />
              <span className="text-[8px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
                INTEGRATION PROTOCOL BRIEF
              </span>
              <p className="text-[11px] text-foreground leading-relaxed uppercase font-semibold">
                {integration.description}
              </p>
            </div>

            {/* Config Title */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  Credentials Specifications
                </span>
                <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20">
                  Secured SHA-512 End-to-End
                </span>
              </div>

              {/* Injected form */}
              <div className="p-1">
                {renderDynamicForm()}
              </div>
            </div>
          </div>

          {/* Right partition Column - Diagnostic Terminal and Test connection */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-2 flex-1 flex flex-col">
              <h3 className="text-[11px] font-mono font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                Connection Self-Test Probe
              </h3>
              
              {/* Dynamic Console */}
              <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col flex-1 h-62.5 shadow-sm relative">
                <div className="bg-muted p-2.5 border-b border-border flex items-center justify-between font-mono text-[8px] tracking-wider text-muted-foreground uppercase">
                  <span>SSL HANDSHAKE PROBE</span>
                  {testing ? (
                    <span className="text-yellow-505 animate-pulse flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping" />
                      ACTIVE
                    </span>
                  ) : (
                    <span>IDLE</span>
                  )}
                </div>

                <div className="flex-1 bg-black/95 p-4 font-mono text-[8.5px] uppercase text-zinc-305 space-y-2 overflow-y-auto custom-scrollbar">
                  {testLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground uppercase p-4 space-y-2">
                      <Code className="w-5 h-5 text-muted-foreground/45 animate-pulse" />
                      <p className="text-[8px] font-bold text-muted-foreground/60 tracking-wider">
                        CONSOLE READY FOR CONNECTION PROBE
                      </p>
                    </div>
                  ) : (
                    testLogs.map((log, index) => {
                      let tagColor = "text-zinc-400";
                      if (log.startsWith("[SUCCESS]")) tagColor = "text-emerald-400 font-bold bg-emerald-950/20 px-1 rounded";
                      else if (log.startsWith("[ERROR]")) tagColor = "text-rose-405 font-bold bg-rose-950/20 px-1 rounded";
                      else if (log.startsWith("[SOC_DIAG]")) tagColor = "text-cyan-400";

                      return (
                        <div key={index} className={`leading-relaxed break-all ${tagColor}`}>
                          {log}
                        </div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>

            {/* Test connection execution block */}
            <div className="pt-1.5">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground rounded-lg text-[9.5px] font-mono font-black uppercase tracking-widest transition disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                    <span>DIAGNOSTICS RUNNING...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-cyan-550 dark:text-cyan-400" />
                    <span>Run Connection Handshake</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer Panel */}
        <div className="p-5 border-t border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {isConnected && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-505 hover:text-red-300 rounded text-[9.5px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>UNPLUG GATEWAY CONNECTOR</span>
              </button>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border text-muted-foreground rounded-lg text-[10px] font-mono font-black uppercase tracking-widest transition"
            >
              DISCARD
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-505 border border-cyan-500/10 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition"
            >
              SAVE PLATFORM CONFIG
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
