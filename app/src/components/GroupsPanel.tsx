import { useState } from 'react'
import { useGraphStore } from '../store/useGraphStore'
import { GROUP_PALETTE } from '../data/seed'

interface Props {
  onClose: () => void
}

export default function GroupsPanel({ onClose }: Props) {
  const { groups, hiddenGroupIds, toggleGroup, updateGroup, deleteGroup, graph } = useGraphStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(GROUP_PALETTE[0])
  const [busy, setBusy] = useState(false)

  const counts = new Map<string, number>()
  for (const n of graph.nodes) {
    if (n.degree === 1 && n.groupId) counts.set(n.groupId, (counts.get(n.groupId) ?? 0) + 1)
  }

  const startEdit = (id: string, n: string, c: string) => {
    setEditingId(id)
    setName(n)
    setColor(c)
  }

  const saveEdit = async (id: string) => {
    setBusy(true)
    await updateGroup(id, { name, color })
    setBusy(false)
    setEditingId(null)
  }

  const remove = async (id: string) => {
    setBusy(true)
    await deleteGroup(id)
    setBusy(false)
    if (editingId === id) setEditingId(null)
  }

  return (
    <div className="glass-card animate-fade-up max-h-[80vh] w-64 overflow-y-auto rounded-2xl p-5 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-starlight-white">그룹</h3>
        <button onClick={onClose} className="text-on-surface-variant hover:text-white" aria-label="닫기">✕</button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-on-surface-variant">아직 그룹이 없습니다. 별을 추가할 때 그룹을 만들 수 있어요.</p>
      ) : (
        <ul className="space-y-1">
          {groups.map((g) => {
            const hidden = hiddenGroupIds.includes(g.id)
            if (editingId === g.id) {
              return (
                <li key={g.id} className="rounded-lg border border-white/10 p-3">
                  <input className="input-cosmic mb-2" value={name} onChange={(e) => setName(e.target.value)} />
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {GROUP_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`h-5 w-5 rounded-full ${color === c ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: c }}
                        aria-label={`색상 ${c}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button disabled={busy} onClick={() => saveEdit(g.id)} className="btn-star flex-1 py-1.5 text-xs">저장</button>
                    <button onClick={() => remove(g.id)} className="btn-ghost flex-1 py-1.5 text-xs text-error">삭제</button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost flex-1 py-1.5 text-xs">취소</button>
                  </div>
                </li>
              )
            }
            return (
              <li key={g.id} className={`flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/5 ${hidden ? 'opacity-40' : ''}`}>
                <button onClick={() => toggleGroup(g.id)} className="flex flex-1 items-center gap-3 text-left">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="flex-1 text-sm text-on-surface">{g.name}</span>
                  <span className="label-mono text-[11px] text-on-surface-variant">{counts.get(g.id) ?? 0}</span>
                  <span className="text-on-surface-variant">{hidden ? '🚫' : '👁'}</span>
                </button>
                <button
                  onClick={() => startEdit(g.id, g.name, g.color)}
                  className="text-on-surface-variant hover:text-white"
                  aria-label="그룹 편집"
                >
                  ✎
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant/70">
        그룹을 눌러 켜고 끄기 · ✎ 로 이름·색 변경/삭제. 같은 그룹의 별끼리 가까이 모입니다.
      </p>
    </div>
  )
}
