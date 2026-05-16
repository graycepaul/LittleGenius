import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { path: '/', label: 'Home', emoji: '🏠' },
  { path: '/reading', label: 'Reading', emoji: '📖' },
  { path: '/writing', label: 'Writing', emoji: '✏️' },
  { path: '/flashcards', label: 'Cards', emoji: '🃏' },
  { path: '/math', label: 'Math', emoji: '🔢' },
  { path: '/tasks', label: 'Tasks', emoji: '⚡' },
  { path: '/bedtime', label: 'Bedtime', emoji: '🌙' },
  { path: '/french', label: 'French', emoji: '🇫🇷' },
  { path: '/shelf', label: 'My Shelf', emoji: '📚' },
]

export default function Navbar() {
  const { profile, stars, streak } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      {/* Top bar */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b-4 border-yellow-300">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:animate-wiggle inline-block">⭐</span>
            <span className="font-fun text-2xl text-yellow-500 hidden sm:block">EarlyLearner</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1 px-3 py-1.5 rounded-full font-body font-700 text-sm transition-all
                  ${isActive
                    ? 'bg-yellow-400 text-white shadow-md scale-105'
                    : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'}`
                }
              >
                <span>{item.emoji}</span>
                <span className="font-semibold">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Stats + avatar */}
          <div className="flex items-center gap-3">
            {/* Stars */}
            <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
              <span className="sparkle">⭐</span>
              <span className="font-fun text-yellow-600 text-lg">{stars}</span>
            </div>
            {/* Streak */}
            {streak.count > 0 && (
              <div className="hidden sm:flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full">
                <span>🔥</span>
                <span className="font-fun text-orange-500 text-lg">{streak.count}</span>
              </div>
            )}
            {/* Avatar */}
            {profile && (
              <button onClick={() => navigate('/')} className="text-2xl hover:scale-110 transition-transform">
                {profile.avatar.emoji}
              </button>
            )}
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="lg:hidden p-2 rounded-full hover:bg-yellow-100 text-xl"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white shadow-xl border-b-4 border-yellow-300 p-4"
          >
            <div className="grid grid-cols-4 gap-2">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 p-3 rounded-2xl transition-all text-center
                    ${isActive ? 'bg-yellow-400 text-white' : 'bg-gray-50 text-gray-600 hover:bg-yellow-100'}`
                  }
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs font-semibold">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
