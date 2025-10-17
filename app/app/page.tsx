'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AppHome() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function check() {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) {
        router.replace('/login')
        return
      }
      if (mounted) {
        setEmail(session.user.email ?? null)
        setLoading(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) return <div className="p-6">Checking session…</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p>You are signed in as <b>{email}</b>.</p>
      <button onClick={signOut} className="rounded-md bg-black text-white px-3 py-2">
        Sign out
      </button>
    </div>
  )
}
