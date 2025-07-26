'use client'
import { EyeIcon } from '@heroicons/react/24/outline'

const statusConfig = {
  'Resolved': {
    light: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    dark: 'text-emerald-400 bg-emerald-900/30 border-emerald-800'
  },
  'Assessed': {
    light: 'text-amber-600 bg-amber-50 border-amber-200',
    dark: 'text-amber-400 bg-amber-900/30 border-amber-800'
  },
  'In Progress': {
    light: 'text-blue-600 bg-blue-50 border-blue-200',
    dark: 'text-blue-400 bg-blue-900/30 border-blue-800'
  }
}

export default function ComplaintRow({ complaint, onView, darkMode }) {
  const statusStyle = statusConfig[complaint.status]?.[darkMode ? 'dark' : 'light'] ||
                     (darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-600 bg-gray-50 border-gray-200')
  
  return (
    <tr className={`transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group ${
      darkMode
        ? 'bg-slate-800/30 hover:bg-slate-700/50 text-slate-200 border border-slate-700/50'
        : 'bg-white/70 hover:bg-blue-50/80 text-gray-800 border border-gray-100'
    } backdrop-blur-sm rounded-xl`}>
      <td className={`px-4 py-4 font-mono font-medium transition-colors duration-200 ${
        darkMode ? 'text-slate-300' : 'text-gray-700'
      } rounded-l-xl`}>
        #{complaint.no}
      </td>
      <td className="px-4 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
          darkMode ? 'bg-slate-700 text-slate-300 border border-slate-600' : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}>
          {complaint.category}
        </span>
      </td>
      <td className={`px-4 py-4 max-w-xs truncate transition-colors duration-200 ${
        darkMode ? 'text-slate-300' : 'text-gray-600'
      }`} title={complaint.description}>
        {complaint.description}
      </td>
      <td className="px-4 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${statusStyle}`}>
          {complaint.status}
        </span>
      </td>
      <td className={`px-4 py-4 text-sm transition-colors duration-200 ${
        darkMode ? 'text-slate-400' : 'text-gray-500'
      }`}>
        {complaint.date}
      </td>
      <td className="px-4 py-4 rounded-r-xl">
        <button
          onClick={onView}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
            darkMode
              ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300'
              : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
          } group-hover:shadow-md`}
        >
          <EyeIcon className="h-4 w-4" />
          View
        </button>
      </td>
    </tr>
  )
}