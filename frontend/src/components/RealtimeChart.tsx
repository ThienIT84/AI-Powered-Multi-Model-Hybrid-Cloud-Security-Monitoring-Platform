import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface DataPoint {
  timestamp: string
  flowCount: number
  anomaly?: boolean
}

const RealtimeChart = () => {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    // Mock data generation
    const interval = setInterval(() => {
      const now = new Date()
      const newPoint: DataPoint = {
        timestamp: now.toLocaleTimeString(),
        flowCount: Math.floor(Math.random() * 1000) + 500,
        anomaly: Math.random() > 0.9, // 10% chance of anomaly
      }
      setData((prev) => [...prev.slice(-19), newPoint]) // Keep last 20 points
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const chartData = {
    labels: data.map((d) => d.timestamp),
    datasets: [
      {
        label: 'Network Flows',
        data: data.map((d) => d.flowCount),
        borderColor: 'rgb(0, 212, 255)',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        pointBackgroundColor: data.map((d) =>
          d.anomaly ? 'rgb(255, 68, 68)' : 'rgb(0, 212, 255)'
        ),
        pointBorderColor: data.map((d) =>
          d.anomaly ? 'rgb(255, 68, 68)' : 'rgb(0, 212, 255)'
        ),
        pointRadius: data.map((d) => (d.anomaly ? 6 : 3)),
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = data[context.dataIndex]
            return point.anomaly
              ? `Anomaly detected: ${context.parsed.y} flows`
              : `${context.parsed.y} flows`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    animation: {
      duration: 1000,
    },
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}

export default RealtimeChart