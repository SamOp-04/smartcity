'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline'

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: HomeIcon },
  { name: 'Complaints', path: '/dashboard/complaints', icon: DocumentTextIcon },
  { name: 'Users', path: '/dashboard/users', icon: UsersIcon },
  { name: 'Reports', path: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'Profile', path: '/dashboard/Profiles', icon: UserIcon }
]

export default function Sidebar({ isOpen, setIsOpen, darkMode, toggleDarkMode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Close mobile sidebar on route change
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // On desktop, don't auto-close sidebar
        return
      }
      setIsOpen(false)
    }
    
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pathname, setIsOpen])

  const handleNavigate = (path) => {
    router.push(path)
    // Only close on mobile
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        return
      }

      // Clear any local storage data if needed
      localStorage.removeItem('darkMode') // Optional: you might want to keep this
      
      // Redirect to login page
      router.push('/login')
      
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const renderNavItems = () => (
    <ul className="mt-6 space-y-1 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.path
        return (
          <li key={item.name}>
            <button
              onClick={() => handleNavigate(item.path)}
              className={`
                flex items-center w-full px-3 py-3 text-[14px] font-medium rounded-lg transition-all
                ${isOpen ? 'justify-start' : 'justify-center'}
                ${isActive
                  ? darkMode 
                    ? 'bg-slate-700 text-white border-l-4 border-blue-400 shadow-md' 
                    : 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 shadow-md'
                  : darkMode
                    ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}
              `}
              title={!isOpen ? item.name : ''}
            >
              <item.icon className={`w-5 h-5 ${isActive ? (darkMode ? 'text-blue-400' : 'text-blue-600') : ''} ${isOpen ? 'mr-3' : ''}`} />
              {isOpen && (
                <span className="truncate text-[15px]">{item.name}</span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full backdrop-blur-xl border-r
          flex flex-col justify-between z-[1000] transform transition-all duration-300
          ${isOpen ? 'w-72' : 'w-16'}
          ${isOpen ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'}
          ${darkMode 
            ? 'bg-slate-900/95 border-slate-700' 
            : 'bg-white/95 border-slate-200'}
        `}
      >
        <div>
          {/* Navigation */}
          <div className="pt-20">
            {renderNavItems()}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-2 py-6 space-y-2">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`
              flex items-center w-full text-sm transition-all p-3 rounded-lg
              ${isOpen ? 'justify-start' : 'justify-center'}
              ${darkMode
                ? 'text-yellow-400 hover:text-yellow-300 hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}
            `}
            title={!isOpen ? (darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : ''}
          >
            {darkMode ? (
              <SunIcon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
            ) : (
              <MoonIcon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
            )}
            {isOpen && (darkMode ? 'Light Mode' : 'Dark Mode')}
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className={`
              flex items-center w-full text-sm text-red-400 hover:text-red-300 transition-all p-3 rounded-lg
              ${isOpen ? 'justify-start' : 'justify-center'}
              ${darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}
            `}
            title={!isOpen ? 'Logout' : ''}
          >
            <ArrowRightOnRectangleIcon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
            {isOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] md:hidden"
        />
      )}
    </>
  )
}