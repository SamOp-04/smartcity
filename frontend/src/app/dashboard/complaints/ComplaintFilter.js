import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

const statusOptions = ['', 'Assessed', 'In Progress', 'Resolved']
// You might want to fetch these from your database or define based on your common titles
const titleOptions = ['', 'Road Issues', 'Water Supply', 'Environment', 'Garbage Collection', 'Sanitation', 'Traffic', 'Street Lighting', 'Drainage', 'Other']

export default function ComplaintFilter({ filters, setFilters, darkMode }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ search: '', category: '', status: '', startDate: '', endDate: '' })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className={`rounded-2xl shadow-xl p-6 border transition-colors duration-300 ${
      darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <FunnelIcon className={`h-5 w-5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
        <h3 className={`text-lg font-semibold transition-colors duration-300 ${
          darkMode ? 'text-slate-200' : 'text-gray-800'
        }`}>
          Filter Issues
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`text-sm px-3 py-1 rounded-lg transition-colors hover:scale-105 ${
              darkMode 
                ? 'text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700' 
                : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
            darkMode ? 'text-slate-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search by user, ID, or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
              darkMode 
                ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder-slate-400 focus:bg-slate-700' 
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white'
            }`}
          />
        </div>

        {/* Category/Title Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className={`px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
            darkMode 
              ? 'bg-slate-700/50 border-slate-600 text-slate-200 focus:bg-slate-700' 
              : 'bg-gray-50 border-gray-200 text-gray-800 focus:bg-white'
          }`}
        >
          <option value="">All Categories</option>
          {titleOptions.slice(1).map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={`px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
            darkMode 
              ? 'bg-slate-700/50 border-slate-600 text-slate-200 focus:bg-slate-700' 
              : 'bg-gray-50 border-gray-200 text-gray-800 focus:bg-white'
          }`}
        >
          <option value="">All Statuses</option>
          {statusOptions.slice(1).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Start Date */}
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className={`px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
            darkMode 
              ? 'bg-slate-700/50 border-slate-600 text-slate-200 focus:bg-slate-700' 
              : 'bg-gray-50 border-gray-200 text-gray-800 focus:bg-white'
          }`}
          placeholder="Start Date"
        />

        {/* End Date */}
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className={`px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
            darkMode 
              ? 'bg-slate-700/50 border-slate-600 text-slate-200 focus:bg-slate-700' 
              : 'bg-gray-50 border-gray-200 text-gray-800 focus:bg-white'
          }`}
          placeholder="End Date"
        />
      </div>
    </div>
  )
}