export default function UserFilter({ filters, setFilters }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 text-gray-800">
      {/* Search Section */}
      <div className="flex flex-col w-full sm:w-2/3">
        <label className="text-s font-medium mb-1 text-gray-700">Search</label>
        <input
          type="text"
          placeholder="Enter name or email"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3 py-2 rounded-md border text-sm text-gray-800 font-normal placeholder-gray-500"
        />
      </div>

      {/* Filter Section */}
      <div className="flex flex-col w-full sm:w-1/3">
        <label className="text-s font-medium mb-1 text-gray-700">Filter by Status</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 rounded-md border text-sm bg-white text-gray-800 font-normal"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>
    </div>
  )
}
