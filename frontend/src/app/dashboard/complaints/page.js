'use client'
import { useState } from 'react'
import ComplaintFilter from './ComplaintFilter'
import ComplaintRow from './ComplaintRow'
import ComplaintDetailsModal from './ComplaintDetailsModal'
import complaintsData from './ComplaintData'

export default function ComplaintsPage() {
  const [filters, setFilters] = useState({ search: '', category: '', status: '', startDate: '', endDate: '' })
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [page, setPage] = useState(1)
  const [complaints, setComplaints] = useState(complaintsData)
  const perPage = 10

 const handleStatusUpdate = (id, newStatus) => {
  const updated = complaints.map((c) =>
    c.id === id ? { ...c, status: newStatus } : c
  )
  setComplaints(updated)

  // ✅ Also update the selected complaint in modal
  if (selectedComplaint && selectedComplaint.id === id) {
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

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen font-sans relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Complaints Management</h1>

      <ComplaintFilter filters={filters} setFilters={setFilters} />

      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm text-left border-separate border-spacing-y-2 min-w-[600px]">
          <thead className="text-xs uppercase text-gray-600 bg-gray-100">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((complaint) => (
              <ComplaintRow key={complaint.id} complaint={complaint} onView={() => setSelectedComplaint(complaint)} />
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: Math.ceil(filtered.length / perPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-sm transition ${
                page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {selectedComplaint && (
  <ComplaintDetailsModal
    complaint={selectedComplaint}
    onClose={() => setSelectedComplaint(null)}
    onStatusUpdate={handleStatusUpdate}
  />

      )}
    </div>
  )
}
