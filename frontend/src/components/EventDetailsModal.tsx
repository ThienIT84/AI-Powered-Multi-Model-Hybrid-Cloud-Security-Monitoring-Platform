import { motion } from 'framer-motion'
import { Alert, MITRE_MAP } from '../types'

interface EventDetailsModalProps {
  alert: Alert
  onClose: () => void
}

const EventDetailsModal = ({ alert, onClose }: EventDetailsModalProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-soc-critical'
      case 'High':
        return 'text-soc-warning'
      case 'Medium':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-soc-gray rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-soc-accent">Event Investigation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="glassmorphism p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-soc-accent">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Timestamp</p>
                <p className="font-mono">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Source IP</p>
                <p className="font-mono">{alert.sourceIP}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Destination IP</p>
                <p className="font-mono">{alert.destinationIP}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Attack Type</p>
                <p className="font-semibold">{alert.attackType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Severity</p>
                <p className={`font-semibold ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Risk Score</p>
                <p className="font-semibold">{alert.riskScore}%</p>
              </div>
            </div>
          </div>

          {/* Zeek Evidence */}
          {alert.zeekEvidence && (
            <div className="glassmorphism p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-soc-accent">Zeek Evidence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alert.zeekEvidence.uri && (
                  <div>
                    <p className="text-sm text-gray-400">URI</p>
                    <p className="font-mono break-all">{alert.zeekEvidence.uri}</p>
                  </div>
                )}
                {alert.zeekEvidence.method && (
                  <div>
                    <p className="text-sm text-gray-400">Method</p>
                    <p className="font-mono">{alert.zeekEvidence.method}</p>
                  </div>
                )}
                {alert.zeekEvidence.userAgent && (
                  <div>
                    <p className="text-sm text-gray-400">User Agent</p>
                    <p className="font-mono break-all">{alert.zeekEvidence.userAgent}</p>
                  </div>
                )}
                {alert.zeekEvidence.host && (
                  <div>
                    <p className="text-sm text-gray-400">Host</p>
                    <p className="font-mono">{alert.zeekEvidence.host}</p>
                  </div>
                )}
                {alert.zeekEvidence.statusCode && (
                  <div>
                    <p className="text-sm text-gray-400">Status Code</p>
                    <p className="font-mono">{alert.zeekEvidence.statusCode}</p>
                  </div>
                )}
                {alert.zeekEvidence.duration && (
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-mono">{alert.zeekEvidence.duration}s</p>
                  </div>
                )}
                {alert.zeekEvidence.origBytes && (
                  <div>
                    <p className="text-sm text-gray-400">Orig Bytes</p>
                    <p className="font-mono">{alert.zeekEvidence.origBytes}</p>
                  </div>
                )}
                {alert.zeekEvidence.respBytes && (
                  <div>
                    <p className="text-sm text-gray-400">Resp Bytes</p>
                    <p className="font-mono">{alert.zeekEvidence.respBytes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suricata Evidence */}
          {alert.suricataEvidence && (
            <div className="glassmorphism p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-soc-accent">Suricata Evidence</h3>
              <p className="font-mono bg-black/20 p-3 rounded">{alert.suricataEvidence}</p>
            </div>
          )}

          {/* MITRE ATT&CK Mapping */}
          <div className="glassmorphism p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-soc-accent">MITRE ATT&CK Mapping</h3>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-soc-accent text-black rounded-full text-sm font-semibold">
                {alert.attackType}
              </span>
              <span className="text-gray-400">→</span>
              <a
                href={`https://attack.mitre.org/techniques/${MITRE_MAP[alert.attackType] || 'T0000'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-soc-critical text-white rounded-full text-sm font-semibold hover:bg-soc-critical/80 transition-colors"
              >
                {MITRE_MAP[alert.attackType] || 'Unknown'}
              </a>
            </div>
          </div>

          {/* Decision Flow Visualization */}
          <div className="glassmorphism p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-soc-accent">Decision Flow</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Zeek http.log detected</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-soc-accent rounded-full"></div>
                <span>AI2B analyzed: {alert.attackType} ({alert.riskScore}% confidence)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                <span>Fusion Layer: {alert.severity} Alert Generated</span>
              </div>
            </div>
          </div>

          {/* Risk Score Visualization */}
          <div className="glassmorphism p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-soc-accent">Risk Score</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    alert.riskScore > 80 ? 'bg-soc-critical' : alert.riskScore > 60 ? 'bg-soc-warning' : 'bg-soc-success'
                  }`}
                  style={{ width: `${alert.riskScore}%` }}
                ></div>
              </div>
              <span className="font-bold text-lg">{alert.riskScore}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default EventDetailsModal