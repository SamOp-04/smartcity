import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

function ModernCircularProgress({ percent, color, strokeWidth = 8 }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold text-slate-700">{percent}%</span>
      </div>
    </div>
  )
}

export default function StatsCard({ resolved, inProgress, assessed }) {
  const total = resolved + inProgress + assessed
  const resolvedPercent = total ? Math.round((resolved / total) * 100) : 0
  const inProgressPercent = total ? Math.round((inProgress / total) * 100) : 0
  const assessedPercent = total ? Math.round((assessed / total) * 100) : 0

  const cards = [
    {
      title: 'Total Complaints',
      value: total,
      icon: ClipboardDocumentListIcon,
      gradient: 'from-slate-500 to-slate-600',
      bgGradient: 'from-slate-50 to-slate-100',
      textColor: 'text-slate-700',
      showProgress: false
    },
    {
      title: 'Resolved',
      value: resolved,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-700',
      progress: resolvedPercent,
      progressColor: '#10b981',
      showProgress: true
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: ClockIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
      progress: inProgressPercent,
      progressColor: '#3b82f6',
      showProgress: true
    },
    {
      title: 'Assessed',
      value: assessed,
      icon: ExclamationTriangleIcon,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
      textColor: 'text-amber-700',
      progress: assessedPercent,
      progressColor: '#f59e0b',
      showProgress: true
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`bg-gradient-to-br ${card.bgGradient} backdrop-blur-md rounded-xl shadow-lg border border-white/20 
            p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-xl
            group relative overflow-hidden`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`w-8 h-8 bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`} />
              {card.showProgress && (
                <ModernCircularProgress
                  percent={card.progress}
                  color={card.progressColor}
                />
              )}
            </div>

            <p className="text-m text-slate-700 font-bold">{card.title}</p>
            <p className={`text-2xl font-extrabold ${card.textColor}`}>
              {card.value.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}