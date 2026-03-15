import { useMemo } from 'react'

const NUM_BLUEBERRIES = 32

export default function FloatingBlueberries() {
  const berries = useMemo(() => {
    return Array.from({ length: NUM_BLUEBERRIES }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 0.5 + Math.random() * 1,
      duration: 14 + Math.random() * 18,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 80,
    }))
  }, [])

  return (
    <div className="floating-blueberries-bg" aria-hidden="true">
      {berries.map((b) => (
        <div
          key={b.id}
          className="floating-blueberry"
          style={{
            '--left': `${b.left}%`,
            '--top': `${b.top}%`,
            '--size': b.size,
            '--duration': `${b.duration}s`,
            '--delay': `${b.delay}s`,
            '--drift': `${b.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
