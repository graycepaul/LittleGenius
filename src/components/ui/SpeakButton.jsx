import React, { useState } from 'react'
import { useSpeech } from '../../hooks/useSpeech'
import { motion } from 'framer-motion'

export default function SpeakButton({ text, slow = false, size = 'md', label, className = '' }) {
  const { speak, speakSlow, stop } = useSpeech()
  const [speaking, setSpeaking] = useState(false)

  const sizes = { sm: 'text-sm px-2 py-1', md: 'text-base px-3 py-1.5', lg: 'text-xl px-4 py-2' }

  function handleClick() {
    if (speaking) { stop(); setSpeaking(false); return }
    setSpeaking(true)
    const fn = slow ? speakSlow : speak
    fn(text, { onEnd: () => setSpeaking(false) })
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`flex items-center gap-1.5 rounded-full font-semibold bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all ${sizes[size]} ${className}`}
    >
      <span className={speaking ? 'animate-bounce' : ''}>{speaking ? '🔊' : '🔈'}</span>
      {label && <span>{label}</span>}
    </motion.button>
  )
}
