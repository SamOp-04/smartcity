'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ComplaintFilter from './ComplaintFilter'
import ComplaintRow from './ComplaintRow'
import ComplaintDetailsModal from './ComplaintDetailsModal'
import { fetchIssues, updateIssueStatus } from '../../../lib/issueApi'
import { ChartPieIcon } from '@heroicons/react/24/solid'

export default function ComplaintsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [darkMode, setDarkMode] = useState(false)
  const [filters, setFilters] = useState({ search: '', category: '', status: '', startDate: '', endDate: '' })
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [page, setPage] = useState(1)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false) // Add auth check state
  const [error, setError] = useState(null)
  const perPage = 10

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
        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        await supabase.auth.signOut()
        router.replace('/login')
      }
    }
    
    checkUser()
  }, [router, supabase])

  // Add auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

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

  const loadComplaints = async () => {
    try {
      setError(null)
      const data = await fetchIssues()

      console.log('Raw data from Supabase:', data)
      console.log('Data length:', data?.length)

      const transformedData = data.map((issue, index) => {
        if (index === 0) {
          console.log('Sample issue:', issue)
          console.log('User data:', issue.users)
          console.log('User display name:', issue.user_display_name)
        }

        return {
          internal_id: issue.id,
          no: index + 1,
          category: issue.category || issue.title,
          title: issue.title,
          description: issue.description || 'No description provided',
          status: issue.status || 'Assessed',
          date: issue.created_at ? new Date(issue.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          created_at: issue.created_at,
          image: issue.image_urls,
          image_url: issue.image_urls,
        }
      })

      console.log('Transformed data:', transformedData)
      setComplaints(transformedData)
    } catch (err) {
      console.error('Error loading complaints:', err)
      setError('Failed to load complaints. Please try again.')
    }
  }

  useEffect(() => {
    // Only load complaints after auth is checked and user is authenticated
    if (authChecked && !loading) {
      loadComplaints()
    }
  }, [authChecked, loading])

  const handleStatusUpdate = async (internal_id, newStatus) => {
    try {
      await updateIssueStatus(internal_id, newStatus)
      const updated = complaints.map(c => c.internal_id === internal_id ? { ...c, status: newStatus } : c)
      setComplaints(updated)
      if (selectedComplaint?.internal_id === internal_id) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const filtered = complaints.filter((c) => {
    const matchSearch = filters.search === '' ||
      c.no.toString() === filters.search ||
      c.description.toLowerCase().includes(filters.search.toLowerCase())

    const matchCategory = filters.category === '' || c.category === filters.category || c.title === filters.category
    const matchStatus = filters.status === '' || c.status === filters.status
    const matchStart = !filters.startDate || new Date(c.date) >= new Date(filters.startDate)
    const matchEnd = !filters.endDate || new Date(c.date) <= new Date(filters.endDate)

    return matchSearch && matchCategory && matchStatus && matchStart && matchEnd
  })

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  useEffect(() => {
    setPage(1)
  }, [filters])

  // Show loading screen while checking auth
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
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
            onClick={loadComplaints}
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
          <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
            darkMode
              ? 'bg-gradient-to-r from-slate-200 to-blue-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent'
          }`}>
            Issue Records
          </h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Monitor and manage your city&apos;s issues and services
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-sm font-medium ${
            darkMode ? 'bg-slate-800/50 text-slate-300 border border-slate-600' : 'bg-white text-gray-700 border border-gray-200'
          }`}>
            <ChartPieIcon className="h-5 w-5" />
            Total: {filtered.length}
          </div>

          <button
            onClick={loadComplaints}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-sm font-medium transition-colors hover:scale-105 ${
              darkMode
                ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
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
                <th className="px-4 py-4">No.</th>
                <th className="px-4 py-4">Title</th>
                <th className="px-4 py-4">Description</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map(complaint => (
                  <ComplaintRow
                    key={complaint.internal_id}
                    complaint={complaint}
                    onView={() => setSelectedComplaint(complaint)}
                    darkMode={darkMode}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={`text-center py-8 ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    No issues found matching your filters.
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
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
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
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md scale-105'
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
        )}
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