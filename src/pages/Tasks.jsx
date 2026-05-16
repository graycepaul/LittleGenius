import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import SpeakButton from '../components/ui/SpeakButton'
import { triggerStarBurst } from '../components/ui/StarBurst'
import { TASKS, SPELL_WORDS, RHYME_TASK_SETS } from '../data/tasks'
import { useSpeech } from '../hooks/useSpeech'

// ── Alphabet writing task ──────────────────────────────────────────────────────
function AlphabetTask({ task, onBack, onComplete }) {
  const letters = task.variant === 'upper'
    ? Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
    : Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))

  const [typed, setTyped] = useState([])
  const [done, setDone] = useState(false)
  const inputRefs = useRef([])
  const { addStars, markTaskComplete } = useApp()

  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  useEffect(() => {
    if (typed.length < 26) inputRefs.current[typed.length]?.focus()
  }, [typed])

  function handleChange(e, idx) {
    const raw = e.target.value.slice(-1)
    e.target.value = ''
    if (!raw || !/[A-Za-z]/.test(raw)) return
    const ch = task.variant === 'upper' ? raw.toUpperCase() : raw.toLowerCase()
    if (ch === letters[idx]) {
      const next = [...typed, ch]
      setTyped(next)
      if (next.length === 26) {
        setDone(true)
        addStars(task.stars)
        markTaskComplete(task.id)
        triggerStarBurst()
        onComplete && onComplete()
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="font-semibold mb-6 block" style={{ color: 'var(--c-muted)' }}>← Back</button>
      <div className="el-card p-6 text-center">
        <h2 className="font-fun text-2xl mb-1" style={{ color: 'var(--c-text)' }}>{task.title}</h2>
        <p className="font-semibold mb-6" style={{ color: 'var(--c-muted)' }}>Type each letter in order — A, B, C…</p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {letters.map((l, i) => {
            const isTyped = i < typed.length
            const isCurrent = i === typed.length
            return (
              <div key={l} className={`relative w-10 h-10 rounded-xl font-fun text-xl border-2 transition-all
                ${isTyped ? 'bg-green-100 border-green-400 text-green-700' : isCurrent ? 'border-indigo-400 shadow-md' : 'bg-gray-100 border-gray-200 text-gray-300'}`}
                style={isCurrent ? { borderColor: 'var(--c-primary)', background: 'var(--c-primary-light)' } : {}}>
                {isTyped ? (
                  <span className="flex items-center justify-center w-full h-full">{l}</span>
                ) : (
                  <input
                    ref={el => inputRefs.current[i] = el}
                    type="text" maxLength={1}
                    disabled={!isCurrent || done}
                    onChange={e => handleChange(e, i)}
                    className="w-full h-full text-center bg-transparent outline-none font-fun text-xl"
                    style={{ color: 'var(--c-primary)', cursor: isCurrent ? 'text' : 'default' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {done ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <p className="font-fun text-3xl text-green-500 mb-4">🎉 Amazing! All letters done! +{task.stars} ⭐</p>
            <button onClick={onBack} className="btn-primary text-xl px-8 py-3">Back to Tasks</button>
          </motion.div>
        ) : (
          <p className="font-semibold" style={{ color: 'var(--c-muted)' }}>
            Type <span className="font-fun text-2xl" style={{ color: 'var(--c-primary)' }}>{letters[typed.length]}</span> next!
          </p>
        )}
      </div>
    </div>
  )
}

// ── Fill the alphabet ──────────────────────────────────────────────────────────
function FillAlphabetTask({ task, onBack, onComplete }) {
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  const missingSet = task.variant === 'every-other'
    ? letters.filter((_, i) => i % 2 === 1)
    : letters.filter((_, i) => [1,3,6,9,12,15,18,21,24].includes(i))

  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const inputRefs = useRef({})
  const { markTaskComplete, addStars } = useApp()

  useEffect(() => {
    const firstMissing = missingSet[0]
    if (firstMissing) inputRefs.current[firstMissing]?.focus()
  }, [])

  function handleChange(e, l) {
    const val = e.target.value.toUpperCase().slice(-1)
    setAnswers(a => ({ ...a, [l]: val }))
    if (val) {
      const idx = missingSet.indexOf(l)
      const next = missingSet[idx + 1]
      if (next) setTimeout(() => inputRefs.current[next]?.focus(), 50)
    }
  }

  function check() {
    let correct = 0
    missingSet.forEach(l => { if ((answers[l] || '').toUpperCase() === l) correct++ })
    setScore(correct)
    setChecked(true)
    addStars(correct)
    if (correct === missingSet.length) { triggerStarBurst(); markTaskComplete(task.id); onComplete && onComplete() }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="font-semibold mb-6 block" style={{ color: 'var(--c-muted)' }}>← Back</button>
      <div className="el-card p-6">
        <h2 className="font-fun text-2xl mb-1 text-center" style={{ color: 'var(--c-text)' }}>{task.title}</h2>
        <p className="font-semibold mb-6 text-center" style={{ color: 'var(--c-muted)' }}>Fill in the missing letters!</p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {letters.map(l => {
            const isMissing = missingSet.includes(l)
            const val = (answers[l] || '').toUpperCase()
            const isCorrect = checked && val === l
            const isWrong = checked && isMissing && val !== l
            return (
              <div key={l} className={`w-11 h-11 rounded-xl border-2 font-fun text-lg flex items-center justify-center transition-all
                ${!isMissing ? 'bg-blue-100 border-blue-200 text-blue-700' : ''}
                ${isMissing && !checked ? 'bg-yellow-50 border-yellow-300' : ''}
                ${isCorrect ? 'bg-green-100 border-green-400 text-green-700' : ''}
                ${isWrong ? 'bg-red-100 border-red-400 text-red-500' : ''}
              `}>
                {isMissing ? (
                  <input type="text" maxLength={2} value={answers[l] || ''} disabled={checked}
                    ref={el => inputRefs.current[l] = el}
                    onChange={e => handleChange(e, l)}
                    className="w-full h-full text-center bg-transparent outline-none font-fun text-base uppercase" />
                ) : l}
              </div>
            )
          })}
        </div>

        <AnimatePresence>
          {checked && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`font-fun text-2xl text-center mb-4 ${score === missingSet.length ? 'text-green-500' : 'text-orange-500'}`}>
              {score === missingSet.length ? `🎉 Perfect! +${score} ⭐` : `${score}/${missingSet.length} right! Try again!`}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex gap-3 justify-center">
          {!checked ? (
            <button onClick={check} className="btn-primary text-xl px-8 py-3">Check! ✅</button>
          ) : (
            <button onClick={() => { setAnswers({}); setChecked(false); setScore(0) }}
              className="btn-primary text-xl px-8 py-3">Try Again 🔄</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Fill numbers ───────────────────────────────────────────────────────────────
function FillNumbersTask({ task, onBack, onComplete }) {
  const [start, end] = task.range
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)
  const missing = numbers.filter((_, i) => i % 3 === 1)
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const inputRefs = useRef({})
  const { markTaskComplete, addStars } = useApp()

  useEffect(() => { inputRefs.current[missing[0]]?.focus() }, [])

  function handleChange(e, n) {
    const val = e.target.value
    setAnswers(a => ({ ...a, [n]: val }))
    if (val.length >= String(n).length) {
      const idx = missing.indexOf(n)
      const next = missing[idx + 1]
      if (next) setTimeout(() => inputRefs.current[next]?.focus(), 50)
    }
  }

  function check() {
    let c = 0
    missing.forEach(n => { if (parseInt(answers[n]) === n) c++ })
    setScore(c)
    setChecked(true)
    addStars(c)
    if (c === missing.length) { triggerStarBurst(); markTaskComplete(task.id); onComplete && onComplete() }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="font-semibold mb-6 block" style={{ color: 'var(--c-muted)' }}>← Back</button>
      <div className="el-card p-6">
        <h2 className="font-fun text-2xl mb-1 text-center" style={{ color: 'var(--c-text)' }}>{task.title}</h2>
        <p className="font-semibold mb-6 text-center" style={{ color: 'var(--c-muted)' }}>Fill in the missing numbers!</p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {numbers.map(n => {
            const isMissing = missing.includes(n)
            const isCorrect = checked && parseInt(answers[n]) === n
            const isWrong = checked && isMissing && parseInt(answers[n]) !== n
            return (
              <div key={n} className={`w-12 h-12 rounded-2xl border-2 font-fun text-xl flex items-center justify-center transition-all
                ${!isMissing ? 'bg-blue-100 border-blue-200 text-blue-700' : ''}
                ${isMissing && !checked ? 'bg-yellow-50 border-yellow-300' : ''}
                ${isCorrect ? 'bg-green-100 border-green-400 text-green-700' : ''}
                ${isWrong ? 'bg-red-100 border-red-400 text-red-500' : ''}
              `}>
                {isMissing ? (
                  <input type="number" value={answers[n] || ''} disabled={checked}
                    ref={el => inputRefs.current[n] = el}
                    onChange={e => handleChange(e, n)}
                    className="w-full h-full text-center bg-transparent outline-none font-fun text-base"
                    min={start} max={end} />
                ) : n}
              </div>
            )
          })}
        </div>
        <AnimatePresence>
          {checked && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`font-fun text-2xl text-center mb-4 ${score === missing.length ? 'text-green-500' : 'text-orange-500'}`}>
              {score === missing.length ? `🎉 Perfect! +${score} ⭐` : `${score}/${missing.length} correct!`}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex justify-center">
          {!checked ? (
            <button onClick={check} className="btn-primary text-xl px-8 py-3">Check! ✅</button>
          ) : (
            <button onClick={() => { setAnswers({}); setChecked(false); setScore(0) }}
              className="btn-primary text-xl px-8 py-3">Try Again 🔄</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sight words speed ──────────────────────────────────────────────────────────
function SightSpeedTask({ onBack, onComplete }) {
  const WORDS = ['the','and','is','are','was','for','on','you','he','she','they','we','his','her','have','this','that','not','with','said']
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(5)
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  const [done, setDone] = useState(false)
  const [flash, setFlash] = useState(null) // 'correct' | 'wrong' | 'timeout'
  const timerRef = useRef(null)
  const { addStars, markTaskComplete } = useApp()
  const { speak } = useSpeech()

  useEffect(() => {
    if (done) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleTimeout(); return 5 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [idx, done])

  function handleTimeout() {
    clearInterval(timerRef.current)
    setMissed(m => m + 1)
    setFlash('timeout')
    advance()
  }

  function advance() {
    setTimeout(() => {
      setFlash(null)
      setInput('')
      setTimeLeft(5)
      if (idx + 1 >= WORDS.length) {
        setDone(true)
        markTaskComplete('sight-speed')
        addStars(score)
        if (score >= 10) triggerStarBurst()
      } else {
        setIdx(i => i + 1)
      }
    }, 800)
  }

  function handleInput(e) {
    const val = e.target.value
    setInput(val)
    if (val.toLowerCase() === WORDS[idx]) {
      clearInterval(timerRef.current)
      setScore(s => s + 1)
      setFlash('correct')
      speak('Great!')
      advance()
    }
  }

  if (done) return (
    <div className="max-w-md mx-auto text-center py-8">
      <div className="text-6xl mb-4">🎉</div>
      <p className="font-fun text-3xl text-yellow-500 mb-2">Done!</p>
      <p className="font-semibold text-gray-500 mb-2">{score}/{WORDS.length} words! +{score} ⭐</p>
      <div className="flex gap-3 justify-center mt-6">
        <button onClick={() => { setIdx(0); setScore(0); setMissed(0); setDone(false); setTimeLeft(5); setInput('') }}
          className="bg-yellow-400 text-white font-fun text-lg px-6 py-3 rounded-2xl shadow">Play Again 🔄</button>
        <button onClick={onBack} className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl">Back</button>
      </div>
    </div>
  )

  const word = WORDS[idx]
  const pct = (timeLeft / 5) * 100

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-6 block">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-between mb-4 text-sm font-semibold text-gray-400">
          <span>Word {idx + 1}/{WORDS.length}</span>
          <span>✅ {score} 💨 {missed}</span>
        </div>

        {/* Timer bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <motion.div animate={{ width: `${pct}%` }} className={`h-3 rounded-full ${timeLeft <= 2 ? 'bg-red-400' : 'bg-green-400'}`} />
        </div>

        {/* Word */}
        <motion.div key={word}
          animate={flash === 'correct' ? { scale: [1, 1.3, 1], color: '#22c55e' } : flash === 'timeout' ? { x: [-10, 10, -10, 0] } : {}}
          className="font-fun text-6xl text-gray-800 mb-8">{word}</motion.div>

        <input autoFocus value={input} onChange={handleInput}
          placeholder="Type the word..." disabled={!!flash}
          className="w-full border-4 border-yellow-300 focus:border-yellow-500 rounded-2xl px-4 py-3 font-body text-2xl text-center outline-none" />

        <p className="text-gray-400 font-semibold mt-3 text-sm">⏱️ {timeLeft}s left</p>
      </div>
    </div>
  )
}

// ── Rhyme match ────────────────────────────────────────────────────────────────
function RhymeMatchTask({ onBack, onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const { addStars, markTaskComplete } = useApp()
  const { speak } = useSpeech()
  const q = RHYME_TASK_SETS[qIdx % RHYME_TASK_SETS.length]

  function pick(option) {
    if (result) return
    setSelected(option)
    const correct = option === q.answer
    setResult(correct ? 'correct' : 'wrong')
    if (correct) { addStars(1); setScore(s => s + 1); speak('Great job!') }
    else speak(q.answer)
    setTimeout(() => {
      if (qIdx + 1 >= RHYME_TASK_SETS.length) {
        markTaskComplete('rhyme-match')
        triggerStarBurst()
        onComplete && onComplete()
      }
      setQIdx(i => i + 1)
      setSelected(null)
      setResult(null)
    }, 1200)
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-6 block">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <p className="font-semibold text-gray-400 mb-2">Question {qIdx + 1}/{RHYME_TASK_SETS.length} · Score: {score}</p>
        <p className="font-fun text-xl text-gray-600 mb-2">Which word rhymes with</p>
        <p className="font-fun text-5xl text-yellow-500 mb-2">{q.word}</p>
        <SpeakButton text={q.word} size="sm" className="mx-auto mb-6" />
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(opt => (
            <motion.button key={opt} whileTap={{ scale: 0.95 }} onClick={() => pick(opt)}
              className={`py-4 rounded-2xl font-fun text-2xl border-4 transition-all ${
                selected === opt && result === 'correct' ? 'bg-green-400 border-green-500 text-white' :
                selected === opt && result === 'wrong' ? 'bg-red-300 border-red-400 text-white' :
                opt === q.answer && result === 'wrong' ? 'bg-green-200 border-green-400' :
                'bg-gray-100 border-gray-200 hover:bg-yellow-100 hover:border-yellow-300 text-gray-700'
              }`}>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Spell the word ─────────────────────────────────────────────────────────────
function SpellWordTask({ onBack, onComplete }) {
  const shuffled = useRef([...SPELL_WORDS].sort(() => Math.random() - 0.5).slice(0, 12))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const { addStars, markTaskComplete } = useApp()
  const { speak } = useSpeech()

  const word = shuffled.current[idx]

  function speakWord() { speak(word, { rate: 0.75 }) }

  useEffect(() => { speakWord() }, [idx])

  function check() {
    const correct = input.trim().toLowerCase() === word
    setResult(correct ? 'correct' : 'wrong')
    if (correct) { addStars(1); setScore(s => s + 1); speak('Fantastic!') }
    else speak(`The word is ${word}`)
    setTimeout(() => {
      setResult(null)
      setInput('')
      if (idx + 1 >= shuffled.current.length) {
        markTaskComplete('spell-the-word')
        triggerStarBurst()
        onComplete && onComplete()
      } else {
        setIdx(i => i + 1)
      }
    }, 1500)
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-6 block">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <p className="font-semibold text-gray-400 mb-6">Word {idx + 1}/{shuffled.current.length} · Score: {score}</p>
        <p className="font-fun text-xl text-gray-600 mb-4">Listen and spell the word!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={speakWord}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-fun text-2xl px-8 py-4 rounded-2xl mb-6 flex items-center gap-3 mx-auto">
          🔊 Hear the word
        </motion.button>
        <input autoFocus value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && input && check()}
          placeholder="Type it here..." disabled={!!result}
          className="w-full border-4 border-yellow-300 focus:border-yellow-500 rounded-2xl px-4 py-3 font-body text-2xl text-center outline-none mb-4" />
        <AnimatePresence>
          {result && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`font-fun text-2xl mb-3 ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
              {result === 'correct' ? '🎉 Correct! +1 ⭐' : `🙈 It's "${word}"`}
            </motion.p>
          )}
        </AnimatePresence>
        {!result && (
          <button onClick={check} disabled={!input}
            className="bg-gradient-to-r from-orange-400 to-yellow-400 disabled:opacity-50 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
            Check! ✅
          </button>
        )}
      </div>
    </div>
  )
}

// ── Count & type ───────────────────────────────────────────────────────────────
function CountTypeTask({ onBack, onComplete }) {
  const SETS = [
    { emoji: '🍎', count: 4 }, { emoji: '⭐', count: 7 }, { emoji: '🐶', count: 3 },
    { emoji: '🌸', count: 6 }, { emoji: '🎈', count: 9 }, { emoji: '🦋', count: 5 },
    { emoji: '🐸', count: 8 }, { emoji: '🍭', count: 2 }, { emoji: '🐧', count: 10 }, { emoji: '🌙', count: 1 },
  ]
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const { addStars, markTaskComplete } = useApp()
  const set = SETS[idx]

  function check() {
    const correct = parseInt(input) === set.count
    setResult(correct ? 'correct' : 'wrong')
    if (correct) { addStars(1); setScore(s => s + 1) }
    setTimeout(() => {
      setResult(null); setInput('')
      if (idx + 1 >= SETS.length) { markTaskComplete('count-challenge'); triggerStarBurst(); onComplete && onComplete() }
      else setIdx(i => i + 1)
    }, 1200)
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-6 block">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <p className="font-semibold text-gray-400 mb-4">Count {idx + 1}/{SETS.length} · Score: {score}</p>
        <p className="font-fun text-xl text-gray-600 mb-4">How many {set.emoji} can you count?</p>
        <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-16">
          {Array(set.count).fill(set.emoji).map((e, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06 }} className="text-3xl">{e}</motion.span>
          ))}
        </div>
        <input autoFocus type="number" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && input && check()}
          placeholder="?" disabled={!!result}
          className="w-32 border-4 border-yellow-300 focus:border-yellow-500 rounded-2xl px-4 py-3 font-fun text-4xl text-center outline-none mb-4 mx-auto block" />
        <AnimatePresence>
          {result && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`font-fun text-2xl mb-3 ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
              {result === 'correct' ? '🎉 Yes! +1 ⭐' : `🙈 It was ${set.count}!`}
            </motion.p>
          )}
        </AnimatePresence>
        {!result && (
          <button onClick={check} disabled={!input}
            className="bg-gradient-to-r from-green-400 to-teal-400 disabled:opacity-50 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
            Check! ✅
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Tasks page ────────────────────────────────────────────────────────────
export default function Tasks() {
  const { completedTasks } = useApp()
  const [activeTask, setActiveTask] = useState(null)

  const TASK_COMPONENTS = {
    'alphabet': (task) => <AlphabetTask task={task} onBack={() => setActiveTask(null)} onComplete={() => {}} />,
    'fill-alphabet': (task) => <FillAlphabetTask task={task} onBack={() => setActiveTask(null)} onComplete={() => {}} />,
    'fill-numbers': (task) => <FillNumbersTask task={task} onBack={() => setActiveTask(null)} onComplete={() => {}} />,
    'sight-speed': () => <SightSpeedTask onBack={() => setActiveTask(null)} onComplete={() => {}} />,
    'rhyme-match': () => <RhymeMatchTask onBack={() => setActiveTask(null)} onComplete={() => {}} />,
    'spell-word': () => <SpellWordTask onBack={() => setActiveTask(null)} onComplete={() => {}} />,
    'count-type': () => <CountTypeTask onBack={() => setActiveTask(null)} onComplete={() => {}} />,
  }

  return (
    <div>
      <PageHeader emoji="⚡" title="Challenges" subtitle="Complete tasks and earn stars!" accentColor="var(--c-tasks)" />
      <AnimatePresence mode="wait">
        {!activeTask ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TASKS.map((task, i) => {
                const done = completedTasks.includes(task.id)
                return (
                  <motion.button key={task.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTask(task)}
                    className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden text-left transition-all relative">
                    {done && <div className="absolute top-3 right-3 bg-green-400 text-white text-xs font-bold rounded-full px-2 py-0.5">✓ Done</div>}
                    <div className={`bg-gradient-to-br ${task.color} h-20 flex items-center justify-center text-4xl`}>{task.emoji}</div>
                    <div className="p-4">
                      <h3 className="font-fun text-lg text-gray-800">{task.title}</h3>
                      <p className="text-sm text-gray-400 font-semibold mt-1">{task.desc}</p>
                      <p className="text-sm text-yellow-500 font-bold mt-2">⭐ {task.stars} stars</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key={activeTask.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {TASK_COMPONENTS[activeTask.type] ? TASK_COMPONENTS[activeTask.type](activeTask) : (
              <div className="text-center py-16">
                <p className="font-fun text-2xl text-gray-400">Coming soon! 🚧</p>
                <button onClick={() => setActiveTask(null)} className="mt-4 bg-yellow-400 text-white font-fun px-6 py-3 rounded-2xl">Back</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
