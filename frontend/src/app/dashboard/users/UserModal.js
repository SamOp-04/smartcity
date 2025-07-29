'use client'
import { useState } from 'react'
import { X, User, Mail, CheckCircle, AlertTriangle } from 'lucide-react'

export default function UserModal({ user, onClose, onStatusChange, darkMode }) {
  const [status, setStatus] = useState(user.status)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')

  const handleToggle = () => {
    const newStatus = status === 'Active' ? 'Blocked' : 'Active'
    setStatus(newStatus)
    onStatusChange(user.id, newStatus)
    setShowConfirm(false)
    setMessage(`User ${newStatus === 'Blocked' ? 'Blocked' : 'Unblocked'} Successfully`)
    setTimeout(() => {
      setMessage('')
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[80px] overflow-y-auto backdrop-blur-sm bg-black/40">
      <div className={`rounded-2xl shadow-2xl p-6 w-[90%] max-w-lg relative transition-colors duration-300 ${
        darkMode ? 'bg-slate-800/90 border border-slate-700 text-slate-200' : 'bg-white/95 border border-white/20 text-gray-800'
      } backdrop-blur-sm`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className={`absolute top-4 right-4 p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
            darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            User #{user.id}
          </h2>
          <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Registered user details
          </p>
        </div>

        {/* User Info */}
        <div className="space-y-4 text-[15px] leading-relaxed mb-6">
          {/* Full Name */}
          <div className="flex items-center">
            <User className={`h-5 w-5 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`font-semibold transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Name:
            </span>
            <span className={`ml-2 transition-colors duration-300 ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              {user.name}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center">
            <Mail className={`h-5 w-5 mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-semibold transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Email:
            </span>
            <span className={`ml-2 transition-colors duration-300 ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              {user.email}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center">
            {status === 'Active' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`font-semibold mr-2 transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Status:
            </span>
            <span className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors duration-300 ${
              status === 'Active'
                ? darkMode ? 'bg-green-700/20 text-green-400 border border-green-600'
                           : 'bg-green-100 text-green-600 border border-green-200'
                : darkMode ? 'bg-red-700/20 text-red-400 border border-red-600'
                           : 'bg-red-100 text-red-600 border border-red-200'
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* Toggle Action */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
              status === 'Active' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {status === 'Active' ? 'Block User' : 'Unblock User'}
          </button>
        ) : (
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm mb-4 transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Are you sure you want to {status === 'Active' ? 'block' : 'unblock'} this user?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  darkMode ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleToggle}
                className={`flex-1 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 ${
                  status === 'Active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium transition-all duration-300 ${
            darkMode ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-50 text-green-600 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
