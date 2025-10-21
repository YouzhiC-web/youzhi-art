'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [zooming, setZooming] = useState(false)
  const router = useRouter()
  const rotation = 3.5

  const handleClick = () => {
    setZooming(true)
    setTimeout(() => {
      router.push('/tree')
    }, 1600)
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-white overflow-hidden">
      {/* Zooming background layer */}
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={zooming ? { scale: 6, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
        className="absolute inset-0 z-10"
        style={{
          transformOrigin: '44% calc(52.9% + 40px)',
        }}
      >
        {/* Background Drawing */}
        <motion.img
          src="/IMG_0059.jpeg"
          alt="Custom Drawing"
          style={{ rotate: `${rotation}deg` }}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="max-w-full max-h-[90vh] object-contain mx-auto my-auto"
        />
      </motion.div>

      {/* Invisible clickable area */}
      <motion.button
        whileHover={{
          scale: 1.05,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        className="absolute z-30 rounded-full bg-transparent border-none outline-none w-18 h-18 transition duration-300"
        style={{
          top: 'calc(52.9% + 40px)',
          left: '44%',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      />

      {/* Fade-to-black overlay */}
      {zooming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 bg-black z-40"
        />
      )}
    </div>
  )
}
