import { useGraphStore } from '../store/useGraphStore'

/**
 * Brief white flash → blue glow when a star is born (AC6).
 * Keyed on the supernova timestamp so each birth remounts and replays the CSS
 * animation — no effect-driven state needed.
 */
export default function Supernova() {
  const lastSupernovaAt = useGraphStore((s) => s.lastSupernovaAt)
  if (!lastSupernovaAt) return null

  return (
    <div
      key={lastSupernovaAt}
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div className="h-2 w-2 animate-supernova-burst rounded-full bg-white shadow-[0_0_60px_20px_rgba(56,189,248,0.6)]" />
    </div>
  )
}
