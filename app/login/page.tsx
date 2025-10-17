'use client'
import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? window.location.origin + '/auth/callback'
            : 'https://youzhi.art/auth/callback'
      }
    })
    if (error) {
      console.error(error)
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <label className="block">
          <span className="text-sm">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border p-2"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-md bg-black text-white py-2"
        >
          {status === 'sending' ? 'Sending...' : 'Send magic link'}
        </button>

        {status === 'sent' && (
          <p className="text-sm text-green-600">Check your inbox for a sign-in link.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-600">Something went wrong. Try again.</p>
        )}
      </form>
    </div>
  )
}
