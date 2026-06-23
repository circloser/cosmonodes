import { useState } from 'react'
import type { GraphNode } from '../domain/types'
import { useGraphStore } from '../store/useGraphStore'
import { fromDateInput, reminderState, sinceLabel, toDateInput } from '../lib/datetime'

interface Props {
  node: GraphNode
  onClose: () => void
}

function ClosenessDots({ value }: { value: number }) {
  return (
    <span className="label-mono tracking-widest text-nebula-blue">
      {'●'.repeat(value)}
      <span className="text-on-surface-variant/40">{'●'.repeat(5 - value)}</span>
    </span>
  )
}

export default function NodeCard({ node, onClose }: Props) {
  const { nodes, groups, updateNode, removeNode, invite, acceptInvite, requestIntro } = useGraphStore()
  const record = nodes.find((n) => n.id === node.id)

  const [editing, setEditing] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [introSent, setIntroSent] = useState(false)
  const [busy, setBusy] = useState(false)

  // edit form state (seeded from record)
  const [label, setLabel] = useState(record?.label ?? node.label)
  const [groupId, setGroupId] = useState<string | null>(record?.groupId ?? null)
  const [closeness, setCloseness] = useState(record?.closeness ?? 3)
  const [note, setNote] = useState(record?.note ?? '')
  const [lastContact, setLastContact] = useState(toDateInput(record?.lastContactAt ?? null))
  const [nextReminder, setNextReminder] = useState(toDateInput(record?.nextReminderAt ?? null))
  const [birthday, setBirthday] = useState(record?.birthday ?? '')
  const [interests, setInterests] = useState(record?.interests ?? '')

  const degreeLabel = node.degree === 0 ? '나의 중심' : node.degree === 1 ? '직접 연결' : '한 다리 건너'

  const save = async () => {
    setBusy(true)
    await updateNode(node.id, {
      label,
      groupId,
      closeness,
      note,
      lastContactAt: fromDateInput(lastContact),
      nextReminderAt: fromDateInput(nextReminder),
      birthday: birthday.trim() || null,
      interests: interests.trim(),
    })
    setBusy(false)
    setEditing(false)
  }

  const markContactedToday = async () => {
    setBusy(true)
    await updateNode(node.id, { lastContactAt: Date.now() })
    setLastContact(toDateInput(Date.now()))
    setBusy(false)
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

  const reminder = reminderState(record?.nextReminderAt ?? null)
  const interestList = (record?.interests ?? '').split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <div className="glass-card animate-fade-up max-h-[80vh] w-72 overflow-y-auto rounded-xl p-5 shadow-2xl">
      <div className="mb-3 flex items-start justify-between">
        <span className="label-mono text-[11px] uppercase tracking-wider text-nebula-blue">{degreeLabel}</span>
        <button onClick={onClose} className="text-on-surface-variant hover:text-white" aria-label="닫기">✕</button>
      </div>

      {/* ---- degree 2: faint far star ---- */}
      {node.degree === 2 && (
        <>
          <h4 className="mb-1 font-display text-2xl font-bold text-starlight-white">{node.label}</h4>
          <p className="mb-4 text-sm text-on-surface-variant">
            매칭된 친구의 인맥입니다. 상세 정보는 보호되어 있어요. 소개를 요청해 한 걸음 더 다가가 보세요.
          </p>
          <button disabled={busy || introSent} onClick={doIntro} className="btn-star w-full py-2 text-sm disabled:opacity-60">
            {introSent ? '소개 요청 보냄 ✦' : '소개 요청하기'}
          </button>
        </>
      )}

      {/* ---- degree 0: self ---- */}
      {node.degree === 0 && <h4 className="font-display text-2xl font-bold text-starlight-white">{node.label}</h4>}

      {/* ---- degree 1: my contact (relationship intelligence) ---- */}
      {node.degree === 1 && record && !editing && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-display text-2xl font-bold text-starlight-white">{record.label}</h4>
            <ClosenessDots value={record.closeness} />
          </div>

          {record.note && <p className="mb-3 whitespace-pre-wrap text-sm text-on-surface-variant">{record.note}</p>}

          <dl className="mb-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">마지막 연락</dt>
              <dd className="text-on-surface">{sinceLabel(record.lastContactAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">다음 연락</dt>
              <dd className={reminder?.overdue ? 'text-error' : reminder?.due ? 'text-amber-300' : 'text-on-surface'}>
                {reminder ? reminder.label : '없음'}
              </dd>
            </div>
            {record.birthday && (
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">생일</dt>
                <dd className="text-on-surface">🎂 {record.birthday}</dd>
              </div>
            )}
          </dl>

          {interestList.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {interestList.map((t) => (
                <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-on-surface-variant">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <button onClick={markContactedToday} disabled={busy} className="btn-ghost mb-2 w-full py-2 text-sm">
            ✓ 오늘 연락함
          </button>

          {/* matching */}
          {record.matchedUserId ? (
            <div className="label-mono mb-2 rounded-lg border border-nebula-blue/30 bg-nebula-blue/10 px-3 py-2 text-[11px] text-nebula-blue">
              ✓ 매칭됨 · 인맥이 확장되었습니다
            </div>
          ) : token ? (
            <div className="mb-2 space-y-2">
              <div className="label-mono break-all rounded-lg bg-white/5 px-3 py-2 text-[10px] text-on-surface-variant">
                초대 링크: cosmonodes.app/i/{token.slice(3, 15)}…
              </div>
              <button disabled={busy} onClick={doAccept} className="btn-star w-full py-2 text-sm">
                상대가 수락했다고 가정 (데모)
              </button>
            </div>
          ) : (
            <button disabled={busy} onClick={doInvite} className="btn-star mb-2 w-full py-2 text-sm">
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
        </>
      )}

      {/* ---- degree 1: edit form ---- */}
      {node.degree === 1 && record && editing && (
        <div className="space-y-3">
          <input className="input-cosmic" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="이름" />

          <div>
            <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">그룹</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setGroupId(null)}
                className={`rounded-full border px-2.5 py-1 text-[11px] ${groupId === null ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant'}`}
              >
                없음
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGroupId(g.id)}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${groupId === g.id ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant'}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }} />
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">친밀도</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setCloseness(v)}
                  className={`h-7 flex-1 rounded text-sm transition-colors ${v <= closeness ? 'bg-nebula-blue/30 text-nebula-blue' : 'bg-white/5 text-on-surface-variant'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <label className="label-mono block text-[10px] uppercase tracking-wider text-on-surface-variant">
            마지막 연락
            <input type="date" className="input-cosmic mt-1" value={lastContact} onChange={(e) => setLastContact(e.target.value)} />
          </label>
          <label className="label-mono block text-[10px] uppercase tracking-wider text-on-surface-variant">
            다음 연락 리마인더
            <input type="date" className="input-cosmic mt-1" value={nextReminder} onChange={(e) => setNextReminder(e.target.value)} />
          </label>
          <label className="label-mono block text-[10px] uppercase tracking-wider text-on-surface-variant">
            생일 (MM-DD)
            <input className="input-cosmic mt-1" value={birthday} onChange={(e) => setBirthday(e.target.value)} placeholder="예: 03-15" />
          </label>
          <label className="label-mono block text-[10px] uppercase tracking-wider text-on-surface-variant">
            관심사 (쉼표로 구분)
            <input className="input-cosmic mt-1" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="예: 러닝, 커피" />
          </label>

          <textarea
            className="input-cosmic min-h-[56px] resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모 (비공개)"
          />

          <div className="flex gap-2">
            <button disabled={busy} onClick={save} className="btn-star flex-1 py-2 text-sm">저장</button>
            <button onClick={() => setEditing(false)} className="btn-ghost flex-1 py-2 text-sm">취소</button>
          </div>
        </div>
      )}
    </div>
  )
}
