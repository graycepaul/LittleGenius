import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import ReadingRoom from './pages/ReadingRoom'
import WritingPad from './pages/WritingPad'
import Flashcards from './pages/Flashcards'
import MathWorld from './pages/MathWorld'
import Tasks from './pages/Tasks'
import BedtimeStories from './pages/BedtimeStories'
import MyShelf from './pages/MyShelf'
import French from './pages/French'
import Games from './pages/Games'

// ── Full-screen loading spinner ───────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="text-6xl">⭐</motion.div>
      <p className="font-fun text-2xl text-white/80">Loading LittleGenius…</p>
    </div>
  )
}

// ── Google sign-in screen ─────────────────────────────────────────────────────
function SignInScreen() {
  const { signIn } = useApp()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute bottom-16 right-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute top-1/3 right-16 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="el-card p-10 max-w-sm w-full text-center relative">

        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="text-7xl mb-4 inline-block">🧠</motion.div>

        <h1 className="font-fun text-4xl mb-1" style={{ color: 'var(--c-primary)' }}>LittleGenius</h1>
        <p className="font-semibold mb-8 text-sm" style={{ color: 'var(--c-muted)' }}>
          A fun learning adventure for kids 1–10 🌟
        </p>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-bold text-lg shadow-md"
          style={{ background: '#fff', border: '2px solid var(--c-border)', color: 'var(--c-text)' }}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google" className="w-6 h-6" />
          Sign in with Google
        </motion.button>

        <p className="mt-5 text-xs font-semibold" style={{ color: 'var(--c-muted)' }}>
          Parents sign in — progress saves across all devices ☁️
        </p>
      </motion.div>
    </div>
  )
}

// ── Inner app ─────────────────────────────────────────────────────────────────
function AppInner() {
  const { authUser, checkStreak } = useApp()

  useEffect(() => { if (authUser) checkStreak() }, [authUser])

  // Firebase still checking auth state
  if (authUser === undefined) return <LoadingScreen />

  // Not signed in → show Google sign-in
  if (authUser === null) return <SignInScreen />

  // Signed in → full app
  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/reading"    element={<ReadingRoom />} />
          <Route path="/writing"    element={<WritingPad />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/math"       element={<MathWorld />} />
          <Route path="/tasks"      element={<Tasks />} />
          <Route path="/bedtime"    element={<BedtimeStories />} />
          <Route path="/shelf"      element={<MyShelf />} />
          <Route path="/french"     element={<French />} />
          <Route path="/games"      element={<Games />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
