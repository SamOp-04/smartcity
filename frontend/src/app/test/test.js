'use client'

import { useRouter } from 'next/navigation'

export default function RedirectPage() {

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
