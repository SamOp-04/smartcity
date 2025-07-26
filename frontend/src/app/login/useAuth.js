'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useAuth() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState(null)
  const [loadiing, setLoading] = useState(true)

  useEffect(() => {
    let subscription = null

    async function init() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)
      setLoading(false)

      const { data: listen } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setTimeout(async () => { 
            const { data } = await supabase.auth.getUser()
            setUser(data.user ?? null)
            setLoading(false)
          }, 0)
        }
      })
      subscription = listen.subscription
    }

    init()
    return () => subscription?.unsubscribe()
  }, [supabase])

  return { user, loadiing }
}
