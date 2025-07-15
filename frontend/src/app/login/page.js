'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [typing, setTyping] = useState(false)
  const [passwordTimeout, setPasswordTimeout] = useState(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const router = useRouter()

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      localStorage.setItem('loggedIn', 'true')
      router.push('/dashboard')
    }
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-4">
  {/* Logo and Name */}
  <div className="flex items-center justify-center -mt-10">
    <img src="/logo.png" alt="SmartCity360 Logo" className="w-25 h-25 -mt-6" />
    <span className="text-2xl font-bold text-blue-600 -ml-2 -mt-6">SmartCity360</span>
  </div>


  <div className="bg-white shadow-lg hover:shadow-2xl transition duration-300 rounded-xl max-w-md w-full p-8">

        {/* Tabs */}
        <div className="flex justify-center space-x-6 mb-6 border-b border-gray-200">
          <button
            className={`pb-2 text-lg font-semibold ${activeTab === 'login' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`pb-2 text-lg font-semibold ${activeTab === 'signup' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          {activeTab === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
              <div className={`flex items-center border rounded-md px-3 py-2  ${errors.email ? 'border-red-500' : 'border-gray-500'}`}>
                <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full text-sm outline-none placeholder-gray-400 text-gray-700"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <div className={`flex items-center border rounded-md px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-500'}`}>
              <EnvelopeIcon className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full text-sm outline-none placeholder-gray-400 text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <div className={`flex items-center border rounded-md px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-500'}`}>
              <LockClosedIcon className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full text-sm outline-none placeholder-gray-400 text-gray-700"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Remember + Forgot */}
          {activeTab === 'login' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="w-4 h-4" />
                <label htmlFor="remember" className="text-sm text-gray-700">Remember me</label>
              </div>
              <Link href="#" className="text-[14px] text-blue-600 hover:underline">Forgot password?</Link>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
          >
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-4 text-[14px] text-gray-500">or continue with</span>
          <hr className="flex-grow border-gray-400" />
        </div>

        {/* Social Buttons */}
        <div className="flex justify-between gap-4 mt-6">
          <button className="w-full flex items-center justify-center border px-4 py-2 rounded-md text-sm text-gray-700">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
            Google
          </button>
          <button className="w-full flex items-center justify-center border px-4 py-2 rounded-md text-sm text-gray-700">
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5 mr-2" />
            Facebook
          </button>
        </div>

       
      </div>
       {/* Footer */}
        <p className="mt-6 text-center text-[14px] text-gray-400 tracking-wide">
          © 2025 SmartCity360. All rights reserved.
        </p>
    </div>
  )
}
