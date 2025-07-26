'use client'
import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

const statusConfig = {
  Resolved: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-100/50',
    dot: 'bg-emerald-500',
    darkColor: 'text-emerald-400',
    darkBg: 'bg-emerald-900/30',
    darkDot: 'bg-emerald-400'
  },
  'In Progress': {
    color: 'text-blue-600',
    bg: 'bg-blue-100/50',
    dot: 'bg-blue-500',
    darkColor: 'text-blue-400',
    darkBg: 'bg-blue-900/30',
    darkDot: 'bg-blue-400'
  },
  Assessed: {
    color: 'text-amber-600',
    bg: 'bg-amber-100/50',
    dot: 'bg-amber-500',
    darkColor: 'text-amber-400',
    darkBg: 'bg-amber-900/30',
    darkDot: 'bg-amber-400'
  }
}

const categoryColors = {
  Road: { light: 'bg-blue-100/70 text-blue-700', dark: 'bg-blue-900/30 text-blue-400' },
  Water: { light: 'bg-cyan-100/70 text-cyan-700', dark: 'bg-cyan-900/30 text-cyan-400' },
  Electricity: { light: 'bg-yellow-100/70 text-yellow-700', dark: 'bg-yellow-900/30 text-yellow-400' },
  Garbage: { light: 'bg-red-100/70 text-red-700', dark: 'bg-red-900/30 text-red-400' },
  Sanitation: { light: 'bg-green-100/70 text-green-700', dark: 'bg-green-900/30 text-green-400' },
  Uncategorized: { light: 'bg-gray-100/70 text-gray-700', dark: 'bg-gray-900/30 text-gray-400' }
}

function StatusDropdown({ currentStatus, complaintId, onStatusUpdate, darkMode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState('below')

  const statuses = ['Assessed', 'In Progress', 'Resolved']

  const handleToggleDropdown = (e) => {
    if (!isOpen) {
      // Calculate position when opening
      const buttonRect = e.currentTarget.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const dropdownHeight = 130 // Height for 3 menu items
      const spaceBelow = viewportHeight - buttonRect.bottom - 20 // Add buffer
      
      // Position above if not enough space below
      setDropdownPosition(spaceBelow < dropdownHeight ? 'above' : 'below')
    }
    setIsOpen(!isOpen)
  }
  const handleStatusChange = async (newStatus) => {
    if (newStatus !== currentStatus && onStatusUpdate) {
      setIsUpdating(true)
      try {
        await onStatusUpdate(complaintId, newStatus)
      } catch (error) {
        console.error('Failed to update status:', error)
      } finally {
        setIsUpdating(false)
        setIsOpen(false)
      }
    } else {
      setIsOpen(false)
    }
  }

  const currentStatusConfig = statusConfig[currentStatus] || statusConfig.Assessed

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggleDropdown}
        disabled={isUpdating}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 ${
          darkMode ? currentStatusConfig.darkBg : currentStatusConfig.bg
        }`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${
          darkMode ? currentStatusConfig.darkDot : currentStatusConfig.dot
        }`}></span>
        <span className={darkMode ? currentStatusConfig.darkColor : currentStatusConfig.color}>
          {isUpdating ? 'Updating...' : currentStatus}
        </span>
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute left-0 w-32 rounded-md shadow-lg z-20 border ${
            dropdownPosition === 'above' 
              ? 'bottom-full mb-2' 
              : 'top-full mt-2'
          } ${
            darkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-slate-200'
          }`}>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-opacity-75 transition-colors first:rounded-t-md last:rounded-b-md ${
                  status === currentStatus
                    ? darkMode
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-slate-100 text-slate-800'
                    : darkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
export default function RecentComplaintTable({ complaints = [] }) {
  const [page, setPage] = useState(1)
  const [darkMode, setDarkMode] = useState(false)
  const perPage = 5

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    
    const handleStorageChange = () => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      setDarkMode(newDarkMode)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    const interval = setInterval(() => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      if (newDarkMode !== darkMode) {
        setDarkMode(newDarkMode)
      }
    }, 100)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [darkMode])

  if (!complaints || !Array.isArray(complaints)) {
    return (
      <div className={`backdrop-blur-md rounded-xl shadow-md border p-6 transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/80 border-slate-700' 
          : 'bg-white/90 border-white/30'
      }`}>
        <p className={`text-center transition-colors duration-300 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          No complaints available.
        </p>
      </div>
    )
  }

  const totalPages = Math.ceil(complaints.length / perPage)
  const paginated = complaints.slice((page - 1) * perPage, page * perPage)

  return (
    <div className={`backdrop-blur-lg rounded-2xl shadow-xl border p-6 transition-all duration-300 hover:shadow-2xl ${
      darkMode 
        ? 'bg-slate-800/80 border-slate-700' 
        : 'bg-white/90 border-white/30'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          Recent Complaints
        </h2>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-[15px]">
          <thead>
            <tr className={`border-b text-sm transition-colors duration-300 ${
              darkMode 
                ? 'border-slate-600 text-slate-400' 
                : 'border-slate-200 text-slate-600'
            }`}>
              <th className="text-left py-3 px-4 font-semibold">No.</th>
              <th className="text-left py-3 px-4 font-semibold">Category</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((complaint, index) => {
              const statusStyle = statusConfig[complaint.status] || statusConfig.Assessed
              const categoryStyle = categoryColors[complaint.category] || categoryColors.Uncategorized
              const rowNumber = (page - 1) * perPage + index + 1

              return (
                <tr
                  key={complaint.id}
                  className={`border-b transition-all duration-200 group ${
                    darkMode 
                      ? 'border-slate-700 hover:bg-slate-700/40' 
                      : 'border-slate-100 hover:bg-slate-100/40'
                  }`}
                >
                  <td className={`py-4 px-4 font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {rowNumber}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                      darkMode ? categoryStyle.dark : categoryStyle.light
                    }`}>
                      {complaint.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                      darkMode ? statusStyle.darkBg : statusStyle.bg
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        darkMode ? statusStyle.darkDot : statusStyle.dot
                      }`}></span>
                      <span className={darkMode ? statusStyle.darkColor : statusStyle.color}>
                        {complaint.status}
                      </span>
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-sm transition-colors duration-300 ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {new Date(complaint.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={`flex items-center justify-between mt-6 pt-4 border-t transition-colors duration-300 ${
        darkMode ? 'border-slate-600' : 'border-slate-200'
      }`}>
        <div className={`text-sm transition-colors duration-300 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, complaints.length)} of {complaints.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={`p-2 rounded-md border transition-all duration-200 disabled:opacity-40 ${
              darkMode 
                ? 'bg-slate-800/80 border-slate-600 hover:bg-slate-700 hover:shadow-md text-slate-300' 
                : 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-md text-slate-600'
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                page === i + 1
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:shadow'
                    : 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 hover:shadow'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className={`p-2 rounded-md border transition-all duration-200 disabled:opacity-40 ${
              darkMode 
                ? 'bg-slate-800/80 border-slate-600 hover:bg-slate-700 hover:shadow-md text-slate-300' 
                : 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-md text-slate-600'
            }`}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}