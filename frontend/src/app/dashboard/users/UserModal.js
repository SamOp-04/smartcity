'use client'
import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import {
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function UserModal({ user, onClose, onStatusChange }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md relative text-gray-800">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-gray-900">User #{user.id}</h2>
        <p className="text-sm text-gray-500 mb-4">{user.name}</p>

        {/* Info Section */}
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p className="flex items-center">
            <UserIcon className="h-5 w-5 text-blue-600 mr-2 pointer-events-none" aria-hidden="true" />
            <span className="font-medium">Name:</span>&nbsp;{user.name}
          </p>
          <p className="flex items-center">
            <EnvelopeIcon className="h-5 w-5 text-purple-600 mr-2 pointer-events-none" aria-hidden="true" />
            <span className="font-medium">Email:</span>&nbsp;{user.email}
          </p>
          <p className="flex items-center">
            {status === 'Active' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 pointer-events-none" aria-hidden="true" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 pointer-events-none" aria-hidden="true" />
            )}
            <span className="font-medium">Status:</span>&nbsp;
            <span className={status === 'Active' ? 'text-green-600' : 'text-red-500'}>
              {status}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className={`mt-6 w-full ${
              status === 'Active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } text-white py-2 rounded-md text-sm font-medium`}
          >
            {status === 'Active' ? 'Block User' : 'Unblock User'}
          </button>
        ) : (
          <div className="mt-6 p-4 bg-gray-100 border rounded-md">
            <p className="text-sm text-gray-700 mb-3">
              Are you sure you want to {status === 'Active' ? 'block' : 'unblock'} this user?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 rounded-md bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleToggle}
                className={`px-4 py-1 rounded-md text-white text-sm ${
                  status === 'Active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Message */}
        {message && <p className="mt-4 text-center text-green-600 text-sm">{message}</p>}
      </div>
    </div>
  )
}
