import type { Consent, EdgeRecord, Group, IntroRequest, MatchRecord, NodeRecord, Profile } from '../domain/types'
import { uid } from '../lib/id'

export const ME = 'me'
export const SELF_NODE = 'self'

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
    bio: '인간관계를 별자리처럼 바라봅니다.',
    oneLine: '오늘도 한 사람의 우주를 추가하는 중 ✦',
    avatarColor: '#ffffff',
  }

  const groups: Group[] = [
    { id: 'g_family', name: '가족', color: '#F472B6' },
    { id: 'g_friend', name: '친구', color: '#38BDF8' },
    { id: 'g_work', name: '직장', color: '#FBBF24' },
    { id: 'g_acq', name: '지인', color: '#A78BFA' },
  ]

  const seedContacts: Array<{ label: string; note: string; strength: 'verified' | 'pending'; groupId: string }> = [
    { label: '엄마', note: '가족 · 매주 일요일 통화', strength: 'verified', groupId: 'g_family' },
    { label: '김서연', note: '대학 동기 · 디자이너', strength: 'verified', groupId: 'g_friend' },
    { label: '이준호', note: '회사 동료 · 백엔드', strength: 'pending', groupId: 'g_work' },
    { label: '박지민', note: '동네 친구 · 러닝 메이트', strength: 'verified', groupId: 'g_friend' },
    { label: '최예나', note: '독서모임에서 만남', strength: 'pending', groupId: 'g_acq' },
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
      matchedUserId: null,
      createdAt: Date.now(),
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
