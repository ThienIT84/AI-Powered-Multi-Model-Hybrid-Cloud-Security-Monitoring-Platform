import { useState, useEffect, useCallback, useRef } from "react";
import { NetworkLog, ChartDataPoint } from "../components/network/NetworkConfig";
import { 
  generateRandomLog, 
  generateInitialLogsList 
} from "../components/network/NetworkGenerator";
import { useRealtimeBuffer } from "./useRealtimeBuffer";

const MAX_LOGS_LIMIT = 200;
const CHART_HISTORY_LIMIT = 30;

export function useNetworkStream() {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [logs, setLogs] = useState<NetworkLog[]>(() => generateInitialLogsList(60));
  const [chartHistory, setChartHistory] = useState<ChartDataPoint[]>(() => {
    // Generate initial historical charts
    const data: ChartDataPoint[] = [];
    const now = new Date();
    for (let i = CHART_HISTORY_LIMIT - 1; i >= 0; i--) {
      const historicalTime = new Date(now.getTime() - i * 2000);
      const timeLabel = `${historicalTime.getHours().toString().padStart(2, "0")}:${historicalTime.getMinutes().toString().padStart(2, "0")}:${historicalTime.getSeconds().toString().padStart(2, "0")}`;
      const baseFlows = Math.floor(Math.random() * 12) + 14;
      const isAnomaly = Math.random() < 0.10;
      const flows = isAnomaly ? baseFlows * 2.5 : baseFlows;
      data.push({
        timeLabel,
        flows: Math.round(flows),
        bandwidth: Math.round(isAnomaly ? (Math.random() * 8000 + 4000) : (Math.random() * 1200 + 340)),
        anomalyScore: isAnomaly ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 15) + 2,
        isAnomaly
      });
    }
    return data;
  });

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

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
      
      const flowsCount = Math.round(Math.floor(Math.random() * 8) + 12 + newLogs.length * 1.5);
      const activeBandwidth = newLogs.reduce((acc, log) => acc + log.origBytes / 1024, 0);
      const normalizedBandwidth = Math.max(300, activeBandwidth > 200 ? activeBandwidth : (Math.random() * 800 + 300));
      const anomalyScore = hasAnomaly 
        ? (anomalyLog?.threatScore || 85)
        : Math.min(45, Math.max(1, Math.round(newLogs.length * 2.5 + Math.random() * 8)));

      const nextTime = new Date();
      const timeLabel = `${nextTime.getHours().toString().padStart(2, "0")}:${nextTime.getMinutes().toString().padStart(2, "0")}:${nextTime.getSeconds().toString().padStart(2, "0")}`;

      const nextPoint: ChartDataPoint = {
        timeLabel,
        flows: Math.round(flowsCount),
        bandwidth: Math.round(normalizedBandwidth),
        anomalyScore: Math.round(anomalyScore),
        isAnomaly: hasAnomaly,
        eventAnnotation: hasAnomaly ? anomalyLog?.reason.split(":")[0] : undefined
      };

      return [...prev.slice(1), nextPoint];
    });
  }, []);

  const { queueEvent } = useRealtimeBuffer<NetworkLog>(handleFlushLogs, 400);

  // Background random stream generation (Low noise traffic loop)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRunningRef.current) return;
      
      // Introduce variable frequency
      const packetsCount = Math.floor(Math.random() * 3) + 1; // 1-3 packet ticks per generation
      for (let i = 0; i < packetsCount; i++) {
        queueEvent(generateRandomLog());
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [queueEvent]);

  // Injector 1: Port Scan reconnaissance diagnostics
  const injectPortScan = useCallback(() => {
    const now = new Date();
    const portsToScan = [21, 22, 23, 25, 80, 110, 139, 443, 445];
    const srcIp = "185.190.240.8"; // external suspicious tracer
    
    portsToScan.forEach((port, idx) => {
      const offsetTime = new Date(now.getTime() - (portsToScan.length - idx) * 50);
      const timestamp = `${offsetTime.getHours().toString().padStart(2, "0")}:${offsetTime.getMinutes().toString().padStart(2, "0")}:${offsetTime.getSeconds().toString().padStart(2, "0")}.${offsetTime.getMilliseconds().toString().padStart(3, "0")}`;

      const scanLog: NetworkLog = {
        id: `inject_scan_${Math.random().toString(36).substring(2, 11)}`,
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
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

    const exfilLog: NetworkLog = {
      id: `inject_exfil_${Math.random().toString(36).substring(2, 11)}`,
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
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

    const torLog: NetworkLog = {
      id: `inject_tor_${Math.random().toString(36).substring(2, 11)}`,
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
    injectPortScan,
    injectMassiveExfiltration,
    injectTorDnsTunnel,
    clearLogs,
    injectCustomLog
  };
}
