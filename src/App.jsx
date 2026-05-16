import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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

function AppInner() {
  const { checkStreak } = useApp()
  useEffect(() => { checkStreak() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reading" element={<ReadingRoom />} />
          <Route path="/writing" element={<WritingPad />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/math" element={<MathWorld />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/bedtime" element={<BedtimeStories />} />
          <Route path="/shelf" element={<MyShelf />} />
          <Route path="/french" element={<French />} />
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
