'use client'
import { useState } from 'react'

const statusColor = {
  Resolved: 'text-green-600',
  'In Progress': 'text-blue-600',
  Pending: 'text-yellow-600'
}

export default function RecentComplaintTable({ complaints }) {
  const [page, setPage] = useState(1)
  const perPage = 5
  const totalPages = Math.ceil(complaints.length / perPage)
  const paginated = complaints.slice((page - 1) * perPage, page * perPage)

  if (!complaints || !Array.isArray(complaints)) {
    return <p className="text-sm text-gray-400 px-4">No complaints available.</p>
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Complaints</h2>
      <table className="w-full text-sm text-left border-separate border-spacing-y-2 min-w-[600px]">
        <thead className="text-xs uppercase text-gray-600 bg-gray-100">
          <tr>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">User</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((complaint) => (
            <tr
              key={complaint.id}
              className="bg-white border-b hover:shadow-sm hover:bg-blue-100 transition text-gray-800"
            >
              <td className="px-3 py-2">{complaint.id}</td>
              <td className="px-3 py-2">{complaint.user}</td>
              <td className="px-3 py-2">{complaint.category}</td>
              <td className={`px-3 py-2 font-medium ${statusColor[complaint.status]}`}>
                {complaint.status}
              </td>
              <td className="px-3 py-2">{complaint.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination inside the card */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
