import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import { getWordColor } from '../utils/colors'
import { triggerStarBurst } from '../components/ui/StarBurst'

const EMOJI_LIST = [
  '😀','😂','🥰','😎','🤩','🎉','🌈','⭐','🔥','💫','🎈','🎨',
  '🐱','🐶','🦁','🐸','🦋','🐠','🐧','🦄','🍎','🍕','🍦','🍭',
  '⚽','🎵','🎸','🏆','🌸','🌻','🌙','☀️','❤️','💙','💜','🟡',
]

const IMAGE_STAMPS = [
  { emoji: '🐱', label: 'Cat' }, { emoji: '🐶', label: 'Dog' },
  { emoji: '🦁', label: 'Lion' }, { emoji: '🐸', label: 'Frog' },
  { emoji: '🦋', label: 'Butterfly' }, { emoji: '🌸', label: 'Flower' },
  { emoji: '🌈', label: 'Rainbow' }, { emoji: '⭐', label: 'Star' },
  { emoji: '🏠', label: 'House' }, { emoji: '🌳', label: 'Tree' },
  { emoji: '🚀', label: 'Rocket' }, { emoji: '🏖️', label: 'Beach' },
]

const FONT_SIZES = [18, 22, 28, 34, 40]

// A "word" block — stores text + color, displayed inline
function ColorWord({ text, color, fontSize }) {
  return (
    <span style={{ color, fontSize: `${fontSize}px` }} className="font-body font-bold inline">
      {text}{' '}
    </span>
  )
}

