/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NetworkLog, ProtocolType, NetworkStatus } from "../components/network/networksConfig";

// Realistic IP blocks for internal and external networks
const INTERNAL_IPS = [
  "10.0.1.15", "10.0.1.42", "10.0.2.100", "10.0.2.145",
  "192.168.1.50", "192.168.10.12", "172.16.8.21", "172.16.8.99"
];

const EXTERNAL_IPS = [
  "185.190.140.85", "8.8.8.8", "1.1.1.1", "45.227.254.10",
  "104.244.42.1", "23.45.120.9", "198.51.100.12", "203.0.113.88",
  "142.250.190.46", "31.13.72.36", "52.84.12.188", "13.224.227.101"
];

const COMMON_PORTS = [80, 443, 22, 53, 3306, 8080, 21, 25];

const ANOMALY_TYPES = [
  "SYN Flood DDoS",
  "SQL Injection Scan",
  "SSH Brute Force",
  "Ransomware Data Exfiltration",
  "DNS Tunneling Beacon",
  "Malware C2 Handshake",
  "Nmap Port Scan",
  "Unauthorized Kerberos Ticket Grant"
];

// Generates a random realistic IP address
export function randomIP(isInternal = false): string {
  const list = isInternal ? INTERNAL_IPS : EXTERNAL_IPS;
  // 90% chance to fetch from real preset list, 10% to generate random
  if (Math.random() > 0.1) {
    return list[Math.floor(Math.random() * list.length)];
  }
  const octets = [
    isInternal ? 10 : Math.floor(Math.random() * 223) + 1,
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 254) + 1
  ];
  return octets.join(".");
}

// Randomly gets a port (well-known or high dynamic)
export function randomPort(preferCommon = true): number {
  if (preferCommon && Math.random() > 0.3) {
    return COMMON_PORTS[Math.floor(Math.random() * COMMON_PORTS.length)];
  }
  return Math.floor(Math.random() * 48127) + 1024;
}

// Randomly selects a protocol
export function randomProtocol(): ProtocolType {
  const rand = Math.random();
  if (rand < 0.7) return ProtocolType.TCP;
  if (rand < 0.95) return ProtocolType.UDP;
  return ProtocolType.ICMP;
}

// Generates a random byte size
export function randomBytes(isAnomaly = false): { origBytes: number; respBytes: number } {
  if (isAnomaly) {
    // Exfiltration or massive flood spike
    const isExfil = Math.random() > 0.5;
    return {
      origBytes: isExfil ? Math.floor(Math.random() * 50000000) + 10000000 : Math.floor(Math.random() * 5000),
      respBytes: isExfil ? Math.floor(Math.random() * 500000) + 1000 : Math.floor(Math.random() * 40000000) + 8000000
    };
  } else {
    // Normal connection bytes
    return {
      origBytes: Math.floor(Math.random() * 45000) + 64,
      respBytes: Math.floor(Math.random() * 350000) + 128
    };
  }
}

// Generates a single network log structure
export function generateNetworkLog(forcedAnomaly?: boolean): NetworkLog {
  const isAnomaly = forcedAnomaly !== undefined ? forcedAnomaly : Math.random() < 0.15;
  const { origBytes, respBytes } = randomBytes(isAnomaly);
  const protocol = randomProtocol();

  let sourceIp = randomIP(true);
  let destIp = randomIP(false);
  
  // Swap sometimes to simulate outbound vs inbound
  if (Math.random() > 0.5) {
    const temp = sourceIp;
    sourceIp = destIp;
    destIp = temp;
  }

  return {
    id: `conn_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    sourceIp,
    sourcePort: randomPort(true),
    destIp,
    destPort: randomPort(true),
    protocol,
    origBytes,
    respBytes,
    status: isAnomaly ? NetworkStatus.ANOMALY : NetworkStatus.NORMAL,
    attackType: isAnomaly ? ANOMALY_TYPES[Math.floor(Math.random() * ANOMALY_TYPES.length)] : undefined,
    duration: isAnomaly ? Math.random() * 450 + 120 : Math.random() * 15 + 0.1
  };
}

// Generates initial mock history for 20 elements
export function generateInitialHistory(count = 20): { logs: NetworkLog[]; points: any[] } {
  const logs: NetworkLog[] = [];
  const points: any[] = [];
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const timeOffset = i * 2000; // 2 seconds apart
    const itemTime = new Date(now - timeOffset).toLocaleTimeString();
    
    // Generate 1-3 connections per historical slice
    const sliceCount = Math.floor(Math.random() * 3) + 1;
    const sliceLogs: NetworkLog[] = [];
    
    for (let s = 0; s < sliceCount; s++) {
      const isAnomaly = Math.random() < 0.12; 
      const log = generateNetworkLog(isAnomaly);
      // Align times to offset for historical look
      log.timestamp = itemTime;
      sliceLogs.push(log);
      logs.push(log);
    }

    // Bandwidth calculation aligned to realistic SOC loads
    const anomalies = sliceLogs.filter(l => l.status === NetworkStatus.ANOMALY);
    const hasAnomaly = anomalies.length > 0;
    const totalBytes = sliceLogs.reduce((sum, current) => sum + current.origBytes + current.respBytes, 0);

    let bandwidth = 0;
    if (hasAnomaly) {
      bandwidth = parseFloat((350 + Math.random() * 130).toFixed(2));
    } else {
      const timeTick = (now - timeOffset) / 8000;
      const baseOscillation = 120 + Math.sin(timeTick) * 4.5;
      const backgroundNoise = Math.random() * 3.2 - 1.6;
      bandwidth = parseFloat((baseOscillation + backgroundNoise).toFixed(2));
    }

    points.push({
      time: itemTime,
      bandwidth,
      normalCount: sliceLogs.length - anomalies.length,
      anomalyCount: anomalies.length,
      totalBytes,
      hasAnomaly
    });
  }

  return { logs: logs.reverse().slice(0, 30), points };
}
