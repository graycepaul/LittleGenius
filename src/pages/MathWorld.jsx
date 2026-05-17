import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import { triggerStarBurst } from '../components/ui/StarBurst'
import { playCheer } from '../utils/audio'
import {
  COUNTING_SETS, generateAddition, generateSubtraction,
  NUMBER_SEQUENCES, NUMBER_BONDS, MATH_EMOJIS
} from '../data/mathData'

const MATH_MODES = [
  { id: 'counting',    label: 'Counting',     emoji: '🔢', desc: 'Tap & count the objects!',     color: '#10B981' },
  { id: 'addition',    label: 'Addition',     emoji: '➕', desc: 'Add numbers together!',        color: '#3B82F6' },
  { id: 'subtraction', label: 'Subtraction',  emoji: '➖', desc: 'Tap to take items away!',      color: '#8B5CF6' },
  { id: 'fill-sequence', label: 'Fill the Gap', emoji: '🧩', desc: 'Find the missing number!',  color: '#F97316' },
  { id: 'number-bonds', label: 'Number Bonds', emoji: '🔗', desc: 'What adds up to the total?', color: '#EF4444' },
]

// ── Shared: tappable counting items ──────────────────────────────────────────
function CountItems({ count, emoji, tapped, onTap, mode = 'highlight', maxTap = count }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
      {Array.from({ length: count }, (_, i) => {
        const isTapped   = tapped.has(i)
        const isCrossed  = mode === 'cross' && isTapped
        const isHighlighted = mode === 'highlight' && isTapped
        const canTap = onTap && !isTapped && tapped.size < maxTap
        return (
          <motion.button
            key={i}
            whileTap={canTap ? { scale: 0.8 } : {}}
            onClick={() => canTap && onTap(i)}
            animate={
              isHighlighted ? { scale: 1.25, rotate: [-3,3,0] } :
              isCrossed     ? { scale: 0.75, opacity: 0.25 }   :
                              { scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`relative text-4xl p-1.5 rounded-2xl select-none
              ${isHighlighted ? 'ring-4 shadow-lg' : ''}
              ${canTap ? 'cursor-pointer' : 'cursor-default'}
            `}
            style={isHighlighted ? { ringColor: '#FCD34D', background: '#FEF3C7' } : {}}
          >
            <span>{emoji}</span>
            {isHighlighted && (
              <span className="absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white"
                style={{ background: '#F59E0B', fontSize: '10px' }}>
                {i + 1}
              </span>
            )}
            {isCrossed && (
              <span className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-2xl pointer-events-none">✕</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// ── Counting game ─────────────────────────────────────────────────────────────
function CountingGame({ onBack }) {
  const { addStars } = useApp()
  const [setIdx, setSetIdx] = useState(0)
  const [tapped, setTapped] = useState(new Set())
  const [phase, setPhase] = useState('tap') // tap | answer
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const set = COUNTING_SETS[setIdx % COUNTING_SETS.length]

  function handleTap(i) {
    const next = new Set([...tapped, i])
    setTapped(next)
    if (next.size === set.count) setTimeout(() => setPhase('answer'), 400)
  }

  function check() {
    const correct = parseInt(answer) === set.count
    setResult(correct)
    if (correct) { addStars(1); playCheer(); setTimeout(next, 1400) }
  }

  function next() {
    setSetIdx(i => i + 1)
    setTapped(new Set())
    setPhase('tap')
    setAnswer('')
    setResult(null)
  }

  const answerOptions = Array.from({ length: Math.min(set.count + 2, 12) }, (_, i) => i + Math.max(1, set.count - 1))
    .filter((v, _, arr) => arr.includes(set.count))
    .slice(0, 6)
  const opts = [...new Set([...answerOptions, set.count])].sort((a,b) => a-b).slice(0, 6)

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="font-semibold mb-6 block hover:opacity-70" style={{ color: 'var(--c-muted)' }}>← Back</button>

      <div className="el-card p-6">
        <AnimatePresence mode="wait">
          {phase === 'tap' ? (
            <motion.div key="tap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-fun text-2xl mb-1" style={{ color: 'var(--c-text)' }}>
                How many {set.name}?
              </h2>
              <p className="font-semibold mb-5 text-sm" style={{ color: 'var(--c-muted)' }}>
                Tap each one to count! ({tapped.size}/{set.count})
              </p>
              <div className="mb-4">
                <CountItems count={set.count} emoji={set.emoji} tapped={tapped} onTap={handleTap} mode="highlight" />
              </div>
              <div className="font-fun text-5xl" style={{ color: 'var(--c-gold)' }}>
                {tapped.size > 0 ? tapped.size : '?'}
              </div>
            </motion.div>
          ) : (
            <motion.div key="answer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-fun text-xl mb-2" style={{ color: 'var(--c-primary)' }}>
                You counted {tapped.size}! 🎉
              </p>
              <CountItems count={set.count} emoji={set.emoji} tapped={tapped} onTap={null} mode="highlight" />
              <p className="font-semibold mt-4 mb-3" style={{ color: 'var(--c-muted)' }}>Pick the answer:</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {opts.map(n => (
                  <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => setAnswer(String(n))}
                    className="w-12 h-12 rounded-full font-fun text-xl transition-all"
                    style={answer === String(n)
                      ? { background: 'var(--c-primary)', color: '#fff', transform: 'scale(1.15)' }
                      : { background: 'var(--c-bg)', color: 'var(--c-text)' }}>
                    {n}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {result !== null && (
                  <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`font-fun text-2xl mb-3 ${result ? 'text-green-500' : 'text-red-500'}`}>
                    {result ? '🎉 Correct! +1 ⭐' : '🙈 Try again!'}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex gap-3 justify-center">
                <button onClick={check} disabled={!answer} className="btn-primary text-xl px-8 py-3">
                  Check! ✅
                </button>
                {result === false && (
                  <button onClick={() => { setAnswer(''); setResult(null) }}
                    className="px-6 py-3 rounded-2xl font-semibold" style={{ background: 'var(--c-bg)', color: 'var(--c-muted)' }}>
                    Retry
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Addition game ─────────────────────────────────────────────────────────────
function AdditionGame({ onBack }) {
  const { addStars } = useApp()
  const [problem, setProblem]   = useState(() => generateAddition(8))
  const [tappedA, setTappedA]   = useState(new Set())
  const [tappedB, setTappedB]   = useState(new Set())
  const [phase, setPhase]       = useState('tap')  // tap | answer
  const [answer, setAnswer]     = useState('')
  const [result, setResult]     = useState(null)
  const [streak, setStreak]     = useState(0)
  const emoji = MATH_EMOJIS[problem.a % MATH_EMOJIS.length]

  const totalTapped = tappedA.size + tappedB.size
  const allTapped   = tappedA.size === problem.a && tappedB.size === problem.b

  useEffect(() => { if (allTapped) setTimeout(() => setPhase('answer'), 400) }, [allTapped])

  function check() {
    const correct = parseInt(answer) === problem.answer
    setResult(correct)
    if (correct) {
      addStars(1); playCheer()
      setStreak(s => s + 1)
      if ((streak + 1) % 5 === 0) triggerStarBurst()
      setTimeout(next, 1400)
    }
  }

  function next() {
    setProblem(generateAddition(8))
    setTappedA(new Set()); setTappedB(new Set())
    setPhase('tap'); setAnswer(''); setResult(null)
  }

  const maxAns = problem.answer + 2
  const opts = Array.from({ length: maxAns }, (_, i) => i + 1)
    .filter(n => Math.abs(n - problem.answer) <= 3)
    .slice(0, 6)

  return (
    <div className="max-w-lg mx-auto text-center">
      <button onClick={onBack} className="font-semibold mb-6 block hover:opacity-70" style={{ color: 'var(--c-muted)' }}>← Back</button>
      {streak > 0 && <p className="font-fun text-lg text-orange-500 mb-2">🔥 {streak} in a row!</p>}

      <div className="el-card p-6">
        <p className="font-fun text-3xl mb-4" style={{ color: 'var(--c-text)' }}>
          {problem.a} + {problem.b} ={' '}
          <AnimatePresence mode="wait">
            <motion.span key={answer || '?'}
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ color: answer ? 'var(--c-primary)' : 'var(--c-gold)' }}>
              {answer || '?'}
            </motion.span>
          </AnimatePresence>
        </p>

        {phase === 'tap' ? (
          <>
            <p className="font-semibold mb-4 text-sm" style={{ color: 'var(--c-muted)' }}>
              Tap each {emoji} to count them! ({totalTapped}/{problem.a + problem.b})
            </p>
            <div className="flex gap-6 justify-center items-start flex-wrap mb-2">
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: '#3B82F6' }}>Group A ({tappedA.size}/{problem.a})</p>
                <CountItems count={problem.a} emoji={emoji} tapped={tappedA}
                  onTap={i => setTappedA(prev => new Set([...prev, i]))} mode="highlight" />
              </div>
              <div className="font-fun text-4xl self-center" style={{ color: 'var(--c-muted)' }}>+</div>
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: '#10B981' }}>Group B ({tappedB.size}/{problem.b})</p>
                <CountItems count={problem.b} emoji={emoji} tapped={tappedB}
                  onTap={i => setTappedB(prev => new Set([...prev, i]))} mode="highlight" />
              </div>
            </div>
            <p className="font-fun text-5xl mt-3" style={{ color: 'var(--c-gold)' }}>
              {totalTapped > 0 ? totalTapped : '…'}
            </p>
          </>
        ) : (
          <>
            <p className="font-fun text-xl mb-4" style={{ color: 'var(--c-primary)' }}>
              You counted {totalTapped} total! Pick the answer:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {opts.map(n => (
                <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => setAnswer(String(n))}
                  className="w-12 h-12 rounded-full font-fun text-xl transition-all"
                  style={answer === String(n)
                    ? { background: 'var(--c-primary)', color: '#fff', transform: 'scale(1.15)' }
                    : { background: 'var(--c-bg)', color: 'var(--c-text)' }}>
                  {n}
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {result !== null && (
                <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className={`font-fun text-2xl mb-3 ${result ? 'text-green-500' : 'text-red-500'}`}>
                  {result ? '🎉 Yes! +1 ⭐' : `🙈 The answer is ${problem.answer}!`}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex gap-3 justify-center">
              <button onClick={check} disabled={!answer} className="btn-primary text-xl px-8 py-3">Check! ✅</button>
              <button onClick={next} className="px-5 py-3 rounded-2xl font-semibold"
                style={{ background: 'var(--c-bg)', color: 'var(--c-muted)' }}>Skip →</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Subtraction game (tap to remove) ─────────────────────────────────────────
function SubtractionGame({ onBack }) {
  const { addStars } = useApp()
  const [problem, setProblem] = useState(() => generateSubtraction(8))
  const [crossed, setCrossed] = useState(new Set())  // items tapped/removed
  const [phase, setPhase]     = useState('remove')    // remove | answer
  const [answer, setAnswer]   = useState('')
  const [result, setResult]   = useState(null)
  const [streak, setStreak]   = useState(0)
  const emoji = MATH_EMOJIS[problem.a % MATH_EMOJIS.length]

  function handleCross(i) {
    if (crossed.size >= problem.b) return
    const next = new Set([...crossed, i])
    setCrossed(next)
    if (next.size === problem.b) setTimeout(() => setPhase('answer'), 600)
  }

  function check() {
    const correct = parseInt(answer) === problem.answer
    setResult(correct)
    if (correct) {
      addStars(1); playCheer()
      setStreak(s => s + 1)
      if ((streak + 1) % 5 === 0) triggerStarBurst()
      setTimeout(next, 1400)
    }
  }

  function next() {
    setProblem(generateSubtraction(8))
    setCrossed(new Set()); setPhase('remove'); setAnswer(''); setResult(null)
  }

  const left = problem.a - crossed.size
  const opts = Array.from({ length: problem.a + 1 }, (_, i) => i)
    .filter(n => Math.abs(n - problem.answer) <= 2)
    .slice(0, 6)

  return (
    <div className="max-w-lg mx-auto text-center">
      <button onClick={onBack} className="font-semibold mb-6 block hover:opacity-70" style={{ color: 'var(--c-muted)' }}>← Back</button>
      {streak > 0 && <p className="font-fun text-lg text-orange-500 mb-2">🔥 {streak} in a row!</p>}

      <div className="el-card p-6">
        <p className="font-fun text-3xl mb-2" style={{ color: 'var(--c-text)' }}>
          {problem.a} − {problem.b} ={' '}
          <span style={{ color: answer ? 'var(--c-primary)' : 'var(--c-gold)' }}>{answer || '?'}</span>
        </p>

        <AnimatePresence mode="wait">
          {phase === 'remove' ? (
            <motion.div key="remove" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-semibold mb-5 text-sm" style={{ color: 'var(--c-muted)' }}>
                Tap <strong style={{ color: '#8B5CF6' }}>{problem.b - crossed.size}</strong> {emoji} to take {problem.b - crossed.size === 1 ? 'it' : 'them'} away!
              </p>
              <CountItems count={problem.a} emoji={emoji} tapped={crossed}
                onTap={handleCross} mode="cross" maxTap={problem.b} />
              <p className="mt-4 font-semibold text-sm" style={{ color: 'var(--c-muted)' }}>
                Taken away: {crossed.size} / {problem.b}
              </p>
            </motion.div>
          ) : (
            <motion.div key="answer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-fun text-xl mb-3" style={{ color: 'var(--c-primary)' }}>
                You took away {problem.b}! How many are left? 👀
              </p>
              <CountItems count={problem.a} emoji={emoji} tapped={crossed} onTap={null} mode="cross" />
              <p className="font-fun text-4xl mt-3 mb-4" style={{ color: 'var(--c-gold)' }}>
                {left} left!
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {opts.map(n => (
                  <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => setAnswer(String(n))}
                    className="w-12 h-12 rounded-full font-fun text-xl transition-all"
                    style={answer === String(n)
                      ? { background: 'var(--c-primary)', color: '#fff', transform: 'scale(1.15)' }
                      : { background: 'var(--c-bg)', color: 'var(--c-text)' }}>
                    {n}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {result !== null && (
                  <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`font-fun text-2xl mb-3 ${result ? 'text-green-500' : 'text-red-500'}`}>
                    {result ? '🎉 Yes! +1 ⭐' : `🙈 The answer is ${problem.answer}!`}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex gap-3 justify-center">
                <button onClick={check} disabled={!answer} className="btn-primary text-xl px-8 py-3">Check! ✅</button>
                <button onClick={next} className="px-5 py-3 rounded-2xl font-semibold"
                  style={{ background: 'var(--c-bg)', color: 'var(--c-muted)' }}>Skip →</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Fill the sequence ─────────────────────────────────────────────────────────
function FillSequence({ onBack }) {
  const { addStars } = useApp()
  const [seqIdx, setSeqIdx] = useState(0)
  const [inputs, setInputs] = useState({})
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(null)
  const inputRefs = useRef({})

  const seq = NUMBER_SEQUENCES[seqIdx % NUMBER_SEQUENCES.length]
  const numbers = Array.from({ length: seq.end - seq.start + 1 }, (_, i) => seq.start + i)

  useEffect(() => { inputRefs.current[seq.missing[0]]?.focus() }, [seqIdx])

  function handleChange(e, n) {
    const val = e.target.value
    setInputs(p => ({ ...p, [n]: val }))
    if (val.length >= String(n).length) {
      const idx = seq.missing.indexOf(n)
      const next = seq.missing[idx + 1]
      if (next) setTimeout(() => inputRefs.current[next]?.focus(), 50)
    }
  }

  function check() {
    let correct = 0
    seq.missing.forEach(n => { if (parseInt(inputs[n]) === n) correct++ })
    setScore(correct)
    setChecked(true)
    addStars(correct)
    if (correct === seq.missing.length) { triggerStarBurst(); playCheer() }
  }

  function next() { setSeqIdx(i => i + 1); setInputs({}); setChecked(false); setScore(null) }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="font-semibold mb-6 block hover:opacity-70" style={{ color: 'var(--c-muted)' }}>← Back</button>
      <div className="el-card p-6">
        <h2 className="font-fun text-2xl mb-2 text-center" style={{ color: 'var(--c-text)' }}>Fill the Missing Numbers!</h2>
        <p className="font-semibold text-center mb-6 text-sm" style={{ color: 'var(--c-muted)' }}>Type the numbers that are missing 👇</p>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {numbers.map(n => {
            const isMissing = seq.missing.includes(n)
            const isCorrect = checked && parseInt(inputs[n]) === n
            const isWrong   = checked && isMissing && parseInt(inputs[n]) !== n
            return (
              <div key={n} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-fun text-xl border-2 transition-all
                ${!isMissing ? 'bg-blue-100 border-blue-200 text-blue-700' : ''}
                ${isMissing && !checked ? 'bg-yellow-50 border-yellow-300' : ''}
                ${isCorrect ? 'bg-green-100 border-green-400 text-green-700' : ''}
                ${isWrong   ? 'bg-red-100 border-red-400 text-red-700' : ''}
              `}>
                {isMissing ? (
                  <input type="number" value={inputs[n] || ''} disabled={checked}
                    ref={el => inputRefs.current[n] = el}
                    onChange={e => handleChange(e, n)}
                    className="w-full h-full text-center bg-transparent outline-none font-fun text-xl"
                    min={1} max={30} />
                ) : <span>{n}</span>}
              </div>
            )
          })}
        </div>
        <AnimatePresence>
          {checked && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`font-fun text-2xl text-center mb-4 ${score === seq.missing.length ? 'text-green-500' : 'text-orange-500'}`}>
              {score === seq.missing.length ? `🎉 Perfect! +${score} ⭐` : `${score}/${seq.missing.length} correct! Keep going!`}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex gap-3 justify-center">
          {!checked
            ? <button onClick={check} className="btn-primary text-xl px-8 py-3">Check! ✅</button>
            : <button onClick={next}  className="btn-primary text-xl px-8 py-3">Next →</button>
          }
        </div>
      </div>
    </div>
  )
}

// ── Number bonds ──────────────────────────────────────────────────────────────
function NumberBonds({ onBack }) {
  const { addStars } = useApp()
  const [bondIdx, setBondIdx] = useState(0)
  const [pairIdx, setPairIdx] = useState(0)
  const [answer, setAnswer]   = useState('')
  const [result, setResult]   = useState(null)
  const bond = NUMBER_BONDS[bondIdx % NUMBER_BONDS.length]
  const pair = bond.pairs[pairIdx % bond.pairs.length]

  function check() {
    const correct = parseInt(answer) === pair[1]
    setResult(correct)
    if (correct) { addStars(1); playCheer(); setTimeout(next, 1200) }
  }

  function next() {
    const nextPair = pairIdx + 1
    if (nextPair >= bond.pairs.length) { setBondIdx(i => i + 1); setPairIdx(0) }
    else setPairIdx(nextPair)
    setAnswer(''); setResult(null)
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="font-semibold mb-6 block hover:opacity-70" style={{ color: 'var(--c-muted)' }}>← Back</button>
      <div className="el-card p-8">
        <h2 className="font-fun text-2xl mb-6" style={{ color: 'var(--c-text)' }}>Number Bonds to {bond.total}!</h2>
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="w-16 h-16 rounded-full text-white font-fun text-3xl flex items-center justify-center shadow-lg"
            style={{ background: '#3B82F6' }}>{pair[0]}</div>
          <div className="font-fun text-3xl" style={{ color: 'var(--c-muted)' }}>+</div>
          <AnimatePresence mode="wait">
            <motion.div key={answer || '?'} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-full font-fun text-3xl flex items-center justify-center border-4"
              style={answer
                ? { background: 'var(--c-primary)', color: '#fff', borderColor: 'var(--c-primary)' }
                : { background: '#FEF3C7', color: '#92400E', borderColor: '#FCD34D' }}>
              {answer || '?'}
            </motion.div>
          </AnimatePresence>
          <div className="font-fun text-3xl" style={{ color: 'var(--c-muted)' }}>=</div>
          <div className="w-16 h-16 rounded-full text-white font-fun text-3xl flex items-center justify-center shadow-lg"
            style={{ background: '#10B981' }}>{bond.total}</div>
        </div>
        <p className="font-fun text-3xl mb-6" style={{ color: 'var(--c-text)' }}>{pair[0]} + ? = {bond.total}</p>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {Array.from({ length: bond.total + 1 }, (_, i) => i).map(n => (
            <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => setAnswer(String(n))}
              className="w-10 h-10 rounded-full font-fun text-base transition-all"
              style={answer === String(n)
                ? { background: 'var(--c-primary)', color: '#fff', transform: 'scale(1.15)' }
                : { background: 'var(--c-bg)', color: 'var(--c-text)' }}>
              {n}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {result !== null && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`font-fun text-2xl mb-3 ${result ? 'text-green-500' : 'text-red-500'}`}>
              {result ? '🎉 Yes! +1 ⭐' : `🙈 It's ${pair[1]}!`}
            </motion.p>
          )}
        </AnimatePresence>
        <button onClick={check} disabled={!answer} className="btn-primary text-xl px-8 py-3">
          Check! ✅
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MathWorld() {
  const [mode, setMode] = useState(null)

  return (
    <div>
      <PageHeader emoji="🔢" title="Math World" subtitle="Count, add and discover numbers!" accentColor="var(--c-math)" />
      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {MATH_MODES.map((m, i) => (
                <motion.button key={m.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setMode(m.id)}
                  className="el-card text-left overflow-hidden group">
                  <div className="h-20 flex items-center justify-center" style={{ background: m.color + '18' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                      style={{ background: m.color }}>
                      {m.emoji}
                    </div>
                  </div>
                  <div className="p-3 pb-4">
                    <h3 className="font-fun text-base" style={{ color: 'var(--c-text)' }}>{m.label}</h3>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--c-muted)' }}>{m.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {mode === 'counting'    && <CountingGame     key="counting"    onBack={() => setMode(null)} />}
        {mode === 'addition'    && <AdditionGame     key="addition"    onBack={() => setMode(null)} />}
        {mode === 'subtraction' && <SubtractionGame  key="subtraction" onBack={() => setMode(null)} />}
        {mode === 'fill-sequence' && <FillSequence   key="fill"        onBack={() => setMode(null)} />}
        {mode === 'number-bonds'  && <NumberBonds    key="bonds"       onBack={() => setMode(null)} />}
      </AnimatePresence>
    </div>
  )
}
