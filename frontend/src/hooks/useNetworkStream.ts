import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NetworkLog, ChartDataPoint } from "../components/network/NetworkConfig";
import { useRealtimeBuffer } from "./useRealtimeBuffer";
import { getNetworkTelemetryAdapter } from "../adapters/network.adapters";
import { appConfig } from "../config";

const MAX_LOGS_LIMIT = 200;
const CHART_HISTORY_LIMIT = 30;

export function useNetworkStream() {
  const adapter = useMemo(() => getNetworkTelemetryAdapter(), []);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartHistory, setChartHistory] = useState<ChartDataPoint[]>([]);

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const buildChartHistory = useCallback((items: NetworkLog[]): ChartDataPoint[] => {
    const source = items.slice(0, CHART_HISTORY_LIMIT).reverse();
    if (source.length === 0) return [];
    return source.map((log) => {
      const bytes = log.origBytes + (log.respBytes ?? 0);
      return {
        timeLabel: log.timestamp,
        flows: Math.max(1, log.respPkts ?? 1),
        bandwidth: Math.round(bytes / 1024),
        anomalyScore: log.verdict === "ANOMALY" ? log.threatScore ?? 75 : log.threatScore ?? 0,
        isAnomaly: log.verdict === "ANOMALY",
        eventAnnotation: log.verdict === "ANOMALY" ? log.reason?.split(":")[0] : undefined,
      };
    });
  }, []);

  const loadInitialLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initialLogs = await adapter.initialLogs();
      setLogs(initialLogs);
      setChartHistory(buildChartHistory(initialLogs));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network telemetry unavailable.");
      setLogs([]);
      setChartHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [adapter, buildChartHistory]);

  useEffect(() => {
    loadInitialLogs();
  }, [loadInitialLogs]);

  // Buffer aggregator that updates React logs state in batch
  const handleFlushLogs = useCallback((newLogs: NetworkLog[]) => {
    setLogs(prev => {
      // Prepend elements, slice at maximum boundary to protect JS memory
      const merged = [...newLogs, ...prev];
      return merged.slice(0, MAX_LOGS_LIMIT);
    });

    // Update charts dynamically with flushed logs count
    setChartHistory(prev => {
      const lastPoint = prev[prev.length - 1];
      const hasAnomaly = newLogs.some(l => l.verdict === "ANOMALY");
      const anomalyLog = newLogs.find(l => l.verdict === "ANOMALY");
      
      const activeBandwidth = newLogs.reduce((acc, log) => acc + log.origBytes / 1024, 0);
      const normalizedBandwidth = Math.max(0, activeBandwidth);
      const anomalyScore = hasAnomaly 
        ? (anomalyLog?.threatScore || 85)
        : Math.min(45, Math.max(0, Math.round(newLogs.length * 2.5)));

      const nextTime = new Date();
      const timeLabel = `${nextTime.getHours().toString().padStart(2, "0")}:${nextTime.getMinutes().toString().padStart(2, "0")}:${nextTime.getSeconds().toString().padStart(2, "0")}`;

      const nextPoint: ChartDataPoint = {
        timeLabel,
        flows: newLogs.length,
        bandwidth: Math.round(normalizedBandwidth),
        anomalyScore: Math.round(anomalyScore),
        isAnomaly: hasAnomaly,
        eventAnnotation: hasAnomaly ? anomalyLog?.reason?.split(":")[0] : undefined
      };

      return [...prev.slice(1), nextPoint];
    });
  }, []);

  const { queueEvent } = useRealtimeBuffer<NetworkLog>(handleFlushLogs, 400);

  // Demo and replay adapters can emit simulated telemetry. Live mode never generates synthetic traffic.
  useEffect(() => {
    if (!adapter.canSimulate) return;
    const timer = setInterval(() => {
      if (!isRunningRef.current) return;

      adapter.nextLogs().then((next) => {
        next.forEach(queueEvent);
      }).catch((err) => {
        setError(err instanceof Error ? err.message : "Network telemetry stream failed.");
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [adapter, queueEvent]);

  // Injector 1: Port Scan reconnaissance diagnostics
  const injectPortScan = useCallback(() => {
    if (appConfig.dataMode === "live") return;
    const now = new Date();
    const portsToScan = [21, 22, 23, 25, 80, 110, 139, 443, 445];
    const srcIp = "185.190.240.8"; // external suspicious tracer
    
    portsToScan.forEach((port, idx) => {
      const offsetTime = new Date(now.getTime() - (portsToScan.length - idx) * 50);
      const timestamp = `${offsetTime.getHours().toString().padStart(2, "0")}:${offsetTime.getMinutes().toString().padStart(2, "0")}:${offsetTime.getSeconds().toString().padStart(2, "0")}.${offsetTime.getMilliseconds().toString().padStart(3, "0")}`;

      const scanLog: NetworkLog = {
        id: `inject_scan_${Date.now()}_${idx}`,
        timestamp,
        srcIp,
        srcPort: 34890 + idx,
        destIp: "10.0.12.3", // internal core database target
        destPort: port,
        protocol: "TCP",
        origBytes: 85, // lightweight trace
        respPkts: 1,
        verdict: "ANOMALY",
        severity: "HIGH",
        threatScore: 82,
        confidence: 94,
        country: "RU",
        duration: 400,
        reason: "RECONNAISSANCE: Multi-port network scan probing. Signature pattern matched SOC criteria.",
        hexDump: ""
      };
      
      scanLog.hexDump = `0000  50 4F 52 54 20 53 43 41 4E 20 44 45 54 45 43 54  |PORT SCAN DETECT|\n0010  85 00 20 18 01 02 03 04 05 06 07 08 09 0A 0B 0C  |.. .............|\n0020  FE DE AD BE EF CA FE BA BE 00 00 00 00 00 00 01  |................|`;
      
      queueEvent(scanLog);
    });
  }, [queueEvent]);

  // Injector 2: Massive critical Exfiltration database dump
  const injectMassiveExfiltration = useCallback(() => {
    if (appConfig.dataMode === "live") return;
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

    const exfilLog: NetworkLog = {
      id: `inject_exfil_${Date.now()}`,
      timestamp,
      srcIp: "10.0.12.3", // local Database server
      srcPort: 5432,
      destIp: "45.227.254.12", // malicious offshore bucket
      destPort: 443,
      protocol: "TCP",
      origBytes: 156000000, // 156 MB SQL leak
      respPkts: 3820,
      verdict: "ANOMALY",
      severity: "CRITICAL",
      threatScore: 98,
      confidence: 99,
      country: "CN",
      duration: 320000,
      reason: "DATA_LEAK: Critical high-volume exfiltration of proprietary postgres DB dump detected.",
      hexDump: `0000  1F 8B 08 00 00 00 00 00 00 03 73 71 6C 20 64 75  |..........sql du|\n0010  6D 70 20 61 6E 6F 6D 61 6C 79 20 64 65 74 65 63  |mp anomaly detec|\n0020  74 65 64 20 73 69 65 6D 20 74 72 61 63 65 20 31  |ted siem trace 1|`
    };

    queueEvent(exfilLog);
  }, [queueEvent]);

  // Injector 3: Onion Tor connection through DNS tunnelling protocols
  const injectTorDnsTunnel = useCallback(() => {
    if (appConfig.dataMode === "live") return;
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

    const torLog: NetworkLog = {
      id: `inject_tor_${Date.now()}`,
      timestamp,
      srcIp: "192.168.1.109",
      srcPort: 5353,
      destIp: "185.220.101.5", // known proxy exit node
      destPort: 9001,
      protocol: "UDP",
      origBytes: 18500,
      respPkts: 412,
      verdict: "ANOMALY",
      severity: "HIGH",
      threatScore: 88,
      confidence: 91,
      country: "NL",
      duration: 4420,
      reason: "TOR_PROXY: Internal workstation tunneling communications over Onion network proxy relay.",
      hexDump: `0000  54 4F 52 20 50 52 4F 58 59 20 45 58 43 48 41 4E  |TOR PROXY EXCHAN|\n0010  47 45 20 31 38 35 2E 32 32 30 2E 31 30 31 2E 35  |GE 185.220.101.5|\n0020  09 01 FF AE 2F AC 11 C2 05 AB 64 EF 31 02 A8 FE  |..../.....d.1...|`
    };

    queueEvent(torLog);
  }, [queueEvent]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const injectCustomLog = useCallback((customLog: NetworkLog) => {
    queueEvent(customLog);
  }, [queueEvent]);

  return {
    isRunning,
    setIsRunning,
    logs,
    chartHistory,
    isLoading,
    error,
    dataMode: appConfig.dataMode,
    isSimulated: appConfig.dataMode !== "live",
    retry: loadInitialLogs,
    injectPortScan,
    injectMassiveExfiltration,
    injectTorDnsTunnel,
    clearLogs,
    injectCustomLog
  };
}
