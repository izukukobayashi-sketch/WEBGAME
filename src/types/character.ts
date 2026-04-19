export type Species = 'human' | 'furry' | 'elf' | 'custom'
export type CharacterRole = 'playerCharacter' | 'majorNPC' | 'backgroundNPC'
export type SimulationLevel = 'hot' | 'warm' | 'cold'
export type Gender = 'male' | 'female' | 'nonbinary' | 'unknown'

export interface Stats {
  intelligence: number // 1-100
  charisma: number
  will: number
  perception: number
  agility: number
  endurance: number
  creativity: number
  luck: number
}

export interface Skill {
  id: string
  name: string
  description: string
  parentStat: keyof Stats
  level: number // 0-100
  isProcedural: boolean
  isCustom: boolean
  usageCount: number
}

export interface Trait {
  id: string
  name: string
  description: string
  statModifiers: Partial<Stats>
  moodModifier: number
  tags: string[]
}

export interface Value {
  name: string
  importance: number // 0-100
}

export interface Need {
  current: number // 0-100
  decayRate: number // per tick
  threshold: number // below this → mood thought
}

export interface Needs {
  health: Need
  hunger: Need
  sleep: Need
  safety: Need
  social: Need
  belonging: Need
  intimacy: Need
  meaning: Need
  selfEsteem: Need
  stability: Need
  progress: Need
}

export interface Thought {
  id: string
  description: string
  moodEffect: number
  expiresAt?: string
}

export interface AppearanceStage {
  ageFrom: number
  ageTo: number
  description: string
}

export interface Appearance {
  current: string
  stages: AppearanceStage[]
  species: Species
  speciesCustomName?: string
}

export interface MemoryEvent {
  id: string
  timestamp: string
  description: string
  emotionalWeight: number
}

export interface MemorySummary {
  period: string
  summary: string
  keyEvents: string[]
}

export interface Reflection {
  id: string
  createdAt: string
  content: string
  relatedEvents: string[]
}

export interface Memory {
  hot: MemoryEvent[]
  warm: MemorySummary[]
  cold: MemorySummary[]
  reflections: Reflection[]
}

export interface PreviousLife {
  worldId?: string
  name: string
  deathDate: string
  deathCause: string
  summary: string
  keyMemories: MemoryEvent[]
}

export interface MemoryLock {
  until: string // ISO date
  reason: string
}

export interface Schedule {
  wakeTime: string
  sleepTime: string
  dailyRoutine: string
}

export interface Goal {
  id: string
  description: string
  priority: number
  deadline?: string
  progress: number // 0-100
}

export interface GrammarProfile {
  gender: Gender
  nameGenitive: string
  nameDative: string
  nameAccusative: string
  nameInstrumental: string
  namePrepositional: string
}

export interface Character {
  id: string
  worldId: string
  createdAt: string
  updatedAt: string

  // Identity
  name: string
  aliases: string[]
  species: Species
  speciesCustomName: string
  gender: Gender
  appearance: Appearance
  grammarProfile: GrammarProfile

  // Biography
  birthDate: string
  deathDate?: string
  birthplace: string
  nationality: string
  culture: string
  biography: string

  // Personality
  traitIds: string[]
  values: Value[]
  fears: string[]
  dreams: string[]
  secrets: string[]
  worldview: string

  // Stats & skills
  stats: Stats
  skillIds: string[]
  customSkills: Skill[]
  hiddenStats: Record<string, number>

  // Psychology
  mood: number // 0-100
  moodTarget: number
  thoughts: Thought[]
  needs: Needs
  mentalBreakThreshold: number

  // Memory
  memory: Memory
  previousLife?: PreviousLife
  memoryLocked?: MemoryLock

  // State
  currentLocationId: string
  schedule: Schedule
  activeGoals: Goal[]
  currentActivity: string

  // Meta
  role: CharacterRole
  simulationLevel: SimulationLevel

  // System voice (for characters with a System)
  hasSystem: boolean
  systemTone?: 'cold' | 'ironic' | 'caring' | 'formal'
}

export function createDefaultStats(): Stats {
  return {
    intelligence: 50,
    charisma: 50,
    will: 50,
    perception: 50,
    agility: 50,
    endurance: 50,
    creativity: 50,
    luck: 50,
  }
}

export function createDefaultNeeds(): Needs {
  const defaultNeed = (decay = 1): Need => ({
    current: 80,
    decayRate: decay,
    threshold: 30,
  })
  return {
    health: defaultNeed(0.1),
    hunger: defaultNeed(3),
    sleep: defaultNeed(2),
    safety: defaultNeed(0.5),
    social: defaultNeed(1.5),
    belonging: defaultNeed(0.5),
    intimacy: defaultNeed(0.3),
    meaning: defaultNeed(0.2),
    selfEsteem: defaultNeed(0.3),
    stability: defaultNeed(0.2),
    progress: defaultNeed(0.4),
  }
}

export function createDefaultCharacter(worldId: string, partial?: Partial<Character>): Character {
  return {
    id: crypto.randomUUID(),
    worldId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'Новый персонаж',
    aliases: [],
    species: 'human',
    speciesCustomName: '',
    gender: 'unknown',
    appearance: { current: '', stages: [], species: 'human' },
    grammarProfile: {
      gender: 'unknown',
      nameGenitive: '',
      nameDative: '',
      nameAccusative: '',
      nameInstrumental: '',
      namePrepositional: '',
    },
    birthDate: '2000-01-01',
    birthplace: '',
    nationality: '',
    culture: '',
    biography: '',
    traitIds: [],
    values: [],
    fears: [],
    dreams: [],
    secrets: [],
    worldview: '',
    stats: createDefaultStats(),
    skillIds: [],
    customSkills: [],
    hiddenStats: {},
    mood: 70,
    moodTarget: 70,
    thoughts: [],
    needs: createDefaultNeeds(),
    mentalBreakThreshold: 20,
    memory: { hot: [], warm: [], cold: [], reflections: [] },
    currentLocationId: '',
    schedule: { wakeTime: '07:00', sleepTime: '23:00', dailyRoutine: '' },
    activeGoals: [],
    currentActivity: '',
    role: 'majorNPC',
    simulationLevel: 'warm',
    hasSystem: false,
    ...partial,
  }
}
