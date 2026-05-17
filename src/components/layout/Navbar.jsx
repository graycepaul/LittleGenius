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
  { path: '/french', label: 'French', emoji: '🇫🇷' },
  { path: '/bedtime', label: 'Bedtime', emoji: '🌙' },
  { path: '/shelf', label: 'My Shelf', emoji: '📚' },
  { path: '/games', label: 'Games', emoji: '🎮' },
]

export default function Navbar() {
  const { profile, stars, streak, authUser, signOut } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header style={{ background: 'var(--c-card)', borderBottom: '2px solid var(--c-border)' }}
        className="sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'var(--c-primary)' }}>
              🧠
            </div>
            <span className="font-fun text-xl hidden sm:block" style={{ color: 'var(--c-primary)' }}>
              LittleGenius
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all
                  ${isActive
                    ? 'text-white shadow-sm'
                    : 'hover:bg-indigo-50'}`
                }
                style={({ isActive }) => isActive
                  ? { background: 'var(--c-primary)', color: '#fff' }
                  : { color: 'var(--c-muted)' }
                }
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Stats + avatar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold"
              style={{ background: 'var(--c-gold-light)', color: 'var(--c-gold)' }}>
              <span className="sparkle">⭐</span>
              <span className="font-fun text-base">{stars}</span>
            </div>
            {streak.count >= 1 && (
              <div className="hidden sm:flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold bg-orange-50 text-orange-500">
                <span>🔥</span>
                <span className="font-fun text-base">{streak.count}</span>
              </div>
            )}
            {profile && (
              <button onClick={() => navigate('/')}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-transform"
                style={{ background: 'var(--c-primary-light)' }}>
                {profile.avatar.emoji}
              </button>
            )}
            {authUser && (
              <button onClick={signOut} title="Sign out"
                className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ background: 'var(--c-bg)', color: 'var(--c-muted)' }}>
                ↩
              </button>
            )}
            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)}
              className="xl:hidden w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors"
              style={{ background: menuOpen ? 'var(--c-primary-light)' : 'transparent', color: 'var(--c-text)' }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="xl:hidden fixed top-14 left-0 right-0 z-40 shadow-xl p-4"
            style={{ background: 'var(--c-card)', borderBottom: '2px solid var(--c-border)' }}>
            <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
              {NAV_ITEMS.map(item => (
                <NavLink key={item.path} to={item.path} end={item.path === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 p-2 rounded-2xl text-center transition-all text-xs font-bold
                    ${isActive ? 'text-white' : 'text-gray-500 hover:bg-indigo-50'}`
                  }
                  style={({ isActive }) => isActive ? { background: 'var(--c-primary)' } : {}}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
