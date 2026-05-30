import { Alert, Severity, AlertStatus } from "../../types";

export const MOCK_ALERTS_COUNT_MERGED = 42;
export const MOCK_ALERTS_COUNT_SUPPRESSED = 128;

// Map attack types to MITRE Technique mappings
export const MITRE_MAPPINGS: Record<string, { id: string; name: string; tactic: string; url: string }> = {
  "XSS": {
    id: "T1190",
    name: "Exploit Public-Facing Application",
    tactic: "Initial Access",
    url: "https://attack.mitre.org/techniques/T1190"
  },
  "SQLi": {
    id: "T1190",
    name: "Exploit Public-Facing Application",
    tactic: "Initial Access",
    url: "https://attack.mitre.org/techniques/T1190"
  },
  "Port Scan": {
    id: "T1046",
    name: "Network Service Discovery",
    tactic: "Discovery",
    url: "https://attack.mitre.org/techniques/T1046"
  },
  "Brute Force": {
    id: "T1110",
    name: "Brute Force",
    tactic: "Credential Access",
    url: "https://attack.mitre.org/techniques/T1110"
  },
  "Beaconing": {
    id: "T1071",
    name: "Application Layer Protocol",
    tactic: "Command and Control",
    url: "https://attack.mitre.org/techniques/T1071"
  },
  "Data Exfiltration": {
    id: "T1041",
    name: "Exfiltration Over C2 Channel",
    tactic: "Exfiltration",
    url: "https://attack.mitre.org/techniques/T1041"
  },
  "Botnet": {
    id: "T1071",
    name: "Application Layer Protocol",
    tactic: "Command and Control",
    url: "https://attack.mitre.org/techniques/T1071"
  }
};

export const MOCK_PLAYBOOKS = [
  { id: "pb-01", name: "AWS CloudTrail Anomaly Quarantine", desc: "Automated IAM credentials stripping and network segment isolation" },
  { id: "pb-02", name: "Reverse Proxy IP Blocklist Update", desc: "Propagates source network bounds rules across Cloudflare layer" },
  { id: "pb-03", name: "Host Forensic Memory Dump capture", desc: "Extracts volatile memory profile over socket bounds" },
  { id: "pb-04", name: "Active Directory Account Freeze Trigger", desc: "Instantly locks target domain security identifier mappings" },
];
