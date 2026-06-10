import { ThreatActor, IOC, ThreatFeed, ThreatKnowledgeArticle, IntelCorrelation } from "./types";

export const MOCK_THREAT_ACTORS: ThreatActor[] = [
  {
    id: "apt28",
    name: "APT28",
    aliases: ["Fancy Bear", "Sofacy", "Pawn Storm"],
    origin: "Russia (State-Sponsored)",
    motivation: "Cyber-Espionage & Geopolitical Influence",
    riskLevel: "Critical",
    industries: ["Government", "Defense", "Energy", "Media", "NATO Entities"],
    techniques: ["T1190 (Exploit Public-Facing Application)", "T1566 (Phishing)", "T1071 (Application Layer Protocols)", "T1041 (Exfiltration Over C2)"],
    lastSeen: "2026-06-09 23:44 UTC",
    bio: "APT28 is a highly sophisticated state-sponsored threat group operating since at least 2004. Known for targeted cyber-espionage operations, they utilize zero-day vulnerabilities, custom backdoors, and credential harvesting campaigns targeting strategic defense and geopolitical targets."
  },
  {
    id: "lazarus",
    name: "Lazarus Group",
    aliases: ["Hidden Cobra", "ZINC", "Guardians of Peace"],
    origin: "North Korea (State-Sponsored)",
    motivation: "Financial Extrication & Crypto Theft",
    riskLevel: "Critical",
    industries: ["Finance", "Cryptocurrency Exchanges", "Media", "Aerospace"],
    techniques: ["T1566 (Phishing)", "T1567 (Exfiltration Over Web Service)", "T1486 (Data Encrypted for Impact)", "T1059 (Command and Scripting Interpreter)"],
    lastSeen: "2026-06-10 01:12 UTC",
    bio: "Active since at least 2009, this cyber syndicate leverages high structural agility. They are famous for the 2014 Sony Pictures hack, the 2017 WannaCry ransomware attack, and widespread global cryptocurrency heist operations leveraging customized remote access trojans."
  },
  {
    id: "wizard_spider",
    name: "Wizard Spider",
    aliases: ["UNC1878", "Trickbot Syndicate"],
    origin: "Eastern Europe (Cybercrime Corporation)",
    motivation: "Double-Extortion Ransomware & Financial Crime",
    riskLevel: "High",
    industries: ["Healthcare", "Logistics", "Academia", "Manufacturing"],
    techniques: ["T1486 (Data Encrypted for Impact)", "T1021 (Remote Services)", "T1083 (File and Directory Discovery)", "T1547 (Boot/Logon Autostart Exe)"],
    lastSeen: "2026-06-08 14:20 UTC",
    bio: "A highly organized development corporation specializing in ransomware operations (Ryuk, Conti). Wizard Spider utilizes Trickbot, BazarBackdoor, and Anchor frameworks as multi-stage intrusion channels to establish lateral network foothold before exfiltrating and encrypting enterprise data."
  },
  {
    id: "carbanak",
    name: "Carbanak",
    aliases: ["Anunak", "Carbon Spider"],
    origin: "Eastern Europe (Syndicate)",
    motivation: "Financial Interception & Banking Network Compromise",
    riskLevel: "High",
    industries: ["Banking", "Retail", "Hospitality", "Payment Processors"],
    techniques: ["T1189 (Drive-by Compromise)", "T1071 (Web Protocols)", "T1437 (Application Window Manipulation)"],
    lastSeen: "2026-06-09 18:05 UTC",
    bio: "Carbanak is a highly prolific financial cybercrime syndicate that pioneered direct ATM cash-out and SWIFT payment manipulation framework attacks. Their operators run stealthy recon inside banking networks for months, mapping financial operations, before draining resources directly."
  },
  {
    id: "sandworm",
    name: "Sandworm Team",
    aliases: ["Voodoo Bear", "Telebots", "BlackEnergy Group"],
    origin: "Russia (State-Sponsored)",
    motivation: "Sabotage & National Security Disruption",
    riskLevel: "Critical",
    industries: ["Critical Infrastructure", "Electrical Grids", "Government", "Transport"],
    techniques: ["T1489 (Service Stop)", "T1059 (Command and Scripting Interpreter)", "T1204 (User Execution)", "T1490 (Inhibit System Recovery)"],
    lastSeen: "2026-06-10 04:30 UTC",
    bio: "Sandworm is an extremely aggressive destructive cyber force. They are responsible for the historical 2015/2016 Ukraine power grid blackouts and the NotPetya malware outbreak which caused billions of dollars in global logistics damages."
  }
];

