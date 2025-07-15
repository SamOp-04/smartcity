'use client'
import { UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const profile = {
    name: 'Admin User',
    email: 'admin@smartcity360.com',
    phone: '+91 9876543210',
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 w-full max-w-xl space-y-5 text-[15px] text-gray-800">
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Name:</span>
          <span>{profile.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <EnvelopeIcon className="h-5 w-5 text-purple-600" />
          <span className="font-medium">Email:</span>
          <span>{profile.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <PhoneIcon className="h-5 w-5 text-green-600" />
          <span className="font-medium">Phone:</span>
          <span>{profile.phone}</span>
        </div>
      </div>
    </div>
  )
}