export default function WritingPad() {
  const { saveStory, addStars } = useApp()
  const [words, setWords] = useState([]) // [{text, color}]
  const [currentInput, setCurrentInput] = useState('')
  const [fontSizeIdx, setFontSizeIdx] = useState(1)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showStamps, setShowStamps] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const inputRef = useRef(null)
  const colorCountRef = useRef(0)

  const fontSize = FONT_SIZES[fontSizeIdx]

  function getNextColor() {
    const c = getWordColor(colorCountRef.current)
    colorCountRef.current++
    return c
  }

  function handleKeyDown(e) {
    if (e.key === ' ') {
      e.preventDefault()
      const trimmed = currentInput.trim()
      if (!trimmed) return
      setWords(prev => [...prev, { text: trimmed, color: getNextColor(), type: 'word' }])
      setCurrentInput('')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = currentInput.trim()
      if (trimmed) {
        setWords(prev => [...prev, { text: trimmed, color: getNextColor(), type: 'word' }])
        setCurrentInput('')
      }
      setWords(prev => [...prev, { text: '\n', type: 'break' }])
    } else if (e.key === 'Backspace' && !currentInput) {
      e.preventDefault()
      setWords(prev => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last?.type === 'break') { next.pop(); return next }
        if (last) { next.pop(); colorCountRef.current = Math.max(0, colorCountRef.current - 1); return next }
        return next
      })
    }
  }

  function addEmoji(emoji) {
    setWords(prev => [...prev, { text: emoji, color: getNextColor(), type: 'word' }])
    setShowEmojis(false)
    inputRef.current?.focus()
  }

  function addStamp(stamp) {
    setWords(prev => [...prev, { text: stamp.emoji, color: getNextColor(), type: 'stamp' }])
    setShowStamps(false)
    inputRef.current?.focus()
  }

  function clearAll() {
    setWords([])
    setCurrentInput('')
    colorCountRef.current = 0
  }

  function handleSave() {
    const fullText = words.map(w => w.type === 'break' ? '\n' : w.text).join(' ')
    if (!fullText.trim()) return
    const title = words.slice(0, 5).filter(w => w.type === 'word').map(w => w.text).join(' ') || 'My Writing'
    saveStory({ title, text: fullText, words, emoji: '✏️', type: 'writing' })
    addStars(3)
    triggerStarBurst()
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2500)
  }

  const wordCount = words.filter(w => w.type === 'word').length

  return (
    <div>
      <PageHeader
        emoji="✏️"
        title="Writing Pad"
        subtitle="Press SPACE and each word gets its own color! Press ENTER for a new line."
        accentColor="var(--c-writing)"
      />

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-md p-3 mb-4 flex items-center gap-2 flex-wrap">
        {/* Font size */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
          <button onClick={() => setFontSizeIdx(i => Math.max(0, i - 1))} className="w-7 h-7 rounded-full hover:bg-white font-bold text-gray-600 flex items-center justify-center">−</button>
          <span className="text-sm font-semibold text-gray-500 w-12 text-center">Aa {fontSize}px</span>
          <button onClick={() => setFontSizeIdx(i => Math.min(FONT_SIZES.length - 1, i + 1))} className="w-7 h-7 rounded-full hover:bg-white font-bold text-gray-600 flex items-center justify-center">+</button>
        </div>

        <div className="w-px h-7 bg-gray-200" />

        {/* Emoji picker */}
        <div className="relative">
          <button
            onClick={() => { setShowEmojis(s => !s); setShowStamps(false) }}
            className="flex items-center gap-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold rounded-full px-3 py-1.5 text-sm"
          >
            😀 Emoji
          </button>
          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-10 left-0 z-30 bg-white rounded-2xl shadow-xl border-2 border-yellow-200 p-3 w-64"
              >
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map(e => (
                    <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:bg-yellow-100 rounded-lg p-1 transition-all">
                      {e}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Image stamps */}
        <div className="relative">
          <button
            onClick={() => { setShowStamps(s => !s); setShowEmojis(false) }}
            className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-full px-3 py-1.5 text-sm"
          >
            🖼️ Stamps
          </button>
          <AnimatePresence>
            {showStamps && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-10 left-0 z-30 bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-3 w-72"
              >
                <div className="grid grid-cols-4 gap-2">
                  {IMAGE_STAMPS.map(s => (
                    <button key={s.label} onClick={() => addStamp(s)} className="flex flex-col items-center gap-1 hover:bg-blue-50 rounded-xl p-2 transition-all">
                      <span className="text-3xl">{s.emoji}</span>
                      <span className="text-xs font-semibold text-gray-500">{s.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-7 bg-gray-200" />

        {/* Word count */}
        <span className="text-sm font-semibold text-gray-400">📝 {wordCount} words</span>

        <div className="ml-auto flex gap-2">
          <button
            onClick={clearAll}
            className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded-full px-3 py-1.5 text-sm"
          >
            🗑️ Clear
          </button>
          <button
            onClick={handleSave}
            disabled={wordCount === 0}
            className="bg-green-100 hover:bg-green-200 disabled:opacity-50 text-green-700 font-semibold rounded-full px-3 py-1.5 text-sm"
          >
            {savedMsg ? '✅ Saved!' : '💾 Save Story'}
          </button>
        </div>
      </div>

      {/* Writing area */}
      <div
        className="bg-white rounded-3xl shadow-md min-h-64 p-6 cursor-text relative border-4 border-transparent focus-within:border-green-300 transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Lined paper background */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ top: `${48 + i * 44}px` }} className="absolute left-6 right-6 h-px bg-blue-100" />
          ))}
          <div className="absolute top-0 bottom-0 left-16 w-0.5 bg-red-100" />
        </div>

        {/* Content */}
        <div className="relative z-10 leading-relaxed min-h-48" style={{ lineHeight: `${fontSize * 2}px` }}>
          {words.map((w, i) => {
            if (w.type === 'break') return <br key={i} />
            return (
              <span key={i} style={{ color: w.color, fontSize: `${fontSize}px` }} className="font-body font-bold">
                {w.text}{' '}
              </span>
            )
          })}
          {/* Current word being typed */}
          <span style={{ fontSize: `${fontSize}px` }} className="font-body font-bold text-gray-400">
            {currentInput}
          </span>
          {/* Blinking cursor */}
          <span className="inline-block w-0.5 bg-gray-600 ml-0.5 animate-pulse" style={{ height: `${fontSize}px`, verticalAlign: 'text-bottom' }} />
        </div>

        {/* Hidden actual input */}
        <input
          ref={inputRef}
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="opacity-0 absolute w-0 h-0"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {/* Hint */}
      {wordCount === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 font-semibold mt-4 text-sm"
        >
          👆 Click anywhere and start typing! Press SPACE to add a colorful word.
        </motion.p>
      )}
    </div>
  )
}
