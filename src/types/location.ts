export type LocationType =
  | 'city'
  | 'village'
  | 'town'
  | 'country'
  | 'region'
  | 'building'
  | 'room'
  | 'dungeon'
  | 'wilderness'
  | 'custom'

export interface Coordinates {
  x: number
  y: number
}

export interface Atmosphere {
  beauty: number // 0-100
  safety: number // 0-100
  prosperity: number // 0-100
  magic: number // 0-100
  population: number
}

export interface Location {
  id: string
  worldId: string
  createdAt: string
  updatedAt: string

  name: string
  type: LocationType
  coordinates: Coordinates
  parentId?: string
  childIds: string[]

  description: string
  atmosphere: Atmosphere
  currentOccupantIds: string[]
  tags: string[]
}

export function createDefaultLocation(worldId: string, partial?: Partial<Location>): Location {
  return {
    id: crypto.randomUUID(),
    worldId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'Новая локация',
    type: 'city',
    coordinates: { x: 500, y: 500 },
    childIds: [],
    description: '',
    atmosphere: { beauty: 50, safety: 50, prosperity: 50, magic: 0, population: 1000 },
    currentOccupantIds: [],
    tags: [],
    ...partial,
  }
}
