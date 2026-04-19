import type { Character, World } from '@/types'
import {
  pickTimeOfDayText, pickAtmosphereText, pickThoughtText,
  pickActionText, pickSocialText, pickRoutineText,
  pickMoodBreakdownText, pickMoodRecoveryText,
} from '../procedural/pools/index'
import type { BreakdownSeverity } from './MoodSystem'
import { satisfyNeed } from './NeedsSystem'

export interface SimEvent {
  id: string
  worldDate: string
  characterId?: string
  characterName?: string
  type: 'thought' | 'action' | 'need' | 'mood' | 'social' | 'milestone' | 'world' | 'idle'
  text: string
  icon: string
  timestamp: number
}

let eventCounter = 0
function newEvent(partial: Omit<SimEvent, 'id' | 'timestamp'>): SimEvent {
  return { ...partial, id: `ev_${++eventCounter}`, timestamp: Date.now() }
}

const CTX_MAP = {
  male: 'male',
  female: 'female',
  nonbinary: 'nonbinary',
  unknown: 'unknown',
} as const

/** Generate procedural events for one character on a given tick. */
export function generateCharacterEvents(
  character: Character,
  world: World,
  hoursElapsed: number,
  breakdown: BreakdownSeverity,
): { events: SimEvent[]; updatedCharacter: Character } {
  const events: SimEvent[] = []
  let char = character
  const ctx = {
    gender: CTX_MAP[character.gender],
    mood: character.mood,
    timeHour: getGameHour(world.timeline.currentDate),
    date: world.timeline.currentDate,
    indoor: true,
  }

  // ── Breakdown event ──────────────────────────────────────────────────────
  if (breakdown !== 'none') {
    const text = pickMoodBreakdownText(ctx) + ' ' + pickMoodRecoveryText()
    events.push(newEvent({
      worldDate: world.timeline.currentDate,
      characterId: char.id,
      characterName: char.name,
      type: 'mood',
      text,
      icon: breakdown === 'extreme' ? '💔' : '😤',
    }))
    return { events, updatedCharacter: char }
  }

  // ── Need satisfaction (routine actions each tick) ──────────────────────
  if (hoursElapsed >= 6) {
    char = satisfyNeed(char, 'hunger', 15)
    events.push(newEvent({
      worldDate: world.timeline.currentDate,
      characterId: char.id,
      characterName: char.name,
      type: 'action',
      text: pickActionText('eat', ctx),
      icon: '🍽️',
    }))
  }

  const hour = getGameHour(world.timeline.currentDate)
  if (hour >= 22 || hour < 7) {
    char = satisfyNeed(char, 'sleep', 10)
    events.push(newEvent({
      worldDate: world.timeline.currentDate,
      characterId: char.id,
      characterName: char.name,
      type: 'action',
      text: pickActionText('sleep', ctx),
      icon: '💤',
    }))
  }

  // ── Random action events (one per N hours) ─────────────────────────────
  if (Math.random() < hoursElapsed / 24) {
    const roll = Math.random()
    let text: string
    let icon: string

    if (roll < 0.2) {
      text = pickActionText('walk', ctx)
      icon = '🚶'
    } else if (roll < 0.4) {
      text = pickActionText('think', ctx)
      icon = '💭'
    } else if (roll < 0.55) {
      text = pickActionText('work', ctx)
      icon = '💼'
    } else if (roll < 0.7) {
      text = pickActionText('read', ctx)
      icon = '📖'
    } else if (roll < 0.85) {
      text = pickActionText('rest', ctx)
      icon = '🛋️'
    } else {
      text = pickRoutineText()
      icon = '📅'
    }

    events.push(newEvent({
      worldDate: world.timeline.currentDate,
      characterId: char.id,
      characterName: char.name,
      type: 'action',
      text,
      icon,
    }))
  }

  // ── Mood / thought event (every ~2 days) ──────────────────────────────
  if (Math.random() < hoursElapsed / 48) {
    events.push(newEvent({
      worldDate: world.timeline.currentDate,
      characterId: char.id,
      characterName: char.name,
      type: 'thought',
      text: pickThoughtText(ctx),
      icon: char.mood >= 60 ? '😊' : char.mood >= 35 ? '😐' : '😔',
    }))
  }

  // ── Social event (every ~3 days, only if social need low) ───────────────
  if (Math.random() < hoursElapsed / 72 || char.needs.social.current < char.needs.social.threshold) {
    const socialRoll = Math.random()
    let text: string
    let icon: string
    if (socialRoll < 0.3) { text = pickSocialText('talked'); icon = '💬' }
    else if (socialRoll < 0.5) { text = pickSocialText('met'); icon = '👋' }
    else if (socialRoll < 0.65) { text = pickSocialText('helped'); icon = '🤝' }
    else if (socialRoll < 0.8) { text = pickSocialText('deepened'); icon = '💞' }
    else { text = pickSocialText('argued'); icon = '⚡' }

    char = satisfyNeed(char, 'social', 20)
    events.push(newEvent({
      worldDate: world.timeline.currentDate,
      characterId: char.id,
      characterName: char.name,
      type: 'social',
      text,
      icon,
    }))
  }

  // ── Atmosphere flavour (daily) ─────────────────────────────────────────
  if (Math.random() < hoursElapsed / 24) {
    const atmText = pickTimeOfDayText(ctx) + ' ' + pickAtmosphereText(ctx)
    events.push(newEvent({
      worldDate: world.timeline.currentDate,
      type: 'idle',
      text: atmText,
      icon: '🌍',
    }))
  }

  return { events, updatedCharacter: char }
}

/** Generate world-level ambient events. */
export function generateWorldEvents(world: World): SimEvent[] {
  if (Math.random() > 0.05) return []
  return [newEvent({
    worldDate: world.timeline.currentDate,
    type: 'world',
    text: 'В мире что-то изменилось — незаметно для большинства.',
    icon: '🌐',
  })]
}

function getGameHour(isoDate: string): number {
  return (new Date(isoDate).getTime() / (1000 * 3600)) % 24
}
