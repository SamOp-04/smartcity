'use client'
import { useState, useEffect, useRef } from 'react'
import StatsCard from '../components/StatsCard'
import CategoryPieChart from '../components/CategoryPieChart'
import RecentComplaintTable from '../components/RecentComplaintTable'
import { fetchIssues } from '../../lib/issueApi'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDarkModeInitialized, setIsDarkModeInitialized] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const darkRef = useRef(darkMode)
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
    darkRef.current = darkMode
  }, [darkMode])

  // Initialize dark mode based on system preference or localStorage
  useEffect(() => {
    const initializeDarkMode = () => {
      const savedDarkMode = localStorage.getItem('darkMode')
      
      if (savedDarkMode !== null) {
        // Use saved preference
        const isDark = savedDarkMode === 'true'
        setDarkMode(isDark)
      } else {
        // Use system preference
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setDarkMode(systemPrefersDark)
        // Save the system preference to localStorage for future visits
        localStorage.setItem('darkMode', systemPrefersDark.toString())
      }
      
      setIsDarkModeInitialized(true)
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeDarkMode()
    }
  }, [])

  // Listen for system dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e) => {
      // Only apply system preference if user hasn't manually set a preference
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode === null) {
        setDarkMode(e.matches)
        localStorage.setItem('darkMode', e.matches.toString())
      }
    }

    mediaQuery.addListener(handleSystemThemeChange)
    return () => mediaQuery.removeListener(handleSystemThemeChange)
  }, [])

  // Listen for storage changes (when dark mode is changed in other tabs)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'darkMode') {
        const newDark = e.newValue === 'true'
        setDarkMode(newDark)
        console.log('Dark mode changed via storage:', newDark)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Polling for dark mode changes (for same-tab updates)
  useEffect(() => {
    const interval = setInterval(() => {
      const newDark = localStorage.getItem('darkMode') === 'true'
      if (newDark !== darkRef.current) {
        setDarkMode(newDark)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        if (error || !currentUser) {
          router.push('/login')
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', currentUser.id)
          .single()

        if (profileError || profileData?.role !== 'admin') {
          router.push('/login')
        }
      } catch (err) {
        console.error('Unexpected error in auth check:', err)
        router.push('/login')
      }
    }
    checkUser()
  }, [router, supabase])

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true)
        const data = await fetchIssues()
        setIssues(data || [])
        setError(null)
      } catch (err) {
        console.error('Failed to fetch issues:', err)
        setError('Failed to load issues. Please try again.')
        setIssues([])
      } finally {
        setLoading(false)
      }
    }
    loadIssues()
  }, [])

  const resolved = issues?.filter(issue => issue.status === 'Resolved')?.length || 0
  const inProgress = issues?.filter(issue => issue.status === 'In Progress')?.length || 0
  const assessed = issues?.filter(issue => issue.status === 'Assessed')?.length || 0

  const transformedIssues = issues?.map(issue => ({
    id: issue.id,
    user: issue.user_name || issue.user_email || issue.created_by || 'Unknown User',
    category: issue.category || 'Uncategorized',
    status: issue.status || 'Assessed',
    date: issue.created_at ? new Date(issue.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    title: issue.title || 'No Title',
    description: issue.description || '',
    priority: issue.priority || 'Medium',
    assigned_to: issue.assigned_to || null,
    resolved_at: issue.resolved_at || null,
    ...issue
  })) || []

  // Show loading until dark mode is initialized
  if (!isDarkModeInitialized || loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className={`text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className={`text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          <div className="mb-4">
            <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
          darkMode
            ? 'bg-gradient-to-r from-slate-200 via-blue-400 to-purple-400 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 bg-clip-text text-transparent'
        }`}>
          Dashboard Overview
        </h1>
        <p className={`transition-colors duration-300 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Monitor and manage your city&apos;s complaints and services
        </p>
      </div>
      <div className="mb-8">
        <StatsCard resolved={resolved} inProgress={inProgress} assessed={assessed} />
      </div>
      <div className="mb-8">
        <CategoryPieChart issues={transformedIssues} />
      </div>
      <div>
        <RecentComplaintTable
          complaints={transformedIssues}
          onStatusUpdate={async (id, status) => {
            try {
              const { updateIssueStatus } = await import('../../lib/issueApi')
              await updateIssueStatus(id, status)
              const updatedIssues = await fetchIssues()
              setIssues(updatedIssues || [])
            } catch (err) {
              console.error('Failed to update issue status:', err)
              setError('Failed to update issue status')
            }
          }}
        />
      </div>
    </div>
  )
}