'use client'
import React, { useState } from 'react'
import usersData from './userData'
import UserFilter from './UserFilter'
import UserRow from './UserRow'
import UserModal from './UserModal'  // make sure this import matches your filename

export default function UsersPage() {
  // 1. keep the full list in state so we can update it
  const [users, setUsers] = useState(usersData)

  const [filters, setFilters] = useState({ search: '', status: '' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 10

  // 2. define the toggle handler
  const handleStatusToggle = (id, newStatus) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: newStatus } : u
      )
    )
  }

  // filtering on the stateful `users` array
  const filtered = users.filter((user) => {
    const matchSearch =
      filters.search === '' ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase())
    const matchStatus = filters.status === '' || user.status === filters.status
    return matchSearch && matchStatus
  })

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>

      <div className="bg-white rounded-xl shadow-sm px-4 pt-4 pb-2 mb-4 border border-gray-100">
        <UserFilter filters={filters} setFilters={setFilters} />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
         <table className="w-full text-sm text-left border-separate border-spacing-y-2 min-w-[600px]">
          <thead className="text-xs uppercase text-gray-600 bg-gray-100">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onView={() => setSelectedUser(user)}
              />
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: Math.ceil(filtered.length / perPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-sm transition ${
                page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusChange={handleStatusToggle}
        />
      )}
    </div>
  )
}
