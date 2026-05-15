import { io, Socket } from 'socket.io-client'
import { useSocketStore, useAlertStore, useSystemStore, useAuthStore } from '../store'
import { Alert } from '../types'

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    const { token } = useAuthStore.getState()
    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000', {
      auth: { token },
      transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      useSocketStore.getState().connect()
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      useSocketStore.getState().disconnect()
      this.handleReconnect()
    })

    this.socket.on('ALERT_CREATED', (alert: Alert) => {
      useAlertStore.getState().addAlert(alert)
    })

    this.socket.on('SYSTEM_STATUS', (status) => {
      useSystemStore.getState().updateStatus(status)
    })

    this.socket.on('THREAT_STATS', (stats) => {
      useSystemStore.getState().updateStats(stats)
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect()
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1))
    }
  }

  send(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
    }
  }
}

export const wsService = new WebSocketService()