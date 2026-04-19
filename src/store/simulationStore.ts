import { create } from 'zustand'
import type { Character, World } from '@/types'
import { processTick, type SimSpeed, type SimEvent } from '@/engine/simulation'
import { saveWorld, saveCharacter } from '@/db'

const TICK_INTERVAL_MS = 500
const MAX_LOG = 200
const AUTOSAVE_EVERY = 60 // ticks

export interface SimulationState {
  isRunning: boolean
  speed: SimSpeed
  world: World | null
  characters: Character[]
  eventLog: SimEvent[]
  totalTicks: number
  ticksSinceLastSave: number
  _intervalId: ReturnType<typeof setInterval> | null

  // Actions
  init: (world: World, characters: Character[]) => void
  start: () => void
  pause: () => void
  setSpeed: (speed: SimSpeed) => void
  step: () => void            // one manual tick
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning: false,
  speed: 1,
  world: null,
  characters: [],
  eventLog: [],
  totalTicks: 0,
  ticksSinceLastSave: 0,
  _intervalId: null,

  init: (world, characters) => {
    const { _intervalId } = get()
    if (_intervalId) clearInterval(_intervalId)
    set({ world, characters, isRunning: false, _intervalId: null, eventLog: [], totalTicks: 0, ticksSinceLastSave: 0 })
  },

  start: () => {
    if (get().isRunning) return
    if (!get().world) return

    const id = setInterval(() => {
      const { world, characters, speed, eventLog, totalTicks, ticksSinceLastSave } = get()
      if (!world) return

      const result = processTick(world, characters, speed)

      const newLog = [...result.events, ...eventLog].slice(0, MAX_LOG)
      const newSinceLastSave = ticksSinceLastSave + 1

      set({
        world: result.updatedWorld,
        characters: result.updatedCharacters,
        eventLog: newLog,
        totalTicks: totalTicks + 1,
        ticksSinceLastSave: newSinceLastSave,
      })

      // Autosave to IndexedDB
      if (newSinceLastSave >= AUTOSAVE_EVERY) {
        set({ ticksSinceLastSave: 0 })
        void saveWorld(result.updatedWorld)
        for (const c of result.updatedCharacters) void saveCharacter(c)
      }
    }, TICK_INTERVAL_MS)

    set({ isRunning: true, _intervalId: id })
  },

  pause: () => {
    const { _intervalId, world, characters } = get()
    if (_intervalId) clearInterval(_intervalId)
    set({ isRunning: false, _intervalId: null, ticksSinceLastSave: AUTOSAVE_EVERY })
    // Save on pause
    if (world) {
      void saveWorld(world)
      for (const c of characters) void saveCharacter(c)
    }
  },

  setSpeed: (speed) => {
    const { isRunning } = get()
    set({ speed })
    if (isRunning) {
      get().pause()
      get().start()
    }
  },

  step: () => {
    const { world, characters, speed, eventLog, totalTicks } = get()
    if (!world) return
    const result = processTick(world, characters, speed)
    set({
      world: result.updatedWorld,
      characters: result.updatedCharacters,
      eventLog: [...result.events, ...eventLog].slice(0, MAX_LOG),
      totalTicks: totalTicks + 1,
    })
  },

  reset: () => {
    const { _intervalId } = get()
    if (_intervalId) clearInterval(_intervalId)
    set({ isRunning: false, _intervalId: null, world: null, characters: [], eventLog: [], totalTicks: 0 })
  },
}))
