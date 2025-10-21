'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [askingLocation, setAskingLocation] = useState(false)
  const [showDeals, setShowDeals] = useState(false)
  const [deals, setDeals] = useState<any | null>(null)
  const [loadingDeals, setLoadingDeals] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  // 🧭 Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 👤 Load user info
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/')
        return
      }
      setUser(data.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await supabase.from('profiles').insert([{ id: data.user.id }])
        setAskingLocation(true)
        setMessages([
          { role: 'assistant', content: 'Hey camper! Before we start, what city or ZIP are you in?' },
        ])
      } else if (!profile.location) {
        setAskingLocation(true)
        setMessages([
          { role: 'assistant', content: 'Hey camper! Before we start, what city or ZIP are you in?' },
        ])
      } else {
        setLocation(profile.location)
        greetUser(profile.location)
      }
    }
    loadUser()
  }, [router])

  // 🌦️ Greeting function
  async function greetUser(loc: string) {
    let dealsLine = ''
    try {
      const res = await fetch('/api/deals', { cache: 'no-store' })
      const data = await res.json()
      const rei = data?.deals?.rei?.[0]
      const moose = data?.deals?.moosejaw?.[0]
      const back = data?.deals?.backcountry?.[0]
      const combined = [rei, moose, back].filter(Boolean).join(' | ')
      if (combined) dealsLine = `Current outdoor deals: ${combined}`
    } catch {
      dealsLine = ''
    }

    const greetingPrompt = `
You are an outdoors and camping assistant.
Generate a friendly one-paragraph greeting for someone located in ${loc}.
Include:
- today's weather summary,
- short climate trend for the week,
- 1–2 hiking spots nearby,
- and append this if provided: "${dealsLine}".
Do not use emojis. Keep under 120 words.
`
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: greetingPrompt }),
    })
    const data = await res.json()
    const reply = data.reply || 'Unable to fetch outdoor info right now.'
    setMessages([{ role: 'assistant', content: reply }])
  }

  // 💬 Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    if (!userMsg || userMsg.length < 2) return
    setInput('')
    setLoading(true)

    // Handle first-time location setup
    if (askingLocation) {
      const loc = userMsg
      setLocation(loc)
      setAskingLocation(false)
      await supabase.from('profiles').update({ location: loc }).eq('id', user.id)
      setMessages((m) => [...m, { role: 'user', content: loc }])
      await greetUser(loc)
      setLoading(false)
      return
    }

    // Only create conversation for real messages
    if (!conversationId && userMsg.length > 2) {
      const baseName = user.email?.split('@')[0] || 'camper'
      const { data: convo, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: `${baseName}_chat_${Date.now()}`,
        })
        .select()
        .single()
      if (!error && convo) setConversationId(convo.id)
    }

    const outdoorPrompt = `You are a helpful outdoor-activity assistant.
Only answer about camping, hiking, outdoor gear, or weather.
User says: ${userMsg}`

    setMessages((m) => [...m, { role: 'user', content: userMsg }])

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: outdoorPrompt }),
    })
    const data = await res.json()
    const reply = data.reply || 'No response.'
    setMessages((m) => [...m, { role: 'assistant', content: reply }])

    if (conversationId) {
      await supabase.from('messages').insert([
        { conversation_id: conversationId, role: 'user', content: userMsg },
        { conversation_id: conversationId, role: 'assistant', content: reply },
      ])
    }

    setLoading(false)
  }

  // 🧭 Fetch deals when popup opens
  useEffect(() => {
    if (!showDeals) return
    setLoadingDeals(true)
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDeals(data.deals)
      })
      .catch(() => setDeals(null))
      .finally(() => setLoadingDeals(false))
  }, [showDeals])

  // 🚪 Log out
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-300 px-4 py-2 relative">
          <h1 className="text-lg font-semibold text-gray-800">
            Outdoor Chat {user ? `(${user.email.split('@')[0]})` : ''}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeals(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              View Gear Deals
            </button>
            <button
              onClick={() => router.push('/history')}
              className="text-sm text-blue-600 hover:underline"
            >
              View Past Chats
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>

          {/* DEALS MODAL */}
          {showDeals && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  🔥 Current Outdoor Deals
                </h2>

                {loadingDeals ? (
                  <p className="text-gray-600">Fetching latest deals...</p>
                ) : deals ? (
                  <div className="space-y-4 text-sm text-gray-800 overflow-y-auto max-h-[60vh]">
                    <div>
                      <h3 className="font-semibold text-green-700">REI</h3>
                      <ul className="list-disc ml-5">
                        {deals.rei?.map((d: string, i: number) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      <a
                        href="https://www.rei.com/outlet"
                        target="_blank"
                        className="text-xs text-blue-600 underline"
                      >
                        View more on REI
                      </a>
                    </div>

                    <div>
                      <h3 className="font-semibold text-red-700">Moosejaw</h3>
                      <ul className="list-disc ml-5">
                        {deals.moosejaw?.map((d: string, i: number) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      <a
                        href="https://www.moosejaw.com/content/sale"
                        target="_blank"
                        className="text-xs text-blue-600 underline"
                      >
                        View more on Moosejaw
                      </a>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-700">Backcountry</h3>
                      <ul className="list-disc ml-5">
                        {deals.backcountry?.map((d: string, i: number) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      <a
                        href="https://www.backcountry.com/sc/current-deals"
                        target="_blank"
                        className="text-xs text-blue-600 underline"
                      >
                        View more on Backcountry
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No deals found right now.</p>
                )}

                <button
                  onClick={() => setShowDeals(false)}
                  className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CHAT WINDOW */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[60vh]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-md max-w-[80%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'ml-auto bg-gray-200 text-black'
                  : 'mr-auto bg-gray-100 text-black'
              }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="border-t border-gray-300 p-3 flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder={
              askingLocation
                ? 'Enter your city or ZIP to get started...'
                : 'Ask about trails, gear, or weather...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
