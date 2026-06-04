import { Alert, getAlertFusionMeta } from "../../types";

export interface FeatureWeight {
  feature: string;
  weight: number; // Positive contribution
  direction: "positive" | "negative";
  category: "network" | "payload" | "metadata";
  description: string;
}

export const MODEL_WEIGHTS = {
  ai1: 0.30,      // Anomaly detector
  ai2a: 0.30,     // Network classifier
  ai2b: 0.25,     // Payload inspector
  suricata: 0.15, // Hardware signatures
};

/**
 * Returns dry-run SHAP features based on attack types
 */
export function getExplainabilityFeatures(alert: Alert): FeatureWeight[] {
  const meta = getAlertFusionMeta(alert);
  const type = (alert.attackType || "").toLowerCase();

  const base: FeatureWeight[] = [
    { feature: "Duration of connection", weight: 8, direction: "positive", category: "metadata", description: "Slightly elevated correlation window" },
    { feature: "Payload entropy check", weight: 12, direction: "positive", category: "payload", description: "Unusual character randomness detected" },
  ];

  if (type.includes("injection") || type.includes("sql") || type.includes("xss")) {
    return [
      { feature: "Request URI pattern match (SQL/XSS hints)", weight: 42, direction: "positive", category: "payload", description: "Matches dangerous regex pattern list" },
      { feature: "Response payload byte variance", weight: 28, direction: "positive", category: "payload", description: "Suspiciously large structure in return frame" },
      { feature: "Connection source reputation index", weight: 15, direction: "positive", category: "metadata", description: "Source IP from non-standard hosting CIDR" },
      { feature: "Header parameters validation", weight: -10, direction: "negative", category: "metadata", description: "Standard HTTP headers align normally" },
    ];
  } else if (type.includes("scan") || type.includes("recon")) {
    return [
      { feature: "Port variance count in delta-T", weight: 45, direction: "positive", category: "network", description: "Destination TCP/UDP ports scanned rapidly" },
      { feature: "TCP connection flags ratio (SYN-ACK bias)", weight: 32, direction: "positive", category: "network", description: "High ratio of half-open TCP states" },
      { feature: "Total originating packet rate", weight: 18, direction: "positive", category: "network", description: "Burst traffic exceeds regular human baseline thresholds" },
      { feature: "Original origin packet volume", weight: -8, direction: "negative", category: "network", description: "Total bytes per packet is minimal" },
    ];
  } else if (type.includes("brute") || type.includes("credential")) {
    return [
      { feature: "Failed authentication transactions", weight: 44, direction: "positive", category: "payload", description: "Multiple matching raw authentication payload attempts" },
      { feature: "Re-entry frequency rate", weight: 35, direction: "positive", category: "network", description: "Aggressive speed cyclic POST requests" },
      { feature: "Standard user-agent diversity", weight: 12, direction: "positive", category: "metadata", description: "Changing agent fields in short windows of time" },
      { feature: "Session ID persistence states", weight: -5, direction: "negative", category: "metadata", description: "Standard cookies managed correctly" },
    ];
  }

  // Fallback / DoS / DDoS defaults
  return [
    { feature: "Outbound bytes ratio (orig_bytes)", weight: 38, direction: "positive", category: "network", description: "Huge originating payload size vs small returns" },
    { feature: "Frequency rate of packets (packet_rate)", weight: 34, direction: "positive", category: "network", description: "Sustained high volumes of frames per millisecond" },
    { feature: "Total response bytes return index", weight: -12, direction: "negative", category: "network", description: "Target responded very minimally to flow" },
    { feature: "Service protocol alignment state", weight: 10, direction: "positive", category: "metadata", description: "Irregular protocol layers detected on this port" },
  ];
}
