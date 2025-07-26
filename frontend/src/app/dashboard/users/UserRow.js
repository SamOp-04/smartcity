import { User, Eye, Lock, Unlock } from 'lucide-react'

// Status style mapping
const statusConfig = {
  Active: {
    light: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    dark: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
  },
  Blocked: {
    light: 'text-red-600 bg-red-50 border-red-200',
    dark: 'text-red-400 bg-red-900/30 border-red-800',
  }
}

export default function UserRow({ user, onView, darkMode }) {
  const statusStyle = statusConfig[user.status]?.[darkMode ? 'dark' : 'light'] ||
                      (darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-600 bg-gray-50 border-gray-200')

  // Generate initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <tr className={`border-b transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
      darkMode ? 'border-slate-700 hover:bg-slate-700/30' : 'border-gray-200 hover:bg-blue-50'
    }`}>
      {/* ID */}
      <td className={`px-4 py-4 font-mono ${darkMode ? 'text-slate-300' : 'text-gray-900'}`}>
        #{user.id.slice(0, 8)}
      </td>

      {/* User Name and Role */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {user.name && user.name !== 'Unknown User' ? getInitials(user.name) : (
              <User className={`h-5 w-5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
            )}
          </div>
          <div>
            <p className={`${darkMode ? 'text-slate-200' : 'text-gray-900'} font-medium`}>
              {user.name}
            </p>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm`}>
              {user.role}
            </p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className={`${darkMode ? 'text-slate-300' : 'text-gray-600'} px-4 py-4`}>
        <div className="max-w-xs truncate" title={user.email}>
          {user.email}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${statusStyle}`}>
          {user.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Lock / Unlock Icon */}
          <div 
            className={`p-2 rounded-lg ${
              user.status === 'Active'
                ? darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
                : darkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-600'
            }`}
            title={user.status === 'Active' ? 'User is Active' : 'User is Blocked'}
          >
            {user.status === 'Active' ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}