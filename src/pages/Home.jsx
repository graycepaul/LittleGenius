import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { triggerStarBurst } from '../components/ui/StarBurst'

const NAV_CARDS = [
  { path: '/reading', emoji: '📖', label: 'Reading Room', desc: 'Read amazing stories!', color: 'from-blue-400 to-cyan-400', bg: 'bg-blue-50' },
  { path: '/writing', emoji: '✏️', label: 'Writing Pad', desc: 'Write with colorful letters!', color: 'from-green-400 to-teal-400', bg: 'bg-green-50' },
  { path: '/flashcards', emoji: '🃏', label: 'Flash Cards', desc: 'Learn letters, numbers & more!', color: 'from-purple-400 to-pink-400', bg: 'bg-purple-50' },
  { path: '/math', emoji: '🔢', label: 'Math World', desc: 'Count, add & explore numbers!', color: 'from-orange-400 to-yellow-400', bg: 'bg-orange-50' },
  { path: '/tasks', emoji: '⚡', label: 'Challenges', desc: 'Fun tasks & earn stars!', color: 'from-indigo-400 to-violet-400', bg: 'bg-indigo-50' },
  { path: '/bedtime', emoji: '🌙', label: 'Bedtime Stories', desc: 'Sleepy time stories!', color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50' },
  { path: '/french', emoji: '🇫🇷', label: 'French', desc: 'Learn to speak French!', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
  { path: '/shelf', emoji: '📚', label: 'My Shelf', desc: 'Your stories & cards!', color: 'from-pink-400 to-red-400', bg: 'bg-pink-50' },
]

function AvatarPicker({ onDone }) {
  const { AVATARS, setProfile } = useApp()
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')

  function handleStart() {
    if (!selected || !name.trim()) return
    setProfile({ avatar: selected, name: name.trim() })
    triggerStarBurst()
    onDone()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center"
      >
        <div className="text-5xl mb-3 animate-bounce">👋</div>
        <h1 className="font-fun text-3xl text-yellow-500 mb-1">Welcome!</h1>
        <p className="text-gray-500 font-semibold mb-6">Pick your animal friend and tell us your name!</p>

        {/* Avatar grid */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {AVATARS.map(av => (
            <motion.button
              key={av.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelected(av)}
              className={`text-4xl p-2 rounded-2xl transition-all ${
                selected?.id === av.id
                  ? 'bg-yellow-300 scale-110 shadow-md'
                  : 'bg-gray-100 hover:bg-yellow-100'
              }`}
            >
              {av.emoji}
            </motion.button>
          ))}
        </div>

        {/* Name input */}
        <input
          type="text"
          placeholder="What is your name? 😊"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
          className="w-full border-4 border-yellow-300 rounded-2xl px-4 py-3 text-xl font-body font-semibold text-center outline-none focus:border-yellow-500 mb-4"
          maxLength={20}
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          disabled={!selected || !name.trim()}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 disabled:opacity-50 text-white font-fun text-2xl py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Let's Go! 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function Home() {
  const { profile, stars, streak, badges } = useApp()
  const navigate = useNavigate()
  const [showAvatarPicker, setShowAvatarPicker] = useState(!profile)

  if (showAvatarPicker && !profile) {
    return <AvatarPicker onDone={() => setShowAvatarPicker(false)} />
  }

  return (
    <div>
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-3xl p-6 mb-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="text-6xl animate-float inline-block">{profile?.avatar?.emoji || '⭐'}</span>
            <div>
              <h1 className="font-fun text-3xl sm:text-4xl">
                Hello, {profile?.name || 'Learner'}! 👋
              </h1>
              <p className="font-semibold text-white/90 mt-1">Ready to learn something amazing today?</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/30 rounded-2xl px-4 py-2 text-center">
              <div className="font-fun text-2xl">⭐ {stars}</div>
              <div className="text-sm font-semibold">Stars</div>
            </div>
            <div className="bg-white/30 rounded-2xl px-4 py-2 text-center">
              <div className="font-fun text-2xl">🔥 {streak.count}</div>
              <div className="text-sm font-semibold">Day Streak</div>
            </div>
            {badges.length > 0 && (
              <div className="bg-white/30 rounded-2xl px-4 py-2 text-center">
                <div className="font-fun text-2xl">🏅 {badges.length}</div>
                <div className="text-sm font-semibold">Badges</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Streak encouragement */}
      {streak.count >= 3 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-orange-100 border-2 border-orange-300 rounded-2xl p-4 mb-6 flex items-center gap-3"
        >
          <span className="text-3xl">🔥</span>
          <div>
            <p className="font-fun text-lg text-orange-600">
              {streak.count} day streak! You're on fire!
            </p>
            <p className="text-sm text-orange-500 font-semibold">Keep coming back every day to grow your streak!</p>
          </div>
        </motion.div>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {NAV_CARDS.map((card, i) => (
          <motion.button
            key={card.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(card.path)}
            className={`${card.bg} border-2 border-transparent hover:border-yellow-300 rounded-3xl p-5 text-left shadow-md hover:shadow-xl transition-all`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-3xl mb-3 shadow-md`}>
              {card.emoji}
            </div>
            <h3 className="font-fun text-lg text-gray-800">{card.label}</h3>
            <p className="text-sm text-gray-500 font-semibold mt-1">{card.desc}</p>
          </motion.button>
        ))}

        {/* Change avatar card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: NAV_CARDS.length * 0.07 }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAvatarPicker(true)}
          className="bg-gray-50 border-2 border-transparent hover:border-yellow-300 rounded-3xl p-5 text-left shadow-md hover:shadow-xl transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-3xl mb-3 shadow-md">
            {profile?.avatar?.emoji || '🐾'}
          </div>
          <h3 className="font-fun text-lg text-gray-800">My Avatar</h3>
          <p className="text-sm text-gray-500 font-semibold mt-1">Change your animal friend!</p>
        </motion.button>
      </div>

      {/* Badges section */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 bg-white rounded-3xl p-6 shadow-md"
        >
          <h2 className="font-fun text-2xl text-yellow-500 mb-4">🏅 My Badges</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map(b => (
              <div key={b.id} className="flex flex-col items-center bg-yellow-50 rounded-2xl p-3 border-2 border-yellow-200">
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-xs font-semibold text-gray-600 mt-1">{b.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Avatar picker modal when changing */}
      <AnimatePresence>
        {showAvatarPicker && profile && (
          <AvatarPicker onDone={() => setShowAvatarPicker(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
