import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Activity, 
  Cpu, 
  Radio, 
  Layers, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Info, 
  RefreshCw, 
  Sliders, 
  Terminal, 
  ArrowRight, 
  User, 
  Link2, 
  Network, 
  Database, 
  FileText, 
  SearchCode, 
  ExternalLink,
  Tag, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Filter, 
  Calendar,
  X,
  Gauge,
  Play,
  Pause,
  AlertCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from "recharts";

// TypeScript Interfaces for Structured Threat Intel Data
interface ThreatActor {
  id: string;
  name: string;
  codename: string;
  origin: string;
  focus: string;
  confidence: number;
  lastActivity: string;
  linkedIncidentsCount: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  techniques: string[]; // MITRE Techniques list
  targetSectors: string[];
  observedZeekPattern: string;
  observedSuricataSids: string[];
  bio: string;
}

interface IOCIndicator {
  id: string;
  type: "IP" | "Domain" | "URL" | "Payload" | "Suricata SID";
  value: string;
  source: "Zeek (conn.log)" | "Zeek (http.log)" | "Suricata IDS" | "AI2A" | "AI2B";
  mitreId: string;
  mitreName: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  caseId: string;
  riskScore: number;
  enrichmentStatus: "Enriched" | "Pending" | "Unknown";
}

interface ThreatFeedItem {
  id: string;
  timestamp: string;
  attackType: string;
  mitreId: string;
  actorOverlap: string;
  iocMatch: string;
  confidence: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  logSource: string;
}

interface CampaignStage {
  stage: string;
  title: string;
  timestamp: string;
  logEvidence: string;
  indicator: string;
  mitreId: string;
  status: "DETECTED" | "CORRELATED" | "MITIGATED" | "ACTIVE";
  signalSource: string;
}

