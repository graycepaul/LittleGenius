import React, { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext(null)

const AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'Leo' },
  { id: 'bunny', emoji: '🐰', name: 'Bun' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'penguin', emoji: '🐧', name: 'Pip' },
  { id: 'frog', emoji: '🐸', name: 'Frog' },
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Pup' },
  { id: 'duck', emoji: '🐥', name: 'Duck' },
]

export function AppProvider({ children }) {
  const [profile, setProfile] = useLocalStorage('el_profile', null)
  const [stars, setStars] = useLocalStorage('el_stars', 0)
  const [streak, setStreak] = useLocalStorage('el_streak', { count: 0, lastDate: null })
  const [savedStories, setSavedStories] = useLocalStorage('el_stories', [])
  const [customCards, setCustomCards] = useLocalStorage('el_custom_cards', [])
  const [completedTasks, setCompletedTasks] = useLocalStorage('el_tasks', [])
  const [badges, setBadges] = useLocalStorage('el_badges', [])

  function checkStreak() {
    const today = new Date().toDateString()
    if (streak.lastDate === today) return
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    setStreak({
      count: streak.lastDate === yesterday ? streak.count + 1 : 1,
      lastDate: today,
    })
  }

  function addStars(n) {
    setStars(s => s + n)
  }

  function saveStory(story) {
    setSavedStories(prev => [{ ...story, id: Date.now(), savedAt: new Date().toLocaleDateString() }, ...prev])
  }

  function deleteStory(id) {
    setSavedStories(prev => prev.filter(s => s.id !== id))
  }

  function addCustomCard(card) {
    setCustomCards(prev => [{ ...card, id: Date.now() }, ...prev])
  }

  function deleteCustomCard(id) {
    setCustomCards(prev => prev.filter(c => c.id !== id))
  }

  function markTaskComplete(taskId) {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId])
      addStars(5)
    }
  }

  function earnBadge(badge) {
    if (!badges.find(b => b.id === badge.id)) {
      setBadges(prev => [...prev, { ...badge, earnedAt: new Date().toLocaleDateString() }])
    }
  }

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      stars, addStars,
      streak, checkStreak,
      savedStories, saveStory, deleteStory,
      customCards, addCustomCard, deleteCustomCard,
      completedTasks, markTaskComplete,
      badges, earnBadge,
      AVATARS,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
