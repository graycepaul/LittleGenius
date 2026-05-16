import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../../hooks/useSpeech'
import { getSyllableDisplay, splitSyllables } from '../../utils/syllables'
import { findRhymes } from '../../utils/rhymes'

function PronunciationPopup({ word, onClose }) {
  const { speak, speakSlow } = useSpeech()
  const syllables = splitSyllables(word)
  const rhymes = findRhymes(word)
  const [step, setStep] = useState(0) // 0=syllables, 1=slow audio, 2=full audio

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-2xl border-4 border-yellow-300 p-4 min-w-56 max-w-72"
    >
      {/* Word */}
      <div className="text-center mb-3">
        <p className="font-fun text-2xl text-yellow-600">{word}</p>
        <p className="text-gray-500 text-sm font-semibold mt-1">{getSyllableDisplay(word)}</p>
      </div>

      {/* Syllable blocks */}
      <div className="flex justify-center gap-2 flex-wrap mb-3">
        {syllables.map((syl, i) => (
          <button
            key={i}
            onClick={() => speak(syl)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl px-3 py-1 text-sm transition-all active:scale-95"
          >
            {syl}
          </button>
        ))}
      </div>

      {/* Speak buttons */}
      <div className="flex gap-2 justify-center mb-3">
        <button
          onClick={() => speakSlow(word)}
          className="flex items-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-full px-3 py-1.5 text-sm"
        >
          🐢 Slow
        </button>
        <button
          onClick={() => speak(word)}
          className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-full px-3 py-1.5 text-sm"
        >
          🔊 Hear it
        </button>
      </div>

      {/* Rhymes */}
      {rhymes.length > 0 && (
        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs text-gray-400 font-semibold text-center mb-1.5">🎵 Rhymes with</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {rhymes.slice(0, 4).map(r => (
              <button
                key={r}
                onClick={() => speak(r)}
                className="bg-pink-100 text-pink-600 font-semibold rounded-full px-2.5 py-0.5 text-xs hover:bg-pink-200"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs flex items-center justify-center"
      >
        ✕
      </button>
    </motion.div>
  )
}

export default function WordHighlighter({ text, fontSize = 22 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [popupIdx, setPopupIdx] = useState(null)
  const { speak } = useSpeech()

  // Preserve newlines — split into paragraphs then words
  const paragraphs = text.split('\n').filter(Boolean)

  let wordIndex = 0
  const paragraphWords = paragraphs.map(para => {
    const words = para.split(/(\s+)/).filter(Boolean)
    return words.map(token => {
      const isWord = /\w/.test(token)
      const obj = isWord ? { token, index: wordIndex, isWord: true } : { token, isWord: false }
      if (isWord) wordIndex++
      return obj
    })
  })

  function handleWordClick(token, idx) {
    const clean = token.replace(/[^a-zA-Z]/g, '')
    if (!clean) return
    if (popupIdx === idx) { setPopupIdx(null); return }
    setPopupIdx(idx)
    speak(clean)
  }

  return (
    <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.9 }} className="font-body select-none">
      {paragraphWords.map((para, pIdx) => (
        <p key={pIdx} className="mb-4">
          {para.map(({ token, index, isWord }) => {
            if (!isWord) return <span key={`s-${pIdx}-${token}`}>{token}</span>
            const clean = token.replace(/[^a-zA-Z]/g, '')
            const punct = token.replace(/[a-zA-Z]/g, '')
            const isHovered = hoveredIdx === index
            const hasPopup = popupIdx === index

            return (
              <span key={index} className="relative inline-block">
                <span
                  className={`cursor-pointer rounded-lg px-0.5 transition-all duration-150 ${
                    isHovered || hasPopup
                      ? 'bg-yellow-300 text-gray-800 shadow-sm'
                      : 'hover:bg-yellow-100'
                  }`}
                  onMouseEnter={() => setHoveredIdx(index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => handleWordClick(token, index)}
                >
                  {clean}
                </span>
                {punct}
                <AnimatePresence>
                  {hasPopup && (
                    <PronunciationPopup
                      word={clean.toLowerCase()}
                      onClose={() => setPopupIdx(null)}
                    />
                  )}
                </AnimatePresence>
              </span>
            )
          })}
        </p>
      ))}
    </div>
  )
}
