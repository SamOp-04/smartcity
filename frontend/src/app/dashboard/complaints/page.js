'use client'

import { useState, useEffect } from 'react'
import ComplaintFilter from './ComplaintFilter'
import ComplaintRow from './ComplaintRow'
import ComplaintDetailsModal from './ComplaintDetailsModal'
import complaintsData from './ComplaintData'
import { ChartPieIcon } from '@heroicons/react/24/solid'

export default function ComplaintsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [filters, setFilters] = useState({ search: '', category: '', status: '', startDate: '', endDate: '' })
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [page, setPage] = useState(1)
  const [complaints, setComplaints] = useState(complaintsData)
  const perPage = 10

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)

    const interval = setInterval(() => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      if (newDarkMode !== darkMode) {
        setDarkMode(newDarkMode)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [darkMode])

  const handleStatusUpdate = (id, newStatus) => {
    const updated = complaints.map(c => c.id === id ? { ...c, status: newStatus } : c)
    setComplaints(updated)

    if (selectedComplaint?.id === id) {
      setSelectedComplaint(prev => ({ ...prev, status: newStatus }))
    }
  }

  const filtered = complaints.filter((c) => {
    const matchSearch = filters.search === '' || c.user.toLowerCase().includes(filters.search.toLowerCase()) || c.id.toString() === filters.search
    const matchCategory = filters.category === '' || c.category === filters.category
    const matchStatus = filters.status === '' || c.status === filters.status
    const matchStart = !filters.startDate || new Date(c.date) >= new Date(filters.startDate)
    const matchEnd = !filters.endDate || new Date(c.date) <= new Date(filters.endDate)
    return matchSearch && matchCategory && matchStatus && matchStart && matchEnd
  })

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  return (
    <div className="min-h-screen space-y-8 px-4 sm:px-6 md:px-6 py-6">

  {/* Header */}
<div className="flex justify-between items-center mb-8">
  <div>
    <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-r from-slate-200 to-blue-400 bg-clip-text text-transparent'
        : 'bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent'
    }`}>
      Complaint Records
    </h1>
    <p className={`transition-colors duration-300 ${
      darkMode ? 'text-slate-300' : 'text-slate-600'
    }`}>
      Monitor and manage your city's complaints and services
    </p>
  </div>

  <div className="flex items-center gap-4">
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-sm font-medium ${
      darkMode ? 'bg-slate-800/50 text-slate-300 border border-slate-600' : 'bg-white text-gray-700 border border-gray-200'
    }`}>
      <ChartPieIcon className="h-5 w-5" />
      Total: {filtered.length}
    </div>
  </div>
</div>


      {/* Filters */}
      <ComplaintFilter filters={filters} setFilters={setFilters} darkMode={darkMode} />

      {/* Table */}
      <div className={`rounded-2xl shadow-xl overflow-hidden border transition-colors duration-300 ${
        darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className={`text-xs font-semibold uppercase ${
              darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>
              <tr>
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">User</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Description</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(complaint => (
                <ComplaintRow
                  key={complaint.id}
                  complaint={complaint}
                  onView={() => setSelectedComplaint(complaint)}
                  darkMode={darkMode}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              page === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 transition'
            } ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800'}`}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                i + 1 === page
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md scale-105'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              page === totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 transition'
            } ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800'}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onStatusUpdate={handleStatusUpdate}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}