export const MOCK_IOCS: IOC[] = [
  {
    id: "ioc-01",
    type: "IP",
    value: "185.34.61.12",
    confidence: 96,
    severity: "Critical",
    sourceFeed: "MISP Shared Intel",
    firstSeen: "2026-06-01 02:44",
    lastSeen: "2026-06-10 03:15",
    status: "Active"
  },
  {
    id: "ioc-02",
    type: "Domain",
    value: "microsoft-security-verify.com",
    confidence: 92,
    severity: "Critical",
    sourceFeed: "OTX AlienVault Pulse",
    firstSeen: "2026-06-03 12:04",
    lastSeen: "2026-06-10 02:30",
    status: "Active"
  },
  {
    id: "ioc-03",
    type: "URL",
    value: "https://secure-dropbox-share-api.net/login/auth/token.php",
    confidence: 88,
    severity: "High",
    sourceFeed: "AbuseIPDB Global",
    firstSeen: "2026-06-05 08:12",
    lastSeen: "2026-06-09 17:54",
    status: "Active"
  },
  {
    id: "ioc-04",
    type: "Hash",
    value: "8f4a34b29c9deef91a54ab413bcdee6312a814bd9ef52bc1947af773dd2b1ca4",
    confidence: 99,
    severity: "Critical",
    sourceFeed: "VirusTotal Live Feed",
    firstSeen: "2026-06-02 11:30",
    lastSeen: "2026-06-10 07:11",
    status: "Active"
  },
  {
    id: "ioc-05",
    type: "Email",
    value: "system-admin-update@mail-exchange-secure.org",
    confidence: 85,
    severity: "High",
    sourceFeed: "Internal TI Team",
    firstSeen: "2026-06-04 15:40",
    lastSeen: "2026-06-08 22:15",
    status: "Active"
  },
  {
    id: "ioc-06",
    type: "IP",
    value: "91.220.101.44",
    confidence: 78,
    severity: "Medium",
    sourceFeed: "AbuseIPDB Global",
    firstSeen: "2026-05-20 04:12",
    lastSeen: "2026-06-02 01:22",
    status: "Expired"
  },
  {
    id: "ioc-07",
    type: "Domain",
    value: "compromised-retail-portal.ru",
    confidence: 90,
    severity: "High",
    sourceFeed: "MISP Shared Intel",
    firstSeen: "2026-05-15 11:30",
    lastSeen: "2026-05-30 19:40",
    status: "Revoked"
  }
];

export const MOCK_THREAT_FEEDS: ThreatFeed[] = [
  {
    id: "feed-misp",
    name: "MISP Security Intelligence Collective",
    status: "Active",
    lastSync: "3 mins ago",
    iocCount: 42109,
    health: 100,
    syncErrors: 0
  },
  {
    id: "feed-otx",
    name: "AlienVault OTX Community Pulse",
    status: "Active",
    lastSync: "8 mins ago",
    iocCount: 182405,
    health: 99.8,
    syncErrors: 1
  },
  {
    id: "feed-abuse",
    name: "AbuseIPDB Real-time Blacklist",
    status: "Active",
    lastSync: "1 min ago",
    iocCount: 95412,
    health: 100,
    syncErrors: 0
  },
  {
    id: "feed-vt",
    name: "VirusTotal Advanced Sandbox Intelligence",
    status: "Active",
    lastSync: "5 mins ago",
    iocCount: 12409,
    health: 100,
    syncErrors: 0
  },
  {
    id: "feed-internal",
    name: "Internal Custom Threat Intel Repository",
    status: "Active",
    lastSync: "12 mins ago",
    iocCount: 3150,
    health: 100,
    syncErrors: 0
  }
];

