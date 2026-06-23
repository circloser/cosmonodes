import { useState } from 'react'
import { useGraphStore } from '../store/useGraphStore'

interface Props {
  onClose: () => void
}

/** Onboarding helper: add many stars at once to fill an empty universe fast. */
export default function QuickAddModal({ onClose }: Props) {
  const { addStarsBulk, groups } = useGraphStore()
  const [text, setText] = useState('')
  const [groupId, setGroupId] = useState<string | null>(groups[0]?.id ?? null)
  const [busy, setBusy] = useState(false)

  const names = text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)

  const submit = async () => {
    if (names.length === 0) return
    setBusy(true)
    await addStarsBulk(names, groupId)
    setBusy(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-deep-void/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card animate-fade-up relative z-10 w-full max-w-md rounded-2xl p-7">
        <h3 className="mb-1 font-display text-2xl font-bold text-starlight-white">빠른 추가</h3>
        <p className="mb-5 text-sm text-on-surface-variant">
          이름을 줄바꿈이나 쉼표로 구분해 한 번에 여러 별을 만듭니다.
        </p>

        <textarea
          autoFocus
          className="input-cosmic mb-4 min-h-[120px] resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'엄마\n김서연\n이준호, 박지민, 최예나'}
        />

        {groups.length > 0 && (
          <>
            <label className="label-mono mb-2 block text-[11px] uppercase tracking-wider text-on-surface-variant">
              그룹 (선택)
            </label>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setGroupId(null)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  groupId === null ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant'
                }`}
              >
                없음
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroupId(g.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    groupId === g.id ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  {g.name}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button disabled={busy || names.length === 0} onClick={submit} className="btn-star flex-1 py-3 disabled:opacity-50">
            ✦ {names.length > 0 ? `${names.length}개 별 생성` : '별 생성'}
          </button>
          <button onClick={onClose} className="btn-ghost flex-1 py-3">취소</button>
        </div>
      </div>
    </div>
  )
}
