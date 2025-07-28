import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextPath = url.searchParams.get('next')?.startsWith('/') ? url.searchParams.get('next') : '/dashboard'

  const supabase = createRouteHandlerClient({ cookies })

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (user && !userError) {
        // Update their profile role to 'admin'
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating user role:', updateError.message)
          // Optionally redirect to an error page or log more info
        }
      } else {
        console.error('Error fetching user after session:', userError?.message)
      }

      return NextResponse.redirect(`${url.origin}${nextPath}`)
    }
  }

  return NextResponse.redirect(`${url.origin}/auth/auth-code-error`)
}
