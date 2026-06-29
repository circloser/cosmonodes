import type { Consent, EdgeRecord, Group, IntroRequest, MatchRecord, NodeRecord, Profile } from '../domain/types'
import { uid } from '../lib/id'

export const ME = 'me'
export const SELF_NODE = 'self'

/** Defaults for the detailed (owner-only) contact fields. */
export const CONTACT_DEFAULTS = { relation: '', job: '', location: '', phone: '', email: '', howWeMet: '' }

/** Distinct, cosmic-friendly colors for groups. */
export const GROUP_PALETTE = [
  '#38BDF8', // nebula blue
  '#818CF8', // nova violet
  '#34D399', // emerald
  '#FBBF24', // amber
  '#F472B6', // pink
  '#22D3EE', // cyan
  '#A78BFA', // lavender
  '#FB7185', // rose
]

export interface Dataset {
  profile: Profile
  groups: Group[]
  nodes: NodeRecord[]
  edges: EdgeRecord[]
  matches: MatchRecord[]
  intros: IntroRequest[]
  consents: Consent[]
}

const NAME_POOL = [
  '김서연', '이준호', '박지민', '최예나', '정우진', '강하늘', '윤도현', '임수아',
  '한지우', '오세훈', '서민재', '신유나', '권태양', '황보름', '문가람', '배시우',
  '노을', '진하리', '추성우', '명진주', 'Aria', 'Leo', 'Mila', 'Theo', 'Nova', 'Kai',
]

function pick(i: number): string {
  return NAME_POOL[i % NAME_POOL.length]
}

/** Initial demo universe for the logged-in user. */
export function makeSeed(): Dataset {
  const profile: Profile = {
    userId: ME,
    displayName: '나',
    oneLine: '오늘도 한 사람의 우주를 추가하는 중 ✦',
    bio: '인간관계를 별자리처럼 바라봅니다.',
    job: '',
    location: '',
    birthday: '',
    interests: '',
    website: '',
    avatarColor: '#ffffff',
  }

  const groups: Group[] = [
    { id: 'g_family', name: '가족', color: '#F472B6' },
    { id: 'g_friend', name: '친구', color: '#38BDF8' },
    { id: 'g_work', name: '직장', color: '#FBBF24' },
    { id: 'g_acq', name: '지인', color: '#A78BFA' },
  ]

  const D = 86_400_000
  const now = Date.now()
  type Seed = {
    label: string
    note: string
    strength: 'verified' | 'pending'
    groupId: string
    closeness: number
    tier: number
    age: number | null
    relation: string
    lastDays: number
    reminderDays: number | null
    birthday: string | null
    interests: string
  }
  const seedContacts: Seed[] = [
    // 가족 — generational hierarchy (조부모 +2, 부모 +1, 형제 0)
    { label: '할머니', note: '가족 · 명절마다 방문', strength: 'verified', groupId: 'g_family', closeness: 4, tier: 2, age: 78, relation: '조모', lastDays: 10, reminderDays: 3, birthday: '01-09', interests: '가족, 텃밭' },
    { label: '엄마', note: '가족 · 매주 일요일 통화', strength: 'verified', groupId: 'g_family', closeness: 5, tier: 1, age: 55, relation: '어머니', lastDays: 2, reminderDays: 5, birthday: '03-15', interests: '가족, 요리' },
    { label: '아빠', note: '가족 · 주말 등산', strength: 'verified', groupId: 'g_family', closeness: 4, tier: 1, age: 58, relation: '아버지', lastDays: 6, reminderDays: 12, birthday: '09-02', interests: '등산, 바둑' },
    { label: '형', note: '형제 · 게임 친구', strength: 'verified', groupId: 'g_family', closeness: 4, tier: 0, age: 30, relation: '형', lastDays: 3, reminderDays: null, birthday: '05-20', interests: '게임, 축구' },
    { label: '김서연', note: '대학 동기 · 디자이너', strength: 'verified', groupId: 'g_friend', closeness: 4, tier: 0, age: 27, relation: '대학 동기', lastDays: 20, reminderDays: -1, birthday: '07-22', interests: '디자인, 전시' },
    { label: '이준호', note: '회사 동료 · 백엔드', strength: 'pending', groupId: 'g_work', closeness: 3, tier: 0, age: 33, relation: '회사 동료', lastDays: 5, reminderDays: null, birthday: null, interests: '백엔드, 등산' },
    { label: '박지민', note: '동네 친구 · 러닝 메이트', strength: 'verified', groupId: 'g_friend', closeness: 4, tier: 0, age: 29, relation: '동네 친구', lastDays: 1, reminderDays: 14, birthday: '11-03', interests: '러닝, 커피' },
    { label: '최예나', note: '독서모임에서 만남', strength: 'pending', groupId: 'g_acq', closeness: 2, tier: 0, age: 26, relation: '독서모임', lastDays: 40, reminderDays: -3, birthday: null, interests: '독서' },
  ]

  const nodes: NodeRecord[] = []
  const edges: EdgeRecord[] = []

  for (const c of seedContacts) {
    const node: NodeRecord = {
      id: uid('node'),
      ownerId: ME,
      label: c.label,
      note: c.note,
      groupId: c.groupId,
      closeness: c.closeness,
      tier: c.tier,
      age: c.age,
      ...CONTACT_DEFAULTS,
      relation: c.relation,
      lastContactAt: now - c.lastDays * D,
      nextReminderAt: c.reminderDays === null ? null : now + c.reminderDays * D,
      birthday: c.birthday,
      interests: c.interests,
      matchedUserId: null,
      createdAt: now,
    }
    nodes.push(node)
    edges.push({
      id: uid('edge'),
      ownerId: ME,
      fromNodeId: SELF_NODE,
      toNodeId: node.id,
      strength: c.strength,
    })
  }

  return { profile, groups, nodes, edges, matches: [], intros: [], consents: [] }
}

