import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
import { useSpeech } from '../hooks/useSpeech'
import { BEDTIME_STORIES } from '../data/stories'

// Floating star particles in the background
function Stars() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 12 + 8,
    delay: Math.random() * 3,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map(s => (
        <motion.div key={s.id}
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.size}px`, position: 'absolute' }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 + s.delay, delay: s.delay }}>
          ✦
        </motion.div>
      ))}
    </div>
  )
}

function StoryReader({ story, onClose }) {
  const [fontSize, setFontSize] = useState(24)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wordIdx, setWordIdx] = useState(-1)
  const { speak, stop } = useSpeech()
  const wordsRef = useRef(story.text.split(/\s+/))
  const playRef = useRef(false)

  function playNarration() {
    setIsPlaying(true)
    playRef.current = true
    speak(story.text, {
      rate: 0.8,
      onEnd: () => { setIsPlaying(false); setWordIdx(-1); playRef.current = false }
    })
  }

  function stopNarration() {
    stop()
    setIsPlaying(false)
    setWordIdx(-1)
    playRef.current = false
  }

  useEffect(() => () => stop(), [])

  // Split text into paragraphs → words for display
  const paragraphs = story.text.split('\n').filter(Boolean)
  let globalWordIdx = 0
  const paragraphTokens = paragraphs.map(para => {
    const tokens = para.split(/(\s+)/)
    return tokens.map(token => {
      const isWord = /\w/.test(token)
      const obj = { token, isWord, globalIdx: isWord ? globalWordIdx : null }
      if (isWord) globalWordIdx++
      return obj
    })
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${story.color} rounded-3xl p-6 mb-6 text-white shadow-xl`}>
        <button onClick={onClose} className="mb-3 bg-white/20 hover:bg-white/40 text-white font-semibold rounded-full px-3 py-1 text-sm block">
          ← Back to Stories
        </button>
        <div className="flex items-center gap-4">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl inline-block">
            {story.emoji}
          </motion.span>
          <h2 className="font-fun text-3xl">{story.title}</h2>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow p-3 mb-6 flex items-center gap-3 flex-wrap">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={isPlaying ? stopNarration : playNarration}
          className={`flex items-center gap-2 font-fun text-lg px-5 py-2.5 rounded-2xl shadow transition-all ${
            isPlaying ? 'bg-red-400 hover:bg-red-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          {isPlaying ? '⏹ Stop' : '▶ Read to me'}
        </motion.button>

        {/* Font size */}
        <div className="flex items-center gap-2 bg-white rounded-full border-2 border-gray-200 px-3 py-1.5">
          <button onClick={() => setFontSize(s => Math.max(16, s - 2))} className="font-bold text-gray-600 hover:text-indigo-500">−</button>
          <span className="text-sm font-semibold text-gray-400 w-8 text-center">{fontSize}</span>
          <button onClick={() => setFontSize(s => Math.min(40, s + 2))} className="font-bold text-gray-600 hover:text-indigo-500">+</button>
        </div>

        {isPlaying && (
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
            className="text-indigo-400 font-semibold text-sm">
            🎙 Narrating...
          </motion.span>
        )}
      </div>

      {/* Story text */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
        <div style={{ fontSize: `${fontSize}px`, lineHeight: 2 }} className="font-body text-gray-800">
          {paragraphTokens.map((para, pIdx) => (
            <p key={pIdx} className="mb-6">
              {para.map(({ token, isWord, globalIdx }, tIdx) => (
                <span
                  key={tIdx}
                  className={isWord && isPlaying ? 'transition-all duration-200 rounded px-0.5' : ''}
                >
                  {token}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>

      {/* Goodnight message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 mb-4"
      >
        <p className="font-fun text-2xl text-indigo-400">Sweet dreams! 🌙✨</p>
      </motion.div>
    </motion.div>
  )
}

export default function BedtimeStories() {
  const [activeStory, setActiveStory] = useState(null)

  return (
    <div className="relative">
      {/* Starfield background */}
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-950 via-indigo-900 to-purple-900 z-0 pointer-events-none" />
      <Stars />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-4">
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-5xl inline-block">
              🌙
            </motion.span>
            <div>
              <h1 className="font-fun text-3xl sm:text-4xl">Bedtime Stories</h1>
              <p className="text-white/80 font-semibold mt-1">Cozy stories to drift off to sleep 🌟</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!activeStory ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BEDTIME_STORIES.map((story, i) => (
                  <motion.button
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveStory(story)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-3xl overflow-hidden text-left transition-all shadow-lg"
                  >
                    <div className={`bg-gradient-to-br ${story.color} h-28 flex items-center justify-center text-6xl`}>
                      {story.emoji}
                    </div>
                    <div className="p-4">
                      <h3 className="font-fun text-lg text-white">{story.title}</h3>
                      <p className="text-white/60 text-sm font-semibold mt-1 line-clamp-2">
                        {story.text.slice(0, 80)}…
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Moon decoration */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-center mt-12 text-white/30 text-6xl"
              >
                🌙
              </motion.div>
            </motion.div>
          ) : (
            <StoryReader key={activeStory.id} story={activeStory} onClose={() => setActiveStory(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
