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
  const [authChecked, setAuthChecked] = useState(false) // Added missing state
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Authentication check - consolidated into single useEffect
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
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

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
        // Fallback to system preference if localStorage fails
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setDarkMode(systemPrefersDark)
      } finally {
        setIsDarkModeInitialized(true)
      }
    }

    initializeDarkMode()
  }, [])

  // Listen for system dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e) => {
      try {
        const savedDarkMode = localStorage.getItem('darkMode')
        if (savedDarkMode === null) {
          setDarkMode(e.matches)
          localStorage.setItem('darkMode', e.matches.toString())
        }
      } catch (error) {
        console.error('Error handling system theme change:', error)
        setDarkMode(e.matches)
      }
    }

    mediaQuery.addListener(handleSystemThemeChange)
    return () => mediaQuery.removeListener(handleSystemThemeChange)
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

  // Load issues data
  useEffect(() => {
    const loadIssues = async () => {
      if (!authChecked) return // Wait for auth check to complete

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
  }, [authChecked])

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

  // Show loading until everything is initialized
  if (!isDarkModeInitialized || !authChecked || loading) {
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

  const handleStatusUpdate = async (id, status) => {
    try {
      const { updateIssueStatus } = await import('../../lib/issueApi')
      await updateIssueStatus(id, status)
      const updatedIssues = await fetchIssues()
      setIssues(updatedIssues || [])
    } catch (err) {
      console.error('Failed to update issue status:', err)
      setError('Failed to update issue status')
    }
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
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  )
}