/**
 * Generate the 1st-degree network of a (mock) matched user. Used when a contact
 * accepts an invite, so their contacts can appear as faint 2-hop stars.
 */
export function makeMatchedUserNetwork(ownerId: string, count = 5): { nodes: NodeRecord[]; edges: EdgeRecord[] } {
  const nodes: NodeRecord[] = []
  const edges: EdgeRecord[] = []
  const base = Math.floor(Math.random() * NAME_POOL.length)
  for (let i = 0; i < count; i++) {
    const node: NodeRecord = {
      id: uid('node'),
      ownerId,
      label: pick(base + i + 1),
      note: '비공개 — 타인의 우주', // never exposed via getGraph (degree-2)
      groupId: null,
      closeness: 3,
      tier: 0,
      age: null,
      ...CONTACT_DEFAULTS,
      lastContactAt: null,
      nextReminderAt: null,
      birthday: null,
      interests: '',
      matchedUserId: null,
      createdAt: Date.now(),
    }
    nodes.push(node)
    edges.push({ id: uid('edge'), ownerId, fromNodeId: SELF_NODE, toNodeId: node.id, strength: 'verified' })
  }
  return { nodes, edges }
}

/** Six demo groups used to color the performance dataset. */
export function makePerfGroups(): Group[] {
  const names = ['가족', '친구', '직장', '동호회', '학교', '비즈니스']
  return names.map((name, i) => ({ id: `pg_${i}`, name, color: GROUP_PALETTE[i % GROUP_PALETTE.length] }))
}

/** Build a ~N node dataset for the performance gate (US-004), grouped + colored. */
export function makePerfDataset(total = 300): Dataset {
  const seed = makeSeed()
  const groups = makePerfGroups()
  const nodes: NodeRecord[] = []
  const edges: EdgeRecord[] = []
  // self-connected hub: keep the 5 seed contacts but re-group them into perf groups
  let i = 0
  while (nodes.length < total) {
    const group = groups[i % groups.length]
    const node: NodeRecord = {
      id: uid('node'),
      ownerId: ME,
      label: pick(i),
      note: `더미 연결 #${i}`,
      groupId: group.id,
      closeness: 1 + Math.floor(Math.random() * 5),
      tier: [-1, 0, 0, 0, 1, 2][Math.floor(Math.random() * 6)],
      age: 20 + Math.floor(Math.random() * 55),
      ...CONTACT_DEFAULTS,
      lastContactAt: Date.now() - Math.floor(Math.random() * 60) * 86_400_000,
      nextReminderAt: null,
      birthday: null,
      interests: '',
      matchedUserId: null,
      createdAt: Date.now(),
    }
    nodes.push(node)
    // attach to self or to a same-group earlier node to form clustered constellations
    const sameGroup = nodes.filter((n) => n.groupId === group.id && n.id !== node.id)
    const anchor =
      i % 5 === 0 || sameGroup.length === 0 ? SELF_NODE : sameGroup[Math.floor(Math.random() * sameGroup.length)].id
    edges.push({
      id: uid('edge'),
      ownerId: ME,
      fromNodeId: anchor,
      toNodeId: node.id,
      strength: Math.random() > 0.5 ? 'verified' : 'pending',
    })
    i++
  }
  return { ...seed, groups, nodes, edges }
}
