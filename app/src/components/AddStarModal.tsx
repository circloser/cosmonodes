import { useState } from 'react'
import type { GroupKind } from '../domain/types'
import { useGraphStore } from '../store/useGraphStore'
import { GROUP_PALETTE } from '../data/seed'
import { ColorSwatches, Field, GroupChips, KindChips, Modal } from './ui'

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
    // AC16: storing third-party info requires explicit consent.
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
    <Modal title="새로운 별 추가" subtitle="나의 우주에 한 사람을 더합니다." onClose={onClose}>
      <div className="mb-5">
        <Field label="이름">
          <input
            autoFocus
            className="input-cosmic mt-1"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="예: 김서연"
          />
        </Field>
      </div>

      <span className="label-mono mb-2 block text-[10px] uppercase tracking-wider text-on-surface-variant">그룹</span>
      <div className="mb-4">
        <GroupChips
          groups={groups}
          value={groupId}
          onChange={setGroupId}
          extra={
            <button
              type="button"
              onClick={() => setCreatingGroup((v) => !v)}
              className="rounded-full border border-dashed border-white/25 px-3 py-1.5 text-xs text-on-surface-variant transition-colors hover:border-white/50 hover:text-white"
            >
              ＋ 새 그룹
            </button>
          }
        />
      </div>

      {creatingGroup && (
        <div className="mb-4 space-y-3 rounded-xl border border-white/10 p-3">
          <input
            className="input-cosmic"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="그룹 이름 (예: 동호회)"
          />
          <KindChips value={newGroupKind} onChange={setNewGroupKind} />
          <ColorSwatches value={newGroupColor} onChange={setNewGroupColor} />
          <button disabled={busy} onClick={createGroup} className="btn-ghost w-full py-2 text-sm">
            그룹 만들기
          </button>
        </div>
      )}

      <Field label="메모 (비공개)">
        <textarea
          className="input-cosmic mb-4 mt-1 min-h-[72px] resize-none"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="이 사람과의 관계, 만난 곳 등 — 나만 볼 수 있어요"
        />
      </Field>

      {note.trim() && (
        <label className="mb-4 flex items-start gap-2 text-xs text-on-surface-variant">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-nova-violet"
          />
          <span>
            타인에 대한 정보를 저장하는 것에 동의합니다. 이 메모는 <b className="text-on-surface">비공개</b>이며 상대에게
            공개되지 않습니다. 상대가 요청하면 삭제할 수 있습니다.
          </span>
        </label>
      )}

      {error && <p className="mb-3 text-xs text-error">{error}</p>}

      <div className="flex gap-3">
        <button disabled={busy} onClick={submit} className="btn-star flex-1 py-3">
          ✦ 별 생성
        </button>
        <button onClick={onClose} className="btn-ghost flex-1 py-3">
          취소
        </button>
      </div>
    </Modal>
  )
}
