import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import KPICards from '../components/KPICards'
import RealtimeChart from '../components/RealtimeChart'
import ThreatDistributionChart from '../components/ThreatDistributionChart'
import RealtimeAlertFeed from '../components/RealtimeAlertFeed'
import { wsService } from '../sockets'
import useMockData from '../hooks/useMockData'

const DashboardPage = () => {
  useMockData()

  useEffect(() => {
    // Connect to WebSocket on mount
    wsService.connect()

    return () => {
      // Disconnect on unmount
      wsService.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-soc-dark">
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <KPICards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glassmorphism p-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-soc-accent">
              Network Flow Timeline
            </h2>
            <RealtimeChart />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glassmorphism p-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-soc-accent">
              Threat Distribution
            </h2>
            <ThreatDistributionChart />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-soc-accent">
            Realtime Alert Feed
          </h2>
          <RealtimeAlertFeed />
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage