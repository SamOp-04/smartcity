import { EyeIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline'

export default function UserRow({ user, onView }) {
  return (
    <tr className="bg-white border-b hover:shadow-sm hover:bg-blue-100 transition text-gray-800">
      <td className="px-3 py-2">{user.id}</td>
      <td className="px-3 py-2">{user.name}</td>
      <td className="px-3 py-2">{user.email}</td>
      <td className="px-3 py-2">
        <span
          className={`text-sm font-medium ${
            user.status === 'Active' ? 'text-green-600' : 'text-red-600'
          }`}
        >

          {user.status}
        </span>
      </td>
      <td className="px-3 py-2 space-x-2 flex items-center">
        {/* View Button */}
        <button onClick={onView} className="text-blue-600 hover:underline text-sm">
          <EyeIcon className="w-5 h-5 inline" />
        </button>

        {/* Status Icon */}
        <span
          className={`inline-block ${
            user.status === 'Active' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {user.status === 'Active' ? (
            <LockOpenIcon className="w-5 h-5 pointer-events-none" aria-hidden="true" />
          ) : (
            <LockClosedIcon className="w-5 h-5 pointer-events-none" aria-hidden="true" />
          )}
        </span>
      </td>
    </tr>
  )
}
