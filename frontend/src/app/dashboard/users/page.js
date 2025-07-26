'use client'

import { useState, useEffect } from 'react'
import UserFilter from './UserFilter'
import UserRow from './UserRow'
import UserModal from './UserModal'
import { Users, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { fetchUsersAlternative, updateUserStatus, getUserStats } from '../../../lib/userApi'

export default function UsersPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ search: '', status: '' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 })
  const perPage = 8

  // Load users from Supabase
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [usersData, statsData] = await Promise.all([
        fetchUsersAlternative(),
        getUserStats()
      ])
      
      // Transform the data to match expected format
      const transformedUsers = usersData.map(user => ({
        id: user.id,
        name: user.full_name || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || 'No email',
        status: user.status || 'Active',
        role: user.role || 'User',
        created_at: user.created_at,
        updated_at: user.updated_at
      }))
      
      setUsers(transformedUsers)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading users:', err)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const handleStatusToggle = async (id, newStatus) => {
    try {
      await updateUserStatus(id, newStatus)
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      )
      
      // Update stats
      const updatedStats = { ...stats }
      const oldUser = users.find(u => u.id === id)
      if (oldUser) {
        updatedStats[oldUser.status.toLowerCase()]--
        updatedStats[newStatus.toLowerCase()]++
      }
      setStats(updatedStats)

      // Update selected user if it's the same one
      if (selectedUser?.id === id) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error('Error updating user status:', err)
      // You might want to show an error toast here
    }
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filters])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

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

        <button
          onClick={loadUsers}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-sm font-medium transition-colors hover:scale-105 ${
            darkMode 
              ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title="Active Users"
          value={stats.active}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          darkMode={darkMode}
        />
        <StatCard
          title="Blocked Users"
          value={stats.blocked}
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
              {paginated.length > 0 ? (
                paginated.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onView={() => setSelectedUser(user)}
                    darkMode={darkMode}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`text-center py-8 ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    pageNum === page
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                      : darkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
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
        )}
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
  const colorConfig = {
    blue: {
      bg: darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600',
      text: darkMode ? 'text-blue-400' : 'text-blue-600'
    },
    green: {
      bg: darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600',
      text: darkMode ? 'text-green-400' : 'text-green-600'
    },
    red: {
      bg: darkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-600',
      text: darkMode ? 'text-red-400' : 'text-red-600'
    }
  }

  const config = colorConfig[color] || colorConfig.blue

  return (
    <div
      className={`rounded-2xl shadow-xl p-4 border transition-all duration-300 hover:scale-105 ${
        darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-xl ${config.bg}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${config.text}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}