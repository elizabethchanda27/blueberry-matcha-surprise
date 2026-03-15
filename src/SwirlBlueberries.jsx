import { useRef, useEffect, useState } from 'react'

const NUM_PARTICLES = 56
const ANGULAR_SPEED = 0.022
const RADIAL_SPEED = 0.85
const MAX_RADIUS = 480
const PARTICLE_SIZE = 11

export default function SwirlBlueberries() {
  const containerRef = useRef(null)
  const [center, setCenter] = useState({ x: 0, y: 0 })
  const [positions, setPositions] = useState(() =>
    Array.from({ length: NUM_PARTICLES }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * MAX_RADIUS + 80,
      size: 0.6 + Math.random() * 0.8,
    }))
  )
  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect()
        setCenter({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }
    }
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [])

  useEffect(() => {
    let raf
    function tick() {
      setPositions((prev) =>
        prev.map((p) => {
          let angle = p.angle + ANGULAR_SPEED
          let radius = p.radius - RADIAL_SPEED
          if (radius < 0) {
            radius = MAX_RADIUS + Math.random() * 60
            angle = Math.random() * Math.PI * 2
          }
          return { ...p, angle, radius }
        })
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={containerRef} className="swirl-blueberries-bg" aria-hidden="true">
      {positions.map((p, i) => {
        const x = center.x + p.radius * Math.cos(p.angle) - (PARTICLE_SIZE * p.size) / 2
        const y = center.y + p.radius * Math.sin(p.angle) - (PARTICLE_SIZE * p.size) / 2
        const scale = 0.4 + 0.7 * (p.radius / MAX_RADIUS)
        return (
          <div
            key={i}
            className="swirl-blueberry"
            style={{
              left: x,
              top: y,
              width: PARTICLE_SIZE * p.size * scale,
              height: PARTICLE_SIZE * p.size * scale,
              opacity: 0.5 + 0.5 * (p.radius / MAX_RADIUS),
            }}
          />
        )
      })}
    </div>
  )
}
