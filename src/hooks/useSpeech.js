import { useCallback, useRef } from 'react'

export function useSpeech() {
  const utteranceRef = useRef(null)

  const speak = useCallback((text, { rate = 0.85, pitch = 1.1, onEnd } = {}) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = rate
    utter.pitch = pitch
    utter.lang = 'en-US'
    if (onEnd) utter.onend = onEnd
    utteranceRef.current = utter
    // Pick a friendly voice if available
    const voices = window.speechSynthesis.getVoices()
    const friendly = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen'))
    ) || voices.find(v => v.lang.startsWith('en'))
    if (friendly) utter.voice = friendly
    window.speechSynthesis.speak(utter)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
  }, [])

  const speakSlow = useCallback((text) => {
    speak(text, { rate: 0.6, pitch: 1.1 })
  }, [speak])

  return { speak, speakSlow, stop }
}
