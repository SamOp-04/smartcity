'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from './useAuth'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [typing, setTyping] = useState(false)
  const [passwordTimeout, setPasswordTimeout] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const { user, loading: authLoading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (authLoading) return
      if (user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('user_id', user.id)
            .single()
if (typing)
{}
          if (!profileError && profileData?.role === 'admin') {
            router.push('/dashboard')
          } else {
            await supabase.auth.signOut()
          }
        } catch (error) {
          console.error('Profile check error:', error)
          await supabase.auth.signOut()
        }
      }
    }
    checkUser()
  }, [user, authLoading, router, supabase])

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setShowPassword(true)
    setTyping(true)

    if (passwordTimeout) clearTimeout(passwordTimeout)
    const timeout = setTimeout(() => {
      setShowPassword(false)
      setTyping(false)
    }, 1000)
    setPasswordTimeout(timeout)
  }

  const validateForm = () => {
    const errs = {}
    if (activeTab === 'signup') {
      if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
        errs.fullName = 'Please enter your full name (first and last)'
      }
    }
    if (!email.includes('@') || !email.includes('.')) {
      errs.email = 'Invalid email format'
    }
    if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showMessage('Invalid email or password. Please try again.', 'error')
        } else if (error.message.includes('Email not confirmed')) {
          showMessage('Please check your email and click the confirmation link.', 'error')
        } else {
          showMessage(error.message, 'error')
        }
        return
      }
      if (data.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('user_id', data.user.id)
            .single()
          if (profileError) {
            console.error('Profile fetch error:', profileError)
            showMessage('Account profile not found. Please contact support.', 'error')
            await supabase.auth.signOut()
            return
          }
          if (!profileData || profileData.role !== 'admin') {
            showMessage('Access denied. This application is restricted to administrators only.', 'error')
            await supabase.auth.signOut()
            return
          }
          showMessage(`Welcome back, ${profileData.username || 'Admin'}! Redirecting...`, 'success')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } catch (profileErr) {
          console.error('Profile check failed:', profileErr)
          showMessage('Unable to verify account permissions. Please try again.', 'error')
          await supabase.auth.signOut()
        }
      }
    } catch (error) {
      showMessage('An unexpected error occurred. Please try again.', 'error')
      console.error('Login error:', error)
    }
  }

  const handleSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) {
        if (error.message.includes('User already registered')) {
          showMessage('An account with this email already exists. Please sign in instead.', 'error')
        } else {
          showMessage(error.message, 'error')
        }
        return
      }
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: data.user.id,
              username: fullName,
              email,
              role: 'admin',
              created_at: new Date().toISOString(),
            })
            .eq('user_id', data.user.id)
          if (profileError) {
            console.error('Profile creation error:', profileError)
          }
        } catch (profileErr) {
          console.error('Profile insertion failed:', profileErr)
        }
        if (data.user.email_confirmed_at) {
          showMessage('Admin account created successfully! Redirecting...', 'success')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          showMessage('Admin account created! Please check your email and click the confirmation link to complete your registration.', 'success')
          setActiveTab('login')
        }
      }
    } catch (error) {
      showMessage('An unexpected error occurred. Please try again.', 'error')
      console.error('Signup error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setMessage('')
    try {
      if (activeTab === 'login') {
        await handleLogin()
      } else {
        await handleSignup()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        showMessage(`Error signing in with ${provider}: ${error.message}`, 'error')
      }
    } catch (error) {
      showMessage(`An error occurred with ${provider} login.`, 'error')
      console.error('Social login error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-4">
      <div className="flex items-center justify-center -mt-10">
        <img src="/logo.png" alt="SmartCity360 Logo" className="w-25 h-25 -mt-6" />
        <span className="text-2xl font-bold text-blue-600 -ml-2 -mt-6">SmartCity360</span>
      </div>
      <div className="bg-white shadow-lg hover:shadow-2xl transition duration-300 rounded-xl max-w-md w-full p-8">
        {message && (
          <div className={`mb-4 p-3 rounded-md flex items-center ${
            messageType === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {messageType === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}
        <div className="flex justify-center space-x-6 mb-6 border-b border-gray-200">
          <button
            className={`pb-2 text-lg font-semibold ${activeTab === 'login' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => {
              setActiveTab('login')
              setErrors({})
              setMessage('')
            }}
          >
            Login
          </button>
          <button
            className={`pb-2 text-lg font-semibold ${activeTab === 'signup' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => {
              setActiveTab('signup')
              setErrors({})
              setMessage('')
            }}
          >
            Sign Up
          </button>
        </div>
        <div className="space-y-4">
          {activeTab === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
              <div className={`flex items-center border rounded-md px-3 py-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}>
                <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full text-sm outline-none placeholder-gray-400 text-gray-700"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <div className={`flex items-center border rounded-md px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}>
              <EnvelopeIcon className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full text-sm outline-none placeholder-gray-400 text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <div className={`flex items-center border rounded-md px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}>
              <LockClosedIcon className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full text-sm outline-none placeholder-gray-400 text-gray-700"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          {activeTab === 'login' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="w-4 h-4" />
                <label htmlFor="remember" className="text-sm text-gray-700">Remember me</label>
              </div>
              <Link href="#" className="text-[14px] text-blue-600 hover:underline">Forgot password?</Link>
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              activeTab === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-4 text-[14px] text-gray-500">or continue with</span>
          <hr className="flex-grow border-gray-400" />
        </div>
        <div className="flex justify-between gap-4 mt-6">
          <button
            className="w-full flex items-center justify-center border px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
            Google
          </button>
          <button
            className="w-full flex items-center justify-center border px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
          >
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5 mr-2" />
            Facebook
          </button>
        </div>
      </div>
      <p className="mt-6 text-center text-[14px] text-gray-400 tracking-wide">
        © 2025 SmartCity360. All rights reserved.
      </p>
    </div>
  )
}
