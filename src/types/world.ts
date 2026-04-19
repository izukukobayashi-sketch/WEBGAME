export type WorldGenre =
  | 'fantasy'
  | 'sci-fi'
  | 'modern'
  | 'magical-realism'
  | 'post-apocalypse'
  | 'historical'
  | 'custom'

export interface WorldSettings {
  genre: WorldGenre
  epoch: string
  startYear: number
  tickSize: 'minute' | 'hour' | 'day' | 'week'
  reincarnationEnabled: boolean
  magicEnabled: boolean
  anthropomorphsEnabled: boolean
  xenophobiaLevel: number // 0-100
  aiProvider: 'claude' | 'openai' | 'gemini' | 'ollama' | 'none'
  aiModel: string
  aiApiKey: string
  dailyTokenLimit: number
  description: string
  rules: string
}

export interface MapLayer {
  type: 'landscape' | 'political' | 'settlements' | 'roads'
  data: unknown
}

export interface WorldMap {
  width: number
  height: number
  seed: number
  layers: MapLayer[]
}

export interface Timeline {
  currentDate: string // ISO date
  tickCount: number
  history: string[] // sorted event IDs
}

export interface GlobalState {
  population: number
  stability: number // 0-100
  prosperity: number // 0-100
  magicLevel: number // 0-100
}

export interface World {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  schemaVersion: number
  settings: WorldSettings
  map: WorldMap
  timeline: Timeline
  globalState: GlobalState
}

export function createDefaultWorld(partial?: Partial<World>): World {
  return {
    id: crypto.randomUUID(),
    name: 'Новый мир',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
    settings: {
      genre: 'modern',
      epoch: 'Современность',
      startYear: 2000,
      tickSize: 'day',
      reincarnationEnabled: false,
      magicEnabled: false,
      anthropomorphsEnabled: false,
      xenophobiaLevel: 30,
      aiProvider: 'claude',
      aiModel: 'claude-sonnet-4-5',
      aiApiKey: '',
      dailyTokenLimit: 100000,
      description: '',
      rules: '',
    },
    map: { width: 1000, height: 1000, seed: Math.floor(Math.random() * 999999), layers: [] },
    timeline: {
      currentDate: '2000-01-01',
      tickCount: 0,
      history: [],
    },
    globalState: { population: 1000000, stability: 70, prosperity: 60, magicLevel: 0 },
    ...partial,
  }
}
