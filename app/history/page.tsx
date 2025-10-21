'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function HistoryPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/')
        return
      }
      const { data: convos } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
      if (convos) setConversations(convos)
    })
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg shadow-md p-6">
        <h1 className="text-xl font-semibold mb-4 text-gray-800">Chat History</h1>

        {conversations.length === 0 ? (
          <p className="text-gray-500">No previous chats yet.</p>
        ) : (
          <ul className="space-y-3">
            {conversations.map((c) => (
              <li
                key={c.id}
                className="border p-3 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/chat?id=${c.id}`)}
              >
                <p className="font-medium text-gray-800">
                  {c.title || 'Untitled Chat'}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => router.push('/chat')}
          className="mt-6 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          New Chat
        </button>
      </div>
    </div>
  )
}
