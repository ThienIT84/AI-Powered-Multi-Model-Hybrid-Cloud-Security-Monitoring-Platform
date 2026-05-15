import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const ThreatDistributionChart = () => {
  const data = {
    labels: ['DoS', 'XSS', 'SQL Injection', 'Port Scan', 'Brute Force'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(255, 68, 68, 0.8)',
          'rgba(255, 170, 0, 0.8)',
          'rgba(255, 255, 0, 0.8)',
          'rgba(0, 212, 255, 0.8)',
          'rgba(68, 255, 68, 0.8)',
        ],
        borderColor: [
          'rgb(255, 68, 68)',
          'rgb(255, 170, 0)',
          'rgb(255, 255, 0)',
          'rgb(0, 212, 255)',
          'rgb(68, 255, 68)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${percentage}%`
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  }

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  )
}

export default ThreatDistributionChart