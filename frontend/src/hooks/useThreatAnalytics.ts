import { useMemo } from "react";
import { NetworkLog } from "../components/network/NetworkConfig";

interface UseThreatAnalyticsResult {
  suspiciousSessionsCount: number;
  avgPacketSize: number;
  avgThreatScore: number;
  activeCountriesCount: number;
  uniqueIPCount: number;
  calculatedThreatLevel: number; // probability %
}

export function useThreatAnalytics(logs: NetworkLog[]): UseThreatAnalyticsResult {
  return useMemo(() => {
    if (logs.length === 0) {
      return {
        suspiciousSessionsCount: 0,
        avgPacketSize: 0,
        avgThreatScore: 0,
        activeCountriesCount: 0,
        uniqueIPCount: 0,
        calculatedThreatLevel: 0
      };
    }

    // 1. Suspicious Sessions: log severity HIGH or CRITICAL
    const suspiciousSessions = logs.filter(
      l => l.severity === "HIGH" || l.severity === "CRITICAL"
    );
    const suspiciousSessionsCount = suspiciousSessions.length;

    // 2. Average Packet Size = Sum(origBytes) / Sum(respPkts)
    let totalBytes = 0;
    let totalPackets = 0;
    const ips = new Set<string>();
    const countries = new Set<string>();
    let sumThreatScores = 0;

    logs.forEach(log => {
      totalBytes += log.origBytes;
      totalPackets += Math.max(1, log.respPkts);
      ips.add(log.srcIp);
      ips.add(log.destIp);
      if (log.country) {
        countries.add(log.country);
      }
      sumThreatScores += log.threatScore;
    });

    const avgPacketSize = Math.round(totalBytes / Math.max(1, totalPackets));

    // 3. Average threat score across all active entries
    const avgThreatScore = Math.round(sumThreatScores / logs.length);

    // 4. Unique IP and countries
    const uniqueIPCount = ips.size;
    const activeCountriesCount = countries.size;

    // 5. Moving Threat Level %: ratio of anomaly verdicts in the last 40 logs
    const windowsLogs = logs.slice(0, 40);
    const anomaliesCount = windowsLogs.filter(l => l.verdict === "ANOMALY").length;
    const calculatedThreatLevel = Math.round((anomaliesCount / windowsLogs.length) * 100);

    return {
      suspiciousSessionsCount,
      avgPacketSize,
      avgThreatScore,
      activeCountriesCount,
      uniqueIPCount,
      calculatedThreatLevel
    };
  }, [logs]);
}
