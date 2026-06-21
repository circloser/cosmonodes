import { useState } from 'react'
import type { GraphNode } from '../domain/types'
import { useGraphStore } from '../store/useGraphStore'

interface Props {
  node: GraphNode
  onClose: () => void
}

export default function NodeCard({ node, onClose }: Props) {
  const { editNode, removeNode, invite, acceptInvite, requestIntro } = useGraphStore()
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(node.label)
  const [note, setNote] = useState(node.note ?? '')
  const [token, setToken] = useState<string | null>(null)
  const [introSent, setIntroSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const degreeLabel =
    node.degree === 0 ? '나의 중심' : node.degree === 1 ? '직접 연결' : '한 다리 건너'

  const save = async () => {
    setBusy(true)
    await editNode(node.id, label, note)
    setBusy(false)
    setEditing(false)
  }

  const doInvite = async () => {
    setBusy(true)
    const m = await invite(node.id)
    setToken(m.inviteToken)
    setBusy(false)
  }

  const doAccept = async () => {
    if (!token) return
    setBusy(true)
    await acceptInvite(token)
    setBusy(false)
    onClose()
  }

  const doIntro = async () => {
    setBusy(true)
    await requestIntro(node.id)
    setIntroSent(true)
    setBusy(false)
  }

  return (
    <div className="glass-card animate-fade-up w-72 rounded-xl p-5 shadow-2xl">
      <div className="mb-3 flex items-start justify-between">
        <span className="label-mono text-[11px] uppercase tracking-wider text-nebula-blue">
          {degreeLabel}
        </span>
        <button onClick={onClose} className="text-on-surface-variant hover:text-white" aria-label="닫기">
          ✕
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <input className="input-cosmic" value={label} onChange={(e) => setLabel(e.target.value)} />
          <textarea
            className="input-cosmic min-h-[64px] resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="이 사람에 대한 메모 (비공개)"
          />
          <div className="flex gap-2">
            <button disabled={busy} onClick={save} className="btn-star flex-1 py-2 text-sm">저장</button>
            <button onClick={() => setEditing(false)} className="btn-ghost flex-1 py-2 text-sm">취소</button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="mb-1 font-display text-2xl font-bold text-starlight-white">{node.label}</h4>

          {node.degree === 2 && (
            <p className="mb-4 text-sm text-on-surface-variant">
              매칭된 친구의 인맥입니다. 상세 정보는 보호되어 있어요. 소개를 요청해 한 걸음 더 다가가 보세요.
            </p>
          )}

          {node.degree <= 1 && node.note !== undefined && (
            <p className="mb-4 whitespace-pre-wrap text-sm text-on-surface-variant">
              {node.note || '아직 메모가 없습니다.'}
            </p>
          )}

          {node.degree === 1 && (
            <div className="space-y-2">
              {node.matched ? (
                <div className="label-mono rounded-lg border border-nebula-blue/30 bg-nebula-blue/10 px-3 py-2 text-[11px] text-nebula-blue">
                  ✓ 매칭됨 · 인맥이 확장되었습니다
                </div>
              ) : token ? (
                <div className="space-y-2">
                  <div className="label-mono break-all rounded-lg bg-white/5 px-3 py-2 text-[10px] text-on-surface-variant">
                    초대 링크: cosmonodes.app/i/{token.slice(3, 15)}…
                  </div>
                  <button disabled={busy} onClick={doAccept} className="btn-star w-full py-2 text-sm">
                    상대가 수락했다고 가정 (데모)
                  </button>
                </div>
              ) : (
                <button disabled={busy} onClick={doInvite} className="btn-star w-full py-2 text-sm">
                  초대 링크 만들기
                </button>
              )}

              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="btn-ghost flex-1 py-2 text-sm">편집</button>
                <button
                  onClick={async () => {
                    await removeNode(node.id)
                    onClose()
                  }}
                  className="btn-ghost flex-1 py-2 text-sm text-error"
                >
                  삭제
                </button>
              </div>
            </div>
          )}

          {node.degree === 2 && (
            <button
              disabled={busy || introSent}
              onClick={doIntro}
              className="btn-star w-full py-2 text-sm disabled:opacity-60"
            >
              {introSent ? '소개 요청 보냄 ✦' : '소개 요청하기'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
