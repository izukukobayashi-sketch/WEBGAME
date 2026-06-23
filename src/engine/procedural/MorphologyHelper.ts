import type { Gender } from '@/types'

/**
 * Minimal Russian morphology helper.
 * Full morphology (pymorphy-style) lives in Stage 7 refinement.
 * For now: pronoun selection, name case usage, basic adjective agreement.
 */

export interface PronounSet {
  nom: string   // он/она/они
  gen: string   // его/её/их
  dat: string   // ему/ей/им
  acc: string   // его/её/их
  ins: string   // им/ей/ими
  prep: string  // нём/ней/них
  refl: string  // себя
  pos: string   // его/её/их (possessive)
}

const PRONOUNS: Record<Gender, PronounSet> = {
  male: { nom: 'он', gen: 'его', dat: 'ему', acc: 'его', ins: 'им', prep: 'нём', refl: 'себя', pos: 'его' },
  female: { nom: 'она', gen: 'её', dat: 'ей', acc: 'её', ins: 'ею', prep: 'ней', refl: 'себя', pos: 'её' },
  nonbinary: { nom: 'они', gen: 'их', dat: 'им', acc: 'их', ins: 'ими', prep: 'них', refl: 'себя', pos: 'их' },
  unknown: { nom: 'они', gen: 'их', dat: 'им', acc: 'их', ins: 'ими', prep: 'них', refl: 'себя', pos: 'их' },
}

export function getPronouns(gender: Gender): PronounSet {
  return PRONOUNS[gender]
}

/** Capitalise first letter. */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Adjective ending agreement (short form - good enough for procedural text). */
export function agreeAdj(base: string, gender: Gender): string {
  switch (gender) {
    case 'female': return base + 'ая'
    case 'male': return base + 'ый'
    default: return base + 'ые'
  }
}

/** Return "прошёл/прошла" or similar verb form based on gender. */
export function agreeVerb(maleForm: string, femaleForm: string, gender: Gender): string {
  return gender === 'female' ? femaleForm : maleForm
}

/** Format game date to Russian. */
export function formatDate(isoDate: string): string {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day} ${months[month - 1]} ${year} г.`
}

/** Advance ISO date string by N days. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Advance ISO date string by N hours (fractional days). */
export function addHours(isoDate: string, hours: number): string {
  return addDays(isoDate, hours / 24)
}

/** Month as season. */
export function getSeason(isoDate: string): 'winter' | 'spring' | 'summer' | 'autumn' {
  const month = Number(isoDate.slice(5, 7))
  if (month <= 2 || month === 12) return 'winter'
  if (month <= 5) return 'spring'
  if (month <= 8) return 'summer'
  return 'autumn'
}

/** Time of day bucket based on an hour 0-23. */
export function getTimeOfDay(hour: number): 'night' | 'morning' | 'afternoon' | 'evening' {
  if (hour < 6) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}
