'use client'
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
  const resolved = allComplaints.filter(c => c.status === 'Resolved').length
  const inProgress = allComplaints.filter(c => c.status === 'In Progress').length
  const pending = allComplaints.filter(c => c.status === 'Pending').length

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      <StatsCard resolved={resolved} inProgress={inProgress} pending={pending} />

      <div className="mb-6">
        <CategoryPieChart />
      </div>

      <RecentComplaintTable complaints={allComplaints} />
    </div>
  )
}
