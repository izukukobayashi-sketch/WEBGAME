import { useState } from 'react'
import { useSimulationStore } from '@/store/simulationStore'
import { useWorldStore } from '@/store/worldStore'
import { formatDate } from '@/engine/procedural/MorphologyHelper'
import { generateChapter, type NarrativeEvent } from '@/engine/ai/ChapterBuilder'
import type { SimEvent } from '@/engine/simulation/EventSystem'

type Mode = 'chronicle' | 'book'

interface Chapter {
  id: string
  worldDate: string
  eventCount: number
  text: string
}

const EV_COLOR: Record<SimEvent['type'], string> = {
  thought:   'text-purple-400',
  action:    'text-gray-300',
  need:      'text-red-400',
  mood:      'text-yellow-400',
  social:    'text-blue-400',
  milestone: 'text-accent',
  world:     'text-green-400',
  idle:      'text-gray-500',
}

export function HistoryTab() {
  const simLog = useSimulationStore((s) => s.eventLog)
  const aiProvider = useSimulationStore((s) => s.aiProvider)
  const simWorld = useSimulationStore((s) => s.world)
  const { world: storeWorld, characters } = useWorldStore()
  const world = simWorld ?? storeWorld

  const [mode, setMode] = useState<Mode>('chronicle')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const handleGenerateChapter = async () => {
    if (!aiProvider || !world) return
    setGenerating(true)
    setGenError(null)
    try {
      const events: NarrativeEvent[] = simLog.slice(0, 40).map((e) => ({
        icon: e.icon,
        text: e.text,
        characterName: e.characterName,
        worldDate: e.worldDate,
        type: e.type,
      }))
      const text = await generateChapter(events, world, characters, aiProvider)
      setChapters((prev) => [
        { id: crypto.randomUUID(), worldDate: world.timeline.currentDate, eventCount: events.length, text },
        ...prev,
      ])
    } catch (e) {
      setGenError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  // Group chronicle events by calendar day (oldest first)
  const grouped = new Map<string, SimEvent[]>()
  for (const ev of [...simLog].reverse()) {
    const day = ev.worldDate.slice(0, 10)
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(ev)
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold">История</h2>
        <div className="flex gap-1">
          {(['chronicle', 'book'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                mode === m ? 'bg-accent text-white' : 'bg-surface-overlay text-gray-300 hover:bg-gray-600'
              }`}
            >
              {m === 'chronicle' ? '📋 Хроника' : '📖 Книга'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Book mode ── */}
      {mode === 'book' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleGenerateChapter}
              disabled={generating || !aiProvider || simLog.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {generating ? '⏳ ИИ пишет…' : '✨ Сгенерировать главу'}
            </button>
            {!aiProvider && (
              <span className="text-xs text-gray-500">
                Настройте Claude API-ключ в редакторе мира
              </span>
            )}
            {simLog.length === 0 && aiProvider && (
              <span className="text-xs text-gray-500">Сначала запустите симуляцию</span>
            )}
          </div>

          {genError && <p className="text-red-400 text-sm">{genError}</p>}

          {chapters.length === 0 && !generating && (
            <div className="card text-sm text-gray-400 space-y-1">
              <p>Режим «Книга» превращает события симуляции в литературный нарратив.</p>
              <p className="text-xs text-gray-600">
                Запустите авто-симуляцию, наберите событий, затем нажмите «Сгенерировать главу».
              </p>
            </div>
          )}

          {chapters.map((ch) => (
            <div key={ch.id} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">{formatDate(ch.worldDate)}</span>
                <span className="text-xs text-gray-600">{ch.eventCount} событий</span>
              </div>
              <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{ch.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Chronicle mode ── */}
      {mode === 'chronicle' && (
        <div className="space-y-6">
          {simLog.length === 0 && (
            <p className="text-gray-400 text-sm">
              Запустите симуляцию во вкладке «Авто» — события появятся здесь в хронологическом порядке.
            </p>
          )}

          <div className="text-xs text-gray-600 font-mono">
            {world.timeline.currentDate} · тиков: {world.timeline.tickCount} · событий: {simLog.length}
          </div>

          {Array.from(grouped.entries()).map(([day, events]) => (
            <div key={day}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono sticky top-0 bg-surface py-1">
                {formatDate(day)}
              </div>
              <div className="space-y-0.5">
                {events.map((ev) => (
                  <div key={ev.id} className="flex gap-2 text-sm py-1 border-b border-gray-800/40">
                    <span className="shrink-0 w-5 text-center">{ev.icon}</span>
                    <span className={EV_COLOR[ev.type]}>
                      {ev.characterName && (
                        <span className="text-accent font-medium mr-1">{ev.characterName}.</span>
                      )}
                      {ev.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
