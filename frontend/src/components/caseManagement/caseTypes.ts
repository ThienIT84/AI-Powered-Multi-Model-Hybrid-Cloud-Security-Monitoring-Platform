export type CaseSeverity = "Critical" | "High" | "Medium" | "Low";
export type CaseStatus = "Open" | "In Progress" | "Resolved" | "Pending Review";

export interface Case {
  id: string;
  title: string;
  severity: CaseSeverity;
  status: CaseStatus;
  assignedTo?: string;
  timestamp: string; // ISO date format

  source_ip: string;
  destination_ip: string;
  attack_type: string;

  zeek: {
    conn_log: string[];
    http_log?: string[];
    flows: number;
  };

  detection: {
    ai1: { label: string; score: number };
    ai2a: { class: string; confidence: number };
    ai2b?: { class: string; confidence: number };
  };

  suricata: {
    signatures: string[];
  };

  timeline: {
    events: string[]; // Forensic time strings or logs for activity
  };

  // Operational states supporting page interactions
  isIpBlocked?: boolean;
  comments?: {
    id: string;
    author: string;
    timestamp: string;
    text: string;
  }[];
  notes?: string;
}
