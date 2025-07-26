'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000) // 5 seconds

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        color: '#444',
      }}
    >
      Redirecting...
    </div>
  )
}
