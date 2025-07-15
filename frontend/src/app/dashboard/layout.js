'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn')
    if (!loggedIn) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Sidebar handles its own mobile toggle */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 w-full min-h-screen p-4 sm:p-6 md:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
