'use client'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, Camera, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        setUser(user)
        
        if (user) {
          // Fetch additional profile data if you have a profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (!profileError && profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          // Fetch profile data for new user
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileData) {
            setProfile(profileData)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

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

  // Get user data with fallbacks
  const getUserData = () => {
    if (!user) return null
    
    return {
      name: profile?.full_name || profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email || 'No email',
      phone: profile?.phone || user.user_metadata?.phone || '+91 9876543210',
      role: profile?.role || 'User',
      location: profile?.location || 'Location not set',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
        darkMode ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className={`h-8 w-8 animate-spin mx-auto mb-4 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
        darkMode ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className={`h-16 w-16 mx-auto mb-4 ${
              darkMode ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <h2 className={`text-xl font-semibold mb-2 ${
              darkMode ? 'text-slate-200' : 'text-gray-800'
            }`}>
              Not Authenticated
            </h2>
            <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Please sign in to view your profile
            </p>
          </div>
        </div>
      </div>
    )
  }

  const userData = getUserData()

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
      darkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
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
              <div className={`w-24 h-24 rounded-full mx-auto border-4 flex items-center justify-center overflow-hidden ${
                darkMode ? 'bg-slate-700 border-slate-800' : 'bg-gray-100 border-white'
              }`}>
                {userData.avatar_url ? (
                 <Image
  src={userData.avatar_url || '/default-avatar.png'}  // fallback optional
  alt="Profile"
  width={100}     // Set appropriate pixel dimensions
  height={100}
  className="w-full h-full object-cover"
/>
                ) : (
                  <User className={`h-12 w-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                )}
                <button
                  className={`absolute bottom-0 right-1/2 translate-x-6 p-2 rounded-full shadow-lg hover:scale-105 transition-transform ${
                    darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-center">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                {userData.name}
              </h2>
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {userData.role}
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                {userData.location}
              </p>
              {user.email_confirmed_at && (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-2 ${
                  darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                }`}>
                  ✓ Verified
                </div>
              )}
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
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{userData.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email Address</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{userData.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Phone Number</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{userData.phone}</p>
              </div>
            </div>

            {/* User ID (for debugging) */}
            <div className="flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>User ID</p>
                <p className={`font-mono text-sm ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}