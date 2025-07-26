'use client'

import { useState, useEffect } from 'react'
import usersData from './userData'
import UserFilter from './UserFilter'
import UserRow from './UserRow'
import UserModal from './UserModal'
import { Users, CheckCircle, AlertTriangle } from 'lucide-react'

export default function UsersPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [users, setUsers] = useState(usersData)
  const [filters, setFilters] = useState({ search: '', status: '' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 8

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

  const handleStatusToggle = (id, newStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    )
  }

  const filtered = users.filter((user) => {
    const matchSearch =
      filters.search === '' ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase())

    const matchStatus = filters.status === '' || user.status === filters.status

    return matchSearch && matchStatus
  })

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const activeUsers = users.filter((u) => u.status === 'Active').length
  const blockedUsers = users.filter((u) => u.status === 'Blocked').length

  return (
    <div className="min-h-screen space-y-8 px-4 sm:px-6 md:px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
              darkMode
                ? 'bg-gradient-to-r from-slate-200 to-blue-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent'
            }`}
          >
            User Management
          </h1>
          <p
            className={`transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Monitor and manage registered users
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          darkMode={darkMode}
        />
        <StatCard
          title="Blocked Users"
          value={blockedUsers}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
          darkMode={darkMode}
        />
      </div>

      {/* Filters */}
      <div
        className={`rounded-2xl shadow-xl p-6 border mb-8 transition-colors duration-300 ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}
      >
        <UserFilter filters={filters} setFilters={setFilters} darkMode={darkMode} />
      </div>

      {/* Table */}
      <div
        className={`rounded-2xl shadow-xl overflow-hidden border transition-colors duration-300 ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead
              className={`text-xs font-semibold uppercase ${
                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <tr>
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">User</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onView={() => setSelectedUser(user)}
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
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
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
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusChange={handleStatusToggle}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}

// StatCard component
function StatCard({ title, value, icon, color, darkMode }) {
  const bg = darkMode
    ? `bg-${color}-600/20 text-${color}-400`
    : `bg-${color}-100 text-${color}-600`
  const valueColor = darkMode ? `text-${color}-400` : `text-${color}-600`

  return (
    <div
      className={`rounded-2xl shadow-xl p-4 border transition-all duration-300 hover:scale-105 ${
        darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-xl ${bg}`}>{icon}</div>
        <div>
          <p className={`text-m font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}
