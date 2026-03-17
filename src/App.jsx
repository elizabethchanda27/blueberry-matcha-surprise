import { useState, useCallback, useEffect, useRef } from 'react'
import { useBlowDetection } from './useBlowDetection'
import FloatingBlueberries from './FloatingBlueberries'
import SwirlBlueberries from './SwirlBlueberries'
import confetti from 'canvas-confetti'
import './App.css'

const APP_URL = 'https://bloomly-birthday-app.vercel.app/'

const WAIT_AFTER_BLOW_MS = 2500
const POUR_MS = 2200
const DRAIN_START_MS = 3800
const FILL_DONE_MS = 5200
const CONFETTI_DELAY_MS = 500

export default function App() {
  const [phase, setPhase] = useState('intro') // intro | candle | blown | filling | link
  const [fillClass, setFillClass] = useState('') // '' | 'pour' | 'pour show-welcome' | 'pour show-welcome drain'
  const confettiFiredRef = useRef(false)

  const handleBlow = useCallback(() => setPhase('blown'), [])

  const { startListening, stopListening, micAllowed, error } = useBlowDetection(handleBlow)

  useEffect(() => {
    if (phase === 'blown') stopListening()
  }, [phase, stopListening])

  // After blow: wait, then go to filling
  useEffect(() => {
    if (phase !== 'blown') return
    const t = setTimeout(() => setPhase('filling'), WAIT_AFTER_BLOW_MS)
    return () => clearTimeout(t)
  }, [phase])

  // Matcha fill-up: same sequence as portfolio (pour → show-welcome → drain → link)
  useEffect(() => {
    if (phase !== 'filling') return
    setFillClass('pour')
    const t1 = setTimeout(() => setFillClass('pour show-welcome'), POUR_MS)
    const t2 = setTimeout(() => setFillClass('pour show-welcome drain'), DRAIN_START_MS)
    const t3 = setTimeout(() => {
      setPhase('link')
      setFillClass('')
    }, FILL_DONE_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [phase])

  // Confetti when link screen shows (when CTA pops up)
  useEffect(() => {
    if (phase !== 'link' || confettiFiredRef.current) return
    const t = setTimeout(() => {
      confettiFiredRef.current = true
      const count = 120
      const colors = ['#677ab4', '#8884c9', '#74a12e', '#b9dca9', '#ffffff']
      const defaults = { origin: { y: 0.7 }, zIndex: 9999, colors }
      function fire(particleRatio, opts) {
        confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
      }
      fire(0.25, { spread: 26, startVelocity: 55 })
      fire(0.2, { spread: 60 })
      fire(0.35, { spread: 100, decay: 0.91 })
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92 })
      fire(0.1, { spread: 120, startVelocity: 45 })
    }, CONFETTI_DELAY_MS)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    const t = setTimeout(() => setPhase((p) => (p === 'intro' ? 'candle' : p)), 2200)
    return () => clearTimeout(t)
  }, [])

  const handleCandleTap = useCallback(() => {
    if (phase === 'candle') handleBlow()
  }, [phase, handleBlow])

  const handleLinkClick = useCallback(
    (e) => {
      if (APP_URL === '#' || APP_URL === '') e.preventDefault()
    },
    []
  )

  const showIntro = phase === 'intro' || phase === 'candle' || phase === 'blown' || phase === 'filling'
  const showFilling = phase === 'filling'
  const showLink = phase === 'link'

  return (
    <>
      {showIntro && (
        <>
          <div className="swirl-bg" aria-hidden="true" />
          {phase !== 'filling' && <SwirlBlueberries />}
          <main className={`content ${phase === 'blown' || phase === 'filling' ? 'content--blown' : ''}`}>
            <h1 className="title-line">
              <span className="title-word title-word--first">Happy</span>
              <span className="title-word title-word--second">
                B
                <button
                  type="button"
                  className={`candle-inline ${phase === 'blown' || phase === 'filling' ? 'candle-inline--out' : ''}`}
                  disabled={phase === 'blown' || phase === 'filling'}
                  onClick={handleCandleTap}
                  aria-label="Blow out the candle"
                >
                  <span className="candle-flame" />
                  <span className="candle-stick" />
                </button>
                rthday!
              </span>
            </h1>
            <div className="cake-wrap">
              <div className="cake" aria-hidden="true">🎂</div>
            </div>
            {phase === 'candle' && (
              <div className="blow-hint">
                <p>Blow out the candle!</p>
                {!micAllowed && !error && (
                  <button type="button" className="btn-mic" onClick={startListening}>
                    Use microphone to blow
                  </button>
                )}
                {micAllowed && <span className="mic-on">🎤 Listening… blow now!</span>}
                {error && <span className="mic-err">{error}</span>}
              </div>
            )}
          </main>
        </>
      )}

      {showFilling && (
        <div className={`fill-up-screen ${fillClass.trim()}`.trim()} aria-hidden="true">
          <div className="fill-up-loading-bg" />
          <div className="fill-up-water-fill" />
          <div className="fill-up-splash fill-up-s1" />
          <div className="fill-up-splash fill-up-s2" />
          <div className="fill-up-splash fill-up-s3" />
          <div className="fill-up-splash fill-up-s4" />
          <div className="fill-up-splash fill-up-s5" />
        </div>
      )}

      {showLink && (
        <div className="link-screen">
          <div className="swirl-bg swirl-bg--soft" aria-hidden="true" />
          <FloatingBlueberries />
          <main className="content content--link">
            <a
              href={APP_URL}
              className="cta cta--big"
              onClick={handleLinkClick}
              rel={APP_URL.startsWith('http') ? 'noopener noreferrer' : undefined}
              target={APP_URL.startsWith('http') ? '_blank' : undefined}
            >
              {APP_URL === '#' || APP_URL === '' ? 'Open your surprise (tester link)' : 'Open your surprise →'}
            </a>
          </main>
        </div>
      )}
    </>
  )
}
