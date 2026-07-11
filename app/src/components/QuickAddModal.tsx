import { useState } from 'react'
import { useGraphStore } from '../store/useGraphStore'
import { GroupChips, Modal } from './ui'

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
    <Modal title="빠른 추가" subtitle="이름을 줄바꿈이나 쉼표로 구분해 한 번에 여러 별을 만듭니다." onClose={onClose}>
      <textarea
        autoFocus
        className="input-cosmic mb-4 min-h-[120px] resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'엄마\n김서연\n이준호, 박지민, 최예나'}
      />

      {groups.length > 0 && (
        <>
          <span className="label-mono mb-2 block text-[10px] uppercase tracking-wider text-on-surface-variant">
            그룹 (선택)
          </span>
          <div className="mb-4">
            <GroupChips groups={groups} value={groupId} onChange={setGroupId} />
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button disabled={busy || names.length === 0} onClick={submit} className="btn-star flex-1 py-3 disabled:opacity-50">
          ✦ {names.length > 0 ? `${names.length}개 별 생성` : '별 생성'}
        </button>
        <button onClick={onClose} className="btn-ghost flex-1 py-3">
          취소
        </button>
      </div>
    </Modal>
  )
}