export const MOCK_KNOWLEDGE_BASE: ThreatKnowledgeArticle[] = [
  {
    id: "kb-01",
    title: "APT28 Custom LURES Backdoor Payload Analysis",
    type: "Threat Report",
    author: "Irina Petrova, Lead Intel Analyst",
    publishedDate: "2026-06-05",
    summary: "Comprehensive teardown of newest Fancy Bear macro delivery payloads using template injection vectors to execute persistent Cobalt Strike beacons inside strategic governmental systems.",
    tags: ["APT28", "Macro Injection", "Cobalt Strike", "Malware teardown"],
    references: ["MITRE T1566", "CVE-2024-30190"]
  },
  {
    id: "kb-02",
    title: "Widespread Campaign Mapping of Ryuk Variant C2 Overlaps",
    type: "Threat Profile",
    author: "Marcus Vance, Cyberforensics Lead",
    publishedDate: "2026-05-28",
    summary: "Analysis of shared Command and Control (C2) domains and dynamic DNS frameworks used by Wizard Spider Conti-groups. Matches infrastructure similarities across separate double-extortion campaigns.",
    tags: ["Wizard Spider", "Conti Ransomware", "Ryuk", "DNS Beacons"],
    references: ["MITRE T1486", "T1071"]
  },
  {
    id: "kb-03",
    title: "Defensive Mitigations against Phishing and OAuth Authorization Code Interception",
    type: "Advisory",
    author: "Platform Engineering Security",
    publishedDate: "2026-06-08",
    summary: "Urgent advisory detailing cloud API tenant configuration steps to block third-party malicious application registrations acting as OAuth-interceptor portals.",
    tags: ["OAuth Hijacking", "Cloud Security", "Mitigations", "Office365"],
    references: ["T1566.002", "Azure Security Guidelines"]
  },
  {
    id: "kb-04",
    title: "Comprehensive Threat Actor Taxonomy Reference v3.2",
    type: "Reference Article",
    author: "Global Intel Alliance (GIA)",
    publishedDate: "2026-04-12",
    summary: "Peer-reviewed documentation tracking active correlations between primary state actor syndicates, covering motivations, target clusters, geographic clusters, and primary weaponized exploits.",
    tags: ["Taxonomy", "APT Profiles", "Global Threat Landscape"],
    references: ["GIA Framework v3", "MITRE ATT&CK Matrix"]
  }
];

export const MOCK_CORRELATIONS: IntelCorrelation[] = [
  {
    id: "corr-01",
    iocValue: "185.34.61.12",
    iocType: "IP",
    alignedActor: "APT28",
    malwareFamily: "Lures Backdoor",
    campaignName: "Operation Eastern Light",
    confidence: 94,
    sourceFeed: "MISP Security Collective",
    detectedTime: "2026-06-10 06:12 UTC"
  },
  {
    id: "corr-02",
    iocValue: "microsoft-security-verify.com",
    iocType: "Domain",
    alignedActor: "APT28",
    malwareFamily: "X-Agent C2 Server",
    campaignName: "Strategic Phish-Egress 2026",
    confidence: 91,
    sourceFeed: "OTX AlienVault pulse",
    detectedTime: "2026-06-10 05:40 UTC"
  },
  {
    id: "corr-03",
    iocValue: "8f4a34b29c9deef91a54ab413bcdee6312a814bd9ef52bc1947af773dd2b1ca4",
    iocType: "Hash",
    alignedActor: "Lazarus Group",
    malwareFamily: "Dacls Micro-Trojan",
    campaignName: "Crypto Wallet Drain Campaign",
    confidence: 98,
    sourceFeed: "VirusTotal Live Sandbox",
    detectedTime: "2026-06-10 04:11 UTC"
  },
  {
    id: "corr-04",
    iocValue: "system-admin-update@mail-exchange-secure.org",
    iocType: "Email",
    alignedActor: "Wizard Spider",
    malwareFamily: "Conti-Stealer Dropper",
    campaignName: "Double Ransom Extortion Core",
    confidence: 89,
    sourceFeed: "Internal Threat Intel Repository",
    detectedTime: "2026-06-09 21:55 UTC"
  }
];
