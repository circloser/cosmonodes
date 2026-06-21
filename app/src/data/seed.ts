import type { Consent, EdgeRecord, IntroRequest, MatchRecord, NodeRecord, Profile } from '../domain/types'
import { uid } from '../lib/id'

export const ME = 'me'
export const SELF_NODE = 'self'

export interface Dataset {
  profile: Profile
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

  const seedContacts: Array<{ label: string; note: string; strength: 'verified' | 'pending' }> = [
    { label: '엄마', note: '가족 · 매주 일요일 통화', strength: 'verified' },
    { label: '김서연', note: '대학 동기 · 디자이너', strength: 'verified' },
    { label: '이준호', note: '회사 동료 · 백엔드', strength: 'pending' },
    { label: '박지민', note: '동네 친구 · 러닝 메이트', strength: 'verified' },
    { label: '최예나', note: '독서모임에서 만남', strength: 'pending' },
  ]

  const nodes: NodeRecord[] = []
  const edges: EdgeRecord[] = []

  for (const c of seedContacts) {
    const node: NodeRecord = {
      id: uid('node'),
      ownerId: ME,
      label: c.label,
      note: c.note,
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

  return { profile, nodes, edges, matches: [], intros: [], consents: [] }
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
      matchedUserId: null,
      createdAt: Date.now(),
    }
    nodes.push(node)
    edges.push({ id: uid('edge'), ownerId, fromNodeId: SELF_NODE, toNodeId: node.id, strength: 'verified' })
  }
  return { nodes, edges }
}

/** Build a ~N node dataset for the performance gate (US-004). */
export function makePerfDataset(total = 300): Dataset {
  const seed = makeSeed()
  const nodes: NodeRecord[] = [...seed.nodes]
  const edges: EdgeRecord[] = [...seed.edges]
  let i = 0
  while (nodes.length < total) {
    const node: NodeRecord = {
      id: uid('node'),
      ownerId: ME,
      label: pick(i),
      note: `더미 연결 #${i}`,
      matchedUserId: null,
      createdAt: Date.now(),
    }
    nodes.push(node)
    // attach to self or to a random earlier node to form a connected web
    const anchor = i % 4 === 0 ? SELF_NODE : nodes[Math.floor(Math.random() * (nodes.length - 1))].id
    edges.push({
      id: uid('edge'),
      ownerId: ME,
      fromNodeId: anchor,
      toNodeId: node.id,
      strength: Math.random() > 0.5 ? 'verified' : 'pending',
    })
    i++
  }
  return { ...seed, nodes, edges }
}
