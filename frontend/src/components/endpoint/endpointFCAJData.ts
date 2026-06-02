export interface ZeekConnLog {
  id: string;
  timestamp: string;
  duration: number;
  bytes: number;
  packets: number;
  conn_state: "SF" | "S0" | "REJ" | "RSTR" | "OTG";
  proto: "TCP" | "UDP" | "ICMP";
  service: "HTTP" | "DNS" | "SSH" | "FTP" | "HTTPS" | "UNKNOWN";
  src_ip: string;
  dest_ip: string;
  src_port: number;
  dest_port: number;
}

export interface ZeekHttpLog {
  id: string;
  timestamp: string;
  src_ip: string;
  dest_ip: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD";
  uri: string;
  user_agent: string;
  status_code: number;
}

export interface SuricataAlert {
  id: string;
  timestamp: string;
  signature: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  src_ip: string;
  dest_ip: string;
  src_port: number;
  dest_port: number;
}

export interface EndpointFCAJItem {
  id: string;
  hostname: string;
  ip: string;
  mac: string;
  deviceType: "Server" | "Workstation" | "Firewall" | "Sensor" | "Unknown";
  os: "Ubuntu" | "CentOS" | "Debian" | "Windows" | "Alpine" | "FreeRTOS";
  role: "Web Server" | "Database Server" | "User VM" | "Admin VM" | "Zeek Sensor" | "Suricata Sensor" | "Kali Attacker";
  lastSeen: string;
  firstSeen: string;
  alertCount: number;
  riskScore: number;
  status: "Healthy" | "Warning" | "Critical" | "Offline";
  healthScore: number; // 0 - 100
  
  // Network stats
  totalConnections: number;
  totalBytes: number;
  protocols: { TCP: number; UDP: number; ICMP: number };
  services: { HTTP: number; DNS: number; SSH: number; FTP: number; HTTPS: number; OTHER: number };
  
  // AI Findings (FCAJ v3.0 specs)
  ai1: {
    prediction: "NORMAL" | "ANOMALOUS" | "SUSPICIOUS";
    anomalyScore: number; // percentage
  };
  ai2a: {
    attackType: string;
    confidence: number; // percentage
  };
  ai2b: {
    webAttack: string;
    confidence: number; // percentage
  };
  
  // Suricata Findings
  suricata: {
    signature: string;
    category: string;
    severity: "Low" | "Medium" | "High" | "Critical";
  };
  
  // Fusion Layer Decision
  fusion: {
    finalAttackType: string;
    riskScore: number;
    severity: "Low" | "Medium" | "High" | "Critical";
    mitreMapping: string; // TCode - Name
  };
  
  // Timelines
  timeline: {
    time: string;
    event: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    id: string;
  }[];

  // Specific Zeek associated logs
  zeekConnLogs: ZeekConnLog[];
  zeekHttpLogs: ZeekHttpLog[];
  geoInfo: {
    srcCountry: string;
    srcCode: string; // ISO 2 letter
    destCountry: string;
    destCode: string;
    srcCoords: [number, number]; // [lat, lng]
    destCoords: [number, number];
  };
}

export interface IncidentFCAJ {
  id: string;
  timestamp: string;
  endpointId: string;
  hostname: string;
  ip: string;
  attackType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
  aiSource: string; // "AI1 & AI2A" / "Fusion Core v3" etc.
  zeekLogs?: {
    conn: ZeekConnLog;
    http?: ZeekHttpLog;
  };
  suricataAlert?: SuricataAlert;
}

// Sparkline series generator
export const makeSparkline = (length = 12, seed = 40): number[] => {
  let val = seed;
  const arr = [];
  for (let i = 0; i < length; i++) {
    val = Math.max(5, Math.min(100, val + Math.round((Math.random() - 0.5) * 20)));
    arr.push(val);
  }
  return arr;
};

// Generates consistent IP locations
const MOCK_COUNTRIES = [
  { name: "United States", code: "US", lat: 37.0902, lng: -95.7129 },
  { name: "Vietnam", code: "VN", lat: 14.0583, lng: 108.2772 },
  { name: "Germany", code: "DE", lat: 51.1657, lng: 10.4515 },
  { name: "Singapore", code: "SG", lat: 1.3521, lng: 103.8198 },
  { name: "China", code: "CN", lat: 35.8617, lng: 104.1954 },
  { name: "Russia", code: "RU", lat: 61.5240, lng: 105.3188 },
  { name: "Australia", code: "AU", lat: -25.2744, lng: 133.7751 },
  { name: "United Kingdom", code: "GB", lat: 55.3781, lng: -3.4360 },
  { name: "Japan", code: "JP", lat: 36.2048, lng: 138.2529 }
];

