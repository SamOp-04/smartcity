'use client'
import { useState, useEffect } from 'react'
import UserFilter from './UserFilter'
import UserRow from './UserRow'
import UserModal from './UserModal'
import { Users, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { fetchUsersAlternative, updateUserStatus, getUserStats } from '../../../lib/userApi'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function UsersPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ search: '', status: '' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 })
  const [authChecked, setAuthChecked] = useState(false)
  const [isDarkModeInitialized, setIsDarkModeInitialized] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  const perPage = 8

  // Initialize dark mode - improved with error handling
  useEffect(() => {
    const initializeDarkMode = () => {
      try {
        if (typeof window === 'undefined') return

        const savedDarkMode = localStorage.getItem('darkMode')
        
        if (savedDarkMode !== null) {
          const isDark = savedDarkMode === 'true'
          setDarkMode(isDark)
        } else {
          const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          setDarkMode(systemPrefersDark)
          localStorage.setItem('darkMode', systemPrefersDark.toString())
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setDarkMode(systemPrefersDark)
      } finally {
        setIsDarkModeInitialized(true)
      }
    }

    initializeDarkMode()
  }, [])

  // Listen for storage changes (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'darkMode' && e.newValue !== null) {
        const newDark = e.newValue === 'true'
        setDarkMode(newDark)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Authentication check - consolidated
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Auth error:', userError)
          router.replace('/login')
          return
        }

        if (!user) {
          router.replace('/login')
          return
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, username')
          .eq('user_id', user.id)
          .single()
        
        if (profileError) {
          console.error('Profile error:', profileError)
          await supabase.auth.signOut()
          router.replace('/login')
          return
        }

        if (!profile || profile.role !== 'admin') {
          console.log('User does not have admin role')
          await supabase.auth.signOut()
          router.replace('/login')
          return
        }

        // User is authenticated and has admin role
        setAuthChecked(true)
      } catch (error) {
        console.error('Auth check error:', error)
        await supabase.auth.signOut()
        router.replace('/login')
      }
    }
    
    checkUser()
  }, [router, supabase])

  // Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setAuthChecked(false)
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  // Load users from Supabase
  const loadUsers = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const [usersData, statsData] = await Promise.all([
        fetchUsersAlternative(),
        getUserStats()
      ])
      
      // Transform the data to match expected format
      const transformedUsers = usersData.map(user => ({
        id: user.id,
        name: user.username || user.email?.split('@')[0] || 'Unknown User',
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
      setRefreshing(false)
    }
  }

  // Load users when auth is confirmed
  useEffect(() => {
    if (authChecked) {
      loadUsers()
    }
  }, [authChecked])

  const handleRefresh = () => {
    loadUsers(true)
  }

  const handleStatusToggle = async (id, newStatus) => {
    try {
      await updateUserStatus(id, newStatus)
      
      // Find the user being updated
      const userIndex = users.findIndex(u => u.id === id)
      if (userIndex === -1) return
      
      const oldUser = users[userIndex]
      const oldStatus = oldUser.status
      
      // Update local state
      const updatedUsers = [...users]
      updatedUsers[userIndex] = { ...oldUser, status: newStatus }
      setUsers(updatedUsers)
      
      // Update stats - more robust calculation
      setStats(prevStats => {
        const newStats = { ...prevStats }
        
        // Decrease count for old status
        const oldStatusKey = oldStatus.toLowerCase()
        if (newStats[oldStatusKey] !== undefined) {
          newStats[oldStatusKey] = Math.max(0, newStats[oldStatusKey] - 1)
        }
        
        // Increase count for new status
        const newStatusKey = newStatus.toLowerCase()
        if (newStats[newStatusKey] !== undefined) {
          newStats[newStatusKey] = (newStats[newStatusKey] || 0) + 1
        }
        
        return newStats
      })

      // Update selected user if it's the same one
      if (selectedUser?.id === id) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error('Error updating user status:', err)
      setError('Failed to update user status. Please try again.')
      
      // Optionally reload users to ensure consistency
      loadUsers(true)
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

  // Show loading until everything is initialized
  if (!isDarkModeInitialized || !authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  if (error && !users.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => loadUsers()}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-8 px-4 sm:px-6 md:px-6 py-6">
      {/* Error Banner */}
      {error && users.length > 0 && (
        <div className={`rounded-lg p-4 mb-6 ${
          darkMode ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="text-sm">{error}</p>
        </div>
      )}

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
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode 
              ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
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
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        Loading users...
                      </div>
                    ) : (
                      'No users found matching your filters.'
                    )}
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                page === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
              } ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                page === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
              } ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
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
            {value || 0}
          </p>
        </div>
      </div>
    </div>
  )
}