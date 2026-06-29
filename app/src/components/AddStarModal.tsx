import { useState } from 'react'
import type { GroupKind } from '../domain/types'
import { useGraphStore } from '../store/useGraphStore'
import { GROUP_PALETTE } from '../data/seed'
import { KIND_OPTIONS } from '../lib/kinds'

interface Props {
  onClose: () => void
}

export default function AddStarModal({ onClose }: Props) {
  const { addStar, addGroup, groups, provider } = useGraphStore()
  const [label, setLabel] = useState('')
  const [note, setNote] = useState('')
  const [groupId, setGroupId] = useState<string | null>(groups[0]?.id ?? null)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [creatingGroup, setCreatingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(GROUP_PALETTE[0])
  const [newGroupKind, setNewGroupKind] = useState<GroupKind>('general')

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      setError('그룹 이름을 입력해 주세요.')
      return
    }
    setBusy(true)
    const g = await addGroup(newGroupName, newGroupColor, newGroupKind)
    setBusy(false)
    setGroupId(g.id)
    setCreatingGroup(false)
    setNewGroupName('')
    setError('')
  }

  const submit = async () => {
    if (!label.trim()) {
      setError('별의 이름을 입력해 주세요.')
      return
    }
    if (note.trim() && !consent) {
      setError('타인의 정보를 입력하려면 아래 동의가 필요합니다.')
      return
    }
    setBusy(true)
    if (note.trim() && consent) {
      await provider.recordConsent('third_party_info')
    }
    await addStar(label, note, groupId)
    setBusy(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-deep-void/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card animate-fade-up relative z-10 w-full max-w-md rounded-2xl p-7">
        <h3 className="mb-1 font-display text-2xl font-bold text-starlight-white">새로운 별 추가</h3>
        <p className="mb-5 text-sm text-on-surface-variant">나의 우주에 한 사람을 더합니다.</p>

        <label className="label-mono mb-1 block text-[11px] uppercase tracking-wider text-on-surface-variant">
          이름
        </label>
        <input
          autoFocus
          className="input-cosmic mb-5"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="예: 김서연"
        />

        {/* group selector */}
        <label className="label-mono mb-2 block text-[11px] uppercase tracking-wider text-on-surface-variant">
          그룹
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
          <button
            type="button"
            onClick={() => setCreatingGroup((v) => !v)}
            className="rounded-full border border-dashed border-white/25 px-3 py-1.5 text-xs text-on-surface-variant hover:text-white"
          >
            ＋ 새 그룹
          </button>
        </div>

        {creatingGroup && (
          <div className="mb-4 rounded-xl border border-white/10 p-3">
            <input
              className="input-cosmic mb-3"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="그룹 이름 (예: 동호회)"
            />
            <div className="mb-3 flex flex-wrap gap-1">
              {KIND_OPTIONS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setNewGroupKind(k.key)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] ${newGroupKind === k.key ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant'}`}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {GROUP_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewGroupColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${newGroupColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={`색상 ${c}`}
                />
              ))}
            </div>
            <button disabled={busy} onClick={createGroup} className="btn-ghost w-full py-2 text-sm">
              그룹 만들기
            </button>
          </div>
        )}

        <label className="label-mono mb-1 block text-[11px] uppercase tracking-wider text-on-surface-variant">
          메모 (비공개)
        </label>
        <textarea
          className="input-cosmic mb-4 min-h-[72px] resize-none"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="이 사람과의 관계, 만난 곳 등 — 나만 볼 수 있어요"
        />

        {note.trim() && (
          <label className="mb-4 flex items-start gap-2 text-xs text-on-surface-variant">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-nova-violet"
            />
            <span>
              타인에 대한 정보를 저장하는 것에 동의합니다. 이 메모는 <b className="text-on-surface">비공개</b>이며
              상대에게 공개되지 않습니다. 상대가 요청하면 삭제할 수 있습니다.
            </span>
          </label>
        )}

        {error && <p className="mb-3 text-xs text-error">{error}</p>}

        <div className="flex gap-3">
          <button disabled={busy} onClick={submit} className="btn-star flex-1 py-3">
            ✦ 별 생성
          </button>
          <button onClick={onClose} className="btn-ghost flex-1 py-3">취소</button>
        </div>
      </div>
    </div>
  )
}
