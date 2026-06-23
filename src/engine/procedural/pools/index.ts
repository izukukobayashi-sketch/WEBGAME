import type { Gender } from '@/types'
import { globalAntiRepeat } from '../AntiRepeat'
import * as G from './general'
import * as A from './actions'
import * as S from './social'
import { getTimeOfDay, getSeason } from '../MorphologyHelper'

export type PoolContext = {
  timeHour?: number
  date?: string
  mood?: number        // 0-100
  gender?: Gender
  indoor?: boolean
}

/** Pick a text snippet based on context. */
export function pickTimeOfDayText(ctx: PoolContext): string {
  const tod = getTimeOfDay(ctx.timeHour ?? 12)
  const pools = {
    morning: G.TIME_MORNING,
    afternoon: G.TIME_AFTERNOON,
    evening: G.TIME_EVENING,
    night: G.TIME_NIGHT,
  }
  return globalAntiRepeat.pickFrom(`tod_${tod}`, pools[tod])
}

export function pickWeatherText(weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy'): string {
  const pools = {
    sunny: G.WEATHER_SUNNY,
    cloudy: G.WEATHER_CLOUDY,
    rainy: G.WEATHER_RAINY,
    snowy: G.WEATHER_SNOWY,
    windy: G.WEATHER_WINDY,
  }
  return globalAntiRepeat.pickFrom(`weather_${weather}`, pools[weather])
}

export function pickSeasonText(ctx: PoolContext): string {
  const s = getSeason(ctx.date ?? '2000-01-01')
  const pools = {
    spring: G.SEASON_SPRING,
    summer: G.SEASON_SUMMER,
    autumn: G.SEASON_AUTUMN,
    winter: G.SEASON_WINTER,
  }
  return globalAntiRepeat.pickFrom(`season_${s}`, pools[s])
}

export function pickAtmosphereText(ctx: PoolContext): string {
  const pool = ctx.indoor ? G.ATMOSPHERE_HOME : G.ATMOSPHERE_CITY
  const key = ctx.indoor ? 'atm_home' : 'atm_city'
  return globalAntiRepeat.pickFrom(key, pool)
}

export function pickActionText(action: keyof typeof ACTION_MAP, ctx: PoolContext): string {
  const isFemale = ctx.gender === 'female'
  const [mPool, fPool, key] = ACTION_MAP[action]
  const pool = isFemale ? fPool : mPool
  return globalAntiRepeat.pickFrom(`action_${key}_${isFemale ? 'f' : 'm'}`, pool)
}

export function pickThoughtText(ctx: PoolContext): string {
  const mood = ctx.mood ?? 70
  if (mood >= 70) return globalAntiRepeat.pickFrom('thought_happy', A.THOUGHT_HAPPY)
  if (mood >= 40) return globalAntiRepeat.pickFrom('thought_neutral', A.THOUGHT_NEUTRAL)
  if (mood >= 25) return globalAntiRepeat.pickFrom('thought_sad', A.THOUGHT_SAD)
  return globalAntiRepeat.pickFrom('thought_anxious', A.THOUGHT_ANXIOUS)
}

export function pickSocialText(event: keyof typeof SOCIAL_MAP): string {
  const [pool, key] = SOCIAL_MAP[event]
  return globalAntiRepeat.pickFrom(`social_${key}`, pool)
}

export function pickRoutineText(): string {
  return globalAntiRepeat.pickFrom('routine', S.DAILY_ROUTINE)
}

export function pickMoodBreakdownText(ctx: PoolContext): string {
  const pool = ctx.gender === 'female' ? A.MOOD_BREAKDOWN_MINOR_F : A.MOOD_BREAKDOWN_MINOR
  return globalAntiRepeat.pickFrom(`breakdown_${ctx.gender ?? 'm'}`, pool)
}

export function pickMoodRecoveryText(): string {
  return globalAntiRepeat.pickFrom('recovery', A.MOOD_RECOVERY)
}

export function pickSkillText(breakthrough: boolean): string {
  return breakthrough
    ? globalAntiRepeat.pickFrom('skill_break', S.SKILL_BREAKTHROUGH)
    : globalAntiRepeat.pickFrom('skill_practice', S.SKILL_PRACTICE)
}

// ── Maps ─────────────────────────────────────────────────────────────────────

const ACTION_MAP = {
  walk: [A.ACTION_WALKS, A.ACTION_WALKS_F, 'walk'],
  think: [A.ACTION_THINKS, A.ACTION_THINKS_F, 'think'],
  eat: [A.ACTION_EATS, A.ACTION_EATS_F, 'eat'],
  sleep: [A.ACTION_SLEEPS, A.ACTION_SLEEPS_F, 'sleep'],
  rest: [A.ACTION_RESTS, A.ACTION_RESTS_F, 'rest'],
  work: [A.ACTION_WORKS, A.ACTION_WORKS_F, 'work'],
  read: [A.ACTION_READS, A.ACTION_READS_F, 'read'],
} as const

const SOCIAL_MAP = {
  met: [S.SOCIAL_MET, 'met'],
  talked: [S.SOCIAL_TALKED, 'talked'],
  argued: [S.SOCIAL_ARGUED, 'argued'],
  helped: [S.SOCIAL_HELPED, 'helped'],
  deepened: [S.RELATIONSHIP_DEEPENED, 'deepened'],
  strained: [S.RELATIONSHIP_STRAINED, 'strained'],
  discovery: [S.DISCOVERY, 'discovery'],
} as const
