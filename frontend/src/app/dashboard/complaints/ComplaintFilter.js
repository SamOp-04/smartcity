'use client'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'


export default function ComplaintFilter({ filters, setFilters, darkMode }) {
  const update = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }
  

  const inputClass = `border px-4 py-3 rounded-xl text-sm w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
    darkMode 
      ? 'bg-slate-800/50 border-slate-600 text-slate-200 placeholder-slate-400 focus:bg-slate-700/50' 
      : 'bg-white/80 border-gray-200 text-gray-800 placeholder-gray-500 focus:bg-white'
  } backdrop-blur-sm shadow-sm hover:shadow-md`

  const labelClass = `text-sm font-semibold mb-2 ml-1 transition-colors duration-200 ${
    darkMode ? 'text-slate-300' : 'text-gray-700'
  }`

  return (
    <div className={`rounded-2xl shadow-xl p-6 mb-8 font-sans transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-800/50 border border-slate-700' 
        : 'bg-white/80 border border-white/20'
    } backdrop-blur-sm`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <FunnelIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-bold transition-colors duration-200 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Filter Complaints
          </h3>
          <p className={`text-sm transition-colors duration-200 ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Use filters to find specific complaints quickly
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Search */}
        <div className="flex flex-col">
          <label className={labelClass}>Search</label>
          <div className="relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
              darkMode ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by User or ID"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              className={`${inputClass} pl-12`}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className={labelClass}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value)}
            className={inputClass}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <label className={labelClass}>Category</label>
          <select
            value={filters.category}
            onChange={(e) => update('category', e.target.value)}
            className={inputClass}
          >
            <option value="">All Categories</option>
            <option value="Road">Road</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
            <option value="Sanitation">Sanitation</option>
          </select>
        </div>

        {/* From Date */}
        <div className="flex flex-col">
          <label className={labelClass}>From Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col">
          <label className={labelClass}>To Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.search || filters.status || filters.category || filters.startDate || filters.endDate) && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setFilters({ search: '', category: '', status: '', startDate: '', endDate: '' })}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            } shadow-sm hover:shadow-md`}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
    
  )
  
}


