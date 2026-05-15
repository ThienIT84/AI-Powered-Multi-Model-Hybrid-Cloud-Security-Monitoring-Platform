import { useEffect } from 'react'
import { useAlertStore, useSystemStore } from '../store'
import { Alert } from '../types'

const useMockData = () => {
  useEffect(() => {
    // Generate initial mock data
    const mockAlerts: Alert[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        severity: 'Critical',
        sourceIP: '192.168.1.100',
        destinationIP: '10.0.0.1',
        port: 80,
        attackType: 'XSS',
        riskScore: 95,
        zeekEvidence: {
          uri: '/search?q=<script>alert(1)</script>',
          method: 'GET',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          host: 'example.com',
          statusCode: 200,
        },
        suricataEvidence: 'ET WEB_SERVER XSS Attempt',
        mitreAttack: 'T1190',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        severity: 'High',
        sourceIP: '203.0.113.5',
        destinationIP: '10.0.0.1',
        port: 443,
        attackType: 'SQLI',
        riskScore: 87,
        zeekEvidence: {
          uri: "/login?user=admin' OR '1'='1",
          method: 'POST',
          host: 'api.example.com',
          statusCode: 500,
        },
        suricataEvidence: 'ET WEB_SERVER SQL Injection Attempt',
        mitreAttack: 'T1190',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        severity: 'Medium',
        sourceIP: '198.51.100.23',
        destinationIP: '10.0.0.1',
        port: 22,
        attackType: 'BRUTE_FORCE',
        riskScore: 72,
        zeekEvidence: {
          duration: 45.2,
          origBytes: 1024,
          respBytes: 512,
          connState: 'SF',
          history: 'ShADadFf',
        },
        mitreAttack: 'T1110',
      },
    ]

    mockAlerts.forEach((alert) => {
      useAlertStore.getState().addAlert(alert)
    })

    // Update system stats
    useSystemStore.getState().updateStats({
      totalFlows: 15420,
      totalAlerts: 47,
      topThreat: 'XSS',
      activeIncidents: 3,
    })

    // Simulate new alerts every 10-30 seconds
    const interval = setInterval(() => {
      const attackTypes = ['XSS', 'SQLI', 'BRUTE_FORCE', 'DOS', 'PORT_SCAN']
      const severities: ('Critical' | 'High' | 'Medium')[] = ['Critical', 'High', 'Medium']
      const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)]
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)]

      const newAlert: Alert = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        severity: randomSeverity,
        sourceIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        destinationIP: '10.0.0.1',
        port: [80, 443, 22, 3389][Math.floor(Math.random() * 4)],
        attackType: randomAttack,
        riskScore: Math.floor(Math.random() * 40) + 60,
        mitreAttack: 'T1190', // Simplified
      }

      useAlertStore.getState().addAlert(newAlert)
      useSystemStore.getState().updateStats((prev) => ({
        totalAlerts: prev.totalAlerts + 1,
      }))
    }, Math.random() * 20000 + 10000) // 10-30 seconds

    return () => clearInterval(interval)
  }, [])
}

export default useMockData