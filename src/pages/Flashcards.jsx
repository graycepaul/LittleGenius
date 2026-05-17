import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import { triggerStarBurst } from '../components/ui/StarBurst'
import {
  LETTER_CARDS, NUMBER_CARDS, SIGHT_WORD_CARDS, COLOR_CARDS, SHAPE_CARDS,
  HOUSEHOLD_CARDS, KITCHEN_CARDS, SIGN_CARDS, FLAG_CARDS, WARDROBE_CARDS,
  PLANET_CARDS, VEHICLE_CARDS, BIRD_CARDS,
  FRUIT_CARDS, VEGETABLE_CARDS, EMOTION_CARDS, SPORT_CARDS,
  DECK_TYPES,
} from '../data/flashcards'
import { useSpeech } from '../hooks/useSpeech'

const DECK_DATA = {
  letters:    LETTER_CARDS,
  numbers:    NUMBER_CARDS,
  sightwords: SIGHT_WORD_CARDS,
  colors:     COLOR_CARDS,
  shapes:     SHAPE_CARDS,
  household:  HOUSEHOLD_CARDS,
  kitchen:    KITCHEN_CARDS,
  signs:      SIGN_CARDS,
  flags:      FLAG_CARDS,
  wardrobe:   WARDROBE_CARDS,
  planets:    PLANET_CARDS,
  vehicles:   VEHICLE_CARDS,
  birds:      BIRD_CARDS,
  fruits:     FRUIT_CARDS,
  vegetables: VEGETABLE_CARDS,
  emotions:   EMOTION_CARDS,
  sports:     SPORT_CARDS,
}

// Returns the label text to speak for any card type
function getSpokenText(deckId, card) {
  if (deckId === 'letters')    return `${card.upper}. ${card.word}.`
  if (deckId === 'numbers')    return `${card.word}. ${card.number}.`
  if (deckId === 'sightwords') return `${card.word}. ${card.sentence}`
  if (deckId === 'colors')     return `${card.name}. Things that are ${card.name.toLowerCase()}: ${card.things}.`
  if (deckId === 'shapes')     return `${card.name}. ${card.fun}`
  if (deckId === 'household')  return `${card.word}. ${card.sentence}`
  if (deckId === 'kitchen')    return `${card.word}. ${card.sentence}`
  if (deckId === 'wardrobe')   return `${card.word}. ${card.sentence}`
  if (deckId === 'signs')      return `${card.word}. ${card.meaning}`
  if (deckId === 'flags')      return `${card.country}. The capital is ${card.capital}. It is in ${card.continent}.`
  if (deckId === 'planets')    return `${card.word}. ${card.fact}`
  if (deckId === 'vehicles')   return `${card.word}. It goes: ${card.sound}`
  if (deckId === 'birds')      return `${card.word}. ${card.fact}`
  if (deckId === 'fruits')     return `${card.word}. It is ${card.colour}.`
  if (deckId === 'vegetables') return `${card.word}. It is ${card.colour}.`
  if (deckId === 'emotions')   return `${card.word}. ${card.sentence}`
  if (deckId === 'sports')     return `${card.word}. You ${card.action}.`
  return card.word || card.country || ''
}

