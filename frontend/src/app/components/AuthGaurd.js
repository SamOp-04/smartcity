// components/AuthGuard.js
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true
    let authSubscription = null

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          if (isMounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
            setInitialized(true)
          }
          return
        }

        if (session?.user) {
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, username, email')
            .eq('user_id', session.user.id)
            .single()

          if (isMounted) {
            setUser(session.user)
            setProfile(profileError ? null : profileData)
          }
        } else {
          if (isMounted) {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    // Set up auth state listener
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return
          
          console.log('Auth state changed:', event, session?.user?.id)
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Get user profile
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role, username, email')
                .eq('user_id', session.user.id)
                .single()

              if (isMounted) {
                setUser(session.user)
                setProfile(profileError ? null : profileData)
              }
            } catch (error) {
              console.error('Profile fetch error after sign in:', error)
              if (isMounted) {
                setUser(session.user)
                setProfile(null)
              }
            }
          } else if (event === 'SIGNED_OUT') {
            if (isMounted) {
              setUser(null)
              setProfile(null)
            }
          }
        }
      )
      
      authSubscription = subscription
    }

    initializeAuth()
    setupAuthListener()

    return () => {
      isMounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      // Use hard redirect to break any potential loops
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    initialized,
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user && !!profile,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Auth guard for protected routes
export function withAuth(WrappedComponent) {
return function AuthenticatedComponent(props) {
    const { user, profile, loading, initialized, isAdmin } = useAuth()
    const router = useRouter()
    const [redirecting, setRedirecting] = useState(false)

    useEffect(() => {
if (!initialized || loading || redirecting) return
if (!user || !profile || !isAdmin) {
        console.log('User not authenticated or not admin, redirecting to login')
        setRedirecting(true)
        setTimeout(() => {
        window.location.href = '/login'
        console.log('Redirected to login page')
        }, 100)
        return
}
    }, [user, profile, loading, initialized, isAdmin, router, redirecting])

    // Show loading while checking auth or redirecting
    if (!initialized || loading || redirecting || !user || !profile || !isAdmin) {
    return (
        <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        {redirecting && (
            <p className="mt-4 text-blue-600">Redirecting to login...</p>
        )}
        </div>
    )
    }

    return <WrappedComponent {...props} />
}
}

// Auth guard for login page (redirect if already authenticated)
export function withGuest(WrappedComponent) {
return function GuestComponent(props) {
    const { user, profile, loading, initialized, isAdmin } = useAuth()
    const [hasChecked, setHasChecked] = useState(false)

    useEffect(() => {
    if (!initialized || loading) return
      if (hasChecked) return // Prevent multiple checks

    setHasChecked(true)

      if (user && profile && isAdmin) {
        console.log('User already authenticated, redirecting to dashboard')
        const timeoutId = setTimeout(() => {
          next.replace('/dashboard')
        }, 200)

        return () => clearTimeout(timeoutId)
      }
    }, [user, profile, loading, initialized, isAdmin, hasChecked])
    if (user && profile && isAdmin && !hasChecked) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="mt-4 text-blue-600">Redirecting to dashboard...</p>
        </div>
      )
    }

    // Show the login component for non-authenticated users
    return <WrappedComponent {...props} />
  }
}