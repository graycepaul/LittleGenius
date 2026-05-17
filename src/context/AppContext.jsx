import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  doc, onSnapshot, setDoc, updateDoc,
} from 'firebase/firestore'

const AppContext = createContext(null)

export const AVATARS = [
  { id: 'lion',    emoji: '🦁', name: 'Leo'  },
  { id: 'bunny',   emoji: '🐰', name: 'Bun'  },
  { id: 'bear',    emoji: '🐻', name: 'Bear' },
  { id: 'fox',     emoji: '🦊', name: 'Fox'  },
  { id: 'owl',     emoji: '🦉', name: 'Owl'  },
  { id: 'penguin', emoji: '🐧', name: 'Pip'  },
  { id: 'frog',    emoji: '🐸', name: 'Frog' },
  { id: 'cat',     emoji: '🐱', name: 'Cat'  },
  { id: 'dog',     emoji: '🐶', name: 'Pup'  },
  { id: 'duck',    emoji: '🐥', name: 'Duck' },
]

const DEFAULT_DATA = {
  profile: null,
  stars: 0,
  streak: { count: 0, lastDate: null },
  badges: [],
  completedTasks: [],
  savedStories: [],
  customCards: [],
}

export function AppProvider({ children }) {
  // undefined = still checking auth, null = not signed in, object = signed in
  const [authUser, setAuthUser] = useState(undefined)
  const [data, setData]         = useState(DEFAULT_DATA)

  // ── Auth state listener ──────────────────────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, user => setAuthUser(user ?? null))
  }, [])

  // ── Firestore real-time listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) { setData(DEFAULT_DATA); return }

    const ref = doc(db, 'users', authUser.uid)
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setData({ ...DEFAULT_DATA, ...snap.data() })
      } else {
        // First sign-in — create the user document
        setDoc(ref, DEFAULT_DATA)
      }
    })
    return unsub
  }, [authUser])

  // ── Firestore write helper ───────────────────────────────────────────────────
  async function save(updates) {
    if (!authUser) return
    try {
      await updateDoc(doc(db, 'users', authUser.uid), updates)
    } catch {
      // Doc may not exist yet (race condition on first sign-in)
      await setDoc(doc(db, 'users', authUser.uid), { ...DEFAULT_DATA, ...updates })
    }
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────
  async function signIn() {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  // ── Profile ──────────────────────────────────────────────────────────────────
  function setProfile(profile) {
    save({ profile })
  }

  // ── Streak ───────────────────────────────────────────────────────────────────
  function checkStreak() {
    const today = new Date().toDateString()
    if (data.streak?.lastDate === today) return
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    save({
      streak: {
        count: data.streak?.lastDate === yesterday ? (data.streak.count + 1) : 1,
        lastDate: today,
      }
    })
  }

  // ── Stars ────────────────────────────────────────────────────────────────────
  function addStars(n) {
    save({ stars: (data.stars || 0) + n })
  }

  // ── Stories ──────────────────────────────────────────────────────────────────
  function saveStory(story) {
    const updated = [
      { ...story, id: Date.now(), savedAt: new Date().toLocaleDateString() },
      ...(data.savedStories || []),
    ]
    save({ savedStories: updated })
  }

  function deleteStory(id) {
    save({ savedStories: (data.savedStories || []).filter(s => s.id !== id) })
  }

  // ── Custom cards ─────────────────────────────────────────────────────────────
  function addCustomCard(card) {
    const updated = [{ ...card, id: Date.now() }, ...(data.customCards || [])]
    save({ customCards: updated })
  }

  function deleteCustomCard(id) {
    save({ customCards: (data.customCards || []).filter(c => c.id !== id) })
  }

  // ── Tasks ────────────────────────────────────────────────────────────────────
  function markTaskComplete(taskId) {
    if ((data.completedTasks || []).includes(taskId)) return
    save({
      completedTasks: [...(data.completedTasks || []), taskId],
      stars: (data.stars || 0) + 5,
    })
  }

  // ── Badges ───────────────────────────────────────────────────────────────────
  function earnBadge(badge) {
    if ((data.badges || []).find(b => b.id === badge.id)) return
    save({
      badges: [
        ...(data.badges || []),
        { ...badge, earnedAt: new Date().toLocaleDateString() },
      ]
    })
  }

  return (
    <AppContext.Provider value={{
      // Auth
      authUser,
      signIn,
      signOut,
      // Profile
      profile:          data.profile,
      setProfile,
      // Progress
      stars:            data.stars    || 0,
      addStars,
      streak:           data.streak   || { count: 0, lastDate: null },
      checkStreak,
      badges:           data.badges   || [],
      earnBadge,
      // Content
      savedStories:     data.savedStories  || [],
      saveStory,
      deleteStory,
      customCards:      data.customCards   || [],
      addCustomCard,
      deleteCustomCard,
      completedTasks:   data.completedTasks || [],
      markTaskComplete,
      // Constants
      AVATARS,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
