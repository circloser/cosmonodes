import { useEffect, useState } from 'react'

/** Dev FPS meter for the performance gate (US-004). */
export default function FpsOverlay({ nodeCount }: { nodeCount: number }) {
  const [fps, setFps] = useState(0)

  useEffect(() => {
    let raf = 0
    let frames = 0
    let last = performance.now()
    const loop = () => {
      frames++
      const now = performance.now()
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const good = fps >= 55
  return (
    <div className="label-mono pointer-events-none fixed bottom-4 left-4 z-[80] rounded-lg bg-deep-void/70 px-3 py-2 text-[11px] backdrop-blur">
      <span className={good ? 'text-nebula-blue' : 'text-error'}>{fps} FPS</span>
      <span className="ml-2 text-on-surface-variant">· {nodeCount} nodes</span>
    </div>
  )
}
