import type {
  Consent,
  EdgeRecord,
  GraphData,
  Group,
  IntroRequest,
  LinkStrength,
  MatchRecord,
  NodeRecord,
  Profile,
} from '../domain/types'

export interface AddNodeInput {
  label: string
  note: string
  groupId?: string | null
}

/**
 * Storage-agnostic data layer. The LocalStorage implementation powers the
 * credential-free demo; a SupabaseDataProvider can implement the same contract
 * once backend credentials are available (see docs/SUPABASE_SETUP.md).
 */
export interface DataProvider {
  getProfile(): Promise<Profile>
  saveProfile(patch: Partial<Omit<Profile, 'userId'>>): Promise<Profile>

  listGroups(): Promise<Group[]>
  addGroup(name: string, color: string): Promise<Group>

  listNodes(): Promise<NodeRecord[]>
  addNode(input: AddNodeInput): Promise<NodeRecord>
  updateNode(id: string, patch: Partial<Pick<NodeRecord, 'label' | 'note'>>): Promise<NodeRecord>
  deleteNode(id: string): Promise<void>

  listEdges(): Promise<EdgeRecord[]>
  addEdge(fromNodeId: string, toNodeId: string, strength: LinkStrength): Promise<EdgeRecord>
  updateEdge(id: string, patch: Partial<Pick<EdgeRecord, 'strength'>>): Promise<EdgeRecord>
  deleteEdge(id: string): Promise<void>

  hasConsent(type: Consent['type']): Promise<boolean>
  recordConsent(type: Consent['type']): Promise<void>

  createInvite(nodeId: string): Promise<MatchRecord>
  /** Demo-only: simulate the invited person signing up and accepting. */
  simulateAccept(token: string): Promise<MatchRecord>
  listMatches(): Promise<MatchRecord[]>

  createIntroRequest(targetNodeId: string): Promise<IntroRequest>
  listIntroRequests(): Promise<IntroRequest[]>

  /**
   * Returns the current user's universe: self (degree 0), owned contacts
   * (degree 1, includes note), and — for matched contacts — that person's
   * 1st-degree network as faint degree-2 stars (label only, NEVER note).
   */
  getGraph(): Promise<GraphData>

  reset(): Promise<void>
}
