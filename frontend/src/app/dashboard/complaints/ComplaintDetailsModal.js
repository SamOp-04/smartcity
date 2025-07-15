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

const statusIcons = {
  'Resolved': <CheckCircleIcon className="w-5 h-5 text-green-600 mr-1" />,
  'Pending': <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-1" />,
  'In Progress': <ClockIcon className="w-5 h-5 text-blue-500 mr-1" />
}

const statusOptions = ['Pending', 'In Progress', 'Resolved']

export default function ComplaintDetailsModal({ complaint, onClose, onStatusUpdate }) {
  if (!complaint) return null

  const [status, setStatus] = useState(complaint.status)
  const [message, setMessage] = useState('')

  const handleSave = () => {
  onStatusUpdate(complaint.id, status)
  setMessage('Status updated successfully!')
  setTimeout(() => {
    setMessage('')
    onClose()
  }, 1500)
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-lg relative text-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-1 text-gray-900">Complaint #{complaint.id}</h2>
        <p className="text-sm text-gray-500 mb-4">{complaint.date}</p>

        {/* Complaint Details */}
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p className="flex items-center">
            <UserIcon className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium">User:</span>&nbsp;{complaint.user}
          </p>

          <p className="flex items-center">
            <FolderIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="font-medium">Category:</span>&nbsp;{complaint.category}
          </p>

          {/* Editable Status */}
          <div className="flex items-center">
            {statusIcons[status]}
            <span className="font-medium mr-1">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="ml-2 px-2 py-1 border rounded-md text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <p className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 text-pink-500 mr-2" />
            <span className="font-medium">Description:</span>&nbsp;{complaint.description}
          </p>
        </div>

        {/* Image */}
        <div className="mt-5">
          <img
            src={complaint.image || '/example.jpg'}
            alt="Complaint Image"
            className="w-full h-56 object-cover rounded-md border border-gray-200 shadow-sm"
          />
        </div>

        {/* Save Button */}
        <button
  onClick={handleSave}
  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
>
  Save Changes
</button>


        {/* Confirmation Message */}
        {message && (
          <p className="text-center mt-3 text-green-600 text-sm">{message}</p>
        )}
      </div>
    </div>
  )
}
