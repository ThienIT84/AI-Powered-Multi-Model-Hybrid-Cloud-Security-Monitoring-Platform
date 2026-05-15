# WebSocket Flow Documentation

## Overview

The Hybrid SOC Dashboard implements a robust WebSocket architecture for realtime security monitoring. This document outlines the WebSocket communication flow, event handling, and connection management.

## Architecture

```
Frontend WebSocket Service
├── Connection Management
│   ├── Auto-reconnect
│   ├── Exponential backoff
│   └── Heartbeat monitoring
├── Event Handlers
│   ├── ALERT_CREATED
│   ├── SYSTEM_STATUS
│   ├── AI_STATUS
│   └── THREAT_STATS
└── State Synchronization
    ├── Store updates
    ├── UI re-rendering
    └── Error handling
```

## Connection Management

### Connection Establishment
```typescript
// WebSocket service initialization
const wsService = new WebSocketService()

// Connect on app startup
wsService.connect()

// Handle connection events
socket.on('connect', () => {
  useSocketStore.getState().connect()
  reconnectAttempts = 0
})

socket.on('disconnect', () => {
  useSocketStore.getState().disconnect()
  handleReconnect()
})
```

### Auto-Reconnect Logic
```typescript
private handleReconnect() {
  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    this.reconnectAttempts++
    const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      this.connect()
    }, delay)
  }
}
```

### Heartbeat Monitoring
```typescript
// Send periodic heartbeat
setInterval(() => {
  if (socket.connected) {
    socket.emit('heartbeat', { timestamp: Date.now() })
  }
}, 30000) // 30 seconds

// Handle heartbeat response
socket.on('heartbeat', (data) => {
  const latency = Date.now() - data.timestamp
  updateConnectionLatency(latency)
})
```

## Event Types

### ALERT_CREATED
**Purpose**: Notify frontend of new security alerts
**Frequency**: Real-time as alerts are generated
**Payload**:
```typescript
interface AlertCreatedPayload {
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
```

**Handler**:
```typescript
socket.on('ALERT_CREATED', (alert: Alert) => {
  useAlertStore.getState().addAlert(alert)
  // Trigger UI notifications
  showAlertNotification(alert)
})
```

### SYSTEM_STATUS
**Purpose**: Update system health and component status
**Frequency**: Every 30 seconds or on status change
**Payload**:
```typescript
interface SystemStatusPayload {
  websocket: 'connected' | 'disconnected'
  aiEngine: 'AI1' | 'AI2A' | 'AI2B'
  awsSqs: 'active' | 'inactive'
  database: 'healthy' | 'degraded' | 'down'
  redis: 'healthy' | 'degraded' | 'down'
}
```

**Handler**:
```typescript
socket.on('SYSTEM_STATUS', (status: SystemStatus) => {
  useSystemStore.getState().updateStatus(status)
})
```

### AI_STATUS
**Purpose**: Report AI engine processing status
**Frequency**: Real-time during AI processing
**Payload**:
```typescript
interface AIStatusPayload {
  engine: 'AI1' | 'AI2A' | 'AI2B'
  status: 'idle' | 'processing' | 'error'
  currentTask?: string
  queueLength: number
  processingTime: number
}
```

### THREAT_STATS
**Purpose**: Update threat statistics and KPIs
**Frequency**: Every 60 seconds or after significant changes
**Payload**:
```typescript
interface ThreatStatsPayload {
  totalFlows: number
  totalAlerts: number
  topThreat: string
  activeIncidents: number
  alertsPerMinute: number
  threatsByType: Record<string, number>
}
```

## State Synchronization

### Store Updates
```typescript
// Alert store updates
const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  addAlert: (alert: Alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 1000) // Keep last 1000
    }))
  }
}))

// System store updates
const useSystemStore = create<SystemState>((set) => ({
  status: { ... },
  updateStatus: (status) => {
    set((state) => ({
      status: { ...state.status, ...status }
    }))
  }
}))
```

### UI Re-rendering
```typescript
// Reactive UI updates
const AlertFeed = () => {
  const alerts = useAlertStore((state) => state.alerts)

  return (
    <AnimatePresence>
      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <AlertItem alert={alert} />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
```

## Error Handling

### Connection Errors
```typescript
socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error)
  useSocketStore.getState().setError(error.message)
  handleReconnect()
})
```

### Message Validation
```typescript
socket.on('ALERT_CREATED', (data) => {
  try {
    const alert = validateAlert(data)
    useAlertStore.getState().addAlert(alert)
  } catch (error) {
    console.error('Invalid alert data:', error)
    logError('INVALID_ALERT_DATA', error)
  }
})
```

