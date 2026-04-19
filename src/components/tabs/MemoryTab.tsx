import { useState } from 'react'
import { useSimulationStore } from '@/store/simulationStore'
import { useWorldStore } from '@/store/worldStore'
import { generateReflection } from '@/engine/ai/ChapterBuilder'
import { formatDate } from '@/engine/procedural/MorphologyHelper'
import type { Character, Reflection } from '@/types'

function weightColor(w: number): string {
  if (w >= 8) return 'text-yellow-400'
  if (w >= 4) return 'text-blue-400'
  if (w <= -6) return 'text-red-400'
  if (w <= -2) return 'text-orange-400'
  return 'text-gray-500'
}

function weightIcon(w: number): string {
  if (w >= 8) return '⭐'
  if (w >= 4) return '💙'
  if (w <= -6) return '💔'
  if (w <= -2) return '😟'
  return '•'
}

export function MemoryTab() {
  const simChars = useSimulationStore((s) => s.characters)
  const simWorld = useSimulationStore((s) => s.world)
  const aiProvider = useSimulationStore((s) => s.aiProvider)
  const { world: storeWorld, characters: storeChars } = useWorldStore()

  const world = simWorld ?? storeWorld
  const characters = simChars.length > 0 ? simChars : storeChars

  const [selectedId, setSelectedId] = useState<string>('')
  const [reflections, setReflections] = useState<Record<string, Reflection[]>>({})
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  const char: Character | undefined = characters.find((c) => c.id === selectedId) ?? characters[0]
  const charReflections = char ? (reflections[char.id] ?? []) : []

  const handleGenerateReflection = async () => {
    if (!aiProvider || !world || !char) return
    setGenerating(true)
    setGenError(null)
    try {
      const text = await generateReflection(char, char.memory.hot, world, aiProvider)
      const ref: Reflection = {
        id: crypto.randomUUID(),
        createdAt: world.timeline.currentDate,
        content: text,
        relatedEvents: char.memory.hot.slice(0, 5).map((e) => e.id),
      }
      setReflections((prev) => ({
        ...prev,
        [char.id]: [ref, ...(prev[char.id] ?? [])],
      }))
    } catch (e) {
      setGenError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Header + picker */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold flex-1">Память</h2>
        <select
          className="bg-surface-overlay text-gray-200 rounded px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-accent"
          value={char?.id ?? ''}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!char && <p className="text-gray-400 text-sm">Создайте персонажей.</p>}

      {char && (
        <>
          {/* Memory stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Горячая', char.memory.hot.length, '🔥'],
              ['Тёплая', char.memory.warm.length, '🌡'],
              ['Холодная', char.memory.cold.length, '❄️'],
            ].map(([label, count, icon]) => (
              <div key={label as string} className="card text-center py-3">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xl font-bold text-gray-100">{count}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* AI reflection */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-gray-500">Рефлексии ({charReflections.length})</div>
              <button
                onClick={handleGenerateReflection}
                disabled={generating || !aiProvider || char.memory.hot.length === 0}
                className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
              >
                {generating ? '⏳ Думает…' : '🪞 Сгенерировать рефлексию'}
              </button>
            </div>

            {!aiProvider && (
              <p className="text-xs text-gray-600">Добавьте API-ключ Claude в редакторе мира для AI-рефлексий.</p>
            )}
            {char.memory.hot.length === 0 && aiProvider && (
              <p className="text-xs text-gray-600">Запустите симуляцию — горячая память наполнится событиями.</p>
            )}
            {genError && <p className="text-red-400 text-xs">{genError}</p>}

            {charReflections.map((r) => (
              <div key={r.id} className="border-l-2 border-accent/40 pl-3">
                <div className="text-xs text-gray-500 font-mono mb-1">{formatDate(r.createdAt)}</div>
                <div className="text-sm text-gray-300 italic leading-relaxed">{r.content}</div>
              </div>
            ))}
          </div>

          {/* Hot memory */}
          <div className="card space-y-2">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              Горячая память — последние события ({char.memory.hot.length})
            </div>
            {char.memory.hot.length === 0 ? (
              <p className="text-gray-600 text-sm">Пусто. Запустите симуляцию.</p>
            ) : (
              [...char.memory.hot].reverse().map((e) => (
                <div key={e.id} className="flex gap-3 items-start text-sm">
                  <span className={`shrink-0 ${weightColor(e.emotionalWeight)}`}>
                    {weightIcon(e.emotionalWeight)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-300">{e.description}</div>
                    <div className="text-xs text-gray-600 font-mono">{e.timestamp.slice(0, 10)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Warm memory */}
          {char.memory.warm.length > 0 && (
            <div className="card space-y-3">
              <div className="text-xs uppercase tracking-widest text-gray-500">
                Тёплая память ({char.memory.warm.length})
              </div>
              {char.memory.warm.map((s, i) => (
                <div key={i} className="border-l-2 border-gray-700 pl-3">
                  <div className="text-xs text-gray-500 font-mono mb-1">{formatDate(s.period)}</div>
                  <div className="text-sm text-gray-400">{s.summary}</div>
                  {s.keyEvents.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {s.keyEvents.map((ev, j) => (
                        <div key={j} className="text-xs text-gray-500 pl-2 border-l border-gray-800">
                          {ev}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Cold memory */}
          {char.memory.cold.length > 0 && (
            <div className="card space-y-3">
              <div className="text-xs uppercase tracking-widest text-gray-500">
                Холодная память ({char.memory.cold.length})
              </div>
              {char.memory.cold.map((s, i) => (
                <div key={i} className="text-sm text-gray-500">
                  <span className="text-xs font-mono text-gray-600 mr-2">{s.period}</span>
                  {s.summary}
                </div>
              ))}
            </div>
          )}

          {/* Previous life */}
          {char.previousLife && (
            <div className="card border-accent/20 space-y-2">
              <div className="text-xs uppercase tracking-widest text-gray-500">Прошлая жизнь</div>
              <div className="font-medium text-gray-200">{char.previousLife.name}</div>
              <div className="text-xs text-gray-500">
                Смерть: {char.previousLife.deathDate.slice(0, 10)} · {char.previousLife.deathCause}
              </div>
              {char.previousLife.summary && (
                <div className="text-sm text-gray-400 italic">{char.previousLife.summary}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
