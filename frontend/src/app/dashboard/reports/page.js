'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'
import {
  CheckCircle, Clock, AlertTriangle,
  TrendingUp, PieChart as PieIcon, RefreshCw,
  BarChart3, Users, Target, Calendar
} from 'lucide-react'
import { fetchIssues } from '../../../lib/issueApi'
import { useRouter } from 'next/navigation'

export default function ReportsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState('Daily')
  const [daily, setDaily] = useState([])
  const [weekly, setWeekly] = useState([])
  const [monthly, setMonthly] = useState([])
  const [complaintData, setComplaintData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Initialize dark mode after component mounts (prevents hydration issues)
  useEffect(() => {
    setMounted(true)
    
    const initializeDarkMode = () => {
      try {
        const savedDarkMode = localStorage.getItem('darkMode')
        
        if (savedDarkMode !== null) {
          setDarkMode(savedDarkMode === 'true')
        } else {
          // Use system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setDarkMode(systemPrefersDark)
          localStorage.setItem('darkMode', systemPrefersDark.toString())
        }
      } catch (error) {
        console.error('Error initializing dark mode:', error)
        setDarkMode(false) // Fallback to light mode
      }
    }

    initializeDarkMode()
  }, [])

  // Apply dark mode class to document
  useEffect(() => {
    if (!mounted) return
    
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (error) {
      console.error('Error applying dark mode:', error)
    }
  }, [darkMode, mounted])

  // Listen for dark mode changes from localStorage (cross-tab sync)
  useEffect(() => {
    if (!mounted) return

    const handleStorageChange = (e) => {
      if (e.key === 'darkMode') {
        setDarkMode(e.newValue === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [mounted])
  
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

  // Generate trend data from real complaints
  const generateTrendData = useCallback((data) => {
    // Daily data - last 7 days
    const dateMap = {}
    data.forEach((c) => {
      const date = c.date
      dateMap[date] = (dateMap[date] || 0) + 1
    })

    const sortedDaily = Object.entries(dateMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      }))

    setDaily(sortedDaily)

    // Weekly data - last 4 weeks
    const weeklyMap = {}
    const now = new Date()
    
    data.forEach((c) => {
      const issueDate = new Date(c.date)
      const weeksDiff = Math.floor((now - issueDate) / (7 * 24 * 60 * 60 * 1000))
      
      if (weeksDiff >= 0 && weeksDiff < 4) {
        const weekKey = `Week ${4 - weeksDiff}`
        weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1
      }
    })

    const weeklyData = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => ({
      date: week,
      count: weeklyMap[week] || 0
    }))

    setWeekly(weeklyData)

    // Monthly data - last 6 months
    const monthlyMap = {}
    data.forEach((c) => {
      const issueDate = new Date(c.date)
      const monthKey = issueDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1
    })

    const monthlyData = Object.entries(monthlyMap)
      .sort(([a], [b]) => new Date(a + ' 1') - new Date(b + ' 1'))
      .slice(-6)
      .map(([date, count]) => ({
        date,
        count
      }))

    setMonthly(monthlyData)
  }, [])

  // Load real data from Supabase
  const loadReportsData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const data = await fetchIssues()
      
      const transformedData = data.map(issue => ({
        id: issue.id,
        status: issue.status || 'Assessed',
        date: issue.created_at
          ? new Date(issue.created_at).toLocaleDateString('en-CA')
          : new Date().toLocaleDateString('en-CA'),
        category: issue.category || issue.title || 'Other'
      }))
      
      setComplaintData(transformedData)
      generateTrendData(transformedData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error loading reports data:', err)
      setError('Failed to load reports data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [generateTrendData])

  // Load data on component mount (only after auth is checked)
  useEffect(() => {
    if (authChecked) {
      loadReportsData()
    }
  }, [authChecked, loadReportsData])

  // Calculate statistics
  const statusCount = complaintData.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {})

  const total = complaintData.length
  const resolvedCount = statusCount['Resolved'] || 0
  const resolutionRate = total > 0 ? ((resolvedCount / total) * 100).toFixed(1) : 0

  const pieData = [
    { name: 'Resolved', value: statusCount['Resolved'] || 0 },
    { name: 'In Progress', value: statusCount['In Progress'] || 0 },
    { name: 'Assessed', value: statusCount['Assessed'] || 0 },
  ]

  const COLORS = {
    light: ['#10B981', '#3B82F6', '#F59E0B'],
    dark: ['#34D399', '#60A5FA', '#FBBF24']
  }

  const timeOptions = { Daily: daily, Weekly: weekly, Monthly: monthly }
  const currentColors = darkMode ? COLORS.dark : COLORS.light

  const handleRefresh = () => {
    loadReportsData(true)
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (loading && !authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading reports data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4 text-lg font-medium">{error}</p>
          <button 
            onClick={() => loadReportsData()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-slate-200 to-blue-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent'
            }`}>
              Reports & Analytics
            </h1>
            <p className={`transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Comprehensive insights into complaint patterns and resolution metrics
            </p>
            {lastUpdated && (
              <p className={`text-xs mt-1 transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode 
                ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Complaints */}
        <div className={`rounded-2xl shadow-xl p-6 border hover:scale-105 transition-all duration-300 ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'
            }`}>
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Total Complaints
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {total}
              </p>
            </div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className={`rounded-2xl shadow-xl p-6 border hover:scale-105 transition-all duration-300 ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Resolution Rate
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {resolutionRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Active Issues */}
        <div className={`rounded-2xl shadow-xl p-6 border hover:scale-105 transition-all duration-300 ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Active Issues
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {(statusCount['In Progress'] || 0) + (statusCount['Assessed'] || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className={`rounded-2xl shadow-xl p-6 border hover:scale-105 transition-all duration-300 ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-orange-600/20 text-orange-400' : 'bg-orange-100 text-orange-600'
            }`}>
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                This Week
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                {weekly.length > 0 ? weekly[weekly.length - 1]?.count || 0 : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {['Resolved', 'In Progress', 'Assessed'].map((status, idx) => {
          const Icon = status === 'Resolved' ? CheckCircle : status === 'In Progress' ? Clock : AlertTriangle
          const count = statusCount[status] || 0
          const colors = {
            'Resolved': darkMode ? ['bg-green-600/20', 'text-green-400'] : ['bg-green-100', 'text-green-600'],
            'In Progress': darkMode ? ['bg-blue-600/20', 'text-blue-400'] : ['bg-blue-100', 'text-blue-600'],
            'Assessed': darkMode ? ['bg-yellow-600/20', 'text-yellow-400'] : ['bg-yellow-100', 'text-yellow-600'],
          }

          return (
            <div key={idx} className={`rounded-2xl shadow-xl p-6 border hover:scale-105 transition-all duration-300 ${
              darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${colors[status][0]} ${colors[status][1]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {status}
                  </p>
                  <p className={`text-xl font-bold ${colors[status][1]}`}>
                    {count} of {total}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                    {total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart Section */}
        <div className={`rounded-2xl shadow-xl border ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b flex items-center gap-3 ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'
            }`}>
              <PieIcon className="h-5 w-5" />
            </div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              Status Distribution
            </h2>
          </div>
          <div className="p-6">
            {total > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: darkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      color: darkMode ? '#f1f5f9' : '#374151'
                    }}
                  />
                  <Legend wrapperStyle={{ color: darkMode ? '#cbd5e1' : '#374151' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                <PieIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data available for chart</p>
              </div>
            )}
          </div>
        </div>

        {/* Line Chart Section */}
        <div className={`rounded-2xl shadow-xl border ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b flex justify-between items-center ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                Complaint Trends
              </h2>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                darkMode 
                  ? 'bg-slate-700 text-slate-300 border-slate-600 focus:border-blue-400' 
                  : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <div className="p-6">
            {timeOptions[timeRange]?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeOptions[timeRange]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#6b7280' }}
                    axisLine={{ stroke: darkMode ? '#475569' : '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#6b7280' }}
                    axisLine={{ stroke: darkMode ? '#475569' : '#e5e7eb' }}
                  />
                  <Tooltip contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    border: darkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    color: darkMode ? '#f1f5f9' : '#374151'
                  }} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={darkMode ? '#60A5FA' : '#3B82F6'} 
                    strokeWidth={3}
                    dot={{ fill: darkMode ? '#60A5FA' : '#3B82F6', r: 4 }}
                    activeDot={{ r: 6, fill: darkMode ? '#60A5FA' : '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trend data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}