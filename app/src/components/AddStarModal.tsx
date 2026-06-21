import { useState } from 'react'
import { useGraphStore } from '../store/useGraphStore'

interface Props {
  onClose: () => void
}

export default function AddStarModal({ onClose }: Props) {
  const { addStar, provider } = useGraphStore()
  const [label, setLabel] = useState('')
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
    await addStar(label, note)
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
