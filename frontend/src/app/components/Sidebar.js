'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: HomeIcon },
  { name: 'Complaints', path: '/dashboard/complaints', icon: DocumentTextIcon },
  { name: 'Users', path: '/dashboard/users', icon: UsersIcon },
  { name: 'Reports', path: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'Profile', path: '/dashboard/Profiles', icon: UserIcon }
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleNavigate = (path) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button (Mobile Only) */}
      <div className="md:hidden fixed top-4 left-4 z-[1001]">
        <button onClick={() => setIsOpen(!isOpen)}>
          <Bars3Icon className="w-7 h-7 text-blue-600" />
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white z-[1000] hidden md:flex flex-col justify-between
          border-r shadow-sm
        `}
      >
        <div>
          {/* Logo and Name */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-4">
            <img src="/logo.png" alt="Logo" className="w-25 h-25 object-contain -ml-6" />
            <span className="text-2xl font-bold text-blue-600 -ml-8">SmartCity360</span>
          </div>

          {/* Nav Items (start just below logo) */}
<ul className="pt-2">
  {navItems.map((item) => {
    const isActive = pathname === item.path
    return (
      <li key={item.name}>
        <button
          onClick={() => handleNavigate(item.path)}
          className={`w-full text-left transition ${
            isActive ? 'bg-blue-100' : 'hover:bg-blue-50'
          }`}
        >
          <div
            className={`flex items-center py-3 px-6 ${
              isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </div>
        </button>
      </li>
    )
  })}
</ul>

        </div>

        {/* Logout */}
        <div className="px-6 py-4">
          <button className="flex items-center w-full text-sm text-red-500 hover:text-red-600">
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Fullscreen Overlay */}
      {isOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-white z-[999]">
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Logo + Title */}
              <div className="px-6 pt-6 pb-4 flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                <span className="text-2xl font-bold text-blue-600">SmartCity360</span>
              </div>

              {/* Nav Items */}
              <ul className="pt-2">
  {navItems.map((item) => {
    const isActive = pathname === item.path
    return (
      <li key={item.name}>
        <button
          onClick={() => handleNavigate(item.path)}
          className={`w-full text-left transition ${
            isActive ? 'bg-blue-100' : 'hover:bg-blue-50'
          }`}
        >
          <div
            className={`flex items-center py-3 px-6 ${
              isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </div>
        </button>
      </li>
    )
  })}
</ul>

            </div>

            {/* Logout */}
            <div className="px-6 py-4">
              <button className="flex items-center w-full text-sm text-red-500 hover:text-red-600">
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
