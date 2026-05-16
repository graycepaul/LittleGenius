import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import { triggerStarBurst } from '../components/ui/StarBurst'
import {
  COUNTING_SETS, generateAddition, generateSubtraction,
  NUMBER_SEQUENCES, NUMBER_BONDS, MATH_EMOJIS
} from '../data/mathData'

const MATH_MODES = [
  { id: 'counting', label: 'Counting', emoji: '🔢', desc: 'Count the objects!', color: 'from-green-400 to-teal-400' },
  { id: 'addition', label: 'Addition', emoji: '➕', desc: 'Add numbers together!', color: 'from-blue-400 to-cyan-400' },
  { id: 'subtraction', label: 'Subtraction', emoji: '➖', desc: 'Take numbers away!', color: 'from-purple-400 to-pink-400' },
  { id: 'fill-sequence', label: 'Fill the Gap', emoji: '🧩', desc: 'Find the missing number!', color: 'from-orange-400 to-yellow-400' },
  { id: 'number-bonds', label: 'Number Bonds', emoji: '🔗', desc: 'What adds up to the total?', color: 'from-red-400 to-orange-400' },
]

// ── Counting game ─────────────────────────────────────────────────────────────
function CountingGame({ onBack }) {
  const { addStars } = useApp()
  const [setIdx, setSetIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const set = COUNTING_SETS[setIdx % COUNTING_SETS.length]

  function check() {
    const correct = parseInt(answer) === set.count
    setResult(correct)
    if (correct) { addStars(1); setTimeout(next, 1200) }
  }

  function next() {
    setSetIdx(i => i + 1)
    setAnswer('')
    setResult(null)
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-6 block hover:text-gray-700">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="font-fun text-2xl text-gray-700 mb-6">How many {set.name}?</h2>
        <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-20">
          {Array(set.count).fill(set.emoji).map((e, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
              className="text-4xl">{e}</motion.span>
          ))}
        </div>
        <div className="flex gap-3 justify-center mb-4">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => setAnswer(String(n))}
              className={`w-10 h-10 rounded-full font-fun text-lg transition-all ${answer === String(n) ? 'bg-yellow-400 text-white shadow-md scale-110' : 'bg-gray-100 hover:bg-yellow-100 text-gray-700'}`}>
              {n}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {result !== null && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`font-fun text-2xl mb-3 ${result ? 'text-green-500' : 'text-red-500'}`}>
              {result ? '🎉 Correct! +1 ⭐' : '🙈 Try again!'}
            </motion.p>
          )}
        </AnimatePresence>
        <button onClick={check} disabled={!answer}
          className="bg-gradient-to-r from-green-400 to-teal-400 disabled:opacity-50 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
          Check! ✅
        </button>
      </div>
    </div>
  )
}

