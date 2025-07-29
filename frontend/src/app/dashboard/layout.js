'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'
import Sidebar from '../components/Sidebar'
import Image from 'next/image'
export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side
    setIsClient(true)

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
  }, [router])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
  }

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 border-b border-slate-200 flex items-center px-4">
          <div className="flex items-center ml-4">
            <div className="relative">

<Image
  src="/logo.png"
  alt="Logo"
  width={80}        // w-20 = 80px
  height={80}       // h-20 = 80px
  className="object-contain"
/>

            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              SmartCity360
            </span>
          </div>
        </div>
        <main className="flex-1 w-full min-h-screen pt-16 ml-16">
          <div className="p-4 sm:p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Top Bar with Logo and Hamburger */}
      <div className={`fixed top-0 left-0 right-0 h-16 backdrop-blur-md border-b z-[1001] flex items-center px-4 transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-900/90 border-slate-700' 
          : 'bg-white/90 border-slate-200'
      }`}>
        {/* Hamburger Menu */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            darkMode 
              ? 'hover:bg-slate-800 text-slate-300' 
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center ml-4">
          <div className="relative">
<Image
  src="/logo.png"
  alt="Logo"
  width={80}              // Required: actual width in pixels
  height={80}             // Required: actual height in pixels
  className="object-contain w-20 h-20"  // Optional styling
/>

          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            SmartCity360
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main content area */}
      <main 
        className={`
          flex-1 w-full min-h-screen transition-all duration-300 pt-16
          ${sidebarOpen ? 'ml-72' : 'ml-16'}
        `}
      >
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}