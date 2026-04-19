import { useState } from 'react'
import { useSimulationStore } from '@/store/simulationStore'
import { useWorldStore } from '@/store/worldStore'
import { STAT_DEFINITIONS } from '@/data/stats'
import { BASE_TRAITS } from '@/data/traits'
import { BASE_SKILLS } from '@/data/skills'
import { getMoodLabel, getMoodColor } from '@/engine/simulation/MoodSystem'
import type { Character } from '@/types'

const STAT_COLOR: Record<string, string> = {
  intelligence: 'bg-blue-500',
  charisma:     'bg-pink-500',
  will:         'bg-yellow-500',
  perception:   'bg-teal-500',
  agility:      'bg-green-500',
  endurance:    'bg-orange-500',
  creativity:   'bg-purple-500',
  luck:         'bg-amber-400',
}

const TAG_COLOR: Record<string, string> = {
  positive: 'text-green-400 border-green-800/50',
  negative: 'text-red-400 border-red-800/50',
  dark:     'text-purple-400 border-purple-800/50',
  magic:    'text-cyan-400 border-cyan-800/50',
  species:  'text-orange-400 border-orange-800/50',
  mental:   'text-blue-300 border-blue-800/50',
  social:   'text-pink-300 border-pink-800/50',
  physical: 'text-amber-300 border-amber-800/50',
  special:  'text-cyan-300 border-cyan-800/50',
}

function tagColor(tags: string[]): string {
  for (const t of ['positive', 'negative', 'dark', 'magic', 'species', 'mental', 'social', 'physical', 'special']) {
    if (tags.includes(t)) return TAG_COLOR[t] ?? 'text-gray-400 border-gray-700'
  }
  return 'text-gray-400 border-gray-700'
}