// ── Addition / Subtraction ─────────────────────────────────────────────────────
function ArithmeticGame({ mode, onBack }) {
  const { addStars } = useApp()
  const [problem, setProblem] = useState(() => mode === 'addition' ? generateAddition(10) : generateSubtraction(10))
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [streak, setStreak] = useState(0)
  const emoji = MATH_EMOJIS[problem.a % MATH_EMOJIS.length]

  function check() {
    const correct = parseInt(answer) === problem.answer
    setResult(correct)
    if (correct) {
      addStars(1)
      setStreak(s => s + 1)
      if ((streak + 1) % 5 === 0) triggerStarBurst()
      setTimeout(next, 1200)
    }
  }

  function next() {
    setProblem(mode === 'addition' ? generateAddition(10) : generateSubtraction(10))
    setAnswer('')
    setResult(null)
  }

  const maxAnswer = mode === 'addition' ? 20 : problem.a

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-6 block hover:text-gray-700">← Back</button>
      {streak > 0 && <p className="text-orange-500 font-fun text-lg mb-2">🔥 {streak} in a row!</p>}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        {/* Visual representation */}
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <div className="flex flex-wrap justify-center gap-1 max-w-32">
            {Array(problem.a).fill(emoji).map((e, i) => <span key={i} className="text-2xl">{e}</span>)}
          </div>
          <span className="font-fun text-4xl text-gray-600">{problem.op}</span>
          <div className="flex flex-wrap justify-center gap-1 max-w-32">
            {Array(problem.b).fill(emoji).map((e, i) => (
              <span key={i} className={`text-2xl ${mode === 'subtraction' ? 'opacity-30 line-through' : ''}`}>{e}</span>
            ))}
          </div>
          <span className="font-fun text-4xl text-gray-600">=</span>
          <span className="font-fun text-5xl text-yellow-500">?</span>
        </div>

        <p className="font-fun text-4xl text-gray-800 mb-6">
          {problem.a} {problem.op} {problem.b} = ?
        </p>

        {/* Answer buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {Array.from({ length: maxAnswer + 1 }, (_, i) => i).map(n => (
            <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => setAnswer(String(n))}
              className={`w-10 h-10 rounded-full font-fun text-base transition-all ${answer === String(n) ? 'bg-yellow-400 text-white shadow-md scale-110' : 'bg-gray-100 hover:bg-yellow-100 text-gray-700'}`}>
              {n}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {result !== null && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="mb-3">
              <p className={`font-fun text-2xl ${result ? 'text-green-500' : 'text-red-500'}`}>
                {result ? '🎉 Yes! +1 ⭐' : `🙈 The answer is ${problem.answer}!`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 justify-center">
          <button onClick={check} disabled={!answer}
            className="bg-gradient-to-r from-blue-400 to-cyan-400 disabled:opacity-50 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
            Check! ✅
          </button>
          <button onClick={next} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-3 rounded-2xl">
            Skip →
          </button>
        </div>
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

  const seq = NUMBER_SEQUENCES[seqIdx % NUMBER_SEQUENCES.length]
  const numbers = Array.from({ length: seq.end - seq.start + 1 }, (_, i) => seq.start + i)

  function check() {
    let correct = 0
    seq.missing.forEach(n => { if (parseInt(inputs[n]) === n) correct++ })
    setScore(correct)
    setChecked(true)
    addStars(correct)
    if (correct === seq.missing.length) { triggerStarBurst() }
  }

  function next() {
    setSeqIdx(i => i + 1)
    setInputs({})
    setChecked(false)
    setScore(null)
  }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-6 block hover:text-gray-700">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h2 className="font-fun text-2xl text-gray-700 mb-2 text-center">Fill the Missing Numbers!</h2>
        <p className="text-gray-400 font-semibold text-center mb-6">Type the numbers that are missing 👇</p>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {numbers.map(n => {
            const isMissing = seq.missing.includes(n)
            const isCorrect = checked && parseInt(inputs[n]) === n
            const isWrong = checked && isMissing && parseInt(inputs[n]) !== n
            return (
              <div key={n} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-fun text-xl border-2 transition-all
                ${!isMissing ? 'bg-blue-100 border-blue-200 text-blue-700' : ''}
                ${isMissing && !checked ? 'bg-yellow-50 border-yellow-300' : ''}
                ${isCorrect ? 'bg-green-100 border-green-400 text-green-700' : ''}
                ${isWrong ? 'bg-red-100 border-red-400 text-red-700' : ''}
              `}>
                {isMissing ? (
                  <input type="number" value={inputs[n] || ''} disabled={checked}
                    onChange={e => setInputs(p => ({ ...p, [n]: e.target.value }))}
                    className="w-full h-full text-center bg-transparent outline-none font-fun text-xl"
                    min={1} max={30} />
                ) : (
                  <span>{n}</span>
                )}
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
          {!checked ? (
            <button onClick={check} className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
              Check! ✅
            </button>
          ) : (
            <button onClick={next} className="bg-gradient-to-r from-green-400 to-teal-400 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
              Next →
            </button>
          )}
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
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const bond = NUMBER_BONDS[bondIdx % NUMBER_BONDS.length]
  const pair = bond.pairs[pairIdx % bond.pairs.length]

  function check() {
    const correct = parseInt(answer) === pair[1]
    setResult(correct)
    if (correct) { addStars(1); setTimeout(next, 1200) }
  }

  function next() {
    const nextPair = pairIdx + 1
    if (nextPair >= bond.pairs.length) { setBondIdx(i => i + 1); setPairIdx(0) }
    else setPairIdx(nextPair)
    setAnswer('')
    setResult(null)
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <button onClick={onBack} className="text-gray-500 font-semibold mb-6 block hover:text-gray-700">← Back</button>
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="font-fun text-2xl text-gray-700 mb-6">Number Bonds to {bond.total}!</h2>

        {/* Bond diagram */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-400 text-white font-fun text-3xl flex items-center justify-center shadow-lg">
            {pair[0]}
          </div>
          <div className="font-fun text-3xl text-gray-500">+</div>
          <div className="w-16 h-16 rounded-full bg-yellow-300 border-4 border-yellow-400 font-fun text-3xl flex items-center justify-center">
            ?
          </div>
          <div className="font-fun text-3xl text-gray-500">=</div>
          <div className="w-16 h-16 rounded-full bg-green-400 text-white font-fun text-3xl flex items-center justify-center shadow-lg">
            {bond.total}
          </div>
        </div>

        <p className="font-fun text-3xl text-gray-800 mb-6">{pair[0]} + ? = {bond.total}</p>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {Array.from({ length: bond.total + 1 }, (_, i) => i).map(n => (
            <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => setAnswer(String(n))}
              className={`w-10 h-10 rounded-full font-fun text-base transition-all ${answer === String(n) ? 'bg-yellow-400 text-white shadow-md scale-110' : 'bg-gray-100 hover:bg-yellow-100'}`}>
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

        <button onClick={check} disabled={!answer}
          className="bg-gradient-to-r from-red-400 to-orange-400 disabled:opacity-50 text-white font-fun text-xl px-8 py-3 rounded-2xl shadow-lg">
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
      <PageHeader emoji="🔢" title="Math World" subtitle="Count, add and discover numbers!" gradient="from-orange-400 to-yellow-400" />
      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {MATH_MODES.map((m, i) => (
                <motion.button key={m.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setMode(m.id)}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden text-left transition-all">
                  <div className={`bg-gradient-to-br ${m.color} h-24 flex items-center justify-center text-5xl`}>
                    {m.emoji}
                  </div>
                  <div className="p-4">
                    <h3 className="font-fun text-lg text-gray-800">{m.label}</h3>
                    <p className="text-sm text-gray-400 font-semibold">{m.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {mode === 'counting' && <CountingGame key="counting" onBack={() => setMode(null)} />}
        {mode === 'addition' && <ArithmeticGame key="addition" mode="addition" onBack={() => setMode(null)} />}
        {mode === 'subtraction' && <ArithmeticGame key="subtraction" mode="subtraction" onBack={() => setMode(null)} />}
        {mode === 'fill-sequence' && <FillSequence key="fill" onBack={() => setMode(null)} />}
        {mode === 'number-bonds' && <NumberBonds key="bonds" onBack={() => setMode(null)} />}
      </AnimatePresence>
    </div>
  )
}
