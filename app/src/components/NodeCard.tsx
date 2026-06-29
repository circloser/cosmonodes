import { useState } from 'react'
import type { ReactNode } from 'react'
import type { GraphNode } from '../domain/types'
import { useGraphStore } from '../store/useGraphStore'
import { fromDateInput, reminderState, sinceLabel, toDateInput } from '../lib/datetime'
import { fieldsForKind } from '../lib/kinds'

interface Props {
  node: GraphNode
  onClose: () => void
}

function tierLabel(t: number): string {
  return t >= 2 ? '조부모' : t === 1 ? '부모' : t === 0 ? '동년배' : t === -1 ? '자녀' : '손주'
}

function ClosenessDots({ value }: { value: number }) {
  return (
    <span className="label-mono tracking-widest text-nebula-blue">
      {'●'.repeat(value)}
      <span className="text-on-surface-variant/40">{'●'.repeat(5 - value)}</span>
    </span>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h5 className="label-mono mb-1 mt-2 text-[10px] uppercase tracking-widest text-nebula-blue/80">{children}</h5>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="label-mono block text-[10px] uppercase tracking-wider text-on-surface-variant">
      {label}
      {children}
    </label>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-on-surface-variant">{label}</dt>
      <dd className="truncate text-right text-on-surface">{value}</dd>
    </div>
  )
}

