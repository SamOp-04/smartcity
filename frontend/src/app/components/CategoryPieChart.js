'use client'
import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// Define colors for different categories
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const CustomTooltip = ({ active, payload, label }) => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    
    const handleStorageChange = () => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      setDarkMode(newDarkMode)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
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

  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-lg border transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800 border-slate-700 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <p className="font-medium mb-1">{payload[0].name}</p>
        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Count: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }) => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    
    const handleStorageChange = () => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      setDarkMode(newDarkMode)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
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

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className={`text-sm font-medium transition-colors duration-300 ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CategoryPieChart({ issues = [] }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    
    const handleStorageChange = () => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      setDarkMode(newDarkMode)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
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

  // Process real data from issues prop
  const categoryData = issues.reduce((acc, issue) => {
    const category = issue.category || 'Uncategorized'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  // Convert to array format for recharts
  const data = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }))

  // If no data available, show empty state
  if (data.length === 0) {
    return (
      <div className={`rounded-2xl shadow-lg border transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm' 
          : 'bg-white/70 border-slate-200 backdrop-blur-sm'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-semibold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Complaints by Category
            </h3>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="h-80 flex items-center justify-center">
            <p className={`text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              No complaints data available
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl shadow-lg border transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm' 
        : 'bg-white/70 border-slate-200 backdrop-blur-sm'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Complaints by Category
          </h3>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                className="drop-shadow-sm"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}