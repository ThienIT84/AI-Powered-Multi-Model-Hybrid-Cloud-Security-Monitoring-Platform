import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlertStore } from '../store'
import { Alert } from '../types'
import EventDetailsModal from './EventDetailsModal'

const RealtimeAlertFeed = () => {
  const { alerts } = useAlertStore()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-soc-critical'
      case 'High':
        return 'bg-soc-warning'
      case 'Medium':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4">Timestamp</th>
              <th className="text-left py-3 px-4">Severity</th>
              <th className="text-left py-3 px-4">Source IP</th>
              <th className="text-left py-3 px-4">Destination IP</th>
              <th className="text-left py-3 px-4">Port</th>
              <th className="text-left py-3 px-4">Attack Type</th>
              <th className="text-left py-3 px-4">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {alerts.slice(0, 50).map((alert, index) => (
                <motion.tr
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <td className="py-3 px-4">
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">{alert.sourceIP}</td>
                  <td className="py-3 px-4">{alert.destinationIP}</td>
                  <td className="py-3 px-4">{alert.port}</td>
                  <td className="py-3 px-4">{alert.attackType}</td>
                  <td className="py-3 px-4">{alert.riskScore}%</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No alerts yet. Waiting for realtime data...
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedAlert && (
          <EventDetailsModal
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default RealtimeAlertFeed