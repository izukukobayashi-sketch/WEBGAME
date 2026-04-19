import type { Character, MemoryEvent, MemorySummary } from '@/types'
import type { SimEvent } from './EventSystem'

const HOT_MAX = 15
const WARM_MAX = 30

const EMOTIONAL_WEIGHT: Partial<Record<SimEvent['type'], number>> = {
  mood:      -6,
  milestone: 10,
  social:    3,
  thought:   2,
  need:      -3,
}

function emotionalWeight(ev: SimEvent): number {
  const base = EMOTIONAL_WEIGHT[ev.type] ?? 0
  if (ev.icon === '💔') return -10
  if (ev.icon === '⚡') return -4
  return base
}

/** Append a sim event to a character's hot memory, archive oldest if full. */
export function updateMemory(char: Character, events: SimEvent[]): Character {
  const relevant = events.filter(
    (e) => e.characterId === char.id && e.type !== 'idle' && e.type !== 'world',
  )
  if (relevant.length === 0) return char

  const newEntries: MemoryEvent[] = relevant.map((e) => ({
    id: e.id,
    timestamp: e.worldDate,
    description: e.text,
    emotionalWeight: emotionalWeight(e),
  }))

  let hot = [...char.memory.hot, ...newEntries]
  let warm = [...char.memory.warm]

  if (hot.length > HOT_MAX) {
    const overflow = hot.slice(0, hot.length - HOT_MAX)
    hot = hot.slice(hot.length - HOT_MAX)

    const summary: MemorySummary = {
      period: overflow[0].timestamp.slice(0, 10),
      summary: overflow.map((e) => e.description).join('. '),
      keyEvents: overflow
        .sort((a, b) => Math.abs(b.emotionalWeight) - Math.abs(a.emotionalWeight))
        .slice(0, 3)
        .map((e) => e.description),
    }
    warm = [summary, ...warm].slice(0, WARM_MAX)
  }

  return { ...char, memory: { ...char.memory, hot, warm } }
}
