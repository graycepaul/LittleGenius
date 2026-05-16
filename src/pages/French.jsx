import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import { triggerStarBurst } from '../components/ui/StarBurst'
import {
  FRENCH_CATEGORIES, FRENCH_VOCAB, FRENCH_PHRASES,
  ALL_VOCAB, getWrongOptions, TRANSLATE_CHALLENGES,
} from '../data/french'
import { getCardGradient } from '../utils/colors'

// ── French speech hook ────────────────────────────────────────────────────────
function useFrenchSpeech() {
  const speak = useCallback((text, slow = false) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'fr-FR'
    utter.rate = slow ? 0.6 : 0.85
    utter.pitch = 1.1
    const voices = window.speechSynthesis.getVoices()
    const frVoice = voices.find(v => v.lang.startsWith('fr'))
    if (frVoice) utter.voice = frVoice
    window.speechSynthesis.speak(utter)
  }, [])
  const stop = useCallback(() => window.speechSynthesis?.cancel(), [])
  return { speak, stop }
}

// ── Small speak button ─────────────────────────────────────────────────────────
function FrSpeak({ text, slow = false, size = 'md', label, className = '' }) {
  const { speak } = useFrenchSpeech()
  const [active, setActive] = useState(false)
  const sizes = { sm: 'text-xs px-2 py-1', md: 'text-sm px-3 py-1.5', lg: 'text-base px-4 py-2' }
  function go() {
    setActive(true)
    speak(text, slow)
    setTimeout(() => setActive(false), slow ? 2500 : 1500)
  }
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={go}
      className={`flex items-center gap-1 rounded-full font-semibold bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all ${sizes[size]} ${className}`}>
      <span className={active ? 'animate-bounce' : ''}>{active ? '🔊' : '🔈'}</span>
      {label && <span>{label}</span>}
    </motion.button>
  )
}

