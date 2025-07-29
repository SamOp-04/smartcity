// Updated ComplaintDetailsModal.js with robust image handling
'use client'
import { useState, useEffect } from 'react'
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
  const [status, setStatus] = useState(complaint?.status || '')
  const [message, setMessage] = useState('')
  const [imageError, setImageError] = useState(false)
  const [validImageUrl, setValidImageUrl] = useState(null)
  const [showFullImage, setShowFullImage] = useState(false)

  // Effect to validate and set image URL
  useEffect(() => {
    if (complaint) {
      // Get the image URL with multiple fallbacks
      const imageUrl = complaint.image_url ||
                      (complaint.image && Array.isArray(complaint.image) && complaint.image[0]) ||
                      complaint.image ||
                      null

      // Validate the URL
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        const cleanUrl = imageUrl.trim()
        setValidImageUrl(cleanUrl)
        setImageError(false)
      } else {
        setValidImageUrl(null)
      }
    }
  }, [complaint])

  if (!complaint) return null

  const handleSave = () => {
    onStatusUpdate(complaint.internal_id, status)
    setMessage('Status updated successfully!')
    setTimeout(() => {
      setMessage('')
      onClose()
    }, 1500)
  }

  const handleImageError = (e) => {
    console.error('Image failed to load:', validImageUrl)
    setImageError(true)
    e.preventDefault()
  }

  const handleImageClick = () => {
    setShowFullImage(true)
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
              {complaint.user || complaint.user_name || 'Anonymous User'}
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

        {/* Image Section - Only render if we have a valid URL and no error */}
        {validImageUrl && !imageError && (
          <div className="mb-6">
            <h3 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Attachment
            </h3>
            <div className={`rounded-xl overflow-hidden border transition-colors duration-300 cursor-pointer hover:shadow-lg ${
              darkMode ? 'border-slate-600' : 'border-gray-200'
            } shadow-lg`}>
              <div className="relative group" onClick={handleImageClick} style={{ cursor: 'pointer' }}>
                <Image
                  src={validImageUrl}
                  alt="Issue Image"
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={handleImageError}
                  onLoad={() => console.log('Image loaded successfully:', validImageUrl)}
                  unoptimized
                />
                {/* Click to expand overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Click to expand
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show placeholder if no valid image or error occurred */}
        {(!validImageUrl || imageError) && (
          <div className="mb-6">
            <h3 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Attachment
            </h3>
            <div className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-300 ${
              darkMode ? 'border-slate-600 text-slate-400' : 'border-gray-300 text-gray-500'
            }`}>
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">
                {imageError ? 'Failed to load image' : 'No image attached'}
              </p>
              {imageError && validImageUrl && (
                <button
                  onClick={() => {
                    setImageError(false)
                    console.log('Retrying image load:', validImageUrl)
                  }}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600 underline"
                >
                  Retry
                </button>
              )}
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

      {/* Full Image Modal */}
      {showFullImage && validImageUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] flex flex-col">
            {/* Close button for full image */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowFullImage(false)
              }}
              className="absolute -top-12 right-0 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Full size image */}
            <div className="relative">
              <Image
                src={validImageUrl}
                alt="Full size issue image"
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                unoptimized
              />
            </div>

            {/* Image info */}
            <div className="mt-4 text-center">
              <p className="text-white/80 text-sm">
                Issue #{complaint.no} - Click outside to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
