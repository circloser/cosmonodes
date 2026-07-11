import { useState } from 'react'
import { useGraphStore } from '../store/useGraphStore'

const SELF_ID = 'self'

/** List, add and remove a star's relationships — including ones not involving me. */
export default function ConnectionsEditor({ nodeId }: { nodeId: string }) {
  const { nodes, graph, profile, connect, disconnect } = useGraphStore()
  const [busy, setBusy] = useState(false)

  const labelOf = (id: string) =>
    id === SELF_ID ? (profile?.displayName ?? '나') : (nodes.find((n) => n.id === id)?.label ?? '?')

  const connections = graph.links.filter((l) => !l.faint && (l.source === nodeId || l.target === nodeId))
  const connectedIds = new Set(connections.map((l) => (l.source === nodeId ? l.target : l.source)))
  const candidates = [{ id: SELF_ID, label: profile?.displayName ?? '나' }, ...nodes.filter((n) => n.id !== nodeId)].filter(
    (c) => !connectedIds.has(c.id),
  )

  return (
    <div className="mb-2">
      <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">연결 (관계)</span>
      <div className="space-y-1">
        {connections.length === 0 && <p className="text-xs text-on-surface-variant/70">아직 연결 없음</p>}
        {connections.map((l) => {
          const otherId = l.source === nodeId ? l.target : l.source
          return (
            <div key={l.id} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-xs">
              <span className="text-on-surface">↔ {labelOf(otherId)}</span>
              <button
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  await disconnect(l.id)
                  setBusy(false)
                }}
                className="text-on-surface-variant transition-colors hover:text-error"
                aria-label="연결 삭제"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
      {candidates.length > 0 && (
        <select
          className="input-cosmic mt-1.5 text-xs"
          value=""
          disabled={busy}
          onChange={async (e) => {
            const v = e.target.value
            if (!v) return
            setBusy(true)
            await connect(nodeId, v)
            setBusy(false)
          }}
        >
          <option value="">+ 연결 추가…</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
