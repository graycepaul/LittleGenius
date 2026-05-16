import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import SpeakButton from '../components/ui/SpeakButton'
import { triggerStarBurst } from '../components/ui/StarBurst'
import {
  LETTER_CARDS, NUMBER_CARDS, SIGHT_WORD_CARDS, COLOR_CARDS, SHAPE_CARDS, DECK_TYPES
} from '../data/flashcards'
import { getCardGradient } from '../utils/colors'
import { useSpeech } from '../hooks/useSpeech'

const DECK_DATA = {
  letters: LETTER_CARDS,
  numbers: NUMBER_CARDS,
  sightwords: SIGHT_WORD_CARDS,
  colors: COLOR_CARDS,
  shapes: SHAPE_CARDS,
}

// ── Single flip card ──────────────────────────────────────────────────────────
function FlipCard({ front, back, gradient, size = 'lg' }) {
  const [flipped, setFlipped] = useState(false)
  const dim = size === 'lg' ? 'h-52 w-40' : 'h-40 w-28'

  return (
    <div className={`card-flip ${dim} cursor-pointer select-none`} onClick={() => setFlipped(f => !f)}>
      <div className={`card-flip-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className={`card-front w-full h-full rounded-3xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center shadow-lg text-white p-3`}>
          {front}
        </div>
        {/* Back */}
        <div className={`card-back rounded-3xl bg-white border-4 border-yellow-300 flex flex-col items-center justify-center shadow-lg p-3`}>
          {back}
        </div>
      </div>
    </div>
  )
}

// ── Deck viewer (swipe through cards) ─────────────────────────────────────────
function DeckViewer({ deckId, onClose }) {
  const { speak } = useSpeech()
  const { addStars, earnBadge } = useApp()
  const cards = DECK_DATA[deckId] || []
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const starsGiven = useRef(false)

  const card = cards[idx]

  function next() {
    if (idx < cards.length - 1) { setIdx(i => i + 1); setFlipped(false) }
    else {
      setDone(true)
      if (!starsGiven.current) {
        starsGiven.current = true
        addStars(5)
        triggerStarBurst()
        earnBadge({ id: `deck-${deckId}`, emoji: '🃏', name: `${deckId} master!` })
      }
    }
  }
  function prev() { if (idx > 0) { setIdx(i => i - 1); setFlipped(false) } }

  function speakCard() {
    if (deckId === 'letters') speak(`${card.upper} — ${card.word}`)
    else if (deckId === 'numbers') speak(`${card.number} — ${card.word}`)
    else if (deckId === 'sightwords') speak(`${card.word}. ${card.sentence}`)
    else if (deckId === 'colors') speak(card.name)
    else if (deckId === 'shapes') speak(`${card.name}. ${card.fun}`)
  }

  if (done) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-7xl mb-4 animate-bounce">🎉</div>
      <h2 className="font-fun text-4xl text-yellow-500 mb-2">Amazing!</h2>
      <p className="font-semibold text-gray-500 mb-6">You finished all {cards.length} cards! +5 ⭐</p>
      <div className="flex gap-3">
        <button onClick={() => { setIdx(0); setDone(false); setFlipped(false) }}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-fun text-lg px-6 py-3 rounded-2xl shadow">
          Again! 🔄
        </button>
        <button onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-2xl">
          Back
        </button>
      </div>
    </motion.div>
  )

  const gradient = getCardGradient(idx)

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex items-center gap-4 w-full max-w-sm justify-between">
        <button onClick={onClose} className="text-gray-500 font-semibold hover:text-gray-700">← Back</button>
        <span className="font-semibold text-gray-400">{idx + 1} / {cards.length}</span>
        <SpeakButton text="" size="sm" label="Hear" onClick={speakCard} />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm bg-gray-200 rounded-full h-2">
        <motion.div className="bg-yellow-400 h-2 rounded-full" animate={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
      </div>

      {/* The card */}
      <div className="card-flip w-64 h-80 cursor-pointer select-none" onClick={() => { setFlipped(f => !f); speakCard() }}>
        <div className={`card-flip-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className={`card-front w-full h-full rounded-3xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center shadow-xl text-white p-6`}>
            {deckId === 'letters' && (
              <>
                <span className="font-fun text-8xl leading-none">{card.upper}</span>
                <span className="font-fun text-5xl mt-2 opacity-80">{card.lower}</span>
                <p className="mt-4 font-semibold text-white/80 text-lg">Tap to see more!</p>
              </>
            )}
            {deckId === 'numbers' && (
              <>
                <span className="font-fun text-8xl leading-none">{card.number}</span>
                <span className="text-4xl mt-2">{card.emoji}</span>
              </>
            )}
            {deckId === 'sightwords' && (
              <span className="font-fun text-5xl text-center">{card.word}</span>
            )}
            {deckId === 'colors' && (
              <>
                <div className={`w-24 h-24 rounded-full ${card.bg} border-4 border-white shadow-inner mb-3`} />
                <span className="font-fun text-3xl">{card.name}</span>
              </>
            )}
            {deckId === 'shapes' && (
              <>
                <span className="text-8xl">{card.emoji}</span>
                <span className="font-fun text-3xl mt-2">{card.name}</span>
              </>
            )}
          </div>
          {/* Back */}
          <div className="card-back rounded-3xl bg-white border-4 border-yellow-300 flex flex-col items-center justify-center shadow-xl p-6 text-center">
            {deckId === 'letters' && (
              <>
                <span className="text-6xl mb-2">{card.emoji}</span>
                <p className="font-fun text-3xl text-yellow-600">{card.upper} is for</p>
                <p className="font-fun text-2xl text-gray-700">{card.word}</p>
              </>
            )}
            {deckId === 'numbers' && (
              <>
                <p className="font-fun text-3xl text-yellow-600 mb-2">{card.word}</p>
                <div className="flex flex-wrap justify-center gap-1 max-w-40">
                  {Array(card.number).fill(card.emoji).map((e, i) => (
                    <span key={i} className="text-2xl">{e}</span>
                  ))}
                </div>
              </>
            )}
            {deckId === 'sightwords' && (
              <>
                <span className="text-4xl mb-2">{card.emoji}</span>
                <p className="font-fun text-2xl text-yellow-600 mb-2">{card.word}</p>
                <p className="text-gray-500 font-semibold italic">"{card.sentence}"</p>
              </>
            )}
            {deckId === 'colors' && (
              <>
                <div className={`w-32 h-32 rounded-3xl ${card.bg} border-4 border-gray-200 mb-3`} />
                <p className="font-fun text-3xl text-gray-700">{card.name}</p>
              </>
            )}
            {deckId === 'shapes' && (
              <>
                <span className="text-6xl mb-2">{card.emoji}</span>
                <p className="font-fun text-2xl text-yellow-600">{card.name}</p>
                <p className="text-gray-500 font-semibold mt-2">{card.fun}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 font-semibold">👆 Tap card to flip!</p>

      {/* Nav */}
      <div className="flex gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={prev} disabled={idx === 0}
          className="w-14 h-14 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 font-fun text-2xl flex items-center justify-center">
          ←
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={next}
          className="w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white font-fun text-2xl flex items-center justify-center shadow-lg">
          →
        </motion.button>
      </div>
    </div>
  )
}

// ── Custom card creator ────────────────────────────────────────────────────────
function CardCreator({ onClose }) {
  const { addCustomCard, addStars } = useApp()
  const [word, setWord] = useState('')
  const [sentence, setSentence] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('⭐')
  const [saved, setSaved] = useState(false)

  const PICK_EMOJIS = ['🐱','🐶','🦁','🐸','🦋','🌸','🌈','⭐','🏠','🌳','🚀','🍎',
    '🐠','🦄','🎨','🎵','🏆','❤️','🌙','☀️','🍕','🍦','🐧','🐘']

  function handleSave() {
    if (!word.trim()) return
    addCustomCard({ word: word.trim(), sentence: sentence.trim(), emoji: selectedEmoji, gradient: getCardGradient(Date.now()) })
    addStars(3)
    triggerStarBurst()
    setSaved(true)
    setTimeout(() => { setWord(''); setSentence(''); setSaved(false) }, 1500)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6 max-w-lg mx-auto">
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-semibold mb-4 block">← Back</button>
      <h2 className="font-fun text-2xl text-yellow-500 mb-1">Make My Own Card! 🎨</h2>
      <p className="text-sm text-gray-400 font-semibold mb-5">Write a word or story and pick a picture for it!</p>

      {/* Word input */}
      <label className="block font-semibold text-gray-600 mb-1">My word or title</label>
      <input value={word} onChange={e => setWord(e.target.value)} placeholder="e.g. Cat, Rainbow, My dog..."
        className="w-full border-4 border-yellow-200 focus:border-yellow-400 rounded-2xl px-4 py-3 font-body text-xl outline-none mb-4" />

      {/* Sentence input */}
      <label className="block font-semibold text-gray-600 mb-1">A sentence (optional)</label>
      <textarea value={sentence} onChange={e => setSentence(e.target.value)} rows={3}
        placeholder="e.g. My cat is fluffy and loves to sleep..."
        className="w-full border-4 border-yellow-200 focus:border-yellow-400 rounded-2xl px-4 py-3 font-body text-base outline-none mb-4 resize-none" />

      {/* Emoji / image picker */}
      <label className="block font-semibold text-gray-600 mb-2">Pick a picture 🖼️</label>
      <div className="flex flex-wrap gap-2 mb-5">
        {PICK_EMOJIS.map(e => (
          <button key={e} onClick={() => setSelectedEmoji(e)}
            className={`text-3xl p-2 rounded-xl transition-all ${selectedEmoji === e ? 'bg-yellow-300 scale-110 shadow' : 'bg-gray-100 hover:bg-yellow-100'}`}>
            {e}
          </button>
        ))}
      </div>

      {/* Preview */}
      {word && (
        <div className="mb-5 flex justify-center">
          <div className={`bg-gradient-to-br ${getCardGradient(0)} rounded-3xl p-6 text-white text-center w-48 shadow-lg`}>
            <span className="text-5xl mb-2 block">{selectedEmoji}</span>
            <p className="font-fun text-2xl">{word}</p>
            {sentence && <p className="text-sm mt-2 text-white/80 font-semibold">{sentence.slice(0, 40)}{sentence.length > 40 ? '…' : ''}</p>}
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={!word.trim()}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 disabled:opacity-50 text-white font-fun text-xl py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all">
        {saved ? '✅ Card Saved! +3 ⭐' : '💾 Save My Card!'}
      </button>
    </motion.div>
  )
}

// ── Custom cards gallery ───────────────────────────────────────────────────────
function MyCardsGallery({ onClose }) {
  const { customCards, deleteCustomCard } = useApp()
  const [viewing, setViewing] = useState(null)

  if (customCards.length === 0) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🃏</div>
      <p className="font-fun text-2xl text-gray-400 mb-2">No cards yet!</p>
      <p className="text-gray-400 font-semibold mb-6">Make your first card to see it here.</p>
      <button onClick={onClose} className="bg-yellow-400 text-white font-fun text-lg px-6 py-3 rounded-2xl">Back</button>
    </div>
  )

  return (
    <div>
      <button onClick={onClose} className="text-gray-500 font-semibold hover:text-gray-700 mb-4 block">← Back</button>
      <h2 className="font-fun text-2xl text-yellow-500 mb-4">My Cards ({customCards.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {customCards.map(card => (
          <motion.div key={card.id} whileHover={{ scale: 1.04 }}
            className="card-flip h-48 cursor-pointer" onClick={() => setViewing(v => v === card.id ? null : card.id)}>
            <div className={`card-flip-inner w-full h-full ${viewing === card.id ? 'flipped' : ''}`}>
              <div className={`card-front rounded-3xl bg-gradient-to-br ${card.gradient || 'from-yellow-400 to-orange-400'} flex flex-col items-center justify-center text-white p-4 shadow-lg`}>
                <span className="text-5xl mb-2">{card.emoji}</span>
                <p className="font-fun text-xl text-center">{card.word}</p>
              </div>
              <div className="card-back rounded-3xl bg-white border-4 border-yellow-300 flex flex-col items-center justify-center p-4 shadow-lg text-center">
                <span className="text-4xl mb-2">{card.emoji}</span>
                <p className="font-fun text-lg text-yellow-600 mb-1">{card.word}</p>
                {card.sentence && <p className="text-xs text-gray-500 font-semibold">{card.sentence}</p>}
                <button onClick={e => { e.stopPropagation(); deleteCustomCard(card.id) }}
                  className="mt-2 text-xs text-red-400 hover:text-red-600">🗑️ delete</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Flashcards() {
  const [view, setView] = useState('home') // home | deck:{id} | create | mycards

  return (
    <div>
      <PageHeader emoji="🃏" title="Flash Cards" subtitle="Flip cards to learn — tap to hear!" gradient="from-purple-400 to-pink-500" />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {DECK_TYPES.map((deck, i) => (
                <motion.button key={deck.id} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setView(`deck:${deck.id}`)}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden text-left transition-all">
                  <div className={`bg-gradient-to-br ${deck.color} h-24 flex items-center justify-center text-5xl`}>
                    {deck.emoji}
                  </div>
                  <div className="p-4">
                    <h3 className="font-fun text-lg text-gray-800">{deck.label}</h3>
                    <p className="text-sm text-gray-400 font-semibold">{deck.desc}</p>
                  </div>
                </motion.button>
              ))}

              {/* Create card */}
              <motion.button whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView('create')}
                className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden text-left transition-all">
                <div className="bg-gradient-to-br from-green-400 to-teal-400 h-24 flex items-center justify-center text-5xl">🎨</div>
                <div className="p-4">
                  <h3 className="font-fun text-lg text-gray-800">Make My Card</h3>
                  <p className="text-sm text-gray-400 font-semibold">Create your own!</p>
                </div>
              </motion.button>

              {/* My cards */}
              <motion.button whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView('mycards')}
                className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden text-left transition-all">
                <div className="bg-gradient-to-br from-amber-400 to-yellow-400 h-24 flex items-center justify-center text-5xl">📂</div>
                <div className="p-4">
                  <h3 className="font-fun text-lg text-gray-800">My Cards</h3>
                  <p className="text-sm text-gray-400 font-semibold">Cards I made!</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {view.startsWith('deck:') && (
          <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DeckViewer deckId={view.replace('deck:', '')} onClose={() => setView('home')} />
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardCreator onClose={() => setView('home')} />
          </motion.div>
        )}

        {view === 'mycards' && (
          <motion.div key="mycards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MyCardsGallery onClose={() => setView('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
