import { useCallback, useRef, useState } from 'react'

const BLOW_THRESHOLD = 0.12 // tune if needed: higher = need to blow harder
const BLOW_DURATION_MS = 400 // how long above threshold counts as a blow

export function useBlowDetection(onBlow) {
  const [micAllowed, setMicAllowed] = useState(false)
  const [error, setError] = useState(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const aboveThresholdSinceRef = useRef(null)
  const hasTriggeredRef = useRef(false)

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    analyserRef.current = null
  }, [])

  const startListening = useCallback(() => {
    if (analyserRef.current) return
    hasTriggeredRef.current = false
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream
        setMicAllowed(true)
        setError(null)
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const src = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        src.connect(analyser)
        analyserRef.current = analyser
        const data = new Uint8Array(analyser.frequencyBinCount)

        function check() {
          if (!analyserRef.current) return
          analyser.getByteFrequencyData(data)
          const sum = data.reduce((a, b) => a + b, 0)
          const avg = sum / data.length / 255
          if (avg >= BLOW_THRESHOLD) {
            const now = Date.now()
            if (aboveThresholdSinceRef.current == null) aboveThresholdSinceRef.current = now
            if (now - aboveThresholdSinceRef.current >= BLOW_DURATION_MS && !hasTriggeredRef.current) {
              hasTriggeredRef.current = true
              onBlow()
              stopListening()
              return
            }
          } else {
            aboveThresholdSinceRef.current = null
          }
          rafRef.current = requestAnimationFrame(check)
        }
        rafRef.current = requestAnimationFrame(check)
      })
      .catch((err) => {
        setError(err.message || 'Microphone access needed to blow')
        setMicAllowed(false)
      })
  }, [onBlow, stopListening])

  return { startListening, stopListening, micAllowed, error }
}
