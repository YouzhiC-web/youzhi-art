import { Suspense } from 'react'
import ChatClient from './ChatClient'

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Loading chat...</div>}>
      <ChatClient />
    </Suspense>
  )
}
