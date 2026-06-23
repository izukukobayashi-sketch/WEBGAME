import type { Character, Needs, Thought } from '@/types'

/** How many in-game hours one tick represents. */
const HOURS_PER_DAY = 24

export interface NeedTickResult {
  character: Character
  newThoughts: Thought[]
  criticalNeeds: string[]
}

const NEED_LABELS: Record<keyof Needs, string> = {
  health: 'здоровье',
  hunger: 'голод',
  sleep: 'сон',
  safety: 'безопасность',
  social: 'общение',
  belonging: 'принадлежность',
  intimacy: 'близость',
  meaning: 'смысл',
  selfEsteem: 'самооценка',
  stability: 'стабильность',
  progress: 'прогресс',
}

const NEED_MOOD_EFFECT: Record<keyof Needs, number> = {
  health: -15,
  hunger: -20,
  sleep: -18,
  safety: -25,
  social: -10,
  belonging: -8,
  intimacy: -5,
  meaning: -7,
  selfEsteem: -10,
  stability: -6,
  progress: -4,
}

/** Default decay per 24 hours for each need (in need units). */
const DEFAULT_DECAY_PER_DAY: Record<keyof Needs, number> = {
  health: 0.2,
  hunger: 25,
  sleep: 20,
  safety: 1,
  social: 8,
  belonging: 2,
  intimacy: 1.5,
  meaning: 1,
  selfEsteem: 1.5,
  stability: 1,
  progress: 2,
}

/** Recovery per 24 hours when the need is being met (action-driven, applied situationally). */
export const NEED_RECOVERY: Record<keyof Needs, number> = {
  health: 5,
  hunger: 80,
  sleep: 60,
  safety: 20,
  social: 30,
  belonging: 15,
  intimacy: 10,
  meaning: 12,
  selfEsteem: 15,
  stability: 10,
  progress: 20,
}

export function tickNeeds(character: Character, hoursElapsed: number): NeedTickResult {
  const dayFraction = hoursElapsed / HOURS_PER_DAY
  const newNeeds = { ...character.needs }
  const newThoughts: Thought[] = []
  const criticalNeeds: string[] = []

  for (const key of Object.keys(DEFAULT_DECAY_PER_DAY) as (keyof Needs)[]) {
    const decay = DEFAULT_DECAY_PER_DAY[key] * dayFraction
    const current = newNeeds[key].current - decay
    newNeeds[key] = { ...newNeeds[key], current: Math.max(0, current) }

    const threshold = newNeeds[key].threshold
    if (current < threshold) {
      const severity = current < threshold / 2 ? 'critical' : 'low'
      if (severity === 'critical') criticalNeeds.push(key)

      const existing = character.thoughts.find((t) => t.id === `need_${key}`)
      if (!existing) {
        newThoughts.push({
          id: `need_${key}`,
          description: `Неудовлетворённая потребность: ${NEED_LABELS[key]}`,
          moodEffect: NEED_MOOD_EFFECT[key] * (severity === 'critical' ? 1.5 : 0.7),
        })
      }
    }
  }

  return {
    character: {
      ...character,
      needs: newNeeds,
      thoughts: [
        ...character.thoughts.filter((t) => !t.id.startsWith('need_')),
        ...character.thoughts.filter((t) => t.id.startsWith('need_') && newNeeds[t.id.slice(5) as keyof Needs]?.current < newNeeds[t.id.slice(5) as keyof Needs]?.threshold),
        ...newThoughts,
      ],
    },
    newThoughts,
    criticalNeeds,
  }
}

/** Satisfy a need (e.g. after eating → hunger recovers). */
export function satisfyNeed(character: Character, need: keyof Needs, amount?: number): Character {
  const recovery = amount ?? NEED_RECOVERY[need]
  return {
    ...character,
    needs: {
      ...character.needs,
      [need]: {
        ...character.needs[need],
        current: Math.min(100, character.needs[need].current + recovery),
      },
    },
    thoughts: character.thoughts.filter((t) => t.id !== `need_${need}`),
  }
}
