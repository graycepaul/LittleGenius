import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import WordHighlighter from '../components/reading/WordHighlighter'
import SpeakButton from '../components/ui/SpeakButton'
import { READING_STORIES, LEVELS } from '../data/stories'

function StoryCard({ story, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(story)}
      className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden text-left w-full"
    >
      <div className={`bg-gradient-to-br ${story.color} p-6 flex items-center justify-center text-6xl`}>
        {story.emoji}
      </div>
      <div className="p-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{story.levelLabel}</span>
        <h3 className="font-fun text-lg text-gray-800 mt-1">{story.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{story.wordCount} words</p>
      </div>
    </motion.button>
  )
}

function StoryReader({ story, onClose }) {
  const [fontSize, setFontSize] = useState(22)
  const { addStars, saveStory } = useApp()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (saved) return
    saveStory({ title: story.title, text: story.text, emoji: story.emoji, type: 'read' })
    addStars(2)
    setSaved(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${story.color} p-6 text-white`}>
        <button
          onClick={onClose}
          className="mb-3 bg-white/30 hover:bg-white/50 text-white font-semibold rounded-full px-3 py-1 text-sm"
        >
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{story.emoji}</span>
          <div>
            <h2 className="font-fun text-3xl">{story.title}</h2>
            <p className="text-white/80 font-semibold">{story.levelLabel}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <SpeakButton text={story.text} label="Read aloud" size="md" />
        <div className="flex items-center gap-2 bg-white rounded-full border-2 border-gray-200 px-3 py-1">
          <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="font-bold text-gray-600 hover:text-yellow-500 text-lg w-6">−</button>
          <span className="text-sm font-semibold text-gray-500 w-8 text-center">{fontSize}px</span>
          <button onClick={() => setFontSize(s => Math.min(36, s + 2))} className="font-bold text-gray-600 hover:text-yellow-500 text-lg w-6">+</button>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
            saved ? 'bg-green-100 text-green-600' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
          }`}
        >
          {saved ? '✅ Saved!' : '💾 Save'}
        </button>
        <p className="text-xs text-gray-400 font-semibold ml-auto">👆 Tap a word to hear it!</p>
      </div>

      {/* Story text */}
      <div className="p-6 sm:p-8">
        <WordHighlighter text={story.text} fontSize={fontSize} />
      </div>
    </motion.div>
  )
}

export default function ReadingRoom() {
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [activeStory, setActiveStory] = useState(null)

  const filtered = selectedLevel === 'all'
    ? READING_STORIES
    : READING_STORIES.filter(s => s.level === selectedLevel)

  return (
    <div>
      <PageHeader
        emoji="📖"
        title="Reading Room"
        subtitle="Click any word to hear it — tap twice for help pronouncing it!"
        gradient="from-blue-400 to-cyan-500"
      />

      <AnimatePresence mode="wait">
        {activeStory ? (
          <StoryReader key="reader" story={activeStory} onClose={() => setActiveStory(null)} />
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Level filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              <button
                onClick={() => setSelectedLevel('all')}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  selectedLevel === 'all' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50'
                }`}
              >
                All Stories
              </button>
              {LEVELS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLevel(l.id)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    selectedLevel === l.id ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  {l.label}
                  <span className="ml-1 text-xs opacity-70">Ages {l.ages}</span>
                </button>
              ))}
            </div>

            {/* Story grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(story => (
                <StoryCard key={story.id} story={story} onClick={setActiveStory} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
