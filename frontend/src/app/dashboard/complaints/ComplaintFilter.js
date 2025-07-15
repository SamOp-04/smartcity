'use client'
import { useEffect } from 'react'

export default function ComplaintFilter({ filters, setFilters }) {
  const update = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 font-sans text-gray-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="flex flex-col">
          <label className="text-s font-medium text-gray-700 mb-1 ml-1">Search</label>
          <input
            type="text"
            placeholder="Search by User or ID"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="border px-3 py-2 rounded-md text-sm w-full placeholder-gray-500 font-normal"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="text-s font-medium text-gray-700 mb-1 ml-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value)}
            className="border px-3 py-2 rounded-md text-sm w-full font-normal placeholder-gray-500"
          >
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Resolved</option>
            <option>In Progress</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <label className="text-s font-medium text-gray-700 mb-1 ml-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => update('category', e.target.value)}
            className="border px-3 py-2 rounded-md text-sm w-full font-normal placeholder-gray-500"
          >
            <option value="">All Categories</option>
            <option>Road</option>
            <option>Water</option>
            <option>Electricity</option>
            <option>Sanitation</option>
          </select>
        </div>

        {/* From Date */}
        <div className="flex flex-col">
          <label className="text-s font-medium text-gray-700 mb-1 ml-1">From Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            placeholder="dd-mm-yyyy"
            className="border px-3 py-2 rounded-md text-sm w-full font-normal placeholder-gray-500"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col">
          <label className="text-s font-medium text-gray-700 mb-1 ml-1">To Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            placeholder="dd-mm-yyyy"
            className="border px-3 py-2 rounded-md text-sm w-full font-normal placeholder-gray-500"
          />
        </div>
      </div>
    </div>
  )
}