// ── Vocabulary flip-card deck ─────────────────────────────────────────────────
function VocabDeck({ categoryId, onBack }) {
  const cat = FRENCH_CATEGORIES.find(c => c.id === categoryId)
  const words = FRENCH_VOCAB[categoryId] || []
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const { addStars, earnBadge } = useApp()
  const { speak } = useFrenchSpeech()
  const starsGiven = useRef(false)

  const word = words[idx]

  function next() {
    if (idx < words.length - 1) { setIdx(i => i + 1); setFlipped(false) }
    else {
      setDone(true)
      if (!starsGiven.current) {
        starsGiven.current = true
        addStars(5)
        triggerStarBurst()
        earnBadge({ id: `fr-${categoryId}`, emoji: '🇫🇷', name: `French ${cat.label}!` })
      }
    }
  }
  function prev() { if (idx > 0) { setIdx(i => i - 1); setFlipped(false) } }

  if (done) return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-12">
      <div className="text-7xl mb-4 animate-bounce">🇫🇷</div>
      <h2 className="font-fun text-3xl text-blue-600 mb-2">Magnifique!</h2>
      <p className="text-gray-500 font-semibold mb-6">You learned all {words.length} words! +5 ⭐</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setIdx(0); setDone(false); setFlipped(false); starsGiven.current = false }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-fun text-lg px-6 py-3 rounded-2xl shadow">
          Again! 🔄
        </button>
        <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-2xl">Back</button>
      </div>
    </motion.div>
  )

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-4 w-full max-w-sm justify-between">
        <button onClick={onBack} className="text-gray-500 font-semibold hover:text-gray-700">← Back</button>
        <span className="font-semibold text-gray-400">{idx + 1} / {words.length}</span>
        <div className="flex gap-2">
          <FrSpeak text={word.french} label="French" size="sm" />
          <FrSpeak text={word.french} slow label="Slow" size="sm" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm bg-gray-200 rounded-full h-2">
        <motion.div className={`bg-gradient-to-r ${cat.color} h-2 rounded-full`}
          animate={{ width: `${((idx + 1) / words.length) * 100}%` }} />
      </div>

      {/* Flip card */}
      <div className="card-flip w-72 h-80 cursor-pointer"
        onClick={() => { setFlipped(f => !f); speak(word.french) }}>
        <div className={`card-flip-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front — French */}
          <div className={`card-front w-full h-full rounded-3xl bg-gradient-to-br ${cat.color} flex flex-col items-center justify-center text-white shadow-xl p-6 text-center`}>
            <span className="text-7xl mb-4">{word.emoji}</span>
            <p className="font-fun text-5xl mb-2">{word.french}</p>
            <p className="text-white/70 font-semibold text-sm">Tap to flip!</p>
          </div>
          {/* Back — English + hint */}
          <div className="card-back w-full h-full rounded-3xl bg-white border-4 border-blue-300 flex flex-col items-center justify-center shadow-xl p-6 text-center">
            <span className="text-5xl mb-3">{word.emoji}</span>
            <p className="font-fun text-3xl text-gray-800 mb-2">{word.english}</p>
            <div className="bg-blue-50 rounded-2xl px-4 py-2 mb-3">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-0.5">Say it like</p>
              <p className="font-fun text-xl text-blue-600">{word.hint}</p>
            </div>
            <FrSpeak text={word.french} label="Hear French" size="sm" />
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 font-semibold">👆 Tap card to see English + how to say it</p>

      <div className="flex gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={prev} disabled={idx === 0}
          className="w-14 h-14 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 font-fun text-2xl flex items-center justify-center">←</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={next}
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-fun text-2xl flex items-center justify-center shadow-lg">→</motion.button>
      </div>
    </div>
  )
}

// ── Picture Quiz: see emoji → pick French word ────────────────────────────────
function PictureQuiz({ onBack }) {
  const { addStars } = useApp()
  const { speak } = useFrenchSpeech()
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const quizWords = useRef(
    [...ALL_VOCAB].sort(() => Math.random() - 0.5).slice(0, 15)
  )

  const word = quizWords.current[qIdx % quizWords.current.length]
  const wrong = useRef([])

  useEffect(() => {
    wrong.current = getWrongOptions(word, 3)
  }, [qIdx])

  const options = useRef([])
  useEffect(() => {
    const opts = [...getWrongOptions(word, 3), word].sort(() => Math.random() - 0.5)
    options.current = opts
  }, [qIdx])

  function pick(opt) {
    if (result) return
    setSelected(opt.french)
    setTotal(t => t + 1)
    const correct = opt.french === word.french
    setResult(correct ? 'correct' : 'wrong')
    if (correct) { addStars(1); setScore(s => s + 1); speak('Bravo!') }
    else speak(word.french)
    setTimeout(() => {
      setSelected(null)
      setResult(null)
      setQIdx(i => i + 1)
    }, 1400)
  }

  const isDone = qIdx >= quizWords.current.length

  if (isDone) return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-10">
      <div className="text-7xl mb-4">🎉</div>
      <h2 className="font-fun text-3xl text-blue-600 mb-2">Fantastique!</h2>
      <p className="text-gray-500 font-semibold mb-6">{score}/{quizWords.current.length} correct! +{score} ⭐</p>
      {score >= 10 && triggerStarBurst()}
      <div className="flex gap-3 justify-center">
        <button onClick={() => { quizWords.current = [...ALL_VOCAB].sort(() => Math.random() - 0.5).slice(0, 15); setQIdx(0); setScore(0); setTotal(0) }}
          className="bg-blue-500 text-white font-fun text-lg px-6 py-3 rounded-2xl shadow">Play Again 🔄</button>
        <button onClick={onBack} className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl">Back</button>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-md mx-auto">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-5 block">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-4">
          <span>Question {qIdx + 1}/{quizWords.current.length}</span>
          <span>✅ {score}</span>
        </div>
        <p className="font-fun text-xl text-gray-600 mb-2">What is this in French?</p>
        <motion.div key={qIdx} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-8xl my-6">{word.emoji}</motion.div>
        <p className="text-gray-500 font-semibold mb-5">{word.english}</p>

        <div className="grid grid-cols-2 gap-3">
          {options.current.map(opt => (
            <motion.button key={opt.french} whileTap={{ scale: 0.95 }} onClick={() => pick(opt)}
              className={`py-4 rounded-2xl font-fun text-xl border-4 transition-all ${
                selected === opt.french && result === 'correct' ? 'bg-green-400 border-green-500 text-white' :
                selected === opt.french && result === 'wrong' ? 'bg-red-300 border-red-400 text-white' :
                opt.french === word.french && result === 'wrong' ? 'bg-green-200 border-green-400 text-green-800' :
                'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700'
              }`}>
              {opt.french}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {result && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`font-fun text-2xl mt-4 ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
              {result === 'correct' ? '🎉 Bravo! +1 ⭐' : `🙈 C'est "${word.french}"!`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Translate Challenge ───────────────────────────────────────────────────────
function TranslateChallenge({ onBack }) {
  const { addStars } = useApp()
  const { speak } = useFrenchSpeech()
  const [direction, setDirection] = useState('en-fr') // 'en-fr' | 'fr-en'
  const [qIdx, setQIdx] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)

  const challenges = useRef([...TRANSLATE_CHALLENGES].sort(() => Math.random() - 0.5))
  const q = challenges.current[qIdx % challenges.current.length]
  const question = direction === 'en-fr' ? q.english : q.french
  const answer = direction === 'en-fr' ? q.french : q.english

  function check() {
    const correct = input.trim().toLowerCase() === answer.toLowerCase()
    setResult(correct ? 'correct' : 'wrong')
    if (correct) { addStars(2); setScore(s => s + 1); speak('Excellent!') }
    else if (direction === 'en-fr') speak(q.french)
    setTimeout(() => { setResult(null); setInput(''); setQIdx(i => i + 1) }, 1600)
  }

  function skip() { setInput(''); setResult(null); setQIdx(i => i + 1) }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-5 block">← Back</button>

      {/* Direction toggle */}
      <div className="flex bg-white rounded-2xl shadow p-1 mb-5 w-fit mx-auto gap-1">
        {[['en-fr', '🇬🇧 → 🇫🇷', 'English to French'], ['fr-en', '🇫🇷 → 🇬🇧', 'French to English']].map(([id, label, desc]) => (
          <button key={id} onClick={() => { setDirection(id); setQIdx(0); setInput(''); setResult(null); setScore(0) }}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${direction === id ? 'bg-blue-500 text-white shadow' : 'text-gray-500 hover:bg-blue-50'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-4">
          <span>#{qIdx + 1}</span>
          <span>✅ {score} correct</span>
        </div>

        <p className="font-semibold text-gray-500 mb-2 text-center">
          {direction === 'en-fr' ? 'Translate to French 🇫🇷' : 'Translate to English 🇬🇧'}
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 text-center mb-5">
          <p className="font-fun text-3xl text-gray-800">{question}</p>
          {direction === 'fr-en' && <FrSpeak text={question} className="mx-auto mt-2" size="sm" />}
        </div>

        <input autoFocus value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && input.trim() && !result && check()}
          placeholder={direction === 'en-fr' ? 'Type in French…' : 'Type in English…'}
          disabled={!!result}
          className="w-full border-4 border-blue-200 focus:border-blue-400 rounded-2xl px-4 py-3 font-body text-xl text-center outline-none mb-3" />

        <AnimatePresence>
          {result && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-center mb-3">
              <p className={`font-fun text-2xl ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                {result === 'correct' ? '🎉 Parfait! +2 ⭐' : `🙈 Answer: "${answer}"`}
              </p>
              {result === 'wrong' && direction === 'en-fr' && <FrSpeak text={answer} label="Hear it" className="mx-auto mt-2" />}
            </motion.div>
          )}
        </AnimatePresence>

        {!result && (
          <div className="flex gap-3 justify-center">
            <button onClick={check} disabled={!input.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 disabled:opacity-50 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
              Check! ✅
            </button>
            <button onClick={skip} className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold px-5 py-3 rounded-2xl">Skip →</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Match It — tap pairs ──────────────────────────────────────────────────────
function MatchIt({ onBack }) {
  const { addStars } = useApp()
  const { speak } = useFrenchSpeech()
  const PAIRS = 6

  function newRound() {
    const pool = [...ALL_VOCAB].sort(() => Math.random() - 0.5).slice(0, PAIRS)
    const left = pool.map(w => ({ id: w.french, text: w.english, type: 'en', pair: w.french }))
    const right = pool.map(w => ({ id: w.french + '_fr', text: w.french, type: 'fr', pair: w.french }))
      .sort(() => Math.random() - 0.5)
    return { left, right, pool }
  }

  const [round, setRound] = useState(() => newRound())
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrong, setWrong] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!selectedLeft || !selectedRight) return
    const correct = selectedLeft.pair === selectedRight.pair
    if (correct) {
      const newMatched = [...matched, selectedLeft.pair]
      setMatched(newMatched)
      speak(selectedLeft.pair)
      addStars(1)
      setScore(s => s + 1)
      setSelectedLeft(null)
      setSelectedRight(null)
      if (newMatched.length === PAIRS) { setTimeout(() => { triggerStarBurst(); setDone(true) }, 500) }
    } else {
      setWrong([selectedLeft.id, selectedRight.id])
      setTimeout(() => { setWrong(null); setSelectedLeft(null); setSelectedRight(null) }, 800)
    }
  }, [selectedLeft, selectedRight])

  if (done) return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-10">
      <div className="text-7xl mb-4">🎊</div>
      <h2 className="font-fun text-3xl text-blue-600 mb-2">Parfait!</h2>
      <p className="text-gray-500 font-semibold mb-6">All pairs matched! +{PAIRS} ⭐</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setRound(newRound()); setMatched([]); setDone(false); setSelectedLeft(null); setSelectedRight(null) }}
          className="bg-blue-500 text-white font-fun text-lg px-6 py-3 rounded-2xl shadow">New Round 🔄</button>
        <button onClick={onBack} className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl">Back</button>
      </div>
    </motion.div>
  )

  function itemClass(item, side) {
    const isSel = side === 'left' ? selectedLeft?.id === item.id : selectedRight?.id === item.id
    const isMatch = matched.includes(item.pair)
    const isWrong = wrong?.includes(item.id)
    if (isMatch) return 'bg-green-100 border-green-400 text-green-700 opacity-50 cursor-default'
    if (isWrong) return 'bg-red-200 border-red-400 text-red-700 animate-wiggle'
    if (isSel) return 'bg-blue-400 border-blue-500 text-white shadow-lg scale-105'
    return 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 cursor-pointer'
  }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-5 block">← Back</button>
      <p className="font-fun text-xl text-center text-gray-600 mb-2">Match the pairs! 🔗</p>
      <p className="text-sm text-center text-gray-400 font-semibold mb-5">Tap an English word, then its French match</p>

      <div className="grid grid-cols-2 gap-3">
        {/* English column */}
        <div className="flex flex-col gap-3">
          {round.left.map(item => (
            <motion.button key={item.id} whileTap={{ scale: 0.95 }}
              onClick={() => !matched.includes(item.pair) && setSelectedLeft(item)}
              disabled={matched.includes(item.pair)}
              className={`p-3 rounded-2xl border-4 font-semibold text-base transition-all ${itemClass(item, 'left')}`}>
              {item.text}
            </motion.button>
          ))}
        </div>
        {/* French column */}
        <div className="flex flex-col gap-3">
          {round.right.map(item => (
            <motion.button key={item.id} whileTap={{ scale: 0.95 }}
              onClick={() => !matched.includes(item.pair) && setSelectedRight(item)}
              disabled={matched.includes(item.pair)}
              className={`p-3 rounded-2xl border-4 font-fun text-base transition-all ${itemClass(item, 'right')}`}>
              {item.text}
            </motion.button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 font-semibold mt-4">{matched.length}/{PAIRS} matched ✅</p>
    </div>
  )
}

// ── Phrase Builder ─────────────────────────────────────────────────────────────
function PhraseLearn({ onBack }) {
  const { speak } = useFrenchSpeech()
  const [catFilter, setCatFilter] = useState('all')
  const categories = ['all', ...new Set(FRENCH_PHRASES.map(p => p.category))]
  const filtered = catFilter === 'all' ? FRENCH_PHRASES : FRENCH_PHRASES.filter(p => p.category === catFilter)

  return (
    <div>
      <button onClick={onBack} className="text-gray-500 font-semibold mb-5 block">← Back</button>
      <h2 className="font-fun text-2xl text-blue-600 mb-1">Everyday Phrases 💬</h2>
      <p className="text-gray-400 font-semibold mb-4">Learn how to say useful things in French!</p>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full font-semibold text-sm transition-all capitalize ${catFilter === c ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-blue-50'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((phrase, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl shadow-md p-4 flex items-start gap-3 hover:shadow-lg transition-all">
            <span className="text-3xl mt-0.5">{phrase.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-600 text-sm">{phrase.english}</p>
              <p className="font-fun text-lg text-blue-700 mt-0.5">{phrase.french}</p>
            </div>
            <div className="flex flex-col gap-1">
              <FrSpeak text={phrase.french} size="sm" />
              <FrSpeak text={phrase.french} slow size="sm" label="Slow" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Phrase Quiz ────────────────────────────────────────────────────────────────
function PhraseQuiz({ onBack }) {
  const { addStars } = useApp()
  const { speak } = useFrenchSpeech()
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)

  const quiz = useRef(
    [...FRENCH_PHRASES].sort(() => Math.random() - 0.5).slice(0, 12).map(p => {
      const wrong = FRENCH_PHRASES.filter(x => x.french !== p.french)
        .sort(() => Math.random() - 0.5).slice(0, 3)
      const options = [...wrong, p].sort(() => Math.random() - 0.5)
      return { ...p, options }
    })
  )

  const q = quiz.current[qIdx % quiz.current.length]
  const isDone = qIdx >= quiz.current.length

  function pick(opt) {
    if (result) return
    setSelected(opt.french)
    const correct = opt.french === q.french
    setResult(correct ? 'correct' : 'wrong')
    if (correct) { addStars(2); setScore(s => s + 1); speak('Très bien!') }
    else speak(q.french)
    setTimeout(() => { setSelected(null); setResult(null); setQIdx(i => i + 1) }, 1500)
  }

  if (isDone) return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-10">
      <div className="text-7xl mb-4">🎊</div>
      <h2 className="font-fun text-3xl text-blue-600 mb-2">Super!</h2>
      <p className="text-gray-500 font-semibold mb-6">{score}/{quiz.current.length} correct! +{score * 2} ⭐</p>
      {score >= 8 && triggerStarBurst()}
      <div className="flex gap-3 justify-center">
        <button onClick={() => { quiz.current = [...FRENCH_PHRASES].sort(() => Math.random() - 0.5).slice(0, 12).map(p => { const wrong = FRENCH_PHRASES.filter(x => x.french !== p.french).sort(() => Math.random() - 0.5).slice(0, 3); return { ...p, options: [...wrong, p].sort(() => Math.random() - 0.5) } }); setQIdx(0); setScore(0) }}
          className="bg-blue-500 text-white font-fun text-lg px-6 py-3 rounded-2xl shadow">Again 🔄</button>
        <button onClick={onBack} className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl">Back</button>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-md mx-auto">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-5 block">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-4">
          <span>{qIdx + 1}/{quiz.current.length}</span>
          <span>✅ {score}</span>
        </div>
        <span className="text-4xl block mb-3">{q.emoji}</span>
        <p className="font-fun text-xl text-gray-700 mb-1">How do you say this in French?</p>
        <div className="bg-blue-50 rounded-2xl px-4 py-3 mb-5">
          <p className="font-fun text-2xl text-gray-800">{q.english}</p>
        </div>
        <div className="flex flex-col gap-3">
          {q.options.map(opt => (
            <motion.button key={opt.french} whileTap={{ scale: 0.98 }} onClick={() => pick(opt)}
              className={`py-3 px-4 rounded-2xl font-fun text-lg border-4 text-left transition-all ${
                selected === opt.french && result === 'correct' ? 'bg-green-400 border-green-500 text-white' :
                selected === opt.french && result === 'wrong' ? 'bg-red-300 border-red-400 text-white' :
                opt.french === q.french && result === 'wrong' ? 'bg-green-100 border-green-400' :
                'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700'
              }`}>
              🇫🇷 {opt.french}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Fill the Blank ─────────────────────────────────────────────────────────────
function FillBlank({ onBack }) {
  const { addStars } = useApp()
  const { speak } = useFrenchSpeech()

  const BLANKS = [
    { sentence: '___ m\'appelle Marie.', answer: 'Je', hint: 'I (my name is)', full: "Je m'appelle Marie." },
    { sentence: 'Bonjour, comment ___ va?', answer: 'ça', hint: 'how are you?', full: 'Bonjour, comment ça va?' },
    { sentence: 'J\'ai ___ ans. (I am five)', answer: 'cinq', hint: 'the number 5', full: "J'ai cinq ans." },
    { sentence: 'Le chat est ___. (The cat is red)', answer: 'rouge', hint: 'the color red', full: 'Le chat est rouge.' },
    { sentence: 'Merci ___ vous plaît.', answer: 's\'il', hint: "please (s'il vous plaît)", full: "Merci s'il vous plaît." },
    { sentence: 'Je ___ faim. (I am hungry)', answer: 'ai', hint: "part of j'ai faim", full: "Je ai faim." },
    { sentence: 'Bonne ___, je dors. (Good night)', answer: 'nuit', hint: 'good night', full: 'Bonne nuit, je dors.' },
    { sentence: 'Le soleil est ___. (The sun is yellow)', answer: 'jaune', hint: 'the color yellow', full: 'Le soleil est jaune.' },
    { sentence: 'J\'aime le ___. (I like the dog)', answer: 'chien', hint: 'dog in French', full: "J'aime le chien." },
    { sentence: 'Au ___, à demain!', answer: 'revoir', hint: 'goodbye', full: 'Au revoir, à demain!' },
    { sentence: 'Il fait ___. (It is raining)', answer: 'pluie', hint: 'rain in French', full: 'Il fait pluie.' },
    { sentence: "C'est ___ pomme. (It is an apple)", answer: 'une', hint: 'a/an (feminine)', full: "C'est une pomme." },
  ]

  const [qIdx, setQIdx] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const q = BLANKS[qIdx % BLANKS.length]

  function check() {
    const correct = input.trim().toLowerCase() === q.answer.toLowerCase()
    setResult(correct ? 'correct' : 'wrong')
    if (correct) { addStars(2); setScore(s => s + 1); speak(q.full) }
    else speak(q.full)
    setTimeout(() => { setResult(null); setInput(''); setQIdx(i => i + 1) }, 1800)
  }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-5 block">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <p className="font-fun text-2xl text-center text-blue-600 mb-1">Fill the Blank! ✍️</p>
        <p className="text-gray-400 font-semibold text-center mb-5">Type the missing French word</p>
        <div className="flex justify-between text-sm text-gray-400 font-semibold mb-4">
          <span>#{qIdx + 1}/{BLANKS.length}</span>
          <span>✅ {score}</span>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 text-center mb-3">
          <p className="font-fun text-2xl text-gray-800 leading-relaxed">{q.sentence}</p>
        </div>
        <p className="text-center text-sm text-blue-500 font-semibold mb-5">💡 Hint: {q.hint}</p>

        <input autoFocus value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && input.trim() && !result && check()}
          placeholder="Type the missing word…"
          disabled={!!result}
          className="w-full border-4 border-blue-200 focus:border-blue-400 rounded-2xl px-4 py-3 font-fun text-2xl text-center outline-none mb-3" />

        <AnimatePresence>
          {result && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-center mb-3">
              <p className={`font-fun text-2xl ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                {result === 'correct' ? '🎉 Correct! +2 ⭐' : `🙈 Answer: "${q.answer}"`}
              </p>
              <FrSpeak text={q.full} label="Hear the sentence" className="mx-auto mt-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {!result && (
          <div className="flex gap-3 justify-center">
            <button onClick={check} disabled={!input.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 disabled:opacity-50 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
              Check! ✅
            </button>
            <button onClick={() => { setInput(''); setResult(null); setQIdx(i => i + 1) }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold px-5 py-3 rounded-2xl">Skip</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Activity menu cards ────────────────────────────────────────────────────────
const ACTIVITIES = [
  { id: 'vocab', label: 'Learn Vocabulary', emoji: '🃏', desc: 'Flip cards by category', color: 'from-blue-400 to-cyan-400' },
  { id: 'picture-quiz', label: 'Picture Quiz', emoji: '🖼️', desc: 'See image → pick French word', color: 'from-green-400 to-teal-400' },
  { id: 'translate', label: 'Translate It', emoji: '🔄', desc: 'English ↔ French', color: 'from-purple-400 to-pink-400' },
  { id: 'match', label: 'Match It', emoji: '🔗', desc: 'Pair up English & French', color: 'from-orange-400 to-yellow-400' },
  { id: 'phrases', label: 'Learn Phrases', emoji: '💬', desc: 'Everyday sentences', color: 'from-indigo-400 to-violet-400' },
  { id: 'phrase-quiz', label: 'Phrase Quiz', emoji: '🧠', desc: 'Test your phrases!', color: 'from-red-400 to-orange-400' },
  { id: 'fill', label: 'Fill the Blank', emoji: '✍️', desc: 'Complete French sentences', color: 'from-teal-400 to-green-400' },
]

// ── Main page ──────────────────────────────────────────────────────────────────
export default function French() {
  const [view, setView] = useState('home') // 'home' | 'vocab' | 'vocab:{id}' | activity ids

  return (
    <div>
      <PageHeader emoji="🇫🇷" title="French!" subtitle="Apprends le français — learn to speak French!" accentColor="var(--c-french)" />

      <AnimatePresence mode="wait">
        {/* HOME */}
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Fun intro banner */}
            <div className="bg-white rounded-3xl shadow-md p-5 mb-6 flex items-center gap-4">
              <span className="text-5xl">🗼</span>
              <div>
                <p className="font-fun text-xl text-blue-700">Bonjour! Ready to learn French?</p>
                <p className="text-sm text-gray-400 font-semibold mt-0.5">Start with vocabulary, then try the quizzes!</p>
              </div>
            </div>

            <h2 className="font-fun text-xl text-gray-600 mb-3">🎯 Activities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {ACTIVITIES.map((act, i) => (
                <motion.button key={act.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setView(act.id === 'vocab' ? 'vocab' : act.id)}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden text-left transition-all">
                  <div className={`bg-gradient-to-br ${act.color} h-20 flex items-center justify-center text-4xl`}>{act.emoji}</div>
                  <div className="p-3">
                    <h3 className="font-fun text-base text-gray-800">{act.label}</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{act.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* VOCAB category picker */}
        {view === 'vocab' && (
          <motion.div key="vocab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setView('home')} className="text-gray-500 font-semibold mb-5 block">← Back</button>
            <h2 className="font-fun text-2xl text-blue-600 mb-1">Choose a Category</h2>
            <p className="text-gray-400 font-semibold mb-5">Pick a topic to start learning!</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {FRENCH_CATEGORIES.map((cat, i) => (
                <motion.button key={cat.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setView(`vocab:${cat.id}`)}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden text-left transition-all">
                  <div className={`bg-gradient-to-br ${cat.color} h-20 flex items-center justify-center text-4xl`}>{cat.emoji}</div>
                  <div className="p-3">
                    <h3 className="font-fun text-base text-gray-800">{cat.label}</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{cat.desc}</p>
                    <p className="text-xs text-blue-400 font-bold mt-1">{FRENCH_VOCAB[cat.id]?.length} words</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* VOCAB deck for a category */}
        {view.startsWith('vocab:') && (
          <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VocabDeck categoryId={view.replace('vocab:', '')} onBack={() => setView('vocab')} />
          </motion.div>
        )}

        {view === 'picture-quiz' && (
          <motion.div key="picture-quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PictureQuiz onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'translate' && (
          <motion.div key="translate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TranslateChallenge onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'match' && (
          <motion.div key="match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MatchIt onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'phrases' && (
          <motion.div key="phrases" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PhraseLearn onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'phrase-quiz' && (
          <motion.div key="phrase-quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PhraseQuiz onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'fill' && (
          <motion.div key="fill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FillBlank onBack={() => setView('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
