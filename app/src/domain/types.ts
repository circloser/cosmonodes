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

/** A user-defined grouping (가족/친구/직장 …) with its own color. */
export interface Group {
  id: string
  name: string
  color: string
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
  groupId: string | null
  /** Relationship intelligence (the "management tool" layer). */
  closeness: number // 1-5 intimacy → drives link width & distance
  /** Generational/hierarchy level: grandparent +2, parent +1, self/sibling 0, child -1, grandchild -2. */
  tier: number
  age: number | null
  lastContactAt: number | null
  nextReminderAt: number | null
  birthday: string | null // 'MM-DD' or 'YYYY-MM-DD'
  interests: string
  matchedUserId: string | null
  createdAt: number
}

/** Fields the owner can edit on one of their own stars. */
export type NodePatch = Partial<
  Pick<
    NodeRecord,
    'label' | 'note' | 'groupId' | 'closeness' | 'tier' | 'age' | 'lastContactAt' | 'nextReminderAt' | 'birthday' | 'interests'
  >
>

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
  /** Group membership for degree-1 nodes (drives color + visibility toggles). */
  groupId?: string | null
  /** Resolved group color for degree-1 nodes, if grouped. */
  color?: string
  /** Intimacy 1-5 for degree-1 nodes → radial distance tier from center. */
  closeness?: number
  /** Generational hierarchy level (degree-1) → vertical position in hierarchy view. */
  tier?: number
  /** Age (degree-1) → vertical sort option in hierarchy view. */
  age?: number | null
  /** Present ONLY for nodes owned by the requesting user (degree 0 and 1). */
  note?: string
}

export interface GraphLink {
  id: string
  source: string
  target: string
  strength: LinkStrength
  faint: boolean
  /** Intimacy of the connected contact (1-5) → line width. */
  closeness?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}
