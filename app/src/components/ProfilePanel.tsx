import { useState } from 'react'
import { useGraphStore } from '../store/useGraphStore'

interface Props {
  onClose: () => void
}

export default function ProfilePanel({ onClose }: Props) {
  const { profile, saveProfile, nodes, matches } = useGraphStore()
  // Profile is already loaded before this panel can open, so initialize once.
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [oneLine, setOneLine] = useState(profile?.oneLine ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    await saveProfile({ displayName, oneLine, bio })
    setBusy(false)
    onClose()
  }

  const matchedCount = matches.filter((m) => m.status === 'accepted').length

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-deep-void/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card animate-fade-up relative z-10 w-full max-w-md rounded-2xl p-7">
        <h3 className="mb-1 font-display text-2xl font-bold text-starlight-white">나의 프로필</h3>
        <p className="mb-5 text-sm text-on-surface-variant">
          별 {nodes.length}개 · 매칭 {matchedCount}명
        </p>

        <label className="label-mono mb-1 block text-[11px] uppercase tracking-wider text-on-surface-variant">
          이름
        </label>
        <input className="input-cosmic mb-4" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

        <label className="label-mono mb-1 block text-[11px] uppercase tracking-wider text-on-surface-variant">
          한 줄 메시지
        </label>
        <input
          className="input-cosmic mb-4"
          value={oneLine}
          onChange={(e) => setOneLine(e.target.value)}
          placeholder="지금의 나를 한 줄로"
        />

        <label className="label-mono mb-1 block text-[11px] uppercase tracking-wider text-on-surface-variant">
          자기소개
        </label>
        <textarea
          className="input-cosmic mb-5 min-h-[72px] resize-none"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="flex gap-3">
          <button disabled={busy} onClick={save} className="btn-star flex-1 py-3">저장</button>
          <button onClick={onClose} className="btn-ghost flex-1 py-3">닫기</button>
        </div>
      </div>
    </div>
  )
}
