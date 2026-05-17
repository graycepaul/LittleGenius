import { useCallback, useRef } from 'react'

// ── Voice cache (loaded once, shared across all hook instances) ────────────────
let _voicesCache = []
let _voicesLoaded = false

function getVoices() {
  return new Promise(resolve => {
    if (_voicesLoaded && _voicesCache.length) {
      resolve(_voicesCache)
      return
    }
    const immediate = window.speechSynthesis.getVoices()
    if (immediate.length) {
      _voicesCache = immediate
      _voicesLoaded = true
      resolve(immediate)
      return
    }
    // Wait for browser to load voices (Chrome fires this event)
    const handler = () => {
      _voicesCache = window.speechSynthesis.getVoices()
      _voicesLoaded = true
      resolve(_voicesCache)
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true })
    // Fallback: resolve after 1s even if event never fires (Safari)
    setTimeout(() => {
      if (!_voicesLoaded) {
        _voicesCache = window.speechSynthesis.getVoices()
        resolve(_voicesCache)
      }
    }, 1000)
  })
}

function pickEnglishVoice(voices) {
  // Prefer known natural-sounding voices
  const preferred = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Daniel', 'Google UK English Female', 'Google US English']
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name))
    if (v) return v
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null
}

// ── Chrome bug: speech pauses after ~14s of page being in background ──────────
function makeKeepAlive(intervalRef) {
  intervalRef.current = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      window.speechSynthesis.resume()
    } else {
      clearInterval(intervalRef.current)
    }
  }, 12000)
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSpeech() {
  const keepAliveRef = useRef(null)

  const speak = useCallback(async (text, { rate = 0.88, pitch = 1.05, onEnd } = {}) => {
    if (!window.speechSynthesis) return

    // Cancel anything currently playing
    window.speechSynthesis.cancel()
    clearInterval(keepAliveRef.current)

    // Small delay lets cancel() fully settle before new utterance
    await new Promise(r => setTimeout(r, 80))

    const voices = await getVoices()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang  = 'en-US'
    utter.rate  = rate
    utter.pitch = pitch

    const voice = pickEnglishVoice(voices)
    if (voice) utter.voice = voice

    utter.onend   = () => { clearInterval(keepAliveRef.current); onEnd?.() }
    utter.onerror = () => { clearInterval(keepAliveRef.current) }

    window.speechSynthesis.speak(utter)
    makeKeepAlive(keepAliveRef)
  }, [])

  const speakSlow = useCallback((text) => speak(text, { rate: 0.6, pitch: 1.05 }), [speak])

  const stop = useCallback(() => {
    clearInterval(keepAliveRef.current)
    window.speechSynthesis?.cancel()
  }, [])

  return { speak, speakSlow, stop }
}
