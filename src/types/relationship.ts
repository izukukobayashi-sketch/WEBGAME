export type RelationshipStatus =
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'close-friend'
  | 'romantic'
  | 'partner'
  | 'spouse'
  | 'family'
  | 'rival'
  | 'enemy'
  | 'mentor'
  | 'student'

export interface Interaction {
  id: string
  timestamp: string
  description: string
  emotionalTone: 'positive' | 'neutral' | 'negative'
}

export interface Relationship {
  id: string
  worldId: string
  fromCharacterId: string
  toCharacterId: string
  createdAt: string
  updatedAt: string

  // Dimensions: -100 to 100
  trust: number
  attraction: number
  respect: number
  fear: number
  envy: number

  status: RelationshipStatus
  history: Interaction[]
  sharedEventIds: string[]
  notes: string
}

export function createDefaultRelationship(
  worldId: string,
  fromId: string,
  toId: string,
  partial?: Partial<Relationship>,
): Relationship {
  return {
    id: crypto.randomUUID(),
    worldId,
    fromCharacterId: fromId,
    toCharacterId: toId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trust: 0,
    attraction: 0,
    respect: 0,
    fear: 0,
    envy: 0,
    status: 'stranger',
    history: [],
    sharedEventIds: [],
    notes: '',
    ...partial,
  }
}
