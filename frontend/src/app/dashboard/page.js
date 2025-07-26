'use client'
import { useContext, useState, useEffect } from 'react'
import StatsCard from '../components/StatsCard'
import CategoryPieChart from '../components/CategoryPieChart'
import RecentComplaintTable from '../components/RecentComplaintTable'

const allComplaints = [
  { id: 1, user: 'Amit Kumar', category: 'Road', status: 'Pending', date: '2025-07-01' },
  { id: 2, user: 'Sara Jain', category: 'Water', status: 'Resolved', date: '2025-07-02' },
  { id: 3, user: 'Maya R', category: 'Electricity', status: 'In Progress', date: '2025-07-03' },
  { id: 4, user: 'Dev Patel', category: 'Garbage', status: 'Pending', date: '2025-07-04' },
  { id: 5, user: 'Lisa Ray', category: 'Water', status: 'Resolved', date: '2025-07-05' },
  { id: 6, user: 'Raj Singh', category: 'Road', status: 'In Progress', date: '2025-07-06' },
  { id: 7, user: 'Neha Joshi', category: 'Sanitation', status: 'Pending', date: '2025-07-07' },
  { id: 8, user: 'Vikram Verma', category: 'Electricity', status: 'Resolved', date: '2025-07-08' }
]

export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    
    // Listen for dark mode changes
    const handleStorageChange = () => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      setDarkMode(newDarkMode)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically for changes within the same tab
    const interval = setInterval(() => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      if (newDarkMode !== darkMode) {
        setDarkMode(newDarkMode)
      }
    }, 100)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [darkMode])

  const resolved = allComplaints.filter(c => c.status === 'Resolved').length
  const inProgress = allComplaints.filter(c => c.status === 'In Progress').length
  const pending = allComplaints.filter(c => c.status === 'Pending').length

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header with animated gradient */}
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
          Monitor and manage your city's complaints and services
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCard resolved={resolved} inProgress={inProgress} pending={pending} />
      </div>

      {/* Category Pie Chart - Full Width Card */}
      <div className="mb-8">
        <CategoryPieChart />
      </div>

      {/* Recent Complaints Table - Full Width Card */}
      <div>
        <RecentComplaintTable complaints={allComplaints} />
      </div>
    </div>
  )
}