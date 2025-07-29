'use client'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, Camera, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [isDarkModeInitialized, setIsDarkModeInitialized] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Initialize dark mode - improved with error handling
  useEffect(() => {
    const initializeDarkMode = () => {
      try {
        if (typeof window === 'undefined') return

        const savedDarkMode = localStorage.getItem('darkMode')
        
        if (savedDarkMode !== null) {
          const isDark = savedDarkMode === 'true'
          setDarkMode(isDark)
        } else {
          const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          setDarkMode(systemPrefersDark)
          localStorage.setItem('darkMode', systemPrefersDark.toString())
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setDarkMode(systemPrefersDark)
      } finally {
        setIsDarkModeInitialized(true)
      }
    }

    initializeDarkMode()
  }, [])

  // Listen for storage changes (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'darkMode' && e.newValue !== null) {
        const newDark = e.newValue === 'true'
        setDarkMode(newDark)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Authentication and user data fetching - consolidated
  useEffect(() => {
    const getUser = async () => {
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
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profileError) {
          console.error('Profile error:', profileError)
          // Don't redirect immediately - user might not have a profile yet
          // Just log the error and continue with basic user data
        }

        // Check if user has admin role (if required)
        if (profileData && profileData.role !== 'admin') {
          console.log('User does not have admin role')
          await supabase.auth.signOut()
          router.replace('/login')
          return
        }

        // Set user and profile data
        setUser(user)
        setProfile(profileData)
        setAuthChecked(true)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  // Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setProfile(null)
        setAuthChecked(false)
        router.push('/login')
        return
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        
        // Fetch fresh profile data
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          if (!error && profileData) {
            setProfile(profileData)
          }
          setAuthChecked(true)
        } catch (error) {
          console.error('Error fetching profile on auth change:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  // Get user data with fallbacks
  const getUserData = () => {
    if (!user) return null
    
    return {
      name: profile?.username || profile?.name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      email: user.email || 'No email',
      phone: profile?.phone || user.user_metadata?.phone || '+91 9876543210',
      role: profile?.role || 'admin',
      location: profile?.location || 'Location not set',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url
    }
  }

  // Show loading until everything is initialized
  if (!isDarkModeInitialized || loading || !authChecked) {
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

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload functionality
    console.log('Avatar upload clicked')
  }

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
              <div className={`w-24 h-24 rounded-full mx-auto border-4 flex items-center justify-center overflow-hidden relative ${
                darkMode ? 'bg-slate-700 border-slate-800' : 'bg-gray-100 border-white'
              }`}>
                {userData.avatar_url ? (
                  <Image
                    src={userData.avatar_url}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default user icon if image fails to load
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                ) : null}
                <User 
                  className={`h-12 w-12 ${
                    userData.avatar_url ? 'hidden' : 'block'
                  } ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} 
                />
                <button
                  onClick={handleAvatarUpload}
                  className={`absolute bottom-0 right-1/2 translate-x-6 p-2 rounded-full shadow-lg hover:scale-105 transition-transform ${
                    darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  title="Change profile picture"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-center">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                {userData.name}
              </h2>
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} capitalize`}>
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
            <div className={`flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-900/20 to-blue-800/20' 
                : 'bg-gradient-to-r from-blue-50 to-blue-100'
            }`}>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Full Name</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{userData.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className={`flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-900/20 to-purple-800/20' 
                : 'bg-gradient-to-r from-purple-50 to-purple-100'
            }`}>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email Address</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{userData.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className={`flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-green-900/20 to-green-800/20' 
                : 'bg-gradient-to-r from-green-50 to-green-100'
            }`}>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Phone Number</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{userData.phone}</p>
              </div>
            </div>

            {/* User ID (for debugging/admin purposes) */}
            <div className={`flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-900/20 to-gray-800/20' 
                : 'bg-gradient-to-r from-gray-50 to-gray-100'
            }`}>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>User ID</p>
                <p className={`font-mono text-sm break-all ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                  {user.id}
                </p>
              </div>
            </div>

            {/* Account Created */}
            <div className={`flex items-center gap-4 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-indigo-900/20 to-indigo-800/20' 
                : 'bg-gradient-to-r from-indigo-50 to-indigo-100'
            }`}>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Member Since</p>
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}