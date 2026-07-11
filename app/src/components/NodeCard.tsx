import { useState } from 'react'
import type { GraphNode, NodeRecord } from '../domain/types'
import { useGraphStore } from '../store/useGraphStore'
import { reminderState, sinceLabel } from '../lib/datetime'
import { tierLabel } from '../lib/kinds'
import ContactEditForm from './ContactEditForm'
import ConnectionsEditor from './ConnectionsEditor'
import { Row } from './ui'

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

/** Read-only summary of one of my stars (degree-1). */
function ContactView({ record, onEdit, onClose }: { record: NodeRecord; onEdit: () => void; onClose: () => void }) {
  const { updateNode, removeNode, invite, acceptInvite } = useGraphStore()
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reminder = reminderState(record.nextReminderAt)
  const interestList = record.interests.split(',').map((s) => s.trim()).filter(Boolean)

  const markContactedToday = async () => {
    setBusy(true)
    await updateNode(record.id, { lastContactAt: Date.now() })
    setBusy(false)
  }
  const doInvite = async () => {
    setBusy(true)
    const m = await invite(record.id)
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

  return (
    <>
      <div className="mb-1 flex items-center justify-between">
        <h4 className="font-display text-2xl font-bold text-starlight-white">{record.label}</h4>
        <ClosenessDots value={record.closeness} />
      </div>
      {(record.relation || record.job || record.location) && (
        <p className="mb-3 text-sm text-on-surface-variant">
          {[record.relation, record.job, record.location].filter(Boolean).join(' · ')}
        </p>
      )}

      {record.note && <p className="mb-3 whitespace-pre-wrap text-sm text-on-surface-variant">{record.note}</p>}

      <dl className="mb-3 space-y-1.5 text-sm">
        <Row label="마지막 연락" value={sinceLabel(record.lastContactAt)} />
        <Row
          label="다음 연락"
          value={reminder ? reminder.label : '없음'}
          valueClass={reminder?.overdue ? 'text-error' : reminder?.due ? 'text-amber-300' : 'text-on-surface'}
        />
        {record.birthday && <Row label="생일" value={`🎂 ${record.birthday}`} />}
        {record.age != null && <Row label="나이" value={`${record.age}세`} />}
        {record.tier !== 0 && <Row label="세대" value={tierLabel(record.tier)} />}
        {record.company && <Row label="회사" value={record.company} />}
        {record.department && <Row label="부서" value={record.department} />}
        {record.role && <Row label="직책" value={record.role} />}
        {record.anniversary && <Row label="기념일" value={`🎉 ${record.anniversary}`} />}
        {record.howWeMet && <Row label="만난 계기" value={record.howWeMet} />}
        {record.phone && <Row label="전화" value={record.phone} />}
        {record.email && <Row label="이메일" value={record.email} />}
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

      <ConnectionsEditor nodeId={record.id} />

      <div className="flex gap-2">
        <button onClick={onEdit} className="btn-ghost flex-1 py-2 text-sm">
          편집
        </button>
        <button
          onClick={async () => {
            await removeNode(record.id)
            onClose()
          }}
          className="btn-ghost flex-1 py-2 text-sm text-error"
        >
          삭제
        </button>
      </div>
    </>
  )
}

/** Faint far star (degree-2): protected details + intro request. */
function FarStarView({ node }: { node: GraphNode }) {
  const { requestIntro } = useGraphStore()
  const [introSent, setIntroSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const doIntro = async () => {
    setBusy(true)
    await requestIntro(node.id)
    setIntroSent(true)
    setBusy(false)
  }

  return (
    <>
      <h4 className="mb-1 font-display text-2xl font-bold text-starlight-white">{node.label}</h4>
      <p className="mb-4 text-sm text-on-surface-variant">
        매칭된 친구의 인맥입니다. 상세 정보는 보호되어 있어요. 소개를 요청해 한 걸음 더 다가가 보세요.
      </p>
      <button disabled={busy || introSent} onClick={doIntro} className="btn-star w-full py-2 text-sm disabled:opacity-60">
        {introSent ? '소개 요청 보냄 ✦' : '소개 요청하기'}
      </button>
    </>
  )
}

/** Docked left-sidebar content for the selected star. */
export default function NodeCard({ node, onClose }: Props) {
  const { nodes } = useGraphStore()
  const record = nodes.find((n) => n.id === node.id)
  const [editing, setEditing] = useState(false)

  const degreeLabel = node.degree === 0 ? '나의 중심' : node.degree === 1 ? '직접 연결' : '한 다리 건너'

  return (
    <div className="h-full w-full overflow-y-auto p-5">
      <div className="mb-3 flex items-start justify-between">
        <span className="label-mono text-[11px] uppercase tracking-wider text-nebula-blue">{degreeLabel}</span>
        <button onClick={onClose} className="text-on-surface-variant transition-colors hover:text-white" aria-label="닫기">
          ✕
        </button>
      </div>

      {node.degree === 2 && <FarStarView node={node} />}

      {node.degree === 0 && <h4 className="font-display text-2xl font-bold text-starlight-white">{node.label}</h4>}

      {node.degree === 1 &&
        record &&
        (editing ? (
          <ContactEditForm record={record} onDone={() => setEditing(false)} />
        ) : (
          <ContactView record={record} onEdit={() => setEditing(true)} onClose={onClose} />
        ))}
    </div>
  )
}
