'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const [msg, setMsg] = useState('Finishing sign-in…')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        // If a session already exists, skip the exchange.
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          const url = new URL(window.location.href)
          const code = url.searchParams.get('code')
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) throw error
          }
        }
        if (active) router.replace('/app')
      } catch (e) {
        console.error(e)
        if (active) setMsg('Sign-in failed. Please try again.')
      }
    })()
    return () => { active = false }
  }, [router])

  return <div className="p-6">{msg}</div>
}

