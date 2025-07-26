'use client'
import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import {
  UserIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
const statusIcons = {
  'Resolved': <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />,
  'Assessed': <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-1" />,
  'In Progress': <ClockIcon className="w-5 h-5 text-blue-500 mr-1" />
}

const statusOptions = ['Assessed', 'In Progress', 'Resolved']

export default function ComplaintDetailsModal({ complaint, onClose, onStatusUpdate, darkMode }) {
  // ✅ Move hooks to the top, default safely if complaint is null
  const [status, setStatus] = useState(complaint?.status || '')
  const [message, setMessage] = useState('')

  if (!complaint) return null

  const handleSave = () => {
    onStatusUpdate(complaint.internal_id, status)
    setMessage('Status updated successfully!')
    setTimeout(() => {
      setMessage('')
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[80px] overflow-y-auto backdrop-blur-sm bg-black/40">
      <div className={`rounded-2xl shadow-2xl p-6 w-[90%] max-w-lg relative transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/90 border border-slate-700 text-slate-200' 
          : 'bg-white/95 border border-white/20 text-gray-800'
      } backdrop-blur-sm`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
            darkMode 
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' 
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Issue #{complaint.no}
          </h2>
          <p className={`text-sm transition-colors duration-300 ${
            darkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            {new Date(complaint.created_at || complaint.date).toLocaleDateString()}
          </p>
        </div>

        {/* Issue Details */}
        <div className="space-y-4 text-[15px] leading-relaxed mb-6">
          <div className="flex items-center">
            <UserIcon className={`h-5 w-5 mr-3 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            
            <span className={`ml-2 transition-colors duration-300 ${
              darkMode ? 'text-slate-200' : 'text-gray-800'
            }`}>
              {complaint.user || complaint.user_name}
            </span>
          </div>

          <div className="flex items-center">
            <FolderIcon className={`h-5 w-5 mr-3 ${
              darkMode ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
            <span className={`font-semibold transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Title:
            </span>
            <span className={`ml-2 px-2 py-1 rounded-lg text-sm font-medium transition-colors duration-300 ${
              darkMode 
                ? 'bg-slate-700 text-slate-200 border border-slate-600' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {complaint.title}
            </span>
          </div>

          {/* Editable Status */}
          <div className="flex items-center">
            {statusIcons[status]}
            <span className={`font-semibold mr-3 transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Status:
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`px-3 py-2 border rounded-xl text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 focus:bg-slate-600' 
                  : 'bg-white border-gray-200 text-gray-800 focus:bg-gray-50'
              }`}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start">
            <DocumentTextIcon className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
              darkMode ? 'text-pink-400' : 'text-pink-500'
            }`} />
            <div className="flex-1">
              <span className={`font-semibold transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Description:
              </span>
              <p className={`mt-1 leading-relaxed transition-colors duration-300 ${
                darkMode ? 'text-slate-200' : 'text-gray-800'
              }`}>
                {complaint.description}
              </p>
            </div>
          </div>
        </div>

        {/* Image */}
        {(complaint.image || complaint.image_url) && (
          <div className="mb-6">
            <h3 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Attachment
            </h3>
            <div className={`rounded-xl overflow-hidden border transition-colors duration-300 ${
              darkMode ? 'border-slate-600' : 'border-gray-200'
            } shadow-lg`}>
              <Image
  src={complaint.image || complaint.image_url || '/example.jpg'}
  alt="Issue Image"
  width={600} // or desired width
  height={300} // or desired height
  className="w-full h-48 object-cover"
  unoptimized // optional: disable optimization for dynamic URLs if needed
/>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          }`}
        >
          Save Changes
        </button>

        {/* Confirmation Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium transition-all duration-300 ${
            darkMode 
              ? 'bg-green-900/30 text-green-400 border border-green-800' 
              : 'bg-green-50 text-green-600 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}