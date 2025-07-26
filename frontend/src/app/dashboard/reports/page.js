'use client'

import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'
import {
  CheckCircle, Clock, AlertTriangle,
  TrendingUp, PieChart as PieIcon
} from 'lucide-react'

export default function ReportsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [timeRange, setTimeRange] = useState('Daily')
  const [daily, setDaily] = useState([])
  const [weekly, setWeekly] = useState([])
  const [monthly, setMonthly] = useState([])

  const complaintData = [
    { id: 1, status: 'Resolved', date: '2024-07-20', category: 'Water Supply' },
    { id: 2, status: 'In Progress', date: '2024-07-21', category: 'Road Maintenance' },
    { id: 3, status: 'Pending', date: '2024-07-22', category: 'Electricity' },
    { id: 4, status: 'Resolved', date: '2024-07-23', category: 'Water Supply' },
    { id: 5, status: 'In Progress', date: '2024-07-24', category: 'Waste Management' },
    { id: 6, status: 'Resolved', date: '2024-07-19', category: 'Street Lighting' },
    { id: 7, status: 'Pending', date: '2024-07-18', category: 'Traffic' },
    { id: 8, status: 'Resolved', date: '2024-07-17', category: 'Water Supply' },
  ]

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    const interval = setInterval(() => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      if (newDarkMode !== darkMode) setDarkMode(newDarkMode)
    }, 200)
    return () => clearInterval(interval)
  }, [darkMode])

  const statusCount = complaintData.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {})

  const total = complaintData.length

  const pieData = [
    { name: 'Resolved', value: statusCount['Resolved'] || 0 },
    { name: 'In Progress', value: statusCount['In Progress'] || 0 },
    { name: 'Pending', value: statusCount['Pending'] || 0 },
  ]

  const COLORS = {
    light: ['#10B981', '#3B82F6', '#F59E0B'],
    dark: ['#34D399', '#60A5FA', '#FBBF24']
  }

  useEffect(() => {
    const dateMap = {}
    complaintData.forEach((c) => {
      const date = c.date.slice(0, 10)
      dateMap[date] = (dateMap[date] || 0) + 1
    })

    const sorted = Object.entries(dateMap).map(([date, count]) => ({
      date: date.slice(-5),
      count,
    }))

    setDaily(sorted.slice(-7))
    setWeekly([
      { date: 'Week 1', count: 14 },
      { date: 'Week 2', count: 9 },
      { date: 'Week 3', count: 11 },
      { date: 'Week 4', count: 13 },
    ])
    setMonthly([
      { date: 'June', count: 32 },
      { date: 'July', count: 28 },
    ])
  }, [])

  const timeOptions = { Daily: daily, Weekly: weekly, Monthly: monthly }
  const currentColors = darkMode ? COLORS.dark : COLORS.light

  return (
    <div className="min-h-screen p-4 sm:p-6 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
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
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {['Resolved', 'In Progress', 'Pending'].map((status, idx) => {
          const Icon = status === 'Resolved' ? CheckCircle : status === 'In Progress' ? Clock : AlertTriangle
          const count = statusCount[status] || 0
          const colors = {
            'Resolved': darkMode ? ['bg-green-600/20', 'text-green-400'] : ['bg-green-100', 'text-green-600'],
            'In Progress': darkMode ? ['bg-blue-600/20', 'text-blue-400'] : ['bg-blue-100', 'text-blue-600'],
            'Pending': darkMode ? ['bg-yellow-600/20', 'text-yellow-400'] : ['bg-yellow-100', 'text-yellow-600'],
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
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pie Chart Section */}
      <div className="mb-8">
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
            <ResponsiveContainer width="100%" height={280}>
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
          </div>
        </div>
      </div>

      {/* Line Chart Section */}
      <div className="mb-8">
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
              className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                darkMode 
                  ? 'bg-slate-700 text-slate-300 border-slate-600 focus:border-blue-400' 
                  : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'
              }`}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeOptions[timeRange]}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e5e7eb'} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#6b7280' }} />
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
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
