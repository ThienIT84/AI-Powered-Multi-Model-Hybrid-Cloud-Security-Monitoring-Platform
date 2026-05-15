import { motion } from 'framer-motion'
import { useSystemStore } from '../store'

const KPICards = () => {
  const { stats } = useSystemStore()

  const cards = [
    {
      title: 'Total Network Flows',
      value: stats.totalFlows.toLocaleString(),
      icon: '🌐',
      color: 'text-soc-accent',
    },
    {
      title: 'Total Fusion Alerts',
      value: stats.totalAlerts.toLocaleString(),
      icon: '🚨',
      color: 'text-soc-warning',
    },
    {
      title: 'Top Threat',
      value: stats.topThreat || 'None',
      icon: '⚠️',
      color: 'text-soc-critical',
    },
    {
      title: 'Active Incidents',
      value: stats.activeIncidents.toString(),
      icon: '🔥',
      color: 'text-soc-critical',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glassmorphism p-6 hover:neon-glow transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color} mt-1`}>
                {card.value}
              </p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default KPICards