export const ThreatIntelPage: React.FC = () => {
  // Navigation & View Toggles
  const [activeTab, setActiveTab] = useState<"actors" | "iocs" | "mitre" | "campaigns" | "pipeline">("actors");
  
  // Real-time ticking system state (toggled for simulation speed & live feel)
  const [isPlaying, setIsPlaying] = useState(true);
  const [ticks, setTicks] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing">("synced");
  const [syncCount, setSyncCount] = useState(0);

  // Search queries
  const [actorSearch, setActorSearch] = useState("");
  const [iocSearch, setIocSearch] = useState("");
  const [selectedActor, setSelectedActor] = useState<string>("APT-28");
  
  // Custom Investigation bar inputs
  const [investigateInput, setInvestigateInput] = useState("");
  const [investigatedRecord, setInvestigatedRecord] = useState<any | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);

  // Risk weighting interactive inputs
  const [weightConfidence, setWeightConfidence] = useState<number>(0.4);
  const [weightSeverity, setWeightSeverity] = useState<number>(0.3);
  const [weightActorRep, setWeightActorRep] = useState<number>(0.3);

  // Deep structural threat actor intelligence payload (SOC Profile records)
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([
    {
      id: "APT-28",
      name: "APT-28 (Fancy Bear)",
      codename: "Bear-0028",
      origin: "Russia (State-Sponsored)",
      focus: "Cyber-Espionage, Geopolitical Disruption",
      confidence: 92,
      lastActivity: "2 hours ago",
      linkedIncidentsCount: 14,
      severity: "CRITICAL",
      techniques: ["T1190 (Exploit Public-Facing Application)", "T1071 (Application Layer Protocols)", "T1566 (Phishing)", "T1041 (Exfiltration Over C2)"],
      targetSectors: ["Government", "Defense Contractors", "Critical Infrastructure"],
      observedZeekPattern: "http.log payload with anomalous SSL header strings + outbound beacons matching 185.220.101.0/24 subnet CIDR blocks",
      observedSuricataSids: ["SID: 2018442 (ET EXPLOIT APT-28 SSL Cert fingerprint)", "SID: 3021941 (ET TROJAN FancyBear Outbound Beacon)"],
      bio: "Highly sophisticated threat actor operating continuously since at least 2004. Utilizes custom implants (such as Sofacy/X-Agent) paired with zero-day vulnerability exploits in public application layers. Frequently correlates with high-priority conn.log egress byte spikes parsed via Zeek sensors."
    },
    {
      id: "Lazarus",
      name: "Lazarus Group (Hidden Cobra)",
      codename: "Cobra-0038",
      origin: "North Korea (State-Sponsored)",
      focus: "Financial Extrication, Cryptocurrency Exploitation, Destructive Actions",
      confidence: 94,
      lastActivity: "4 mins ago",
      linkedIncidentsCount: 9,
      severity: "CRITICAL",
      techniques: ["T1566 (Phishing)", "T1041 (Exfiltration over C2)", "T1567 (Exfiltration Over Web Service)", "T1486 (Data Encrypted for Impact)"],
      targetSectors: ["Financial Institutions", "Cryptocurrency Exchanges", "Media Enterprises"],
      observedZeekPattern: "http.log POST payloads carrying multipart base64 data structures and conn.log session payloads on destination port 443 with asymmetrical volume ratios (>20:1)",
      observedSuricataSids: ["SID: 2029481 (ET WEBSERVER Lazarus malware downloader)", "SID: 2048592 (ET TROJAN HiddenCobra Host Beacon C2)"],
      bio: "Active since 2009, this cyber syndicate leverages rapid technological agility, shifting from destructive critical infrastructure hacks to massive cryptocurrency wallet exfiltrations. Often triggered in the SOC as persistent high-entropy payloads analyzed by AI2B semantic detectors."
    },
    {
      id: "WizardSpider",
      name: "Wizard Spider (Trickbot Syndicate)",
      codename: "Spider-0782",
      origin: "Eastern Europe (Cybercrime Corporation)",
      focus: "Double Ransomware Extortion, Network Intrusions",
      confidence: 89,
      lastActivity: "1 day ago",
      linkedIncidentsCount: 11,
      severity: "HIGH",
      techniques: ["T1486 (Data Encrypted for Impact)", "T1059 (Command and Scripting Interpreter)", "T1021 (Remote Services)", "T1083 (File and Directory Discovery)"],
      targetSectors: ["Healthcare", "Logistics", "Municipal Governments", "Academia"],
      observedZeekPattern: "conn.log rapid lateral RPC requests and SMB connection counts (>150/min) matching internal domain controllers",
      observedSuricataSids: ["SID: 2020291 (ET EXPLOIT WizardSpider Trickbot lateral SMB v1 payload)", "SID: 2038102 (ET TROJAN Ryuk Ransomware trigger sign)"],
      bio: "A highly structured financial-crime group deploying multi-stage malware chains (Trickbot -> BazarBackdoor -> Ryuk/Conti Ransomware). Security telemetry flags this group via active anomalous lateral movement detection from Isolation Forest (AI1) models."
    },
    {
      id: "Carbanak",
      name: "Carbanak Group (Anunak)",
      codename: "Carb-0104",
      origin: "Global Syndicate (Eastern Europe centric)",
      focus: "ATM Fraud, SWIFT Network Spoofing, Banking Injection",
      confidence: 91,
      lastActivity: "5 hours ago",
      linkedIncidentsCount: 7,
      severity: "HIGH",
      techniques: ["T1189 (Drive-by Compromise)", "T1071 (Web Protocols)", "T1437 (Application Window Manipulation)"],
      targetSectors: ["Retail Brokerages", "Banks", "Payment Systems Processing Centres"],
      observedZeekPattern: "http.log requests reflecting query parameter length anomalies and unexpected direct HTTP proxy-connect activities",
      observedSuricataSids: ["SID: 2011928 (ET MALWARE Carbanak Bank Injector Activity)", "SID: 2018485 (ET C2 Carbanak Outbound Port Sync check)"],
      bio: "Rife with specialized threat engineers, Carbanak focuses extensively on long-term stealth compromise inside targeted bank employee workstations to execute direct wire/cash outflow commands. Flagged by SVM matching on command and control traffic anomalies (AI2A)."
    }
  ]);

  // Comprehensive Indicators Matrix linking live Zeek context
  const [indicators, setIndicators] = useState<IOCIndicator[]>([
    {
      id: "IOC-1092",
      type: "IP",
      value: "185.220.101.45",
      source: "Zeek (conn.log)",
      mitreId: "T1071",
      mitreName: "Application Layer Protocols",
      confidence: 95,
      firstSeen: "2026-06-08 04:30:12",
      lastSeen: "2026-06-08 07:44:11",
      caseId: "CASE-492",
      riskScore: 94,
      enrichmentStatus: "Enriched"
    },
    {
      id: "IOC-1104",
      type: "Domain",
      value: "malicious-update-sync.com",
      source: "Zeek (http.log)",
      mitreId: "T1071",
      mitreName: "Web Protocols",
      confidence: 92,
      firstSeen: "2026-06-08 05:12:08",
      lastSeen: "2026-06-08 07:51:19",
      caseId: "CASE-312",
      riskScore: 89,
      enrichmentStatus: "Enriched"
    },
    {
      id: "IOC-1152",
      type: "URL",
      value: "/login?user=<script>alert(document.cookie);</script>",
      source: "Zeek (http.log)",
      mitreId: "T1190",
      mitreName: "Exploit Public-Facing App",
      confidence: 98,
      firstSeen: "2026-06-08 07:11:02",
      lastSeen: "2026-06-08 07:54:10",
      caseId: "CASE-802",
      riskScore: 97,
      enrichmentStatus: "Enriched"
    },
    {
      id: "IOC-1210",
      type: "Payload",
      value: "union select null, username, password from users--",
      source: "AI2B",
      mitreId: "T1190",
      mitreName: "SQLi Injection Vector",
      confidence: 90,
      firstSeen: "2026-06-08 06:14:24",
      lastSeen: "2026-06-08 07:32:05",
      caseId: "CASE-511",
      riskScore: 85,
      enrichmentStatus: "Enriched"
    },
    {
      id: "IOC-1304",
      type: "Suricata SID",
      value: "SID: 2018442 (FancyBear Outbound Beacon TLS matched)",
      source: "Suricata IDS",
      mitreId: "T1041",
      mitreName: "Exfiltration Over C2 Channel",
      confidence: 99,
      firstSeen: "2026-06-08 01:20:00",
      lastSeen: "2026-06-08 07:49:15",
      caseId: "CASE-492",
      riskScore: 98,
      enrichmentStatus: "Enriched"
    },
    {
      id: "IOC-1422",
      type: "IP",
      value: "80.248.21.194",
      source: "Zeek (conn.log)",
      mitreId: "T1046",
      mitreName: "Reconnaissance Port Scanning",
      confidence: 74,
      firstSeen: "2026-06-08 02:40:05",
      lastSeen: "2026-06-08 04:12:12",
      caseId: "CASE-104",
      riskScore: 62,
      enrichmentStatus: "Enriched"
    },
    {
      id: "IOC-1589",
      type: "Domain",
      value: "dropbox-sync-share-api.net",
      source: "Zeek (http.log)",
      mitreId: "T1567",
      mitreName: "Exfiltration Over Web Service",
      confidence: 42,
      firstSeen: "2026-06-08 07:34:11",
      lastSeen: "2026-06-08 07:35:12",
      caseId: "PENDING",
      riskScore: 48,
      enrichmentStatus: "Pending"
    }
  ]);

  // Interactive Live Threat Feed Items (Fitted with a rolling array in effect)
  const [threatFeed, setThreatFeed] = useState<ThreatFeedItem[]>([
    {
      id: "TF-9421",
      timestamp: "07:55:12",
      attackType: "HTTP Semantic Cross Site Scripting Injection",
      mitreId: "T1190",
      actorOverlap: "APT-28 Possible Overlap",
      iocMatch: "malicious-update-sync.com",
      confidence: 92,
      severity: "CRITICAL",
      logSource: "AI2B + http.log"
    },
    {
      id: "TF-9420",
      timestamp: "07:54:30",
      attackType: "Egress Data Burst Transfer",
      mitreId: "T1041",
      actorOverlap: "Lazarus Correlation Match",
      iocMatch: "185.220.101.45",
      confidence: 94,
      severity: "CRITICAL",
      logSource: "Zeek (conn.log) + AI1"
    },
    {
      id: "TF-9419",
      timestamp: "07:52:14",
      attackType: "Unusual Port Scan Mapping Activity",
      mitreId: "T1046",
      actorOverlap: "Unknown Attacker Fleet",
      iocMatch: "80.248.21.194",
      confidence: 81,
      severity: "MEDIUM",
      logSource: "Zeek (conn.log) + AI2A"
    },
    {
      id: "TF-9418",
      timestamp: "07:49:05",
      attackType: "Trickbot Latent SMB lateral beacon signature",
      mitreId: "T1021",
      actorOverlap: "Wizard Spider Signature Match",
      iocMatch: "SID: 2020291",
      confidence: 89,
      severity: "HIGH",
      logSource: "Suricata IDS + conn.log"
    }
  ]);

  // MITRE Heatmap Matrix Data Source (Linking AI and signature mapping coordinates)
  const tacticColumns = [
    { name: "Initial Access", key: "initial", items: [
      { id: "T1190", name: "Exploit Public-Facing App", detections: 42, score: 94, source: "AI2B (Web Model)", conf: 96, status: "covered" },
      { id: "T1566", name: "Phishing Ingress", detections: 19, score: 78, source: "Suricata + http.log", conf: 82, status: "covered" }
    ]},
    { name: "Execution", key: "exec", items: [
      { id: "T1059", name: "Command Scripting Shell", detections: 34, score: 85, source: "AI1 + AI2A Modules", conf: 91, status: "covered" },
      { id: "T1204", name: "User Executed File", detections: 4, score: 42, source: "Endpoint Link Mock", conf: 50, status: "partial" }
    ]},
    { name: "Persistence", key: "persist", items: [
      { id: "T1543", name: "Create System Service", detections: 12, score: 62, source: "Host Telemetry Broker", conf: 70, status: "partial" },
      { id: "T1136", name: "Create Local Account", detections: 0, score: 5, source: "Audit Daemon Sync", conf: 10, status: "gap" }
    ]},
    { name: "Privilege Escalation", key: "priv", items: [
      { id: "T1068", name: "Exploitation for Privs", detections: 15, score: 80, source: "FCS Fusion Correlator", conf: 88, status: "covered" }
    ]},
    { name: "Defense Evasion", key: "evade", items: [
      { id: "T1070", name: "Indicator Removal", detections: 2, score: 28, source: "Syslog Monitoring Feed", conf: 35, status: "gap" },
      { id: "T1027", name: "Obfuscated Files/Payloads", detections: 68, score: 91, source: "AI2B (XSS/SQLi Model)", conf: 94, status: "covered" }
    ]},
    { name: "Credential Access", key: "creds", items: [
      { id: "T1110", name: "Brute Force Credentials", detections: 112, score: 95, source: "Zeek (http.log) Model", conf: 98, status: "covered" }
    ]},
    { name: "Discovery", key: "discover", items: [
      { id: "T1046", name: "Network Service Scanning", detections: 218, score: 99, source: "AI2A XGBoost Model", conf: 99, status: "covered" },
      { id: "T1083", name: "File Directory Discovery", detections: 8, score: 60, source: "Lateral Engine Correlation", conf: 64, status: "partial" }
    ]},
    { name: "Lateral Movement", key: "lateral", items: [
      { id: "T1021", name: "Remote Services (SMB/RDP)", detections: 29, score: 87, source: "AI1 Isolation Forest", conf: 92, status: "covered" }
    ]},
    { name: "Command & Control", key: "c2", items: [
      { id: "T1071", name: "Web C2 Protocols (HTTP)", detections: 152, score: 97, source: "Zeek http.log + conn.log", conf: 98, status: "covered" },
      { id: "T1041", name: "Exfiltration Over Alternate Channel", detections: 14, score: 89, source: "FCS Byte Anomaly AI", conf: 94, status: "covered" }
    ]},
    { name: "Exfiltration", key: "exfil", items: [
      { id: "T1567", name: "Exfil to Cloud Web Drive", detections: 5, score: 55, source: "AI1 Volume Monitor", conf: 62, status: "partial" }
    ]},
    { name: "Impact", key: "impact", items: [
      { id: "T1486", name: "Data Encrypted (Ransomware)", detections: 4, score: 92, source: "IDS Endpoint Signals", conf: 94, status: "covered" }
    ]}
  ];

  // Threat Campaign Timeline (Advanced Multi-Stage Correlation)
  const campaignStages: CampaignStage[] = [
    {
      stage: "Stage 1: Reconnaissance",
      title: "Anomalous Port Sweep Campaign",
      timestamp: "07:11:04",
      logEvidence: "Zeek conn.log marked 42 incoming TCP connection tries spanning multi-port blocks within 1.5 seconds",
      indicator: "Attacker IP: 185.220.101.45 (Russia Origin)",
      mitreId: "T1046",
      status: "CORRELATED",
      signalSource: "AI2A XGBoost Classifier"
    },
    {
      stage: "Stage 2: Initial Access",
      title: "XSS Web Parameter Exploitation",
      timestamp: "07:18:22",
      logEvidence: "http.log request payload contains HTML payload '<script>alert(document.cookie)' on /login gateway",
      indicator: "malicious-update-sync.com (Linked C2 CNAME)",
      mitreId: "T1190",
      status: "DETECTED",
      signalSource: "AI2B Semantic model (98% match)"
    },
    {
      stage: "Stage 3: Privilege Escalation",
      title: "Exploiting Local System Vulnerability",
      timestamp: "07:22:45",
      logEvidence: "Elevated command shell launched from Apache daemon child thread",
      indicator: "CVE-2024-XX Kernel buffer exploit string",
      mitreId: "T1068",
      status: "ACTIVE",
      signalSource: "Fusion Layer Event Aggregator"
    },
    {
      stage: "Stage 4: C2 Communication",
      title: "Encrypted WebSocket Channel Heartbeat",
      timestamp: "07:31:00",
      logEvidence: "Outbound byte ratios and connection beacon intervals (skewed precisely to 30.2 second loop) detected",
      indicator: "185.220.101.45:443 (Outbound Tunnel)",
      mitreId: "T1071",
      status: "CORRELATED",
      signalSource: "AI1 Network Isolation Forest"
    },
    {
      stage: "Stage 5: Exfiltration",
      title: "Staged Database DB Backup Egress",
      timestamp: "07:44:11",
      logEvidence: "Egress transfer of 450MB of database compression data detected outside expected client schedules",
      indicator: "Outbound exfiltration transfer to web storage node",
      mitreId: "T1041",
      status: "MITIGATED",
      signalSource: "Suricata SID trigger + AIS Airwall drop"
    }
  ];

  // Pipeline enrichment steps layout data
  const enrichmentStages = [
    { id: "1", name: "Fusion Alert Ingestion", icon: Radio, latency: "0.2ms", val: "ACTIVE", status: "ok" },
    { id: "2", name: "IOC Regex Extractor", icon: SearchCode, latency: "1.1ms", val: "PARSERS LOADED", status: "ok" },
    { id: "3", name: "Threat Intel Feeds Sync", icon: Database, latency: "4.8ms", val: "4 FEEDS RESOLVING", status: "ok" },
    { id: "4", name: "MITRE Attack T1x Mapper", icon: Shield, latency: "0.8ms", val: "v14 DB COMPLIANT", status: "ok" },
    { id: "5", name: "Threat Actor Profiler", icon: User, latency: "2.1ms", val: "4 APT CODENAMES", status: "ok" },
    { id: "6", name: "Enrichment Synthesis", icon: Layers, latency: "1.4ms", val: "FUSION INTELLIGENT", status: "ok" }
  ];

  // Threat Feed sync sources
  const externalThreatFeeds = [
    { name: "OASIS TAXII / MISP Collective", syncRate: "Every 5 mins", indicatorsCount: 42109, syncStatus: "Synced 2 mins ago", health: "100%" },
    { name: "AbuseIPDB Global Blacklist", syncRate: "Real-time query", indicatorsCount: 182405, syncStatus: "Synced 1 min ago", health: "99.8%" },
    { name: "VirusTotal Live Sandbox Feeds", syncRate: "Every 1 min", indicatorsCount: 12409, syncStatus: "Synced 1 min ago", health: "100%" },
    { name: "Internal SOC Fusion Intelligence Hub", syncRate: "Continuous streaming", indicatorsCount: rdsAlertsCountForFeed(), syncStatus: "Live sync active", health: "100%" }
  ];

  function rdsAlertsCountForFeed() {
    return 1405 + ticks;
  }

  // Live simulation updates
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Insert novel events into simulated threat stream on ticking
  useEffect(() => {
    if (ticks === 0) return;

    // Trigger visual short synced flash state
    setSyncStatus("syncing");
    setTimeout(() => {
      setSyncStatus("synced");
      setSyncCount(c => c + 1);
    }, 600);

    // Random choice threat payload
    const attackerIps = ["185.220.101.45", "80.248.21.194", "192.168.12.45", "102.24.110.15"];
    const actors = ["APT-28 Possible Overlap", "Lazarus Correlation Match", "Wizard Spider Signature Match", "Carbanak Group Match", "Unknown Attacker Fleet"];
    const techniques = [
      { id: "T1190", name: "Exploit Public-Facing App", severity: "CRITICAL" as const, source: "AI2B + http.log" },
      { id: "T1071", name: "Web C2 Protocols (HTTP)", severity: "HIGH" as const, source: "Zeek (http.log)" },
      { id: "T1041", name: "Exfiltration Over C2 Channel", severity: "CRITICAL" as const, source: "AI1 + conn.log" },
      { id: "T1046", name: "Reconnaissance Scan Sweep", severity: "MEDIUM" as const, source: "AI2A + conn.log" }
    ];

    const chosenTech = techniques[Math.floor(Math.random() * techniques.length)];
    const chosenIp = attackerIps[Math.floor(Math.random() * attackerIps.length)];
    const chosenActor = actors[Math.floor(Math.random() * actors.length)];

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newFeedItem: ThreatFeedItem = {
      id: `TF-9${421 + ticks}`,
      timestamp: timeStr,
      attackType: chosenTech.name,
      mitreId: chosenTech.id,
      actorOverlap: chosenActor,
      iocMatch: chosenIp,
      confidence: Math.floor(75 + Math.random() * 24),
      severity: chosenTech.severity,
      logSource: chosenTech.source
    };

    setThreatFeed(prev => {
      const copy = [newFeedItem, ...prev];
      if (copy.length > 20) copy.pop();
      return copy;
    });

    // Also add to matching Indicators table if high risk
    if (newFeedItem.confidence > 85) {
      const newIoc: IOCIndicator = {
        id: `IOC-${1600 + ticks}`,
        type: Math.random() > 0.5 ? "IP" : "URL",
        value: chosenIp,
        source: newFeedItem.logSource.includes("http") ? "Zeek (http.log)" : "Zeek (conn.log)",
        mitreId: chosenTech.id,
        mitreName: chosenTech.name,
        confidence: newFeedItem.confidence,
        firstSeen: now.toISOString().split('T')[0] + " " + timeStr,
        lastSeen: now.toISOString().split('T')[0] + " " + timeStr,
        caseId: Math.random() > 0.4 ? `CASE-${700 + ticks}` : "PENDING",
        riskScore: Math.floor(70 + Math.random() * 28),
        enrichmentStatus: "Enriched"
      };

      setIndicators(prev => {
        const copy = [newIoc, ...prev];
        if (copy.length > 30) copy.pop();
        return copy;
      });
    }

  }, [ticks]);

  // Risk Score dynamic algorithm calculator matching active weights
  const activeActorProfile = useMemo(() => {
    return threatActors.find(a => a.id === selectedActor) || threatActors[0];
  }, [threatActors, selectedActor]);

  // Radar metrics representing APT group techniques coverage comparison
  const radarChartData = [
    { subject: "Initial Access (T1190)", "APT-28 (Fancy Bear)": 92, "Lazarus Group": 74, "Wizard Spider": 45 },
    { subject: "Command & Control (T1071)", "APT-28 (Fancy Bear)": 88, "Lazarus Group": 95, "Wizard Spider": 60 },
    { subject: "Lateral Movement (T1021)", "APT-28 (Fancy Bear)": 50, "Lazarus Group": 82, "Wizard Spider": 96 },
    { subject: "Execution (T1059)", "APT-28 (Fancy Bear)": 84, "Lazarus Group": 89, "Wizard Spider": 92 },
    { subject: "Exfiltration (T1041)", "APT-28 (Fancy Bear)": 90, "Lazarus Group": 98, "Wizard Spider": 35 },
    { subject: "Defense Evasion (T1027)", "APT-28 (Fancy Bear)": 78, "Lazarus Group": 91, "Wizard Spider": 80 }
  ];

  // SOC search function
  const handleIocSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigateInput.trim()) return;

    setIsInvestigating(true);
    setInvestigatedRecord(null);

    // Simulated 800ms API Enrichment Lookup Delay
    setTimeout(() => {
      const q = investigateInput.toLowerCase();
      // Probe internal records first
      const matched = indicators.find(i => i.value.toLowerCase().includes(q));

      if (matched) {
        setInvestigatedRecord({
          value: matched.value,
          type: matched.type,
          status: "ENRICHED SYNCED",
          riskScore: matched.riskScore,
          matchedTechnique: `${matched.mitreId} - ${matched.mitreName}`,
          firstSeen: matched.firstSeen,
          lastSeen: matched.lastSeen,
          mispConfidence: matched.confidence,
          reputation: matched.riskScore > 80 ? "MALICIOUS (High Threat)" : matched.riskScore > 50 ? "SUSPICIOUS (Gray Vector)" : "CLEAN NEUTRAL",
          virustotalHits: matched.riskScore > 80 ? "41 / 72 engines flagged" : "5 / 72 engines flagged",
          abuseIpConfidence: matched.riskScore > 80 ? "88%" : "12%",
          relatedActors: matched.riskScore > 80 ? "Fancy Bear (APT-28) / Lazarus overlaps" : "None identified",
          evidencePayload: matched.source
        });
      } else {
        // Generate dynamic mock record
        const derivedRisk = Math.floor(10 + Math.random() * 85);
        setInvestigatedRecord({
          value: investigateInput,
          type: investigateInput.includes(".") ? "Domain/IP" : "Unknown String/Hash",
          status: "ENRICHED REAL-TIME PIPELINE",
          riskScore: derivedRisk,
          matchedTechnique: derivedRisk > 60 ? "T1071 / T1190 Application protocols" : "T1204 User Interaction possible",
          firstSeen: "Just now",
          lastSeen: "Just now",
          mispConfidence: derivedRisk,
          reputation: derivedRisk > 75 ? "MALICIOUS FEED MATCH" : derivedRisk > 40 ? "SUSPICIOUS BEACON" : "STABLE UNRATED",
          virustotalHits: `${Math.floor(derivedRisk * 0.7)} / 72 scanners marked`,
          abuseIpConfidence: `${derivedRisk}%`,
          relatedActors: derivedRisk > 70 ? "Unassigned Russian language group" : "None identified",
          evidencePayload: "Query launched directly via SOC investigation panel"
        });
      }
      setIsInvestigating(false);
    }, 800);
  };

  const filteredActorsList = threatActors.filter(actor => {
    const q = actorSearch.toLowerCase();
    return actor.name.toLowerCase().includes(q) || 
           actor.origin.toLowerCase().includes(q) || 
           actor.focus.toLowerCase().includes(q) ||
           actor.techniques.some(t => t.toLowerCase().includes(q));
  });

  const filteredIocsList = indicators.filter(ioc => {
    const q = iocSearch.toLowerCase();
    return ioc.value.toLowerCase().includes(q) || 
           ioc.source.toLowerCase().includes(q) || 
           ioc.mitreId.toLowerCase().includes(q) || 
           ioc.mitreName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-foreground select-none" id="threat-intel-center">
      
      {/* HEADER SECTION WITH SIMULATION CONTROL STRIP */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-border/20 pb-4 gap-4" id="intel-header-section">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 rounded border border-purple-500/30">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-foreground">
              THREAT INTELLIGENCE PORTAL
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Global Cyber Threat Indicators, MITRE Technique Mapping, and Multi-Model Enrichment Feeds
          </p>
        </div>

        {/* FEED SYNC TACTICS */}
        <div className="flex items-center gap-2.5 bg-secondary/15 p-2 rounded-xl border border-border/30" id="intel-live-indicators-strip">
          <div className="flex items-center gap-1.5 border-r border-border/30 pr-3">
            <span className="text-[9px] font-mono text-muted-foreground uppercase font-black">Simulation:</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded transition-all ${
                isPlaying 
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20' 
                  : 'bg-emerald-550/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
              }`}
              title={isPlaying ? "Pause Intel Events Roll" : "Resume Intel Events Roll"}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-purple-400 animate-ping' : 'bg-purple-500 animate-pulse'}`} />
            <span className="text-[8.5px] uppercase font-bold text-purple-400">
              {syncStatus === 'syncing' ? 'Syncing Indicators...' : 'Feeds Live Link'}
            </span>
            <span className="text-[8.5px] text-muted-foreground">
              ({syncCount} updates synced)
            </span>
          </div>
        </div>
      </div>

      {/* TOP SOC KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6" id="top-kpi-intel-section">
        <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Active Threat Actors Tracked */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-purple-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">APT Groups Tracked</span>
              <span className="text-[7.5px] bg-purple-500/10 text-purple-400 border border-purple-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono font-bold">continuous</span>
            </div>
            <div className="my-2.5">
              <span className="text-xl font-black tracking-tight font-mono text-purple-400">
                {threatActors.length} <span className="text-xs text-muted-foreground">Active Profiles</span>
              </span>
              <span className="text-[7.5px] text-emerald-400 block mt-0.5 font-bold font-mono">
                ▲ 4 Threat Campaigns Overlapping
              </span>
            </div>
            <div className="h-6 flex items-end">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatFeed.slice(-10)}>
                  <Area type="monotone" dataKey="confidence" stroke="#c084fc" fill="#c084fc" fillOpacity={0.1} strokeWidth={1} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* IOC Matches (24H) */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-purple-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">24H IOC Matches</span>
              <span className="text-[7.5px] bg-[#10b981]/15 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">matched & linked</span>
            </div>
            <div className="my-2">
              <div className="text-sm font-mono font-black text-foreground">
                {indicators.length} Indicators Matched
              </div>
              <div className="text-[8px] text-muted-foreground font-mono mt-0.5">
                IP: {indicators.filter(i => i.type === 'IP').length} | Domain: {indicators.filter(i => i.type === 'Domain').length} | URL/Payload: {indicators.filter(i => i.type === 'Payload' || i.type === 'URL').length}
              </div>
              <div className="text-[8px] text-cyan-400 font-bold font-mono mt-1">
                Flipped Alerts Enriched: 100% Core Success
              </div>
            </div>
          </div>

          {/* MITRE Technique Coverage */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-purple-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">MITRE Technique Mapping</span>
              <span className="text-[7.5px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">coverage</span>
            </div>
            <div className="my-2">
              <div className="text-sm font-mono font-black text-cyan-400">
                83.5% Coverage
              </div>
              <div className="text-[8px] text-muted-foreground font-mono">
                Mapped Techniques: 14 Techniques Verified
              </div>
              <div className="text-[8px] text-slate-500 font-mono mt-0.5">
                Feeds Synchronized: v14 ATT&CK Layer
              </div>
            </div>
            <div className="w-full bg-secondary/30 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: "83.5%" }} />
            </div>
          </div>

          {/* High Confidence Intel Alerts */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-purple-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">HIGH CONFIDENCE LABELS</span>
              <span className="text-[7.5px] bg-red-500/10 text-red-400 border border-red-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">&gt;85% MATCH</span>
            </div>
            <div className="my-2">
              <div className="text-xl font-mono font-black text-foreground">
                {indicators.filter(i => i.confidence > 85).length} <span className="text-xs text-muted-foreground">IOCs High Confidence</span>
              </div>
              <div className="text-[8px] text-yellow-500 font-bold font-mono">
                Alert sources verified by AI1 + AI2B + Suricata
              </div>
            </div>
          </div>

          {/* Threat Campaigns Detected */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-purple-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">Threat Chain Campaigns</span>
              <span className="text-[7.5px] bg-purple-500/10 text-purple-400 border border-purple-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono font-mono">multi-stage</span>
            </div>
            <div className="my-2 flex items-center gap-3">
              <div className="text-sm font-mono font-black text-purple-400 leading-tight">
                1 ACTIVE <div className="text-[8px] text-muted-foreground font-normal">Exploitation chain tracking</div>
              </div>
              <div className="text-[7px] text-muted-foreground font-mono leading-tight">
                Zeek conn.log scan (T1046) → http.log inject (T1190) → AI anomaly beacon (T1071)
              </div>
            </div>
          </div>

          {/* External Feed Sync Status */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between hover:border-purple-500/20 transition-all select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-muted-foreground font-mono">TI TAXII SYNC</span>
              <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase font-black font-mono">ONLINE</span>
            </div>
            <div className="my-1.5 text-[8px] font-mono leading-normal">
              <div className="flex justify-between border-b border-border/15 pb-0.5">
                <span>MISP sync:</span>
                <span className="text-emerald-400 font-bold">OK (100%)</span>
              </div>
              <div className="flex justify-between border-b border-border/15 pb-0.5">
                <span>AbuseIPDB loop:</span>
                <span className="text-emerald-400 font-bold">OK (Realtime)</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>VirusTotal API:</span>
                <span className="text-emerald-400 font-bold">OK (Nominal)</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE LARGE STATUS CARD */}
        <div className="lg:col-span-4 bg-gradient-to-b from-card to-background border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] font-mono">INTEL PIPELINE ENGINE</h3>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded text-[7.5px] font-black font-mono uppercase">
                ACTIVE & INTEGRATED
              </span>
            </div>

            <div className="py-4 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">Enrichment Engine</span>
                <span className="text-[8px] font-black text-emerald-400 uppercase">ACTIVE TRACING</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">Correlation Engine</span>
                <span className="text-[8px] font-black text-emerald-400 uppercase">ACTIVE STREAMING</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">Feed TAXII Parser</span>
                <span className="text-[8px] font-black text-emerald-400 uppercase">SYNC LOCK READY</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                <span className="text-[8.5px] text-muted-foreground uppercase">MITRE ATT&CK Mapper</span>
                <span className="text-[8px] font-black text-emerald-400 uppercase">v14 MATCH COMPLETE</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/10 flex items-center justify-between">
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase font-bold">
              AI-Enrichment v3.0 SOC Architecture
            </span>
            <CheckCircle2 size={12} className="text-purple-400" />
          </div>
        </div>
      </div>

      {/* QUICK INVESTIGATION BAR */}
      <div className="bg-gradient-to-r from-purple-950/20 via-background to-transparent border border-purple-500/20 rounded-xl p-4" id="investigation-bar-container">
        <form onSubmit={handleIocSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1 text-purple-400 animate-pulse mt-0.5">
              <SearchCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-purple-400 font-mono">IOC ENRICHMENT & INVESTIGATION CORRELATION</h3>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Provide any Indicator value (IP, domain, payload string) to instantly trace the Fusion database, trigger VirusTotal Sandbox, evaluate risk parameters and match APT TTP alignments.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text"
                placeholder="185.220.101.45"
                value={investigateInput}
                onChange={(e) => setInvestigateInput(e.target.value)}
                className="bg-card border border-border rounded-lg text-[9.5px] px-3 py-1.5 w-60 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              {investigateInput && (
                <button 
                  type="button" 
                  onClick={() => setInvestigateInput("")} 
                  className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground"
                >
                  <X size={11} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isInvestigating}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-400 font-mono font-bold text-[9.5px] uppercase rounded-lg transition-all flex items-center gap-1"
            >
              {isInvestigating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Tracing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  ENRICH IND
                </>
              )}
            </button>
          </div>
        </form>

        {/* Investigate Result Area */}
        <AnimatePresence>
          {investigatedRecord && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 border-t border-border/20 pt-3"
            >
              <div className="bg-secondary/15 rounded-lg border border-purple-500/10 p-3 relative">
                <button 
                  onClick={() => setInvestigatedRecord(null)}
                  className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/25 rounded"
                >
                  <X size={12} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-[9px]">
                  
                  <div>
                    <div className="text-muted-foreground uppercase text-[8px]">Enriched Indicator</div>
                    <div className="text-purple-400 font-extrabold text-[11px] truncate mt-0.5">{investigatedRecord.value}</div>
                    
                    <div className="text-muted-foreground uppercase text-[8px] mt-2.5">Indicator Class</div>
                    <div className="text-foreground font-bold mt-0.5">{investigatedRecord.type}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground uppercase text-[8px]">Risk Rating</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${investigatedRecord.riskScore > 80 ? 'bg-red-500' : investigatedRecord.riskScore > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                      <span className="font-extrabold text-foreground">{investigatedRecord.riskScore} / 100</span>
                    </div>

                    <div className="text-muted-foreground uppercase text-[8px] mt-2.5">Enrichment Reputation</div>
                    <div className="text-foreground font-semibold mt-0.5">{investigatedRecord.reputation}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground uppercase text-[8px]">VirusTotal Engines</div>
                    <div className="text-foreground mt-0.5">{investigatedRecord.virustotalHits}</div>

                    <div className="text-muted-foreground uppercase text-[8px] mt-2.5">AbuseIPDB Conf</div>
                    <div className="text-foreground mt-0.5">{investigatedRecord.abuseIpConfidence}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground uppercase text-[8px]">Technique Link</div>
                    <div className="text-foreground font-semibold mt-0.5">{investigatedRecord.matchedTechnique}</div>

                    <div className="text-muted-foreground uppercase text-[8px] mt-2.5">Related Actor Overlaps</div>
                    <div className="text-purple-400 font-semibold mt-0.5">{investigatedRecord.relatedActors}</div>
                  </div>

                </div>

                <div className="mt-2 text-[8px] font-mono text-slate-500">
                  Evidence Context: {investigatedRecord.evidencePayload} | Synced matching TAXII MISP collective indicators
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CORE CONTROL CARDS TABS */}
      <div className="flex border-b border-border/20 gap-1 overflow-x-auto pb-px" id="intel-navigation-tabs">
        {(["actors", "iocs", "mitre", "campaigns", "pipeline"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab 
                ? "bg-purple-500/5 text-purple-400 border-purple-500" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "actors" ? "Threat Actors (APTs)" :
             tab === "iocs" ? "IOC Correlation Table" :
             tab === "mitre" ? "MITRE ATT&CK Heatmap" :
             tab === "campaigns" ? "Campaign Timelines" :
             "Enrichment Pipeline"}
          </button>
        ))}
      </div>

      {/* RENDER CONTENT BASED ON ACTIVE TAB */}
      <div className="min-h-[400px]" id="intel-tab-content-render">

        {/* TAB 1: THREAT ACTOR PROFILE INTELLIGENCE */}
        {activeTab === "actors" && (
          <div className="space-y-6" id="threat-actor-ops-tab">
            
            {/* GRID OF PROFILE SEARCH AND ACTOR TI SELECTOR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* ACTORS LIST */}
              <div className="lg:col-span-4 bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                    <input 
                      type="text"
                      placeholder="Search Fancy Bear, Lazarus, origin..."
                      value={actorSearch}
                      onChange={(e) => setActorSearch(e.target.value)}
                      className="bg-background border border-border rounded-lg text-[9px] pl-8 pr-3 py-1.5 w-full text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {filteredActorsList.map(actor => (
                      <div
                        key={actor.id}
                        onClick={() => setSelectedActor(actor.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                          selectedActor === actor.id 
                            ? "bg-purple-500/10 border-purple-500/50" 
                            : "bg-secondary/10 border-border hover:border-purple-500/20"
                        }`}
                      >
                        <div>
                          <div className="text-[10px] font-black text-foreground">{actor.name}</div>
                          <div className="text-[8px] text-muted-foreground font-mono mt-0.5">{actor.origin}</div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className={`px-1.5 py-0.2 rounded text-[7px] font-black ${
                            actor.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {actor.severity}
                          </span>
                          <span className="text-[7.5px] text-muted-foreground font-mono mt-1">{actor.lastActivity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/20 text-[8px] font-mono text-muted-foreground">
                  Showing {filteredActorsList.length} threat groups | Monitored by Fusion FCAJ rules
                </div>
              </div>

              {/* RADOR CHART COMPARISON */}
              <div className="lg:col-span-8 bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-[9.5px] font-black uppercase text-foreground tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    APT Group TTP Overlap Matrix
                  </h3>
                  <p className="text-[9px] text-muted-foreground leading-normal mb-3">
                    Comparative analyzer indicating normalized indicator similarity across main critical MITRE techniques mapped on the AI processing channels.
                  </p>
                </div>

                <div className="h-[240px] flex items-center justify-center font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 8 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 7 }} />
                      <Radar name="Fancy Bear (APT-28)" dataKey="APT-28 (Fancy Bear)" stroke="#c084fc" fill="#c084fc" fillOpacity={0.25} />
                      <Radar name="Lazarus Group" dataKey="Lazarus Group" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                      <Radar name="Wizard Spider" dataKey="Wizard Spider" stroke="#eab308" fill="#eab308" fillOpacity={0.10} />
                      <Legend wrapperStyle={{ fontSize: 8, fontFamily: "monospace" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* EXPANDED PROFILE CARD DETAILS FOR SELECTED ACTOR */}
            <div className="bg-gradient-to-b from-card to-background border border-border rounded-xl p-4">
              <div className="flex flex-col md:flex-row items-start justify-between border-b border-border/20 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20 text-purple-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-foreground uppercase tracking-widest leading-none">
                      {activeActorProfile.name}
                    </h2>
                    <span className="text-[8.5px] font-mono text-muted-foreground mt-1.5 block">
                      Codename reference: <span className="text-purple-400 font-bold">{activeActorProfile.codename}</span> | Origin: {activeActorProfile.origin}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-mono text-[9px]">
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[8px] uppercase">MISP Confidence</span>
                    <strong className="text-emerald-400">{activeActorProfile.confidence}% Match</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[8px] uppercase">Severity Rank</span>
                    <strong className={activeActorProfile.severity === "CRITICAL" ? "text-red-400" : "text-amber-500"}>
                      {activeActorProfile.severity}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 font-mono text-[9px] leading-relaxed">
                
                {/* Profile Bio */}
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <span className="text-purple-400 font-bold uppercase tracking-wider block text-[8px] mb-1">Syndicate Synopsis</span>
                    <p className="text-muted-foreground text-[8.5px]">{activeActorProfile.bio}</p>
                  </div>
                  <div>
                    <span className="text-purple-400 font-bold uppercase tracking-wider block text-[8px] mb-1 font-bold">Targeted Industries</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeActorProfile.targetSectors.map((sector, i) => (
                        <span key={i} className="bg-secondary/40 border border-slate-700/50 px-2 py-0.5 rounded text-[7.5px] text-foreground">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MITRE Techniques Coverage */}
                <div className="space-y-4">
                  <div>
                    <span className="text-purple-300 font-bold uppercase tracking-wider block text-[8px] mb-1">Aligned MITRE ATT&CK Techniques</span>
                    <div className="space-y-1.5 mt-2">
                      {activeActorProfile.techniques.map((tech, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-background p-1.5 rounded border border-border/10">
                          <Tag size={10} className="text-purple-400 shrink-0" />
                          <span className="text-[8px] font-semibold text-foreground">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamic Telemetry Alignment */}
                <div className="space-y-4">
                  <div>
                    <span className="text-purple-300 font-bold uppercase tracking-wider block text-[8px] mb-1">Observed Telemetry Patterns (Zeek)</span>
                    <div className="bg-background/40 p-2.5 rounded border border-border/20 text-[8.5px] text-slate-300">
                      {activeActorProfile.observedZeekPattern}
                    </div>
                  </div>

                  <div>
                    <span className="text-purple-300 font-bold uppercase tracking-wider block text-[8px] mb-1">Linked Suricata SIDs</span>
                    <div className="space-y-1 mt-1">
                      {activeActorProfile.observedSuricataSids.map((sid, i) => (
                        <div key={i} className="text-[8px] font-bold text-yellow-500/80 hover:text-yellow-400 flex items-center gap-1">
                          <Link2 size={9} />
                          {sid}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: IOC CORRELATION MATRIX ENGINE */}
        {activeTab === "iocs" && (
          <div className="space-y-4" id="ioc-matrix-tab">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-[9.5px] font-black uppercase text-foreground tracking-wider font-mono">
                    ACTIVE IOC INDICATOR COMPENDIUM
                  </h3>
                  <p className="text-[9px] text-muted-foreground leading-normal mt-0.5">
                    Real-time network, transport, and application layer indicators parsed from http.log, conn.log, and Suricata alert arrays.
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Filter by IP, domain, Source..."
                    value={iocSearch}
                    onChange={(e) => setIocSearch(e.target.value)}
                    className="bg-background border border-border rounded-lg text-[9.5px] pl-8 pr-3 py-1.5 w-60 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Indicators Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[9px] border-collapse">
                  <thead>
                    <tr className="bg-secondary/20 text-muted-foreground uppercase border-b border-border/25">
                      <th className="py-2.5 px-3">Indicator Class</th>
                      <th className="py-2.5 px-3">Observed Value</th>
                      <th className="py-2.5 px-3">Telemetry Source</th>
                      <th className="py-2.5 px-3">MITRE Technique</th>
                      <th className="py-2.5 px-3 text-center">Confidence</th>
                      <th className="py-2.5 px-3 text-center">Risk Score</th>
                      <th className="py-2.5 px-3">Enrichment Status</th>
                      <th className="py-2.5 px-3">First Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIocsList.map(ioc => (
                      <tr key={ioc.id} className="border-b border-border/10 hover:bg-secondary/15 transition-all">
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded font-black text-[8px] uppercase ${
                            ioc.type === 'IP' ? 'bg-cyan-500/10 text-cyan-400' :
                            ioc.type === 'Domain' ? 'bg-indigo-500/10 text-indigo-400' :
                            ioc.type === 'URL' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {ioc.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-foreground font-semibold max-w-[180px] truncate">{ioc.value}</td>
                        <td className="py-2 px-3 text-slate-400">{ioc.source}</td>
                        <td className="py-2 px-3 text-foreground font-bold">
                          {ioc.mitreId} - <span className="text-slate-400 font-normal">{ioc.mitreName}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-400">{ioc.confidence}%</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`font-black ${ioc.riskScore > 80 ? 'text-red-400' : ioc.riskScore > 50 ? 'text-yellow-500' : 'text-emerald-400'}`}>
                            {ioc.riskScore}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.2 rounded text-[7.5px] uppercase font-black ${
                            ioc.enrichmentStatus === 'Enriched' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {ioc.enrichmentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[8px]">{ioc.firstSeen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MITRE ATT&CK HEATMAP */}
        {activeTab === "mitre" && (
          <div className="space-y-4 font-mono" id="mitre-attck-tab">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="border-b border-border/20 pb-3 mb-4">
                <h3 className="text-[10px] font-black uppercase text-foreground tracking-[0.1em]">
                  INTELLIGENCE-DRIVEN MITRE ATT&CK TARGET MATRIX
                </h3>
                <p className="text-[8.5px] text-muted-foreground leading-normal mt-0.5">
                  Dynamic monitoring view displaying correlated techniques from Suricata signatures (Signature Engine), AI2A (Network Classifier XGBoost), and AI2B (Semantic Parser).
                </p>
              </div>

              {/* MATRIX HEATMAP CHANNELS */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-2.5 items-stretch overflow-x-auto py-1">
                {tacticColumns.map(tactic => (
                  <div key={tactic.key} className="flex flex-col border border-border/20 rounded-lg p-1.5 bg-secondary/15 min-w-[110px] shadow-sm select-none">
                    <div className="text-[7.5px] font-black text-muted-foreground uppercase pb-1 mb-2 border-b border-border/10 truncate font-bold text-center" title={tactic.name}>
                      {tactic.name}
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                      {tactic.items.map(tech => (
                        <div 
                          key={tech.id}
                          className={`p-1.5 rounded-md border flex flex-col justify-between text-left transition-all ${
                            tech.status === 'covered' && tech.detections > 30 
                              ? "bg-red-550/15 border-red-500/40 text-red-400" 
                              : tech.status === 'covered' 
                              ? "bg-purple-950/20 border-purple-500/30 text-purple-300"
                              : tech.status === 'partial' 
                              ? "bg-amber-950/20 border-amber-500/25 text-amber-400" 
                              : "bg-[#090d16] border-slate-800/40 opacity-40 text-slate-500"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[7.5px] font-bold">
                            <span>{tech.id}</span>
                            {tech.detections > 0 && <span className="text-[7px] bg-black/35 px-1 py-0.1 rounded">{tech.detections}x</span>}
                          </div>

                          <div className="text-[7px] leading-tight mt-1 font-semibold truncate hover:text-wrap" title={tech.name}>
                            {tech.name}
                          </div>

                          {tech.detections > 0 && (
                            <div className="border-t border-border/5 pt-1 mt-1.5 text-[6px] text-slate-400 leading-none">
                              {tech.source}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* MATRIX LEGEND KEYS */}
              <div className="mt-4 pt-3 border-t border-border/25 flex flex-wrap gap-4 text-[8px] text-muted-foreground uppercase justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-red-950/50 border border-red-500/40 rounded" />
                    <span>Highly Exploited (&gt;30 queries)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-purple-950/40 border border-purple-500/30 rounded" />
                    <span>Covered Technique (Continuous AI monitoring)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-amber-950/40 border border-amber-500/20 rounded" />
                    <span>Partial Detection Scope</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <div className="w-2.5 h-2.5 bg-[#090d16] border border-slate-800 rounded opacity-40" />
                    <span>Intelligence Gap</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-cyan-400">
                  <Info size={11} />
                  <span>Interactive: Mapped strictly under FCAJ pipeline taxonomy rules v3.0</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: THREAT CAMPAIGN TIMELINE */}
        {activeTab === "campaigns" && (
          <div className="space-y-4 font-mono" id="threat-campaigns-tab">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="border-b border-border/20 pb-3 mb-4">
                <h3 className="text-[10px] font-black uppercase text-foreground tracking-[0.1em]">
                  MULTI-STAGE INTERCEPTED THREAT CAMPAIGN: &quot;WEB EXPLOITATION CHAIN&quot;
                </h3>
                <p className="text-[8.5px] text-muted-foreground leading-normal mt-0.5">
                  Fusion analysis correlation engine tracing dynamic progression across separate timeline segments linked in Zeek Logs.
                </p>
              </div>

              {/* TIMELINE VISUAL STAGE SEQUENCE */}
              <div className="space-y-4 select-none relative pb-6">
                
                {/* Vertical trace pipe */}
                <div className="absolute left-[13px] top-[14px] bottom-6 w-[1.5px] bg-gradient-to-b from-cyan-500 via-purple-500 to-red-500/40 pointer-events-none" />

                {campaignStages.map((stage, i) => (
                  <div key={i} className="flex gap-4 items-start relative z-10">
                    
                    {/* Circle Node Indicator */}
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${
                      stage.status === 'MITIGATED' 
                        ? 'bg-emerald-550/15 border-emerald-500 text-emerald-400 font-extrabold' 
                        : stage.status === 'ACTIVE' 
                        ? 'bg-red-550/10 border-red-500 text-red-500 animate-pulse' 
                        : 'bg-indigo-950/20 border-indigo-500 text-indigo-400'
                    }`}>
                      <span className="text-[8.5px] font-bold font-mono">{i + 1}</span>
                    </div>

                    {/* Content segment */}
                    <div className="flex-1 bg-secondary/15 rounded-lg border border-border/20 p-3 flex flex-col md:flex-row items-start justify-between gap-3 hover:border-purple-500/10 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-black text-foreground uppercase">{stage.stage}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-[9px] text-[#c084fc] font-bold font-mono">{stage.title}</span>
                        </div>

                        <p className="text-[8.5px] text-slate-300 mt-1">{stage.logEvidence}</p>
                        
                        <div className="text-[8px] text-slate-500 pt-1 flex items-center gap-1">
                          <Tag size={9} />
                          Indicator matched: <strong className="text-foreground">{stage.indicator}</strong>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end shrink-0 gap-1.5 font-mono text-[7.5px]">
                        <span className="text-slate-500 font-bold">{stage.timestamp} UTC</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-cyan-400 uppercase font-black tracking-widest">{stage.signalSource}</span>
                          <span className="text-slate-400">/</span>
                          <span className={`px-1.5 py-0.2 rounded font-black font-mono text-[7px] ${
                            stage.status === 'MITIGATED' ? 'bg-emerald-500/10 text-emerald-400' :
                            stage.status === 'ACTIVE' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                            'bg-indigo-500/10 text-indigo-400 font-bold'
                          }`}>
                            {stage.status}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: INTEL ENRICHMENT PIPELINE VISUALIZATION */}
        {activeTab === "pipeline" && (
          <div className="space-y-6 font-mono" id="enrichment-pipeline-tab">
            <div className="bg-card border border-border rounded-xl p-4 select-none">
              <div className="border-b border-border/25 pb-3 mb-4">
                <h3 className="text-[9.5px] font-black uppercase text-foreground tracking-wider">
                  REAL-TIME INTELLIGENCE SYNTHESIS & ENRICHMENT PIPELINE
                </h3>
                <p className="text-[9px] text-muted-foreground leading-normal mt-0.5">
                  Tracing telemetry processing latency and matching taxonomy benchmarks on the automated enrichment conduits inside v3.0 SOC core.
                </p>
              </div>

              {/* FLOW DIAGRAM BAR */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-stretch relative">
                {enrichmentStages.map((stage, idx) => (
                  <div key={idx} className="bg-secondary/15 rounded-xl border border-border/20 p-3 flex flex-col justify-between hover:border-purple-500/20 transition-all relative">
                    
                    {/* Connection arrow for desktop */}
                    {idx < 5 && (
                      <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-muted-foreground/35">
                        <ArrowRight size={13} className="text-purple-500/50" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[7.5px] uppercase font-bold text-slate-500">Step 0{stage.id}</span>
                        <stage.icon className="w-3.5 h-3.5 text-purple-400" />
                      </div>

                      <h4 className="text-[8px] font-extrabold text-foreground uppercase tracking-widest leading-snug">
                        {stage.name}
                      </h4>
                      <p className="text-[7px] text-slate-400 mt-1 uppercase font-semibold">{stage.val}</p>
                    </div>

                    <div className="pt-2 border-t border-border/5 mt-4 flex items-center justify-between text-[6.5px]">
                      <span className="text-slate-500 font-bold">LAG:</span>
                      <strong className="text-cyan-400">{stage.latency}</strong>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* DYNAMIC RISK WEIGHTING SCORING INTERFACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none" id="finops-cost-risk-tier">
              
              {/* Dynamic weighting panel */}
              <div className="lg:col-span-6 bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-[9.5px] font-black text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    DYNAMIC INTEL RISK-SCORING MATRIX CONTROL
                  </h3>
                  <p className="text-[8.5px] text-muted-foreground leading-normal mb-4">
                    Modify parameters to calibrate how indicators evaluate risk indices dynamically in the platform in real-time.
                  </p>

                  <div className="space-y-4 font-mono text-[9px]">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-300">
                        <span>IOC Confidence Indicator:</span>
                        <strong className="text-purple-400">{weightConfidence.toFixed(1)}x</strong>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={weightConfidence}
                        onChange={(e) => setWeightConfidence(parseFloat(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer h-1 bg-secondary rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-300">
                        <span>MITRE Severity Level:</span>
                        <strong className="text-cyan-400">{weightSeverity.toFixed(1)}x</strong>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={weightSeverity}
                        onChange={(e) => setWeightSeverity(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer h-1 bg-secondary rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-300">
                        <span>Actor Reputation Score:</span>
                        <strong className="text-yellow-500">{weightActorRep.toFixed(1)}x</strong>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={weightActorRep}
                        onChange={(e) => setWeightActorRep(parseFloat(e.target.value))}
                        className="w-full accent-yellow-500 cursor-pointer h-1 bg-secondary rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/10 text-[8px] font-mono text-slate-500">
                  Intel Risk index calibrated on weights: ({weightConfidence.toFixed(1)} * Conf) + ({weightSeverity.toFixed(1)} * Severity) + ({weightActorRep.toFixed(1)} * Rep)
                </div>
              </div>

              {/* Threat intelligence feeds listing */}
              <div className="lg:col-span-6 bg-card border border-border rounded-xl p-4">
                <div className="border-b border-border/20 pb-2 mb-3">
                  <h3 className="text-[10px] font-black uppercase text-foreground tracking-wider font-mono flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-purple-400" />
                    EXTERNAL THREAT FEEDS (LIVE PARSED)
                  </h3>
                </div>

                <div className="space-y-2.5 font-mono text-[9px]">
                  {externalThreatFeeds.map((feed, idx) => (
                    <div key={idx} className="bg-secondary/15 rounded-lg border border-border/10 p-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-foreground">{feed.name}</div>
                        <div className="text-[7.5px] text-muted-foreground mt-0.5">
                          Frequency: {feed.syncRate} | Indicators Tracked: <strong className="text-purple-400">{feed.indicatorsCount.toLocaleString()}</strong>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[7.5px] text-emerald-400 block font-bold uppercase">{feed.syncStatus}</span>
                        <span className="text-[7px] text-slate-500 font-medium">Health: {feed.health}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* THREAT FEED (REAL-TIME LIVE ENRICHED INTEL STREAM) */}
      <div className="bg-card border border-border rounded-xl p-4 select-none" id="threat-feed-monitoring-panel">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/15 pb-3 mb-4 gap-3">
          <div>
            <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.12em] flex items-center gap-1.5 font-mono">
              <Terminal className="w-4 h-4 text-purple-400 animate-pulse" />
              THREAT INTELLIGENCE LIVE ENRICHED LOG STREAM
            </h2>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              Live streaming updates from Fusion Layer enriched with threat intelligence matches and MITRE technique codes.
            </p>
          </div>
          <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-black uppercase animate-pulse">
            TELEMETRY STREAM INJECTING
          </span>
        </div>

        {/* Scroll Box */}
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-1.5 p-1">
          {threatFeed.map((item, idx) => (
            <div 
              key={item.id} 
              className={`p-2 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors ${
                item.severity === 'CRITICAL' 
                  ? 'bg-red-500/5 border-red-500/20 hover:bg-red-550/10' 
                  : item.severity === 'HIGH' 
                  ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-550/10' 
                  : 'bg-secondary/15 border-border/25 hover:bg-secondary/25'
              }`}
            >
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 text-[8px]">{item.timestamp}</span>
                <span className={`px-1.5 py-0.1 rounded text-[7.5px] font-black ${
                  item.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                  item.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {item.severity}
                </span>

                <span className="text-foreground font-extrabold">{item.attackType}</span>
                <span className="text-slate-400 text-[8px] bg-secondary px-1.5 py-0.1 rounded font-black border border-border/20">
                  MITRE ID: {item.mitreId}
                </span>
                
                {item.actorOverlap !== "Unknown Attacker Fleet" && (
                  <span className="text-purple-400 font-extrabold flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.1 rounded text-[8px] border border-purple-500/10">
                    <User size={8} />
                    {item.actorOverlap}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <span className="text-muted-foreground text-[8px]">
                  IOC Match: <strong className="text-foreground font-semibold">{item.iocMatch}</strong>
                </span>

                <span className="text-slate-500 text-[8px]">
                  Source: {item.logSource}
                </span>

                <span className="text-emerald-400 font-extrabold block text-right w-12 shrink-0">
                  {item.confidence}% Match
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
