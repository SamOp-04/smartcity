import { Search, Filter } from 'lucide-react'

export default function UserFilter({ filters, setFilters, darkMode }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ search: '', status: '' })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Filter className={`h-5 w-5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
        <h3 className={`text-lg font-semibold transition-colors duration-300 ${
          darkMode ? 'text-slate-200' : 'text-gray-800'
        }`}>
          Filter Users
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
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Search Users
          </label>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Filter by Status
          </label>
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`} />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-slate-700/50 border-slate-600 text-slate-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}