// Seed generator for consistent results
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateFCAJData(): {
  endpoints: EndpointFCAJItem[];
  flows: ZeekConnLog[];
  alerts: SuricataAlert[];
  incidents: IncidentFCAJ[];
} {
  const endpoints: EndpointFCAJItem[] = [];
  const flows: ZeekConnLog[] = [];
  const alerts: SuricataAlert[] = [];
  const incidents: IncidentFCAJ[] = [];

  // Generate 85 endpoints (between 50 and 200 requirement)
  const count = 85;
  const hostPrefixes = ["srv-prod-web", "ws-sec-dispatch", "fw-border-cisco", "zeek-sensor-node", "suricata-mirror", "k8s-pod-user", "v-admin-shell", "kali-intrusion-test"];
  const roles: ("Web Server" | "Database Server" | "User VM" | "Admin VM" | "Zeek Sensor" | "Suricata Sensor" | "Kali Attacker")[] = [
    "Web Server", "Database Server", "User VM", "Admin VM", "Zeek Sensor", "Suricata Sensor", "Kali Attacker"
  ];
  const devTypes: ("Server" | "Workstation" | "Firewall" | "Sensor" | "Unknown")[] = [
    "Server", "Workstation", "Firewall", "Sensor", "Unknown"
  ];
  const OSList: ("Ubuntu" | "CentOS" | "Debian" | "Windows" | "Alpine" | "FreeRTOS")[] = [
    "Ubuntu", "CentOS", "Debian", "Windows", "Alpine", "FreeRTOS"
  ];

  const signatures = [
    "ET WEB_SPECIFIC_APPS Drupal XML-RPC Exploitation attempt",
    "ET WEB_SERVER Possible SQL Injection attempt in URI",
    "ET POLICY Cryptomining pool activity detected on non-standard port",
    "ET TROJAN Cobalt Strike Beacon active session established",
    "ET SCAN Potential SSH brute force from external IP",
    "ET CURRENT_EVENTS Malicious redirect landing page loaded",
    "ET WEB_SPECIFIC_APPS WordPress Core XSS Vulnerability target",
    "ET EXFIL Large compressed archive upload via HTTP POST",
  ];

  const mitreList = [
    "T1190 - Exploit Public-Facing Application",
    "T1059 - Command and Scripting Interpreter",
    "T1567 - Exfiltration Over Web Service",
    "T1071 - Application Layer Protocol",
    "T1110 - Brute Force",
    "T1046 - Network Service Discovery",
  ];

  const attackCategories = ["XSS", "SQLi", "Port Scan", "Brute Force", "DoS", "Beaconing", "Data Exfiltration"];

  for (let i = 1; i <= count; i++) {
    // Determine static assignments based on pseudo-random values
    const rand = pseudoRandom(i);
    const role = i === 12 ? "Kali Attacker" : MOCK_ROLES_STR(i);
    const deviceType = role === "Web Server" || role === "Database Server" ? "Server" : 
                       role === "Zeek Sensor" || role === "Suricata Sensor" ? "Sensor" :
                       role === "Kali Attacker" ? "Unknown" : "Workstation";

    const os = i === 12 ? "Debian" : (osSelection(i));
    const ip = i === 12 ? "192.168.1.99" : `10.100.${Math.floor(i / 10) + 1}.${(i % 9) * 15 + 10}`;
    const hostname = i === 12 ? "kali-attacker-f3" : `${hostPrefixes[i % hostPrefixes.length]}-${i.toString().padStart(2, "0")}`;
    const mac = `00:50:56:c0:00:${i.toString(16).padStart(2, "0")}`;
    
    // Status and risks
    let status: "Healthy" | "Warning" | "Critical" | "Offline" = "Healthy";
    let riskScore = Math.floor(pseudoRandom(i * 15) * 40); // 0-40 default
    if (i % 7 === 1) {
      status = "Warning";
      riskScore = 55 + Math.floor(pseudoRandom(i * 3) * 15);
    } else if (i % 11 === 0 || i === 12 || i === 33) {
      status = "Critical";
      riskScore = 82 + Math.floor(pseudoRandom(i * 4) * 17);
    } else if (i % 17 === 0) {
      status = "Offline";
      riskScore = 0;
    }

    // Health Score logic (90-100 Healthy, 70-89 Warning, 50-69 High Risk, 0-49 Critical)
    let healthScore = 100 - Math.round(riskScore * 0.9 + (status === "Offline" ? 100 : status === "Warning" ? 20 : status === "Critical" ? 60 : 0) * 0.1);
    healthScore = Math.max(5, Math.min(100, healthScore));

    const totalConnections = status === "Offline" ? 0 : 200 + Math.floor(pseudoRandom(i * 12) * 800);
    const totalBytes = totalConnections * (500 + Math.floor(pseudoRandom(i * 14) * 4500));

    // Signatures and Mitre
    const signature = signatures[i % signatures.length];
    const category = attackCategories[i % attackCategories.length];
    const mitre = mitreList[i % mitreList.length];

    // AI findings
    const ai1Pred = riskScore > 75 ? "ANOMALOUS" : riskScore > 40 ? "SUSPICIOUS" : "NORMAL";
    const ai1Score = riskScore > 0 ? Math.min(99, Math.round(riskScore + pseudoRandom(i) * 5)) : 2;
    const ai2aConf = riskScore > 40 ? Math.round(70 + pseudoRandom(i * 2) * 28) : 0;
    const ai2bConf = category === "XSS" || category === "SQLi" ? Math.round(75 + pseudoRandom(i * 3) * 23) : 0;

    // Timeline actions
    const timeline = [];
    const baseHour = 9;
    if (status === "Critical" || status === "Warning") {
      timeline.push({
        id: `t-${i}-1`,
        time: `${(baseHour).toString().padStart(2, "0")}:00`,
        event: "Network Discovery Port Scan detected",
        severity: "Low" as const
      });
      if (riskScore > 60) {
        timeline.push({
          id: `t-${i}-2`,
          time: `${(baseHour).toString().padStart(2, "0")}:15`,
          event: "System Vulnerability Brute Force triggered",
          severity: "Medium" as const
        });
      }
      if (riskScore > 75) {
        timeline.push({
          id: `t-${i}-3`,
          time: `${(baseHour + 1).toString().padStart(2, "0")}:30`,
          event: "SQL Injection / XSS Probe Alert Compiled",
          severity: "High" as const
        });
        timeline.push({
          id: `t-${i}-4`,
          time: `${(baseHour + 1).toString().padStart(2, "0")}:55`,
          event: "Fusion Decision: Data Exfiltration Tunnel via Web Proxy",
          severity: "Critical" as const
        });
      }
    } else {
      timeline.push({
        id: `t-${i}-0`,
        time: `${(baseHour - 2).toString().padStart(2, "0")}:10`,
        event: "OS Asset Telemetry agent launched gracefully",
        severity: "Low" as const
      });
    }

    // GeoInfo
    const srcGeo = MOCK_COUNTRIES[i % MOCK_COUNTRIES.length];
    const destGeo = MOCK_COUNTRIES[(i + 4) % MOCK_COUNTRIES.length];

    // Zeek child logs
    const zeekConnLogs: ZeekConnLog[] = [];
    const zeekHttpLogs: ZeekHttpLog[] = [];

    const protoDist = { TCP: 0, UDP: 0, ICMP: 0 };
    const svcDist = { HTTP: 0, DNS: 0, SSH: 0, FTP: 0, HTTPS: 0, OTHER: 0 };

    if (status !== "Offline") {
      for (let f = 0; f < 5; f++) {
        const hash = pseudoRandom(i * 10 + f);
        const proto: "TCP" | "UDP" | "ICMP" = hash > 0.45 ? "TCP" : hash > 0.15 ? "UDP" : "ICMP";
        const svc: "HTTP" | "DNS" | "SSH" | "FTP" | "HTTPS" | "UNKNOWN" = 
          proto === "ICMP" ? "UNKNOWN" :
          hash > 0.7 ? "HTTPS" :
          hash > 0.5 ? "HTTP" :
          hash > 0.3 ? "DNS" :
          hash > 0.15 ? "SSH" : "FTP";

        const bytesCount = proto === "TCP" ? Math.round(5000 + hash * 250000) : Math.round(120 + hash * 3000);
        const packetCount = proto === "TCP" ? Math.max(5, Math.round(bytesCount / 1200)) : Math.max(1, Math.round(bytesCount / 150));

        protoDist[proto]++;
        if (svc !== "UNKNOWN") {
          svcDist[svc]++;
        } else {
          svcDist["OTHER"]++;
        }

        zeekConnLogs.push({
          id: `zk-conn-${i}-${f}`,
          timestamp: `2026-05-31T09:${Math.floor(f * 12).toString().padStart(2, "0")}:02Z`,
          duration: hash * 21.4,
          bytes: bytesCount,
          packets: packetCount,
          conn_state: hash > 0.3 ? "SF" : hash > 0.1 ? "RSTR" : "REJ",
          proto,
          service: svc,
          src_ip: ip,
          dest_ip: `203.0.113.${Math.floor(f * 22) + 12}`,
          src_port: 30000 + Math.floor(hash * 25000),
          dest_port: svc === "HTTP" ? 80 : svc === "HTTPS" ? 443 : svc === "DNS" ? 53 : svc === "SSH" ? 22 : svc === "FTP" ? 21 : 8080
        });

        if (svc === "HTTP" || svc === "HTTPS") {
          zeekHttpLogs.push({
            id: `zk-http-${i}-${f}`,
            timestamp: `2026-05-31T09:${Math.floor(f * 12 + 1).toString().padStart(2, "0")}:15Z`,
            src_ip: ip,
            dest_ip: `203.0.113.${Math.floor(f * 22) + 12}`,
            method: hash > 0.5 ? "GET" : "POST",
            uri: hash > 0.7 ? "/wp-admin/admin-ajax.php?action=upload" : hash > 0.4 ? "/api/v1/auth/login" : "/index.html",
            user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            status_code: hash > 0.8 ? 500 : hash > 0.4 ? 200 : 403
          });
        }
      }
    }

    endpoints.push({
      id: `EP-FCAJ-${2000 + i}`,
      hostname,
      ip,
      mac,
      deviceType,
      os,
      role,
      lastSeen: status === "Offline" ? "2D AGO" : "JUST NOW",
      firstSeen: "2026-03-12T04:22:12Z",
      alertCount: status === "Healthy" ? 0 : Math.round(riskScore / 18 + 1),
      riskScore,
      status,
      healthScore,
      totalConnections,
      totalBytes,
      protocols: {
        TCP: protoDist.TCP || (status === "Offline" ? 0 : 45),
        UDP: protoDist.UDP || (status === "Offline" ? 0 : 15),
        ICMP: protoDist.ICMP || (status === "Offline" ? 0 : 5)
      },
      services: {
        HTTP: svcDist.HTTP || (status === "Offline" ? 0 : 12),
        DNS: svcDist.DNS || (status === "Offline" ? 0 : 35),
        SSH: svcDist.SSH || (status === "Offline" ? 0 : 4),
        FTP: svcDist.FTP || (status === "Offline" ? 0 : 1),
        HTTPS: svcDist.HTTPS || (status === "Offline" ? 0 : 50),
        OTHER: svcDist.OTHER || (status === "Offline" ? 0 : 18)
      },
      ai1: {
        prediction: ai1Pred,
        anomalyScore: ai1Score
      },
      ai2a: {
        attackType: ai1Pred !== "NORMAL" ? category : "None",
        confidence: ai2aConf
      },
      ai2b: {
        webAttack: svcDist.HTTP > 0 ? category : "None",
        confidence: ai2bConf
      },
      suricata: {
        signature: status !== "Healthy" ? signature : "None",
        category: status !== "Healthy" ? "Policy Violation / Intrusion attempt" : "None",
        severity: status === "Critical" ? "Critical" : status === "Warning" ? "Medium" : "Low"
      },
      fusion: {
        finalAttackType: status === "Critical" ? `Critical ${category}` : status === "Warning" ? `Suspected ${category}` : "None",
        riskScore,
        severity: status === "Critical" ? "Critical" : status === "Warning" ? "Medium" : "Low",
        mitreMapping: status !== "Healthy" ? mitre : "None"
      },
      timeline,
      zeekConnLogs,
      zeekHttpLogs,
      geoInfo: {
        srcCountry: srcGeo.name,
        srcCode: srcGeo.code,
        destCountry: destGeo.name,
        destCode: destGeo.code,
        srcCoords: [srcGeo.lat, srcGeo.lng],
        destCoords: [destGeo.lat, destGeo.lng]
      }
    });

    // Make global mock flows (Zeek conn.log)
    if (status !== "Offline" && flows.length < 3500) {
      zeekConnLogs.forEach(l => flows.push(l));
    }

    // Make Suricata Alert objects for global counts
    if (status !== "Healthy") {
      alerts.push({
        id: `sa-alert-${1500 + i}`,
        timestamp: `2026-05-31T09:41:22Z`,
        signature,
        category,
        severity: status === "Critical" ? "Critical" : "Medium",
        src_ip: ip,
        dest_ip: `34.120.45.192`,
        src_port: 45102,
        dest_port: 80
      });
    }

    // Create 100 mock Incidents for history grid (Section 10)
    if (status !== "Healthy" && incidents.length < 100) {
      incidents.push({
        id: `INC-FCAJ-${3000 + i}`,
        timestamp: `2026-05-31T09:${Math.floor(pseudoRandom(i * 8) * 59).toString().padStart(2, "0")}:11Z`,
        endpointId: `EP-FCAJ-${2000 + i}`,
        hostname,
        ip,
        attackType: category,
        severity: status === "Critical" ? "Critical" : "Medium",
        riskScore,
        aiSource: "AI1 Core + AI2A Classifier",
        zeekLogs: {
          conn: zeekConnLogs[0] || {
            id: `zk-conn-m-${i}`,
            timestamp: `2026-05-31T09:12:00Z`,
            duration: 9.4,
            bytes: 142104,
            packets: 122,
            conn_state: "SF",
            proto: "TCP",
            service: "HTTP",
            src_ip: ip,
            dest_ip: `34.120.45.192`,
            src_port: 42100,
            dest_port: 80
          },
          http: zeekHttpLogs[0]
        },
        suricataAlert: alerts[alerts.length - 1]
      });
    }
  }

  // Ensure we reach exactly 500 alerts and 100 incidents by filling remaining counts with pseudo-randomly selected assets
  let fillIndex = 0;
  while (alerts.length < 500) {
    fillIndex++;
    const ep = endpoints[fillIndex % endpoints.length];
    if (ep.status !== "Offline") {
      alerts.push({
        id: `sa-alert-fill-${alerts.length}`,
        timestamp: `2026-05-31T14:30:${(alerts.length % 60).toString().padStart(2, "0")}Z`,
        signature: signatures[alerts.length % signatures.length],
        category: attackCategories[alerts.length % attackCategories.length],
        severity: (alerts.length % 10 === 0) ? "Critical" : (alerts.length % 4 === 0) ? "High" : "Medium",
        src_ip: ep.ip,
        dest_ip: `203.0.113.${(alerts.length % 250) + 1}`,
        src_port: 1024 + (alerts.length * 17) % 50000,
        dest_port: 80
      });
    }
  }

  while (incidents.length < 100) {
    fillIndex++;
    const ep = endpoints[fillIndex % endpoints.length];
    if (ep.status !== "Offline") {
      const cat = attackCategories[incidents.length % attackCategories.length];
      incidents.push({
        id: `INC-FCAJ-fill-${incidents.length}`,
        timestamp: `2026-05-31T14:02:${(incidents.length % 60).toString().padStart(2, "0")}Z`,
        endpointId: ep.id,
        hostname: ep.hostname,
        ip: ep.ip,
        attackType: cat,
        severity: (incidents.length % 9 === 0) ? "Critical" : (incidents.length % 3 === 0) ? "High" : "Medium",
        riskScore: ep.riskScore > 0 ? ep.riskScore : Math.round(35 + (incidents.length * 7) % 40),
        aiSource: "AI2B Web Parser Engine",
        zeekLogs: {
          conn: {
            id: `zk-conn-fill-${incidents.length}`,
            timestamp: `2026-05-31T12:00:00Z`,
            duration: 1.25,
            bytes: 52109,
            packets: 32,
            conn_state: "SF",
            proto: "TCP",
            service: "HTTPS",
            src_ip: ep.ip,
            dest_ip: `203.0.113.88`,
            src_port: 41250,
            dest_port: 443
          }
        },
        suricataAlert: {
          id: `sa-alert-fill-sub-${incidents.length}`,
          timestamp: `2026-05-31T12:00:00Z`,
          signature: `ET INT-${cat} Probe Execution in Enterprise`,
          category: cat,
          severity: "High",
          src_ip: ep.ip,
          dest_ip: `203.0.113.88`,
          src_port: 41250,
          dest_port: 443
        }
      });
    }
  }

  return { endpoints, flows, alerts, incidents };

  function MOCK_ROLES_STR(index: number) {
    return roles[index % roles.length];
  }
  function osSelection(index: number) {
    return OSList[index % OSList.length];
  }
}