export default function NodeCard({ node, onClose }: Props) {
  const { nodes, groups, graph, profile, updateNode, removeNode, connect, disconnect, invite, acceptInvite, requestIntro } =
    useGraphStore()
  const record = nodes.find((n) => n.id === node.id)
  const SELF_ID = 'self'

  const labelOf = (id: string) => (id === SELF_ID ? profile?.displayName ?? '나' : nodes.find((n) => n.id === id)?.label ?? '?')
  const connections = graph.links.filter((l) => !l.faint && (l.source === node.id || l.target === node.id))
  const connectedIds = new Set(connections.map((l) => (l.source === node.id ? l.target : l.source)))
  const candidates = [{ id: SELF_ID, label: profile?.displayName ?? '나' }, ...nodes.filter((n) => n.id !== node.id)]
    .filter((c) => !connectedIds.has(c.id))

  const [editing, setEditing] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [introSent, setIntroSent] = useState(false)
  const [busy, setBusy] = useState(false)

  // edit form state
  const [label, setLabel] = useState(record?.label ?? node.label)
  const [groupId, setGroupId] = useState<string | null>(record?.groupId ?? null)
  const [closeness, setCloseness] = useState(record?.closeness ?? 3)
  const [tier, setTier] = useState(record?.tier ?? 0)
  const [age, setAge] = useState(record?.age != null ? String(record.age) : '')
  const [relation, setRelation] = useState(record?.relation ?? '')
  const [job, setJob] = useState(record?.job ?? '')
  const [location, setLocation] = useState(record?.location ?? '')
  const [phone, setPhone] = useState(record?.phone ?? '')
  const [email, setEmail] = useState(record?.email ?? '')
  const [howWeMet, setHowWeMet] = useState(record?.howWeMet ?? '')
  const [company, setCompany] = useState(record?.company ?? '')
  const [department, setDepartment] = useState(record?.department ?? '')
  const [role, setRole] = useState(record?.role ?? '')
  const [anniversary, setAnniversary] = useState(record?.anniversary ?? '')
  const [birthday, setBirthday] = useState(record?.birthday ?? '')
  const [interests, setInterests] = useState(record?.interests ?? '')
  const [note, setNote] = useState(record?.note ?? '')
  const [lastContact, setLastContact] = useState(toDateInput(record?.lastContactAt ?? null))
  const [nextReminder, setNextReminder] = useState(toDateInput(record?.nextReminderAt ?? null))

  const degreeLabel = node.degree === 0 ? '나의 중심' : node.degree === 1 ? '직접 연결' : '한 다리 건너'

  // category-aware field visibility (가족/직장/친구/지인 …)
  const group = groups.find((g) => g.id === record?.groupId)
  const f = fieldsForKind(group?.kind ?? 'general')

  const save = async () => {
    setBusy(true)
    await updateNode(node.id, {
      label,
      groupId,
      closeness,
      tier,
      age: age.trim() === '' ? null : Number(age),
      relation: relation.trim(),
      job: job.trim(),
      location: location.trim(),
      phone: phone.trim(),
      email: email.trim(),
      howWeMet: howWeMet.trim(),
      company: company.trim(),
      department: department.trim(),
      role: role.trim(),
      anniversary: anniversary.trim(),
      birthday: birthday.trim() || null,
      interests: interests.trim(),
      note,
      lastContactAt: fromDateInput(lastContact),
      nextReminderAt: fromDateInput(nextReminder),
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

  const tierOptions = [
    { v: 2, l: '조부모' },
    { v: 1, l: '부모' },
    { v: 0, l: '동년배' },
    { v: -1, l: '자녀' },
    { v: -2, l: '손주' },
  ]

  return (
    <div className="glass-card animate-fade-up max-h-[78vh] w-72 overflow-y-auto rounded-xl p-5 shadow-2xl">
      <div className="mb-3 flex items-start justify-between">
        <span className="label-mono text-[11px] uppercase tracking-wider text-nebula-blue">{degreeLabel}</span>
        <button onClick={onClose} className="text-on-surface-variant hover:text-white" aria-label="닫기">✕</button>
      </div>

      {/* ---- degree 2 ---- */}
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

      {/* ---- degree 0 ---- */}
      {node.degree === 0 && <h4 className="font-display text-2xl font-bold text-starlight-white">{node.label}</h4>}

      {/* ---- degree 1: view ---- */}
      {node.degree === 1 && record && !editing && (
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
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">다음 연락</dt>
              <dd className={reminder?.overdue ? 'text-error' : reminder?.due ? 'text-amber-300' : 'text-on-surface'}>
                {reminder ? reminder.label : '없음'}
              </dd>
            </div>
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
                <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-on-surface-variant">#{t}</span>
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

          <div className="mb-2">
            <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">연결 (관계)</span>
            <div className="space-y-1">
              {connections.length === 0 && <p className="text-xs text-on-surface-variant/70">아직 연결 없음</p>}
              {connections.map((l) => {
                const otherId = l.source === node.id ? l.target : l.source
                return (
                  <div key={l.id} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-xs">
                    <span className="text-on-surface">↔ {labelOf(otherId)}</span>
                    <button
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true)
                        await disconnect(l.id)
                        setBusy(false)
                      }}
                      className="text-on-surface-variant hover:text-error"
                      aria-label="연결 삭제"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
            {candidates.length > 0 && (
              <select
                className="input-cosmic mt-1.5 text-xs"
                value=""
                disabled={busy}
                onChange={async (e) => {
                  const v = e.target.value
                  if (!v) return
                  setBusy(true)
                  await connect(node.id, v)
                  setBusy(false)
                }}
              >
                <option value="">+ 연결 추가…</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </div>

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

      {/* ---- degree 1: edit (sectioned) ---- */}
      {node.degree === 1 && record && editing && (
        <div className="space-y-2.5">
          <SectionTitle>기본정보 · {group ? group.name : '일반'}</SectionTitle>
          <Field label="이름"><input className="input-cosmic mt-1" value={label} onChange={(e) => setLabel(e.target.value)} /></Field>
          <Field label="관계"><input className="input-cosmic mt-1" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="예: 대학 동기" /></Field>
          {f.job && (
            <Field label="직업 / 하는 일"><input className="input-cosmic mt-1" value={job} onChange={(e) => setJob(e.target.value)} placeholder="예: 디자이너" /></Field>
          )}
          <Field label="사는 곳"><input className="input-cosmic mt-1" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="예: 서울 마포" /></Field>
          {(f.age || f.birthday) && (
            <div className="flex gap-2">
              {f.age && <div className="flex-1"><Field label="나이"><input type="number" className="input-cosmic mt-1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="29" /></Field></div>}
              {f.birthday && <div className="flex-1"><Field label="생일"><input className="input-cosmic mt-1" value={birthday} onChange={(e) => setBirthday(e.target.value)} placeholder="03-15" /></Field></div>}
            </div>
          )}
          {f.anniversary && (
            <Field label="기념일"><input className="input-cosmic mt-1" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} placeholder="예: 05-20" /></Field>
          )}
          {f.tier && (
            <div>
              <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">세대 (계층 뷰)</span>
              <div className="flex flex-wrap gap-1">
                {tierOptions.map((o) => (
                  <button key={o.v} onClick={() => setTier(o.v)} className={`rounded-full border px-2.5 py-1 text-[11px] ${tier === o.v ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant'}`}>{o.l}</button>
                ))}
              </div>
            </div>
          )}

          {(f.company || f.department || f.role) && (
            <>
              <SectionTitle>직장 정보</SectionTitle>
              {f.company && <Field label="회사"><input className="input-cosmic mt-1" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="예: 코스모㈜" /></Field>}
              {f.department && <Field label="부서 / 팀"><input className="input-cosmic mt-1" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="예: 플랫폼팀" /></Field>}
              {f.role && <Field label="직책 / 직급"><input className="input-cosmic mt-1" value={role} onChange={(e) => setRole(e.target.value)} placeholder="예: 팀장" /></Field>}
            </>
          )}

          <SectionTitle>연락처 · 비공개</SectionTitle>
          <Field label="전화"><input className="input-cosmic mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-…" /></Field>
          <Field label="이메일"><input className="input-cosmic mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@…" /></Field>

          <SectionTitle>관계 · 케어</SectionTitle>
          <div>
            <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">친밀도</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <button key={v} onClick={() => setCloseness(v)} className={`h-7 flex-1 rounded text-sm transition-colors ${v <= closeness ? 'bg-nebula-blue/30 text-nebula-blue' : 'bg-white/5 text-on-surface-variant'}`}>{v}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">그룹</span>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setGroupId(null)} className={`rounded-full border px-2.5 py-1 text-[11px] ${groupId === null ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant'}`}>없음</button>
              {groups.map((g) => (
                <button key={g.id} onClick={() => setGroupId(g.id)} className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${groupId === g.id ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant'}`}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }} />{g.name}
                </button>
              ))}
            </div>
          </div>
          <Field label="마지막 연락"><input type="date" className="input-cosmic mt-1" value={lastContact} onChange={(e) => setLastContact(e.target.value)} /></Field>
          <Field label="다음 연락 리마인더"><input type="date" className="input-cosmic mt-1" value={nextReminder} onChange={(e) => setNextReminder(e.target.value)} /></Field>
          {f.howWeMet && (
            <Field label="만난 계기"><input className="input-cosmic mt-1" value={howWeMet} onChange={(e) => setHowWeMet(e.target.value)} placeholder="예: 2022 사내 해커톤" /></Field>
          )}

          <SectionTitle>관심사 · 메모</SectionTitle>
          <Field label="관심사 (쉼표로 구분)"><input className="input-cosmic mt-1" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="러닝, 커피" /></Field>
          <textarea className="input-cosmic min-h-[56px] resize-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="메모 (비공개)" />

          <div className="flex gap-2 pt-1">
            <button disabled={busy} onClick={save} className="btn-star flex-1 py-2 text-sm">저장</button>
            <button onClick={() => setEditing(false)} className="btn-ghost flex-1 py-2 text-sm">취소</button>
          </div>
        </div>
      )}
    </div>
  )
}
