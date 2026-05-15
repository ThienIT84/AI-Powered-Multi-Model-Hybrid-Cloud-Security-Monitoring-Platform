export interface User {
  id: string
  username: string
  role: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

export interface Alert {
  id: string
  timestamp: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  sourceIP: string
  destinationIP: string
  port: number
  attackType: string
  riskScore: number
  zeekEvidence?: ZeekEvidence
  suricataEvidence?: string
  mitreAttack?: string
}

export interface ZeekEvidence {
  uri?: string
  method?: string
  userAgent?: string
  host?: string
  statusCode?: number
  duration?: number
  origBytes?: number
  respBytes?: number
  connState?: string
  history?: string
}

export interface SystemStatus {
  websocket: 'connected' | 'disconnected'
  aiEngine: 'AI1' | 'AI2A' | 'AI2B'
  awsSqs: 'active' | 'inactive'
}

export interface ThreatStats {
  totalFlows: number
  totalAlerts: number
  topThreat: string
  activeIncidents: number
}

export interface AlertState {
  alerts: Alert[]
  addAlert: (alert: Alert) => void
  clearAlerts: () => void
  filterAlerts: (filters: AlertFilters) => Alert[]
}

export interface AlertFilters {
  severity?: string
  attackType?: string
  ip?: string
  timeRange?: { start: Date; end: Date }
  mitreAttack?: string
  aiSource?: string
}

export interface SocketState {
  isConnected: boolean
  reconnectAttempts: number
  connect: () => void
  disconnect: () => void
}

export const MITRE_MAP: Record<string, string> = {
  XSS: 'T1190',
  SQLI: 'T1190',
  BRUTE_FORCE: 'T1110',
  DOS: 'T1498',
  PORT_SCAN: 'Reconnaissance',
}