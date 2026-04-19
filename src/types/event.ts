export type EventType = 'personal' | 'social' | 'world' | 'anchor'
export type AnchorImportance = 'low' | 'medium' | 'high' | 'critical'
export type AnchorStatus = 'pending' | 'active' | 'completed' | 'skipped'
export type AnchorTiming = 'absolute' | 'relative' | 'conditional'

export interface StateChange {
  entityType: 'character' | 'location' | 'world'
  entityId: string
  field: string
  oldValue: unknown
  newValue: unknown
}

export interface GameEvent {
  id: string
  worldId: string
  timestamp: string
  type: EventType
  title: string
  description: string
  participantIds: string[]
  locationId: string
  witnessIds: string[]
  consequences: StateChange[]
  narrativeWeight: number // 0-100
  aiGenerated: boolean
}

export interface Condition {
  type: 'age' | 'date' | 'mood' | 'relationship' | 'stat' | 'custom'
  characterId?: string
  field?: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  value: number | string
}

export interface StoryAnchor {
  id: string
  worldId: string
  createdAt: string
  updatedAt: string

  title: string
  description: string
  timing: AnchorTiming
  targetDate?: string
  targetAge?: number
  conditions: Condition[]
  participantIds: string[]
  importance: AnchorImportance
  status: AnchorStatus
  tags: string[]
  notes: string
}

export function createDefaultStoryAnchor(worldId: string, partial?: Partial<StoryAnchor>): StoryAnchor {
  return {
    id: crypto.randomUUID(),
    worldId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'Новый якорь',
    description: '',
    timing: 'absolute',
    conditions: [],
    participantIds: [],
    importance: 'medium',
    status: 'pending',
    tags: [],
    notes: '',
    ...partial,
  }
}
