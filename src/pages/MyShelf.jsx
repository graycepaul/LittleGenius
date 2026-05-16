import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import SpeakButton from '../components/ui/SpeakButton'
import { getCardGradient } from '../utils/colors'

const TABS = [
  { id: 'stories', label: 'My Stories', emoji: '📖' },
  { id: 'cards', label: 'My Cards', emoji: '🃏' },
  { id: 'progress', label: 'Progress', emoji: '🏆' },
]

// ── Stories tab ────────────────────────────────────────────────────────────────
function StoriesTab() {
  const { savedStories, deleteStory } = useApp()
  const [viewing, setViewing] = useState(null)

  if (savedStories.length === 0) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📭</div>
      <p className="font-fun text-2xl text-gray-400 mb-2">No saved stories yet!</p>
      <p className="text-gray-400 font-semibold">Go to Reading Room or Writing Pad to save your first story.</p>
    </div>
  )

  if (viewing) {
    const story = savedStories.find(s => s.id === viewing)
    if (!story) { setViewing(null); return null }
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setViewing(null)} className="text-gray-500 font-semibold mb-4 block hover:text-gray-700">← Back</button>
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{story.emoji}</span>
            <div>
              <h2 className="font-fun text-2xl text-gray-800">{story.title}</h2>
              <p className="text-sm text-gray-400 font-semibold">Saved on {story.savedAt}</p>
            </div>
            <SpeakButton text={story.text} label="Read aloud" className="ml-auto" />
          </div>

          {story.type === 'writing' && story.words ? (
            <div className="bg-gray-50 rounded-2xl p-4 min-h-24" style={{ lineHeight: '2.5rem' }}>
              {story.words.map((w, i) => {
                if (w.type === 'break') return <br key={i} />
                return (
                  <span key={i} style={{ color: w.color, fontSize: '22px' }} className="font-body font-bold">
                    {w.text}{' '}
                  </span>
                )
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 font-body text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {story.text}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {savedStories.map((story, i) => (
        <motion.div key={story.id}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-white rounded-3xl shadow-md hover:shadow-lg transition-all overflow-hidden">
          <button onClick={() => setViewing(story.id)} className="w-full text-left">
            <div className={`bg-gradient-to-br ${getCardGradient(i)} h-20 flex items-center justify-center text-4xl`}>
              {story.emoji}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${story.type === 'writing' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {story.type === 'writing' ? '✏️ Written' : '📖 Read'}
                  </span>
                  <h3 className="font-fun text-lg text-gray-800 mt-1">{story.title}</h3>
                  <p className="text-xs text-gray-400 font-semibold">{story.savedAt}</p>
                </div>
              </div>
            </div>
          </button>
          <div className="px-4 pb-4">
            <button onClick={() => deleteStory(story.id)}
              className="text-xs text-red-400 hover:text-red-600 font-semibold">
              🗑️ Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Custom cards tab ───────────────────────────────────────────────────────────
function CardsTab() {
  const { customCards, deleteCustomCard } = useApp()
  const [flipped, setFlipped] = useState(null)

  if (customCards.length === 0) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🃏</div>
      <p className="font-fun text-2xl text-gray-400 mb-2">No custom cards yet!</p>
      <p className="text-gray-400 font-semibold">Go to Flash Cards → Make My Card to create your first card.</p>
    </div>
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {customCards.map((card, i) => (
        <motion.div key={card.id}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="card-flip h-52 cursor-pointer"
          onClick={() => setFlipped(f => f === card.id ? null : card.id)}>
          <div className={`card-flip-inner w-full h-full ${flipped === card.id ? 'flipped' : ''}`}>
            <div className={`card-front rounded-3xl bg-gradient-to-br ${card.gradient || 'from-yellow-400 to-orange-400'} flex flex-col items-center justify-center text-white p-4 shadow-lg`}>
              <span className="text-5xl mb-2">{card.emoji}</span>
              <p className="font-fun text-xl text-center">{card.word}</p>
            </div>
            <div className="card-back rounded-3xl bg-white border-4 border-yellow-300 flex flex-col items-center justify-center p-4 shadow-lg text-center">
              <span className="text-4xl mb-2">{card.emoji}</span>
              <p className="font-fun text-lg text-yellow-600 mb-1">{card.word}</p>
              {card.sentence && <p className="text-xs text-gray-500 font-semibold leading-snug">{card.sentence}</p>}
              <div className="flex gap-2 mt-3">
                <SpeakButton text={card.word} size="sm" />
                <button onClick={e => { e.stopPropagation(); deleteCustomCard(card.id) }}
                  className="text-xs text-red-400 hover:text-red-600 bg-red-50 rounded-full px-2 py-1">🗑️</button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Progress tab ───────────────────────────────────────────────────────────────
function ProgressTab() {
  const { stars, streak, completedTasks, badges, savedStories, customCards } = useApp()
  const TASKS_TOTAL = 10

  const stats = [
    { label: 'Stars Earned', value: stars, emoji: '⭐', color: 'from-yellow-400 to-orange-400' },
    { label: 'Day Streak', value: streak.count, emoji: '🔥', color: 'from-orange-400 to-red-400' },
    { label: 'Tasks Done', value: `${completedTasks.length}/${TASKS_TOTAL}`, emoji: '✅', color: 'from-green-400 to-teal-400' },
    { label: 'Stories Saved', value: savedStories.length, emoji: '📖', color: 'from-blue-400 to-cyan-400' },
    { label: 'Cards Made', value: customCards.length, emoji: '🃏', color: 'from-purple-400 to-pink-400' },
    { label: 'Badges', value: badges.length, emoji: '🏅', color: 'from-indigo-400 to-violet-400' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-3xl shadow-md p-5 text-center">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mx-auto mb-3 shadow-md`}>
              {s.emoji}
            </div>
            <p className="font-fun text-3xl text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-400 font-semibold mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h3 className="font-fun text-2xl text-yellow-500 mb-4">🏅 My Badges</h3>
          <div className="flex flex-wrap gap-3">
            {badges.map(b => (
              <motion.div key={b.id} whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-3">
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-xs font-semibold text-gray-600 mt-1 text-center max-w-16">{b.name}</span>
                <span className="text-xs text-gray-400">{b.earnedAt}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks progress */}
      <div className="bg-white rounded-3xl shadow-md p-6 mt-4">
        <h3 className="font-fun text-2xl text-indigo-500 mb-4">⚡ Task Progress</h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedTasks.length / TASKS_TOTAL) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-indigo-400 to-violet-400 h-4 rounded-full"
            />
          </div>
          <span className="font-fun text-lg text-indigo-500">{completedTasks.length}/{TASKS_TOTAL}</span>
        </div>
        {completedTasks.length === TASKS_TOTAL && (
          <p className="font-fun text-xl text-green-500">🎉 All tasks complete! You're a champion!</p>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MyShelf() {
  const [tab, setTab] = useState('stories')

  return (
    <div>
      <PageHeader emoji="📚" title="My Shelf" subtitle="Your stories, cards and achievements!" gradient="from-pink-400 to-red-400" />

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              tab === t.id ? 'bg-pink-400 text-white shadow-md' : 'text-gray-500 hover:bg-pink-50'
            }`}>
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === 'stories' && <StoriesTab />}
          {tab === 'cards' && <CardsTab />}
          {tab === 'progress' && <ProgressTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
