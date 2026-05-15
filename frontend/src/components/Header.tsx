import { motion } from 'framer-motion'
import { useAuthStore, useSocketStore, useSystemStore } from '../store'

const Header = () => {
  const { user, logout } = useAuthStore()
  const { isConnected } = useSocketStore()
  const { status } = useSystemStore()

  return (
    <header className="bg-soc-gray border-b border-white/10 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-soc-accent">Hybrid SOC</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-soc-success animate-pulse-green' : 'bg-soc-critical'
                }`}
              />
              <span className="text-sm">
                WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-soc-success" />
              <span className="text-sm">AI Engine: {status.aiEngine}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status.awsSqs === 'active' ? 'bg-soc-success' : 'bg-soc-warning'
                }`}
              />
              <span className="text-sm">AWS SQS: {status.awsSqs}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome, {user?.username}</span>
          <button
            onClick={logout}
            className="px-3 py-1 bg-soc-critical hover:bg-soc-critical/80 rounded text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header