// ── Card front content ─────────────────────────────────────────────────────────
function CardFront({ deckId, card, accentColor }) {
  if (deckId === 'letters') return (
    <>
      <span className="font-fun leading-none" style={{ fontSize: '5rem', color: accentColor }}>{card.upper}</span>
      <span className="font-fun mt-1" style={{ fontSize: '3rem', color: accentColor, opacity: 0.6 }}>{card.lower}</span>
      <p className="mt-3 font-semibold text-sm" style={{ color: 'var(--c-muted)' }}>Tap to see more!</p>
    </>
  )
  if (deckId === 'numbers') return (
    <>
      <span className="font-fun leading-none" style={{ fontSize: '5rem', color: accentColor }}>{card.number}</span>
      <span style={{ fontSize: '2.5rem' }}>{card.emoji}</span>
    </>
  )
  if (deckId === 'sightwords') return (
    <span className="font-fun text-center" style={{ fontSize: '3rem', color: accentColor }}>{card.word}</span>
  )
  if (deckId === 'colors') return (
    <>
      <div className="w-28 h-28 rounded-full shadow-inner border-4 border-white mb-3"
        style={{ background: card.hex }} />
      <span className="font-fun text-2xl" style={{ color: 'var(--c-text)' }}>{card.name}</span>
    </>
  )
  if (deckId === 'flags') return (
    <>
      <span style={{ fontSize: '5rem' }}>{card.emoji}</span>
      <span className="font-fun text-xl mt-3 text-center" style={{ color: 'var(--c-text)' }}>{card.country}</span>
    </>
  )
  if (deckId === 'signs') return (
    <>
      <span style={{ fontSize: '3rem' }}>{card.emoji}</span>
      <div className="mt-3 px-5 py-2 rounded-xl font-fun text-xl font-black tracking-widest text-white"
        style={{ background: accentColor }}>
        {card.word}
      </div>
    </>
  )
  // Generic: large emoji + word
  return (
    <>
      <span style={{ fontSize: '4.5rem' }}>{card.emoji}</span>
      <span className="font-fun text-2xl mt-2 text-center" style={{ color: 'var(--c-text)' }}>
        {card.word || card.name}
      </span>
    </>
  )
}

// ── Card back content ──────────────────────────────────────────────────────────
function CardBack({ deckId, card }) {
  if (deckId === 'letters') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-2xl mt-2" style={{ color: 'var(--c-primary)' }}>{card.upper} is for</p>
      <p className="font-fun text-xl" style={{ color: 'var(--c-text)' }}>{card.word}</p>
    </>
  )
  if (deckId === 'numbers') {
    const n = card.number
    const tens = Math.floor(n / 10)
    const ones = n % 10
    return (
      <>
        <p className="font-fun text-2xl mb-2" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
        {n <= 20 ? (
          <div className="flex flex-wrap justify-center gap-1 max-w-40">
            {Array.from({ length: n }).map((_, i) => (
              <span key={i} style={{ fontSize: '1.4rem' }}>{card.emoji}</span>
            ))}
          </div>
        ) : (
          <div className="text-center">
            {tens > 0 && (
              <div className="mb-1">
                <span className="text-xs font-bold mb-1 block" style={{ color: 'var(--c-muted)' }}>{tens} tens</span>
                <div className="flex flex-wrap justify-center gap-0.5">
                  {Array.from({ length: tens }).map((_, i) => (
                    <span key={i} className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--c-primary)', color: '#fff' }}>10</span>
                  ))}
                </div>
              </div>
            )}
            {ones > 0 && (
              <div className="mt-1">
                <span className="text-xs font-bold mb-1 block" style={{ color: 'var(--c-muted)' }}>{ones} ones</span>
                <div className="flex flex-wrap justify-center gap-0.5">
                  {Array.from({ length: ones }).map((_, i) => (
                    <span key={i} style={{ fontSize: '1.2rem' }}>{card.emoji}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </>
    )
  }
  if (deckId === 'sightwords') return (
    <>
      <span style={{ fontSize: '2.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-2xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="font-semibold text-sm italic text-center px-2" style={{ color: 'var(--c-muted)' }}>
        "{card.sentence}"
      </p>
      {card.level && (
        <span className="mt-3 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: card.level === 1 ? '#10B981' : card.level === 2 ? '#F59E0B' : '#EF4444' }}>
          Level {card.level}
        </span>
      )}
    </>
  )
  if (deckId === 'colors') return (
    <>
      <div className="w-24 h-24 rounded-2xl border-4 mb-3 shadow"
        style={{ background: card.hex, borderColor: card.hex + '44' }} />
      <p className="font-fun text-2xl mb-1" style={{ color: 'var(--c-text)' }}>{card.name}</p>
      <p className="text-xs font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>
        {card.things}
      </p>
    </>
  )
  if (deckId === 'shapes') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.name}</p>
      {card.sides > 0 && (
        <p className="text-xs font-bold mb-1" style={{ color: 'var(--c-muted)' }}>{card.sides} sides</p>
      )}
      <p className="text-sm font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>{card.fun}</p>
    </>
  )
  if (deckId === 'household' || deckId === 'kitchen' || deckId === 'wardrobe') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="text-sm font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>{card.sentence}</p>
    </>
  )
  if (deckId === 'signs') return (
    <>
      <span style={{ fontSize: '3rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="text-sm font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>{card.meaning}</p>
    </>
  )
  if (deckId === 'flags') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-0.5" style={{ color: 'var(--c-primary)' }}>{card.country}</p>
      <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--c-muted)' }}>Capital: {card.capital}</p>
      <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-bold text-white"
        style={{ background: 'var(--c-primary)' }}>{card.continent}</span>
    </>
  )
  if (deckId === 'planets') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="text-sm font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>{card.fact}</p>
    </>
  )
  if (deckId === 'vehicles') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="font-fun text-lg" style={{ color: 'var(--c-muted)' }}>{card.sound}</p>
    </>
  )
  if (deckId === 'birds') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="text-sm font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>{card.fact}</p>
    </>
  )
  if (deckId === 'fruits' || deckId === 'vegetables') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="text-sm font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>
        Colour: {card.colour}
      </p>
    </>
  )
  if (deckId === 'emotions') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="text-sm font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>{card.sentence}</p>
    </>
  )
  if (deckId === 'sports') return (
    <>
      <span style={{ fontSize: '3.5rem' }}>{card.emoji}</span>
      <p className="font-fun text-xl mt-2 mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
      <p className="text-sm font-semibold text-center px-2" style={{ color: 'var(--c-muted)' }}>
        You {card.action}!
      </p>
    </>
  )
  return null
}