### Rate Limiting
```typescript
// Implement message rate limiting
let messageCount = 0
const resetInterval = setInterval(() => {
  messageCount = 0
}, 60000) // Reset every minute

socket.onAny((event, data) => {
  messageCount++
  if (messageCount > 1000) { // 1000 messages per minute limit
    console.warn('Message rate limit exceeded')
    socket.disconnect()
    return
  }
  // Process message
})
```

## Performance Optimizations

### Message Batching
```typescript
// Batch multiple alerts into single update
let alertBuffer: Alert[] = []
let batchTimeout: NodeJS.Timeout

socket.on('ALERT_CREATED', (alert) => {
  alertBuffer.push(alert)

  if (alertBuffer.length >= 10) {
    flushAlertBuffer()
  } else {
    clearTimeout(batchTimeout)
    batchTimeout = setTimeout(flushAlertBuffer, 100)
  }
})

const flushAlertBuffer = () => {
  useAlertStore.getState().addAlerts(alertBuffer)
  alertBuffer = []
}
```

### Connection Pooling
```typescript
// Maintain connection pool for high availability
class WebSocketPool {
  private connections: Socket[] = []
  private activeConnection: Socket | null = null

  connect() {
    for (let i = 0; i < 3; i++) {
      const socket = io(URL, { ...config })
      this.connections.push(socket)
    }
    this.activeConnection = this.connections[0]
  }
}
```

## Monitoring and Logging

### Connection Metrics
```typescript
// Track connection metrics
const metrics = {
  connections: 0,
  disconnections: 0,
  messagesReceived: 0,
  messagesSent: 0,
  averageLatency: 0,
  errors: 0
}

// Send metrics to monitoring service
setInterval(() => {
  sendMetricsToCloudWatch(metrics)
}, 60000)
```

### Error Logging
```typescript
// Log WebSocket errors
const logWebSocketError = (error: Error, context: string) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    service: 'websocket',
    error: error.message,
    stack: error.stack,
    context
  }

  // Send to CloudWatch
  sendLogToCloudWatch(logEntry)

  // Store locally for debugging
  localStorage.setItem('ws-error-log', JSON.stringify(logEntry))
}
```

## Security

### Authentication
```typescript
// Include JWT token in WebSocket connection
const socket = io(URL, {
  auth: {
    token: getAuthToken()
  }
})
```

### Message Encryption
```typescript
// Encrypt sensitive data before sending
const encryptMessage = (data: any) => {
  return encrypt(data, process.env.WS_ENCRYPTION_KEY)
}

// Decrypt received messages
socket.on('SECURE_MESSAGE', (encryptedData) => {
  const data = decrypt(encryptedData, process.env.WS_ENCRYPTION_KEY)
  processSecureMessage(data)
})
```

## Testing

### Unit Tests
```typescript
describe('WebSocket Service', () => {
  it('should reconnect on disconnection', () => {
    const mockSocket = { connected: false }
    wsService.handleDisconnect()
    expect(wsService.reconnectAttempts).toBe(1)
  })

  it('should handle alert creation', () => {
    const mockAlert = { id: '1', severity: 'High' }
    wsService.handleAlertCreated(mockAlert)
    expect(alertStore.alerts).toContain(mockAlert)
  })
})
```

### Integration Tests
```typescript
describe('WebSocket Integration', () => {
  it('should receive realtime alerts', async () => {
    // Start mock WebSocket server
    const mockServer = createMockWebSocketServer()

    // Connect client
    wsService.connect()

    // Send mock alert
    mockServer.emit('ALERT_CREATED', mockAlert)

    // Wait for state update
    await waitFor(() => {
      expect(alertStore.alerts).toContain(mockAlert)
    })
  })
})
```

## Deployment Considerations

### Environment Configuration
```typescript
// Environment-specific WebSocket URLs
const WS_URLS = {
  development: 'ws://localhost:8000',
  staging: 'wss://staging-api.example.com',
  production: 'wss://api.example.com'
}

const wsUrl = WS_URLS[process.env.NODE_ENV] || WS_URLS.development
```

### Load Balancing
```typescript
// Support multiple WebSocket endpoints
const WS_ENDPOINTS = [
  'wss://ws1.example.com',
  'wss://ws2.example.com',
  'wss://ws3.example.com'
]

const connectToBestEndpoint = () => {
  // Implement endpoint selection logic
  // based on latency, load, etc.
}
```

### Scaling
```typescript
// Handle connection scaling
socket.on('connection', (socket) => {
  // Assign to appropriate server instance
  // Implement sticky sessions if needed
  // Handle horizontal scaling
})
```