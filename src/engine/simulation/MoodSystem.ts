import type { Character } from '@/types'
import { BASE_TRAITS } from '@/data/traits'

const BASE_MOOD = 65
const INERTIA = 0.05  // mood moves this fraction toward target per tick

export type BreakdownSeverity = 'none' | 'minor' | 'major' | 'extreme'

export interface MoodTickResult {
  character: Character
  breakdown: BreakdownSeverity
  delta: number
}

export function calcMoodTarget(character: Character): number {
  // Sum thought effects
  const thoughtSum = character.thoughts.reduce((s, t) => s + t.moodEffect, 0)

  // Trait base modifiers
  const traitSum = character.traitIds.reduce((s, id) => {
    const trait = BASE_TRAITS.find((t) => t.id === id)
    return s + (trait?.moodModifier ?? 0)
  }, 0)

  return Math.min(100, Math.max(0, BASE_MOOD + thoughtSum + traitSum))
}

export function tickMood(character: Character): MoodTickResult {
  const target = calcMoodTarget(character)
  const diff = target - character.mood
  const newMood = character.mood + diff * INERTIA

  let breakdown: BreakdownSeverity = 'none'
  let newChar = { ...character, mood: newMood, moodTarget: target }

  if (newMood <= character.mentalBreakThreshold) {
    if (newMood <= 5) breakdown = 'extreme'
    else if (newMood <= 15) breakdown = 'major'
    else breakdown = 'minor'

    // Post-breakdown catharsis: mood rebounds
    if (breakdown !== ('none' as BreakdownSeverity)) {
      newChar = {
        ...newChar,
        mood: Math.min(100, newMood + 40),
        thoughts: newChar.thoughts.filter((t) => t.id.startsWith('need_')), // clear non-need thoughts
      }
    }
  }

  return { character: newChar, breakdown, delta: newMood - character.mood }
}

export function getMoodLabel(mood: number): string {
  if (mood >= 85) return 'Счастлив'
  if (mood >= 70) return 'Доволен'
  if (mood >= 55) return 'Нейтрален'
  if (mood >= 40) return 'Грустит'
  if (mood >= 25) return 'Подавлен'
  if (mood >= 10) return 'Несчастен'
  return 'В отчаянии'
}

export function getMoodColor(mood: number): string {
  if (mood >= 70) return 'bg-green-500'
  if (mood >= 40) return 'bg-yellow-500'
  if (mood >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}
