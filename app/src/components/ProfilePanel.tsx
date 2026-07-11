import { useState } from 'react'
import { useGraphStore } from '../store/useGraphStore'
import { Field, Modal, SectionTitle } from './ui'

interface Props {
  onClose: () => void
}

export default function ProfilePanel({ onClose }: Props) {
  const { profile, saveProfile, nodes, matches } = useGraphStore()
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [oneLine, setOneLine] = useState(profile?.oneLine ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [job, setJob] = useState(profile?.job ?? '')
  const [location, setLocation] = useState(profile?.location ?? '')
  const [birthday, setBirthday] = useState(profile?.birthday ?? '')
  const [interests, setInterests] = useState(profile?.interests ?? '')
  const [website, setWebsite] = useState(profile?.website ?? '')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    await saveProfile({ displayName, oneLine, bio, job, location, birthday, interests, website })
    setBusy(false)
    onClose()
  }

  const matchedCount = matches.filter((m) => m.status === 'accepted').length

  return (
    <Modal title="나의 프로필" subtitle={`별 ${nodes.length}개 · 매칭 ${matchedCount}명`} onClose={onClose}>
      <div className="space-y-3">
        <SectionTitle>기본</SectionTitle>
        <Field label="이름">
          <input className="input-cosmic mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>
        <Field label="한 줄 소개">
          <input
            className="input-cosmic mt-1"
            value={oneLine}
            onChange={(e) => setOneLine(e.target.value)}
            placeholder="지금의 나를 한 줄로"
          />
        </Field>

        <SectionTitle>소개</SectionTitle>
        <Field label="자기소개">
          <textarea className="input-cosmic mt-1 min-h-[72px] resize-none" value={bio} onChange={(e) => setBio(e.target.value)} />
        </Field>
        <div className="flex gap-2">
          <div className="flex-1">
            <Field label="직업 / 하는 일">
              <input className="input-cosmic mt-1" value={job} onChange={(e) => setJob(e.target.value)} placeholder="예: 기획자" />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="사는 곳">
              <input className="input-cosmic mt-1" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="예: 서울" />
            </Field>
          </div>
        </div>
        <Field label="생일">
          <input className="input-cosmic mt-1" value={birthday} onChange={(e) => setBirthday(e.target.value)} placeholder="03-15" />
        </Field>

        <SectionTitle>관심사 · 링크</SectionTitle>
        <Field label="관심사 (쉼표로 구분)">
          <input
            className="input-cosmic mt-1"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="여행, 사진, 커피"
          />
        </Field>
        <Field label="웹사이트 / SNS">
          <input className="input-cosmic mt-1" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
        </Field>
      </div>

      <div className="mt-5 flex gap-3">
        <button disabled={busy} onClick={save} className="btn-star flex-1 py-3">
          저장
        </button>
        <button onClick={onClose} className="btn-ghost flex-1 py-3">
          닫기
        </button>
      </div>
    </Modal>
  )
}
