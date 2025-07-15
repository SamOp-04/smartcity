import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

function CircularProgress({ percent, color }) {
  return (
    <div className="relative w-14 h-14 animate-spin-slow">
      <div
        className="absolute inset-0 rounded-full transition-all duration-700"
        style={{
          background: `conic-gradient(${color} ${percent * 3.6}deg, #e5e7eb ${percent * 3.6}deg)`
        }}
      ></div>
      <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
        {percent}%
      </div>
    </div>
  )
}

export default function StatsCard({ resolved, inProgress, pending }) {
  const total = resolved + inProgress + pending
  const resolvedPercent = total ? Math.round((resolved / total) * 100) : 0
  const pendingPercent = total ? Math.round((pending / total) * 100) : 0

  const cardBase =
    'bg-white shadow-lg rounded-xl p-5 flex items-center gap-4 transform transition duration-300 hover:scale-[1.025] hover:shadow-xl'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {/* Total Complaints */}
      <div className={cardBase}>
        <div className="p-3 bg-blue-100 rounded-full">
          <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <p className="text-s text-gray-700">Total Complaints</p>
          <p className="text-2xl font-semibold text-gray-800">{total}</p>
        </div>
      </div>

      {/* Resolved Complaints */}
      <div className={cardBase}>
        <div className="p-3 bg-green-100 rounded-full">
          <CheckCircleIcon className="h-7 w-7 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-s text-gray-700">Resolved</p>
          <p className="text-2xl font-semibold text-green-700">{resolved}</p>
        </div>
        <CircularProgress percent={resolvedPercent} color="#16a34a" />
      </div>

      {/* Pending Complaints */}
      <div className={cardBase}>
        <div className="p-3 bg-yellow-100 rounded-full">
          <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600" />
        </div>
        <div className="flex-1">
          <p className="text-s text-gray-700">Pending</p>
          <p className="text-2xl font-semibold text-yellow-700">{pending}</p>
        </div>
        <CircularProgress percent={pendingPercent} color="#eab308" />
      </div>
    </div>
  )
}
