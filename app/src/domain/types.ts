// Cosmonodes domain model.
// A "node" (star) is a PRIVATE contact card the user creates. It becomes linked
// to a real user once that person signs up and accepts the connection (matching).

export type LinkStrength = 'pending' | 'verified'
export type MatchStatus = 'invited' | 'accepted'
export type IntroStatus = 'pending' | 'sent' | 'declined'
export type NodeDegree = 0 | 1 | 2 // 0 = self, 1 = my contacts, 2 = matched contact's network (faint)

export interface Profile {
  userId: string
  displayName: string
  bio: string
  oneLine: string
  avatarColor: string
}

/**
 * A star. `note` holds private third-party info typed by the owner and MUST NOT
 * be exposed to anyone but the owner (see getGraph / GraphView2DNode).
 */
export interface NodeRecord {
  id: string
  ownerId: string
  label: string
  note: string
  matchedUserId: string | null
  createdAt: number
}

export interface EdgeRecord {
  id: string
  ownerId: string
  fromNodeId: string
  toNodeId: string
  strength: LinkStrength
}

export interface MatchRecord {
  id: string
  inviterUserId: string
  inviterNodeId: string
  inviteeUserId: string | null
  inviteToken: string
  status: MatchStatus
  createdAt: number
  acceptedAt: number | null
}

export interface IntroRequest {
  id: string
  fromUserId: string
  targetNodeId: string
  status: IntroStatus
  createdAt: number
}

export interface Consent {
  id: string
  userId: string
  type: 'third_party_info'
  acceptedAt: number
}

/**
 * Render-safe node returned by getGraph(). For degree-2 (faint far stars) the
 * `note` field is intentionally absent — this is the AC17 privacy invariant.
 */
export interface GraphNode {
  id: string
  label: string
  degree: NodeDegree
  matched: boolean
  /** Present ONLY for nodes owned by the requesting user (degree 0 and 1). */
  note?: string
}

export interface GraphLink {
  id: string
  source: string
  target: string
  strength: LinkStrength
  faint: boolean
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}
