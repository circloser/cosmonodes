import { useState } from 'react'
import type { NodeRecord } from '../domain/types'
import { useGraphStore } from '../store/useGraphStore'
import { fromDateInput, toDateInput } from '../lib/datetime'
import { TIER_OPTIONS, fieldsForKind } from '../lib/kinds'
import { Chip, Field, GroupChips, SectionTitle } from './ui'

interface Props {
  record: NodeRecord
  onDone: () => void
}

/** Sectioned, category-aware edit form for one of my stars (degree-1). */
export default function ContactEditForm({ record, onDone }: Props) {
  const { groups, updateNode } = useGraphStore()
  const [busy, setBusy] = useState(false)

  const [label, setLabel] = useState(record.label)
  const [groupId, setGroupId] = useState<string | null>(record.groupId)
  const [closeness, setCloseness] = useState(record.closeness)
  const [tier, setTier] = useState(record.tier)
  const [age, setAge] = useState(record.age != null ? String(record.age) : '')
  const [relation, setRelation] = useState(record.relation)
  const [job, setJob] = useState(record.job)
  const [location, setLocation] = useState(record.location)
  const [phone, setPhone] = useState(record.phone)
  const [email, setEmail] = useState(record.email)
  const [howWeMet, setHowWeMet] = useState(record.howWeMet)
  const [company, setCompany] = useState(record.company)
  const [department, setDepartment] = useState(record.department)
  const [role, setRole] = useState(record.role)
  const [anniversary, setAnniversary] = useState(record.anniversary)
  const [birthday, setBirthday] = useState(record.birthday ?? '')
  const [interests, setInterests] = useState(record.interests)
  const [note, setNote] = useState(record.note)
  const [lastContact, setLastContact] = useState(toDateInput(record.lastContactAt))
  const [nextReminder, setNextReminder] = useState(toDateInput(record.nextReminderAt))

  // category-aware field visibility (가족/직장/친구/지인 …) — follows the *selected* group
  const group = groups.find((g) => g.id === groupId)
  const f = fieldsForKind(group?.kind ?? 'general')

  const save = async () => {
    setBusy(true)
    await updateNode(record.id, {
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
    onDone()
  }

  return (
    <div className="space-y-2.5">
      <SectionTitle>기본정보 · {group ? group.name : '일반'}</SectionTitle>
      <Field label="이름">
        <input className="input-cosmic mt-1" value={label} onChange={(e) => setLabel(e.target.value)} />
      </Field>
      <Field label="관계">
        <input className="input-cosmic mt-1" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="예: 대학 동기" />
      </Field>
      {f.job && (
        <Field label="직업 / 하는 일">
          <input className="input-cosmic mt-1" value={job} onChange={(e) => setJob(e.target.value)} placeholder="예: 디자이너" />
        </Field>
      )}
      <Field label="사는 곳">
        <input className="input-cosmic mt-1" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="예: 서울 마포" />
      </Field>
      {(f.age || f.birthday) && (
        <div className="flex gap-2">
          {f.age && (
            <div className="flex-1">
              <Field label="나이">
                <input type="number" className="input-cosmic mt-1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="29" />
              </Field>
            </div>
          )}
          {f.birthday && (
            <div className="flex-1">
              <Field label="생일">
                <input className="input-cosmic mt-1" value={birthday} onChange={(e) => setBirthday(e.target.value)} placeholder="03-15" />
              </Field>
            </div>
          )}
        </div>
      )}
      {f.anniversary && (
        <Field label="기념일">
          <input className="input-cosmic mt-1" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} placeholder="예: 05-20" />
        </Field>
      )}
      {f.tier && (
        <div>
          <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">세대 (계층 뷰)</span>
          <div className="flex flex-wrap gap-1">
            {TIER_OPTIONS.map((o) => (
              <Chip key={o.value} active={tier === o.value} onClick={() => setTier(o.value)}>
                {o.label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {(f.company || f.department || f.role) && (
        <>
          <SectionTitle>직장 정보</SectionTitle>
          {f.company && (
            <Field label="회사">
              <input className="input-cosmic mt-1" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="예: 코스모㈜" />
            </Field>
          )}
          {f.department && (
            <Field label="부서 / 팀">
              <input className="input-cosmic mt-1" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="예: 플랫폼팀" />
            </Field>
          )}
          {f.role && (
            <Field label="직책 / 직급">
              <input className="input-cosmic mt-1" value={role} onChange={(e) => setRole(e.target.value)} placeholder="예: 팀장" />
            </Field>
          )}
        </>
      )}

      <SectionTitle>연락처 · 비공개</SectionTitle>
      <Field label="전화">
        <input className="input-cosmic mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-…" />
      </Field>
      <Field label="이메일">
        <input className="input-cosmic mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@…" />
      </Field>

      <SectionTitle>관계 · 케어</SectionTitle>
      <div>
        <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">친밀도</span>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => setCloseness(v)}
              className={`h-7 flex-1 rounded text-sm transition-colors ${
                v <= closeness ? 'bg-nebula-blue/30 text-nebula-blue' : 'bg-white/5 text-on-surface-variant hover:bg-white/10'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="label-mono mb-1 block text-[10px] uppercase tracking-wider text-on-surface-variant">그룹</span>
        <GroupChips groups={groups} value={groupId} onChange={setGroupId} size="sm" />
      </div>
      <Field label="마지막 연락">
        <input type="date" className="input-cosmic mt-1" value={lastContact} onChange={(e) => setLastContact(e.target.value)} />
      </Field>
      <Field label="다음 연락 리마인더">
        <input type="date" className="input-cosmic mt-1" value={nextReminder} onChange={(e) => setNextReminder(e.target.value)} />
      </Field>
      {f.howWeMet && (
        <Field label="만난 계기">
          <input className="input-cosmic mt-1" value={howWeMet} onChange={(e) => setHowWeMet(e.target.value)} placeholder="예: 2022 사내 해커톤" />
        </Field>
      )}

      <SectionTitle>관심사 · 메모</SectionTitle>
      <Field label="관심사 (쉼표로 구분)">
        <input className="input-cosmic mt-1" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="러닝, 커피" />
      </Field>
      <textarea className="input-cosmic min-h-[56px] resize-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="메모 (비공개)" />

      <div className="flex gap-2 pt-1">
        <button disabled={busy} onClick={save} className="btn-star flex-1 py-2 text-sm">
          저장
        </button>
        <button onClick={onDone} className="btn-ghost flex-1 py-2 text-sm">
          취소
        </button>
      </div>
    </div>
  )
}