function StatBar({ label, description, value, colorClass }: {
  label: string; description: string; value: number; colorClass: string
}) {
  return (
    <div title={description}>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span className="font-mono font-bold">{value}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function NeedBar({ label, value, threshold }: { label: string; value: number; threshold: number }) {
  const critical = value < threshold
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className={critical ? 'text-red-400' : 'text-gray-500'}>{label}</span>
        <span className={`font-mono ${critical ? 'text-red-400' : 'text-gray-600'}`}>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${critical ? 'bg-red-500' : 'bg-gray-600'}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}

export function ProgressionTab() {
  const simChars = useSimulationStore((s) => s.characters)
  const { world, characters: storeChars } = useWorldStore()
  const characters = simChars.length > 0 ? simChars : storeChars

  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }
  if (characters.length === 0) {
    return <div className="p-6 text-gray-400">Создайте персонажей во вкладке «Персонажи».</div>
  }

  const defaultChar = characters.find((c) => c.role === 'playerCharacter') ?? characters[0]
  const char: Character = characters.find((c) => c.id === selectedId) ?? defaultChar

  const traits = BASE_TRAITS.filter((t) => char.traitIds.includes(t.id))
  const knownSkills = BASE_SKILLS.filter((s) => char.skillIds.includes(s.id))

  // Compute effective stat modifiers from traits
  const traitBonuses: Record<string, number> = {}
  for (const tr of traits) {
    for (const [k, v] of Object.entries(tr.statModifiers)) {
      traitBonuses[k] = (traitBonuses[k] ?? 0) + (v ?? 0)
    }
  }

  const needEntries: [string, string, keyof typeof char.needs][] = [
    ['Голод', 'hunger', 'hunger'],
    ['Сон', 'sleep', 'sleep'],
    ['Общение', 'social', 'social'],
    ['Здоровье', 'health', 'health'],
    ['Смысл', 'meaning', 'meaning'],
    ['Стабильность', 'stability', 'stability'],
  ]

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Header + picker */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold flex-1">Прогрессия</h2>
        {characters.length > 1 && (
          <select
            className="bg-surface-overlay text-gray-200 rounded px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-accent"
            value={char.id}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name} {c.role === 'playerCharacter' ? '★' : ''}</option>
            ))}
          </select>
        )}
      </div>

      {/* Identity card */}
      <div className="card flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-overlay flex items-center justify-center text-2xl shrink-0">
          {char.gender === 'female' ? '👩' : char.gender === 'male' ? '👨' : '🧑'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-100 text-lg">{char.name}</div>
          <div className="text-xs text-gray-500">
            {char.species}{char.speciesCustomName ? ` (${char.speciesCustomName})` : ''} ·{' '}
            {char.role === 'playerCharacter' ? 'Главный герой' : char.role === 'majorNPC' ? 'Важный NPC' : 'Фоновый NPC'}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-sm font-bold ${getMoodColor(char.mood)}`}>{getMoodLabel(char.mood)}</div>
          <div className="text-xs text-gray-500">{char.mood}/100</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card space-y-3">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Статы</div>
        {STAT_DEFINITIONS.map((def) => {
          const base = char.stats[def.key]
          const bonus = traitBonuses[def.key] ?? 0
          const total = Math.max(1, Math.min(100, base + bonus))
          return (
            <div key={def.key}>
              <StatBar
                label={`${def.label}${bonus !== 0 ? ` (${bonus > 0 ? '+' : ''}${bonus})` : ''}`}
                description={def.description}
                value={total}
                colorClass={STAT_COLOR[def.key] ?? 'bg-accent'}
              />
            </div>
          )
        })}
        {Object.keys(traitBonuses).length > 0 && (
          <div className="text-xs text-gray-600 mt-1">* модификаторы от черт применены</div>
        )}
      </div>

      {/* Needs */}
      <div className="card space-y-2">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Нужды</div>
        {needEntries.map(([label, , key]) => {
          const need = char.needs[key]
          return <NeedBar key={key} label={label} value={need.current} threshold={need.threshold} />
        })}
      </div>

      {/* Traits */}
      <div className="card">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">
          Черты ({traits.length})
        </div>
        {traits.length === 0 ? (
          <p className="text-gray-600 text-sm">Нет черт. Добавьте в редакторе персонажа.</p>
        ) : (
          <div className="space-y-2">
            {traits.map((tr) => (
              <div key={tr.id} className={`flex items-start gap-3 p-2 rounded border ${tagColor(tr.tags)}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{tr.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{tr.description}</div>
                </div>
                <div className="text-xs text-right shrink-0 font-mono">
                  {Object.entries(tr.statModifiers)
                    .map(([k, v]) => `${k.slice(0, 3)}${(v ?? 0) > 0 ? '+' : ''}${v}`)
                    .join(' ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      {(knownSkills.length > 0 || char.customSkills.length > 0) && (
        <div className="card">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">
            Навыки ({knownSkills.length + char.customSkills.length})
          </div>
          <div className="space-y-1">
            {knownSkills.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-300 flex-1">{s.name}</span>
                <span className="text-xs text-gray-600">{s.parentStat.slice(0, 3)}</span>
                <span className="w-2 h-2 rounded-full bg-accent/60 shrink-0" />
              </div>
            ))}
            {char.customSkills.map((s) => (
              <div key={s.id} className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-300 flex-1">{s.name}</span>
                  <span className="text-xs text-gray-500 font-mono">{s.level}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${s.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals */}
      {char.activeGoals.length > 0 && (
        <div className="card">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">
            Цели ({char.activeGoals.length})
          </div>
          <div className="space-y-3">
            {char.activeGoals.map((g) => (
              <div key={g.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{g.description}</span>
                  <span className="text-xs text-gray-500 font-mono">{g.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: `${g.progress}%` }} />
                </div>
                {g.deadline && (
                  <div className="text-xs text-gray-600 mt-0.5">до {g.deadline.slice(0, 10)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden stats */}
      {Object.keys(char.hiddenStats).length > 0 && (
        <div className="card">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Скрытые параметры</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(char.hiddenStats).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-gray-500">{k}</span>
                <span className="text-gray-300 font-mono">{typeof v === 'number' ? v.toFixed(1) : v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