// ── Deck viewer (swipe through cards) ─────────────────────────────────────────
function DeckViewer({ deckId, onClose }) {
  const { speak } = useSpeech()
  const { addStars, earnBadge } = useApp()
  const cards = DECK_DATA[deckId] || []
  const deckMeta = DECK_TYPES.find(d => d.id === deckId)
  const accentColor = deckMeta?.color || 'var(--c-primary)'

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
        earnBadge({ id: `deck-${deckId}`, emoji: deckMeta?.emoji || '🃏', name: `${deckMeta?.label || deckId} master!` })
      }
    }
  }
  function prev() { if (idx > 0) { setIdx(i => i - 1); setFlipped(false) } }

  function speakCard() {
    speak(getSpokenText(deckId, card))
  }

  if (done) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-7xl mb-4 animate-bounce">🎉</div>
      <h2 className="font-fun text-4xl mb-2" style={{ color: 'var(--c-gold)' }}>Amazing!</h2>
      <p className="font-semibold mb-6" style={{ color: 'var(--c-muted)' }}>
        You finished all {cards.length} cards! +5 ⭐
      </p>
      <div className="flex gap-3">
        <button onClick={() => { setIdx(0); setDone(false); setFlipped(false) }}
          className="btn-primary text-lg px-6 py-3">
          Again! 🔄
        </button>
        <button onClick={onClose}
          className="font-semibold px-6 py-3 rounded-2xl"
          style={{ background: 'var(--c-bg)', color: 'var(--c-muted)' }}>
          Back
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex items-center gap-4 w-full max-w-sm justify-between">
        <button onClick={onClose} className="font-semibold hover:opacity-70"
          style={{ color: 'var(--c-muted)' }}>← Back</button>
        <span className="font-semibold" style={{ color: 'var(--c-muted)' }}>{idx + 1} / {cards.length}</span>
        <button onClick={speakCard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm text-white"
          style={{ background: accentColor }}>
          🔊 Hear
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm rounded-full h-2" style={{ background: 'var(--c-border)' }}>
        <motion.div className="h-2 rounded-full" animate={{ width: `${((idx + 1) / cards.length) * 100}%` }}
          style={{ background: accentColor }} />
      </div>

      {/* The card */}
      <div className="card-flip w-64 h-80 cursor-pointer select-none"
        onClick={() => { setFlipped(f => !f); if (!flipped) speakCard() }}>
        <div className={`card-flip-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="card-front w-full h-full rounded-3xl bg-white flex flex-col items-center justify-center shadow-xl p-6"
            style={{ border: `3px solid ${accentColor}33` }}>
            <CardFront deckId={deckId} card={card} accentColor={accentColor} />
          </div>
          {/* Back */}
          <div className="card-back w-full h-full rounded-3xl bg-white flex flex-col items-center justify-center shadow-xl p-6 text-center"
            style={{ border: `3px solid ${accentColor}66` }}>
            <CardBack deckId={deckId} card={card} />
          </div>
        </div>
      </div>

      <p className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>👆 Tap card to flip & hear!</p>

      {/* Nav */}
      <div className="flex gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={prev} disabled={idx === 0}
          className="w-14 h-14 rounded-full font-fun text-2xl flex items-center justify-center disabled:opacity-30"
          style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
          ←
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={next}
          className="w-14 h-14 rounded-full text-white font-fun text-2xl flex items-center justify-center shadow-lg"
          style={{ background: accentColor }}>
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
    addCustomCard({ word: word.trim(), sentence: sentence.trim(), emoji: selectedEmoji })
    addStars(3)
    triggerStarBurst()
    setSaved(true)
    setTimeout(() => { setWord(''); setSentence(''); setSaved(false) }, 1500)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="el-card p-6 max-w-lg mx-auto">
      <button onClick={onClose} className="font-semibold mb-4 block hover:opacity-70"
        style={{ color: 'var(--c-muted)' }}>← Back</button>
      <h2 className="font-fun text-2xl mb-1" style={{ color: 'var(--c-primary)' }}>Make My Own Card! 🎨</h2>
      <p className="text-sm font-semibold mb-5" style={{ color: 'var(--c-muted)' }}>
        Write a word and pick a picture for it!
      </p>

      <label className="block font-semibold mb-1" style={{ color: 'var(--c-text)' }}>My word or title</label>
      <input value={word} onChange={e => setWord(e.target.value)} placeholder="e.g. Cat, Rainbow, My dog..."
        className="w-full rounded-2xl px-4 py-3 font-semibold text-xl outline-none mb-4"
        style={{ border: '2.5px solid var(--c-border)', fontFamily: 'Nunito, sans-serif' }} />

      <label className="block font-semibold mb-1" style={{ color: 'var(--c-text)' }}>A sentence (optional)</label>
      <textarea value={sentence} onChange={e => setSentence(e.target.value)} rows={3}
        placeholder="e.g. My cat is fluffy and loves to sleep..."
        className="w-full rounded-2xl px-4 py-3 font-semibold text-base outline-none mb-4 resize-none"
        style={{ border: '2.5px solid var(--c-border)', fontFamily: 'Nunito, sans-serif' }} />

      <label className="block font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Pick a picture 🖼️</label>
      <div className="flex flex-wrap gap-2 mb-5">
        {PICK_EMOJIS.map(e => (
          <button key={e} onClick={() => setSelectedEmoji(e)}
            className="text-3xl p-2 rounded-xl transition-all"
            style={selectedEmoji === e
              ? { background: 'var(--c-primary-light)', outline: '2px solid var(--c-primary)', transform: 'scale(1.1)' }
              : { background: 'var(--c-bg)' }}>
            {e}
          </button>
        ))}
      </div>

      {word && (
        <div className="mb-5 flex justify-center">
          <div className="el-card rounded-3xl p-6 text-center w-48"
            style={{ borderColor: 'var(--c-primary)' }}>
            <span className="text-5xl mb-2 block">{selectedEmoji}</span>
            <p className="font-fun text-2xl" style={{ color: 'var(--c-primary)' }}>{word}</p>
            {sentence && (
              <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--c-muted)' }}>
                {sentence.slice(0, 40)}{sentence.length > 40 ? '…' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={!word.trim()} className="btn-primary w-full text-xl py-3">
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
      <p className="font-fun text-2xl mb-2" style={{ color: 'var(--c-muted)' }}>No cards yet!</p>
      <p className="font-semibold mb-6" style={{ color: 'var(--c-muted)' }}>Make your first card to see it here.</p>
      <button onClick={onClose} className="btn-primary px-6 py-3 text-lg">Back</button>
    </div>
  )

  return (
    <div>
      <button onClick={onClose} className="font-semibold hover:opacity-70 mb-4 block"
        style={{ color: 'var(--c-muted)' }}>← Back</button>
      <h2 className="font-fun text-2xl mb-4" style={{ color: 'var(--c-primary)' }}>
        My Cards ({customCards.length})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {customCards.map(card => (
          <motion.div key={card.id} whileHover={{ scale: 1.04 }}
            className="card-flip h-48 cursor-pointer" onClick={() => setViewing(v => v === card.id ? null : card.id)}>
            <div className={`card-flip-inner w-full h-full ${viewing === card.id ? 'flipped' : ''}`}>
              <div className="card-front rounded-3xl bg-white flex flex-col items-center justify-center p-4 shadow-lg"
                style={{ border: '2.5px solid var(--c-border)' }}>
                <span className="text-5xl mb-2">{card.emoji}</span>
                <p className="font-fun text-xl text-center" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
              </div>
              <div className="card-back rounded-3xl bg-white flex flex-col items-center justify-center p-4 shadow-lg text-center"
                style={{ border: '2.5px solid var(--c-primary)' }}>
                <span className="text-4xl mb-2">{card.emoji}</span>
                <p className="font-fun text-lg mb-1" style={{ color: 'var(--c-primary)' }}>{card.word}</p>
                {card.sentence && (
                  <p className="text-xs font-semibold" style={{ color: 'var(--c-muted)' }}>{card.sentence}</p>
                )}
                <button onClick={e => { e.stopPropagation(); deleteCustomCard(card.id) }}
                  className="mt-2 text-xs" style={{ color: '#EF4444' }}>🗑️ delete</button>
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
  const [view, setView] = useState('home')

  return (
    <div>
      <PageHeader emoji="🃏" title="Flash Cards" subtitle="Flip cards to learn — tap to hear!"
        accentColor="var(--c-cards)" />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {DECK_TYPES.map((deck, i) => (
                <motion.button key={deck.id}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setView(`deck:${deck.id}`)}
                  className="el-card text-left overflow-hidden group">
                  <div className="h-20 flex items-center justify-center"
                    style={{ background: deck.color + '18' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                      style={{ background: deck.color }}>
                      {deck.emoji}
                    </div>
                  </div>
                  <div className="p-3 pb-4">
                    <h3 className="font-fun text-base leading-tight" style={{ color: 'var(--c-text)' }}>
                      {deck.label}
                    </h3>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--c-muted)' }}>
                      {deck.desc}
                    </p>
                  </div>
                </motion.button>
              ))}

              {/* Create card */}
              <motion.button whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView('create')}
                className="el-card text-left overflow-hidden group">
                <div className="h-20 flex items-center justify-center" style={{ background: '#10B98118' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                    style={{ background: '#10B981' }}>
                    🎨
                  </div>
                </div>
                <div className="p-3 pb-4">
                  <h3 className="font-fun text-base" style={{ color: 'var(--c-text)' }}>Make My Card</h3>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--c-muted)' }}>Create your own!</p>
                </div>
              </motion.button>

              {/* My cards */}
              <motion.button whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView('mycards')}
                className="el-card text-left overflow-hidden group">
                <div className="h-20 flex items-center justify-center" style={{ background: '#F59E0B18' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                    style={{ background: '#F59E0B' }}>
                    📂
                  </div>
                </div>
                <div className="p-3 pb-4">
                  <h3 className="font-fun text-base" style={{ color: 'var(--c-text)' }}>My Cards</h3>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--c-muted)' }}>Cards I made!</p>
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
