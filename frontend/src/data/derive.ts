import { Alert, AlertStatus, Severity } from "../types";

export const EMPTY_VALUE = "—";

const UNKNOWN_VALUES = new Set(["", "unknown", "n/a", "na", "none", "null", "undefined"]);

export function hasValue(value: unknown): value is string {
  return typeof value === "string" && !UNKNOWN_VALUES.has(value.trim().toLowerCase());
}

export function displayValue(value: unknown, missing = EMPTY_VALUE): string {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : missing;
  if (hasValue(value)) return value.trim();
  return missing;
}

export function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseTimestamp(value: string | undefined): number | null {
  if (!hasValue(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatTimestamp(value: string | undefined): string {
  if (!hasValue(value)) return EMPTY_VALUE;
  const parsed = parseTimestamp(value);
  if (parsed === null) return value;
  return new Date(parsed).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function sortAlertsNewest(alerts: Alert[]): Alert[] {
  return [...alerts].sort((left, right) => {
    const leftTime = parseTimestamp(left.timestamp) ?? Number.NEGATIVE_INFINITY;
    const rightTime = parseTimestamp(right.timestamp) ?? Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });
}

export function average(values: Array<number | null | undefined>): number | null {
  const usable = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (usable.length === 0) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

const severityRank: Record<Severity, number> = {
  [Severity.LOW]: 1,
  [Severity.MEDIUM]: 2,
  [Severity.HIGH]: 3,
  [Severity.CRITICAL]: 4,
};

export function highestSeverity(values: Severity[]): Severity | null {
  if (values.length === 0) return null;
  return values.reduce((highest, current) =>
    severityRank[current] > severityRank[highest] ? current : highest
  );
}

export function severityClass(severity: Severity | null | undefined): string {
  switch (severity) {
    case Severity.CRITICAL:
      return "border-red-500/30 bg-red-500/10 text-red-500";
    case Severity.HIGH:
      return "border-orange-500/30 bg-orange-500/10 text-orange-500";
    case Severity.MEDIUM:
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";
    case Severity.LOW:
      return "border-blue-500/30 bg-blue-500/10 text-blue-500";
    default:
      return "border-border bg-muted/20 text-muted-foreground";
  }
}

export interface NetworkAlertRow {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourcePort: number | null;
  destinationIp: string;
  destinationPort: number | null;
  protocol: string;
  direction: string;
  service: string;
  attackType: string;
  severity: Severity;
  riskScore: number | null;
  confidenceScore: number | null;
  bytes: number | null;
  packets: number | null;
  sensorId: string;
  signatureId: string;
  correlationId: string;
}

export function deriveNetworkRows(alerts: Alert[]): NetworkAlertRow[] {
  return sortAlertsNewest(alerts).map((alert) => {
    const byteValues = [finiteNumber(alert.zeekData?.origBytes), finiteNumber(alert.zeekData?.respBytes)]
      .filter((value): value is number => value !== null);
    const packetValues = [finiteNumber(alert.zeekData?.origPkts), finiteNumber(alert.zeekData?.respPkts)]
      .filter((value): value is number => value !== null);

    return {
      id: alert.id,
      timestamp: alert.timestamp,
      sourceIp: displayValue(alert.sourceIp, "Unknown"),
      sourcePort: finiteNumber(alert.sourcePort),
      destinationIp: displayValue(alert.destinationIp || alert.destIp, "Unknown"),
      destinationPort: finiteNumber(alert.destinationPort || alert.destPort),
      protocol: displayValue(alert.protocol, "Unknown"),
      direction: displayValue(alert.direction, "Unknown"),
      service: displayValue(alert.zeekData?.service, "Unknown"),
      attackType: displayValue(alert.attackType, "Unknown"),
      severity: alert.severity,
      riskScore: finiteNumber(alert.riskScore),
      confidenceScore: finiteNumber(alert.confidenceScore),
      bytes: byteValues.length > 0 ? byteValues.reduce((sum, value) => sum + value, 0) : null,
      packets: packetValues.length > 0 ? packetValues.reduce((sum, value) => sum + value, 0) : null,
      sensorId: displayValue(alert.zeekData?.sensorId, "Unknown"),
      signatureId: displayValue(alert.suricataData?.signatureId, "Unknown"),
      correlationId: displayValue(alert.zeekData?.correlationId, "Unknown"),
    };
  });
}

export interface NetworkSummary {
  records: number;
  uniqueSources: number;
  uniqueDestinations: number;
  bytes: number | null;
  packets: number | null;
  zeekEvidence: number;
  suricataEvidence: number;
}

export function deriveNetworkSummary(rows: NetworkAlertRow[]): NetworkSummary {
  const knownBytes = rows.map((row) => row.bytes).filter((value): value is number => value !== null);
  const knownPackets = rows.map((row) => row.packets).filter((value): value is number => value !== null);
  return {
    records: rows.length,
    uniqueSources: new Set(rows.map((row) => row.sourceIp).filter((value) => value !== "Unknown")).size,
    uniqueDestinations: new Set(rows.map((row) => row.destinationIp).filter((value) => value !== "Unknown")).size,
    bytes: knownBytes.length > 0 ? knownBytes.reduce((sum, value) => sum + value, 0) : null,
    packets: knownPackets.length > 0 ? knownPackets.reduce((sum, value) => sum + value, 0) : null,
    zeekEvidence: rows.filter((row) => row.sensorId !== "Unknown" || row.correlationId !== "Unknown").length,
    suricataEvidence: rows.filter((row) => row.signatureId !== "Unknown").length,
  };
}

function publicIpv4(value: string): boolean | null {
  const octets = value.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }
  const [first, second] = octets;
  if (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    first === 0
  ) {
    return false;
  }
  return true;
}

interface AssetAccumulator {
  id: string;
  label: string;
  kind: string;
  address: string;
  observedAs: Set<string>;
  alertIds: Set<string>;
  attackTypes: Set<string>;
  protocols: Set<string>;
  providers: Set<string>;
  regions: Set<string>;
  severities: Severity[];
  risks: number[];
  latestTimestamp: string | null;
  latestEpoch: number | null;
  internetFacing: boolean | null;
}

export interface ObservedAsset {
  id: string;
  label: string;
  kind: string;
  address: string;
  observedAs: string[];
  alertCount: number;
  attackTypes: string[];
  protocols: string[];
  providers: string[];
  regions: string[];
  severity: Severity | null;
  maxRiskScore: number | null;
  averageRiskScore: number | null;
  lastSeen: string | null;
  internetFacing: boolean | null;
}

function addAlertToAsset(
  assets: Map<string, AssetAccumulator>,
  key: string,
  seed: Pick<AssetAccumulator, "id" | "label" | "kind" | "address" | "internetFacing">,
  alert: Alert,
  observedAs: string,
) {
  const existing = assets.get(key) ?? {
    ...seed,
    observedAs: new Set<string>(),
    alertIds: new Set<string>(),
    attackTypes: new Set<string>(),
    protocols: new Set<string>(),
    providers: new Set<string>(),
    regions: new Set<string>(),
    severities: [],
    risks: [],
    latestTimestamp: null,
    latestEpoch: null,
  };

  existing.observedAs.add(observedAs);
  existing.alertIds.add(alert.id);
  if (hasValue(alert.attackType)) existing.attackTypes.add(alert.attackType);
  if (hasValue(alert.protocol)) existing.protocols.add(alert.protocol);
  if (hasValue(alert.cloudProvider)) existing.providers.add(alert.cloudProvider);
  if (hasValue(alert.region)) existing.regions.add(alert.region);
  existing.severities.push(alert.severity);
  const risk = finiteNumber(alert.riskScore);
  if (risk !== null) existing.risks.push(risk);

  const epoch = parseTimestamp(alert.timestamp);
  if (epoch !== null && (existing.latestEpoch === null || epoch > existing.latestEpoch)) {
    existing.latestEpoch = epoch;
    existing.latestTimestamp = alert.timestamp;
  }
  assets.set(key, existing);
}

export function deriveObservedAssets(alerts: Alert[]): ObservedAsset[] {
  const assets = new Map<string, AssetAccumulator>();

  alerts.forEach((alert) => {
    if (hasValue(alert.sourceIp)) {
      addAlertToAsset(assets, `ip:${alert.sourceIp}`, {
        id: `ip:${alert.sourceIp}`,
        label: alert.sourceIp,
        kind: "IP address",
        address: alert.sourceIp,
        internetFacing: publicIpv4(alert.sourceIp),
      }, alert, "Source");
    }

    const destination = alert.destinationIp || alert.destIp;
    if (hasValue(destination)) {
      addAlertToAsset(assets, `ip:${destination}`, {
        id: `ip:${destination}`,
        label: destination,
        kind: "IP address",
        address: destination,
        internetFacing: publicIpv4(destination),
      }, alert, "Destination");
    }

    if (hasValue(alert.resourceId)) {
      addAlertToAsset(assets, `resource:${alert.resourceId}`, {
        id: `resource:${alert.resourceId}`,
        label: alert.resourceId,
        kind: displayValue(alert.resourceType, "Cloud resource"),
        address: alert.resourceId,
        internetFacing: null,
      }, alert, "Resource");
    }
  });

  return [...assets.values()]
    .map((asset): ObservedAsset => ({
      id: asset.id,
      label: asset.label,
      kind: asset.kind,
      address: asset.address,
      observedAs: [...asset.observedAs].sort(),
      alertCount: asset.alertIds.size,
      attackTypes: [...asset.attackTypes].sort(),
      protocols: [...asset.protocols].sort(),
      providers: [...asset.providers].sort(),
      regions: [...asset.regions].sort(),
      severity: highestSeverity(asset.severities),
      maxRiskScore: asset.risks.length > 0 ? Math.max(...asset.risks) : null,
      averageRiskScore: average(asset.risks),
      lastSeen: asset.latestTimestamp,
      internetFacing: asset.internetFacing,
    }))
    .sort((left, right) => {
      const severityDifference = (severityRank[right.severity ?? Severity.LOW] ?? 0) -
        (severityRank[left.severity ?? Severity.LOW] ?? 0);
      if (severityDifference !== 0) return severityDifference;
      return (right.maxRiskScore ?? -1) - (left.maxRiskScore ?? -1);
    });
}

export interface AiAlertRecord {
  id: string;
  timestamp: string;
  attackType: string;
  severity: Severity;
  sourceIp: string;
  destinationIp: string;
  confidenceScore: number | null;
  riskScore: number | null;
  ai1Verdict: string;
  ai1Score: number | null;
  ai1Status: string;
  ai1Model: string;
  ai2aType: string;
  ai2aConfidence: number | null;
  ai2aStatus: string;
  ai2aModel: string;
  ai2bType: string;
  ai2bConfidence: number | null;
  ai2bStatus: string;
  ai2bModel: string;
  fusionReason: string;
  fusionMode: string;
  contributors: string[];
}

export function deriveAiRecords(alerts: Alert[]): AiAlertRecord[] {
  return sortAlertsNewest(alerts).map((alert) => ({
    id: alert.id,
    timestamp: alert.timestamp,
    attackType: displayValue(alert.attackType, "Unknown"),
    severity: alert.severity,
    sourceIp: displayValue(alert.sourceIp, "Unknown"),
    destinationIp: displayValue(alert.destinationIp || alert.destIp, "Unknown"),
    confidenceScore: finiteNumber(alert.confidenceScore),
    riskScore: finiteNumber(alert.riskScore),
    ai1Verdict: displayValue(alert.aiDecision.ai1?.verdict, "Unknown"),
    ai1Score: finiteNumber(alert.aiDecision.ai1?.anomalyScore),
    ai1Status: displayValue(alert.aiDecision.ai1?.status, "Unknown"),
    ai1Model: displayValue(alert.aiDecision.ai1?.modelVersion, "Unknown"),
    ai2aType: displayValue(alert.aiDecision.ai2a?.attackType, "Unknown"),
    ai2aConfidence: finiteNumber(alert.aiDecision.ai2a?.confidenceScore),
    ai2aStatus: displayValue(alert.aiDecision.ai2a?.status, "Unknown"),
    ai2aModel: displayValue(alert.aiDecision.ai2a?.modelVersion, "Unknown"),
    ai2bType: displayValue(alert.aiDecision.ai2b?.webAttackType, "Unknown"),
    ai2bConfidence: finiteNumber(alert.aiDecision.ai2b?.confidenceScore),
    ai2bStatus: displayValue(alert.aiDecision.ai2b?.status, "Unknown"),
    ai2bModel: displayValue(alert.aiDecision.ai2b?.modelVersion, "Unknown"),
    fusionReason: displayValue(alert.aiDecision.fusion?.reason, "Unknown"),
    fusionMode: displayValue(alert.aiDecision.fusion?.mode, "Unknown"),
    contributors: alert.aiDecision.fusion?.contributors?.filter(hasValue) ?? [],
  }));
}

export interface MitreTechniqueAggregate {
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  url: string | null;
  alertCount: number;
  maxRiskScore: number | null;
  averageConfidence: number | null;
  severities: Severity[];
  lastSeen: string | null;
  alertIds: string[];
}

interface MitreAccumulator {
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  url: string | null;
  alerts: Alert[];
}

export function deriveMitreTechniques(alerts: Alert[]): MitreTechniqueAggregate[] {
  const grouped = new Map<string, MitreAccumulator>();

  alerts.forEach((alert) => {
    const id = hasValue(alert.mitre?.techniqueId) ? alert.mitre.techniqueId : null;
    const name = hasValue(alert.mitre?.techniqueName) ? alert.mitre.techniqueName : null;
    if (!id && !name) return;
    const key = id ?? `name:${name}`;
    const current = grouped.get(key) ?? {
      techniqueId: id ?? "Unknown",
      techniqueName: name ?? "Unknown",
      tactic: hasValue(alert.mitre?.tactic) ? alert.mitre.tactic : "Unknown",
      url: hasValue(alert.mitre?.url) ? alert.mitre.url : null,
      alerts: [],
    };
    current.alerts.push(alert);
    if (current.techniqueName === "Unknown" && name) current.techniqueName = name;
    if (current.tactic === "Unknown" && hasValue(alert.mitre?.tactic)) current.tactic = alert.mitre.tactic;
    if (!current.url && hasValue(alert.mitre?.url)) current.url = alert.mitre.url;
    grouped.set(key, current);
  });

  return [...grouped.values()]
    .map((item): MitreTechniqueAggregate => {
      const sorted = sortAlertsNewest(item.alerts);
      const risks = item.alerts.map((alert) => finiteNumber(alert.riskScore));
      const riskValues = risks.filter((value): value is number => value !== null);
      return {
        techniqueId: item.techniqueId,
        techniqueName: item.techniqueName,
        tactic: item.tactic,
        url: item.url,
        alertCount: item.alerts.length,
        maxRiskScore: riskValues.length > 0 ? Math.max(...riskValues) : null,
        averageConfidence: average(item.alerts.map((alert) => finiteNumber(alert.confidenceScore))),
        severities: item.alerts.map((alert) => alert.severity),
        lastSeen: sorted[0]?.timestamp ?? null,
        alertIds: sorted.map((alert) => alert.id),
      };
    })
    .sort((left, right) => right.alertCount - left.alertCount || left.techniqueId.localeCompare(right.techniqueId));
}

export type ReportRange = "24h" | "7d" | "30d" | "all";

const reportRangeMilliseconds: Record<Exclude<ReportRange, "all">, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export function filterAlertsByRange(alerts: Alert[], range: ReportRange): Alert[] {
  const sorted = sortAlertsNewest(alerts);
  if (range === "all") return sorted;
  const newestTimestamp = sorted.map((alert) => parseTimestamp(alert.timestamp))
    .find((timestamp): timestamp is number => timestamp !== null);
  if (newestTimestamp === undefined) return [];
  const cutoff = newestTimestamp - reportRangeMilliseconds[range];
  return sorted.filter((alert) => {
    const timestamp = parseTimestamp(alert.timestamp);
    return timestamp !== null && timestamp >= cutoff && timestamp <= newestTimestamp;
  });
}

export interface CountItem {
  name: string;
  count: number;
}

export function countBy(values: Array<string | undefined | null>): CountItem[] {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    if (!hasValue(value)) return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export interface ReportSnapshot {
  alerts: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  uniqueSources: number;
  uniqueDestinations: number;
  openAlerts: number;
  resolvedAlerts: number;
  averageRiskScore: number | null;
  averageConfidence: number | null;
  attackTypes: CountItem[];
  sources: CountItem[];
  destinations: CountItem[];
  statuses: CountItem[];
  mitreTechniques: CountItem[];
  providers: CountItem[];
}

export function deriveReportSnapshot(alerts: Alert[]): ReportSnapshot {
  const resolvedStatuses = new Set<AlertStatus>([
    AlertStatus.RESOLVED,
    AlertStatus.MITIGATED,
    AlertStatus.FALSE_POSITIVE,
  ]);
  return {
    alerts: alerts.length,
    critical: alerts.filter((alert) => alert.severity === Severity.CRITICAL).length,
    high: alerts.filter((alert) => alert.severity === Severity.HIGH).length,
    medium: alerts.filter((alert) => alert.severity === Severity.MEDIUM).length,
    low: alerts.filter((alert) => alert.severity === Severity.LOW).length,
    uniqueSources: new Set(alerts.map((alert) => alert.sourceIp).filter(hasValue)).size,
    uniqueDestinations: new Set(alerts.map((alert) => alert.destinationIp || alert.destIp).filter(hasValue)).size,
    openAlerts: alerts.filter((alert) => !resolvedStatuses.has(alert.status)).length,
    resolvedAlerts: alerts.filter((alert) => resolvedStatuses.has(alert.status)).length,
    averageRiskScore: average(alerts.map((alert) => finiteNumber(alert.riskScore))),
    averageConfidence: average(alerts.map((alert) => finiteNumber(alert.confidenceScore))),
    attackTypes: countBy(alerts.map((alert) => alert.attackType)),
    sources: countBy(alerts.map((alert) => alert.sourceIp)),
    destinations: countBy(alerts.map((alert) => alert.destinationIp || alert.destIp)),
    statuses: countBy(alerts.map((alert) => alert.status)),
    mitreTechniques: countBy(alerts.map((alert) => {
      const id = hasValue(alert.mitre?.techniqueId) ? alert.mitre.techniqueId : null;
      const name = hasValue(alert.mitre?.techniqueName) ? alert.mitre.techniqueName : null;
      return id && name ? `${id} · ${name}` : id ?? name;
    })),
    providers: countBy(alerts.map((alert) => alert.cloudProvider)),
  };
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join(" | ") : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function alertsToCsv(alerts: Alert[]): string {
  const headers = [
    "id",
    "timestamp",
    "severity",
    "status",
    "attack_type",
    "source_ip",
    "source_port",
    "destination_ip",
    "destination_port",
    "protocol",
    "risk_score",
    "confidence_score",
    "mitre_technique_id",
    "mitre_technique_name",
    "mitre_tactic",
    "cloud_provider",
    "region",
    "resource_id",
    "detected_by",
    "suricata_signature_id",
    "zeek_sensor_id",
  ];
  const rows = sortAlertsNewest(alerts).map((alert) => [
    alert.id,
    alert.timestamp,
    alert.severity,
    alert.status,
    alert.attackType,
    alert.sourceIp,
    alert.sourcePort,
    alert.destinationIp || alert.destIp,
    alert.destinationPort || alert.destPort,
    alert.protocol,
    alert.riskScore,
    alert.confidenceScore,
    alert.mitre?.techniqueId,
    alert.mitre?.techniqueName,
    alert.mitre?.tactic,
    alert.cloudProvider,
    alert.region,
    alert.resourceId,
    alert.detectedBy,
    alert.suricataData?.signatureId,
    alert.zeekData?.sensorId,
  ]);
  return [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
}
