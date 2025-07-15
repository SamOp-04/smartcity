'use client'
import { EyeIcon } from '@heroicons/react/24/outline'

const statusColor = {
  'Resolved': 'text-green-600',
  'Pending': 'text-yellow-600',
  'In Progress': 'text-blue-600'
}

export default function ComplaintRow({ complaint, onView }) {
  return ( 
    <tr className="bg-white border-b hover:shadow-sm hover:bg-blue-100 transition  text-gray-800">

      <td className="px-3 py-2">{complaint.id}</td>
      <td className="px-3 py-2">{complaint.user}</td>
      <td className="px-3 py-2">{complaint.category}</td>
      <td className="px-3 py-2">{complaint.description}</td>
      <td className={`px-3 py-2 font-medium ${statusColor[complaint.status]}`}>
        {complaint.status}
      </td>
      <td className="px-3 py-2">{complaint.date}</td>
      <td className="px-3 py-2">
        <button
          onClick={onView}
          className="text-blue-600 hover:underline flex items-center text-sm"
        >
          <EyeIcon className="h-4 w-4 mr-1" /> View
        </button>
      </td>
    </tr>
  )
}
