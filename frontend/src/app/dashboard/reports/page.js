'use client'
import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'
import complaintData from '../complaints/ComplaintData'
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('Daily')
  const [daily, setDaily] = useState([])
  const [weekly, setWeekly] = useState([])
  const [monthly, setMonthly] = useState([])

  const statusCount = complaintData.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {})

  const pieData = [
    { name: 'Resolved', value: statusCount['Resolved'] || 0 },
    { name: 'In Progress', value: statusCount['In Progress'] || 0 },
    { name: 'Pending', value: statusCount['Pending'] || 0 },
  ]

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B']

  useEffect(() => {
    const dateMap = {}
    complaintData.forEach((c) => {
      const date = c.date.slice(0, 10)
      dateMap[date] = (dateMap[date] || 0) + 1
    })

    const sorted = Object.entries(dateMap).map(([date, count]) => ({
      date,
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
      { date: 'June', count: 12 },
      { date: 'July', count: 8 },
    ])
  }, [])

  const timeOptions = {
    Daily: daily,
    Weekly: weekly,
    Monthly: monthly,
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Complaint Statistics</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4 flex items-center gap-4">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-m text-gray-700">Resolved</p>
            <p className="text-xl font-semibold text-green-700">{statusCount['Resolved'] || 0}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex items-center gap-4">
          <ClockIcon className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-m text-gray-700">In Progress</p>
            <p className="text-xl font-semibold text-blue-600">{statusCount['In Progress'] || 0}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex items-center gap-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          <div>
            <p className="text-m text-gray-700">Pending</p>
            <p className="text-xl font-semibold text-yellow-600">{statusCount['Pending'] || 0}</p>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-black">Complaints by Status</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">Complaints Over Time</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-500 rounded px-2 py-1 text-sm text-black"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
       <LineChart data={timeOptions[timeRange]}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis
    dataKey="date"
    tick={{ fontSize: 13, fill: '#000000' }}
    axisLine={{ stroke: '#8884d8' }}
    tickLine={{ stroke: '#8884d8' }}
  />
  <YAxis
    tick={{ fontSize: 13, fill: '#000000' }}
    axisLine={{ stroke: '#8884d8' }}
    tickLine={{ stroke: '#8884d8' }}
  />
  <Tooltip
    contentStyle={{ fontSize: '13px', color: '#000' }}
    labelStyle={{ fontSize: '13px', color: '#000' }}
    itemStyle={{ fontSize: '13px', color: '#000' }}
  />
  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
</LineChart>

        </ResponsiveContainer>
      </div>
    </div>
  )
}
