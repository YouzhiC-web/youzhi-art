'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient' // ✅ import Supabase

export default function LightPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (mode === 'login') {
      // 🧠 LOGIN logic
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('✅ Logging in...')
        setTimeout(() => router.push('/chat'), 1000)
      }
    } else {
      // 🧠 SIGNUP logic
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('✅ Account created! Redirecting to login...')
        setTimeout(() => {
          setMode('login')
          router.push('/signin') // go to Sign In page (signup confirmation)
        }, 1500)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: "url('/light.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 🧩 Login/Signup box */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md rounded-2xl shadow-xl w-80 p-8"
        style={{
          position: 'relative',
          left: '-550px',
        }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {mode === 'login' ? 'Log In' : 'Sign Up'}
        </h2>

        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
<input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 text-black placeholder-gray-400"
/>

<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 text-black placeholder-gray-400"
/>


          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition"
            type="submit"
          >
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </motion.button>
        </form>

        {message && (
          <p className="text-sm text-gray-700 mt-3 text-center">{message}</p>
        )}

        <p className="text-sm text-gray-700 mt-4">
          {mode === 'login' ? (
            <>
              Don’t have an account?{' '}
              <button
                type="button"
                className="text-sky-600 hover:underline"
                onClick={() => router.push('/signin')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="text-sky-600 hover:underline"
                onClick={() => setMode('login')}
              >
                Log In
              </button>
            </>
          )}
        </p>
      </motion.div>
    </motion.div>
  )
}
