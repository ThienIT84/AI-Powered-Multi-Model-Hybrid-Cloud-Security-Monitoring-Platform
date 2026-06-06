export interface ThreatEvent {
  id: string;
  timestamp: string;
  attackType: string;
  source: string;
  destination: string;
  detectionPath: string;
  riskScore: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  zeekEvidence: {
    logType: string;
    fields: Record<string, any>;
  };
  aiResults: {
    ai1AnomalyScore: number;
    ai2aClassifier: { label: string; prob: number };
    ai2bHttpSemantic: { label: string; prob: number };
  };
  suricataEvidence: {
    alert: string;
    sid: number;
    matched: boolean;
  };
  fusionDecision: {
    consensusConfidence: number;
    classificationOverride: boolean;
    mitreTechnique: string;
    mitreId: string;
    remediationAction: string;
  };
}

export interface GraphColors {
  cyan: string;
  emerald: string;
  amber: string;
  red: string;
  violet: string;
  gray: string;
  border: string;
  text: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}
