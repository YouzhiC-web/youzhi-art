'use client'

import { useRouter } from 'next/navigation'

export default function TreePage() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/light') // navigate to the next page
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        backgroundImage: "url('/dark.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Completely invisible clickable area */}
      <button
        className="absolute z-30 rounded-full bg-transparent border-none outline-none w-54 h-54 transition duration-300"
        style={{
          bottom: '650px',
          left: '14%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      />
    </div>
  )
}
