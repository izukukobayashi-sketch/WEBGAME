import type { Character, World } from '@/types'
import { tickNeeds } from './NeedsSystem'
import { tickMood } from './MoodSystem'
import { generateCharacterEvents, generateWorldEvents, type SimEvent } from './EventSystem'
import { updateMemory } from './MemorySystem'
import { addHours } from '../procedural/MorphologyHelper'
import type { LLMProvider } from '../ai'

export type SimSpeed = 1 | 5 | 10 | 50

/** Game hours advanced per real-world 500ms tick. */
const HOURS_PER_TICK: Record<SimSpeed, number> = {
  1: 1,
  5: 6,
  10: 12,
  50: 24,
}

export interface TickResult {
  updatedWorld: World
  updatedCharacters: Character[]
  events: SimEvent[]
}

/** Process one simulation tick for the given world + characters. */
export async function processTick(
  world: World,
  characters: Character[],
  speed: SimSpeed,
  aiProvider?: LLMProvider,
): Promise<TickResult> {
  const hoursElapsed = HOURS_PER_TICK[speed]
  const newDate = addHours(world.timeline.currentDate, hoursElapsed)

  const updatedWorld: World = {
    ...world,
    timeline: {
      ...world.timeline,
      currentDate: newDate,
      tickCount: world.timeline.tickCount + 1,
    },
  }

  const allEvents: SimEvent[] = []
  const updatedCharacters: Character[] = []

  for (const char of characters) {
    // 1. Needs
    const needsResult = tickNeeds(char, hoursElapsed)
    let current = needsResult.character

    // 2. Mood
    const moodResult = tickMood(current)
    current = moodResult.character

    // 3. Events
    const evResult = await generateCharacterEvents(current, updatedWorld, hoursElapsed, moodResult.breakdown, aiProvider)
    current = evResult.updatedCharacter
    allEvents.push(...evResult.events)

    // 4. Memory
    current = updateMemory(current, evResult.events)

    updatedCharacters.push(current)
  }

  // World events
  allEvents.push(...generateWorldEvents(updatedWorld))

  return { updatedWorld, updatedCharacters, events: allEvents }
}
