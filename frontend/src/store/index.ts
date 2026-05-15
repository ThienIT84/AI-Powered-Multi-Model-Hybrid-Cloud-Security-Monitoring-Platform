import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, AlertState, SocketState, Alert, SystemStatus, ThreatStats } from '../types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        // Mock login - replace with actual API call
        if (username === 'admin' && password === 'password') {
          const token = 'mock-jwt-token'
          set({
            user: { id: '1', username, role: 'admin' },
            token,
            isAuthenticated: true,
          })
        } else {
          throw new Error('Invalid credentials')
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      refreshToken: async () => {
        // Mock refresh - replace with actual API call
        const { token } = get()
        if (token) {
          // Refresh logic here
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  addAlert: (alert: Alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
    }))
  },
  clearAlerts: () => {
    set({ alerts: [] })
  },
  filterAlerts: (filters) => {
    const { alerts } = get()
    return alerts.filter((alert) => {
      if (filters.severity && alert.severity !== filters.severity) return false
      if (filters.attackType && alert.attackType !== filters.attackType) return false
      if (filters.ip && !alert.sourceIP.includes(filters.ip) && !alert.destinationIP.includes(filters.ip)) return false
      if (filters.mitreAttack && alert.mitreAttack !== filters.mitreAttack) return false
      if (filters.timeRange) {
        const alertTime = new Date(alert.timestamp)
        if (alertTime < filters.timeRange.start || alertTime > filters.timeRange.end) return false
      }
      return true
    })
  },
}))

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  reconnectAttempts: 0,
  connect: () => {
    set({ isConnected: true, reconnectAttempts: 0 })
  },
  disconnect: () => {
    set({ isConnected: false })
  },
}))

export const useSystemStore = create<{
  status: SystemStatus
  stats: ThreatStats
  updateStatus: (status: Partial<SystemStatus>) => void
  updateStats: (stats: Partial<ThreatStats>) => void
}>((set) => ({
  status: {
    websocket: 'disconnected',
    aiEngine: 'AI1',
    awsSqs: 'inactive',
  },
  stats: {
    totalFlows: 0,
    totalAlerts: 0,
    topThreat: '',
    activeIncidents: 0,
  },
  updateStatus: (status) => {
    set((state) => ({
      status: { ...state.status, ...status },
    }))
  },
  updateStats: (stats) => {
    set((state) => ({
      stats: { ...state.stats, ...stats },
    }))
  },
}))