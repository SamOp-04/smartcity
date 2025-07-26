'use client'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, Camera } from 'lucide-react'

export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false)

  const profile = {
    name: 'Admin User',
    email: 'admin@smartcity360.com',
    phone: '+91 9876543210',
    role: 'System Administrator',
    location: 'Vadodara, Gujarat',
  }

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)

    const interval = setInterval(() => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true'
      if (newDarkMode !== darkMode) {
        setDarkMode(newDarkMode)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [darkMode])

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 `}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
        darkMode 
        ? 'bg-gradient-to-r from-slate-200 to-blue-400 bg-clip-text text-transparent'
        : 'bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent'
    }`}>
          My Profile
        </h1>
        <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Manage your account settings and preferences
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className={`lg:col-span-1 rounded-2xl shadow-xl overflow-hidden border ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`h-32 bg-gradient-to-r ${
            darkMode ? 'from-blue-600 to-purple-700' : 'from-blue-500 to-purple-600'
          }`} />
          <div className="relative px-6 pb-6">
            <div className="relative -mt-16 mb-4">
              <div className={`w-24 h-24 rounded-full mx-auto border-4 flex items-center justify-center ${
                darkMode ? 'bg-slate-700 border-slate-800' : 'bg-gray-100 border-white'
              }`}>
                <User className={`h-12 w-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
               <button
    className={`absolute bottom-0 right-1/2 translate-x-6 p-2 rounded-full shadow-lg hover:scale-105 ${
      darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
    }`}
  >
    <Camera className="h-4 w-4" />
  </button>
              </div>
            </div>
            <div className="text-center">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                {profile.name}
              </h2>
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {profile.role}
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                {profile.location}
              </p>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className={`lg:col-span-2 rounded-2xl shadow-xl border ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              Account Information
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Full Name */}
            <div className="flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Full Name</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{profile.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email Address</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{profile.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Phone Number</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{profile.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
