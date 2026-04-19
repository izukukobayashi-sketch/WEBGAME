import { useEffect, useRef } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useSimulationStore } from '@/store/simulationStore'
import { getMoodLabel, getMoodColor } from '@/engine/simulation/MoodSystem'
import { formatDate } from '@/engine/procedural/MorphologyHelper'
import { ClaudeProvider } from '@/engine/ai'
import type { SimSpeed } from '@/engine/simulation/Ticker'
import type { SimEvent } from '@/engine/simulation/EventSystem'
import type { Character } from '@/types'

const SPEEDS: { value: SimSpeed; label: string }[] = [
  { value: 1, label: '1×' },
  { value: 5, label: '5×' },
  { value: 10, label: '10×' },
  { value: 50, label: '50×' },
]

export function IdleTab() {
  const { world: storeWorld, characters: storeChars } = useWorldStore()
  const sim = useSimulationStore()
  const logRef = useRef<HTMLDivElement>(null)
  const simWorld = sim.world
  const simChars = sim.characters

  // Init simulation when world changes or sim is empty
  useEffect(() => {
    if (storeWorld && !simWorld) {
      sim.init(storeWorld, storeChars)
      if (storeWorld.settings.aiProvider === 'claude' && storeWorld.settings.aiApiKey) {
        sim.setAiProvider(new ClaudeProvider(storeWorld.settings.aiApiKey))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeWorld, simWorld])

  // Auto-scroll to top of log (newest first)
  const prevLen = useRef(0)
  useEffect(() => {
    if (sim.eventLog.length !== prevLen.current) {
      prevLen.current = sim.eventLog.length
      if (logRef.current) logRef.current.scrollTop = 0
    }
  })

  if (!storeWorld) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }
  if (storeChars.length === 0) {
    return (
      <div className="p-6 text-gray-400">
        Создайте хотя бы одного персонажа во вкладке «Персонажи», чтобы запустить симуляцию.
      </div>
    )
  }

  const world = simWorld ?? storeWorld
  const characters = simChars.length > 0 ? simChars : storeChars

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Control bar ── */}
      <div className="shrink-0 border-b border-gray-800 px-4 py-3 bg-surface flex flex-wrap items-center gap-4">
        <StatChip label="Дата мира" value={formatDate(world.timeline.currentDate)} mono />
        <StatChip label="Тиков" value={sim.totalTicks.toLocaleString()} mono />
        <StatChip label="В логе" value={sim.eventLog.length.toString()} mono />

        <div className="flex-1" />

        {/* Speed buttons */}
        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              onClick={() => sim.setSpeed(s.value)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                sim.speed === s.value
                  ? 'bg-accent text-white'
                  : 'bg-surface-overlay text-gray-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Step + Play/Pause */}
        <button
          onClick={() => sim.step()}
          disabled={sim.isRunning}
          className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
        >
          ⏭ Шаг
        </button>
        <button
          onClick={() => (sim.isRunning ? sim.pause() : sim.start())}
          className={`px-5 py-1.5 rounded text-sm font-bold transition-colors ${
            sim.isRunning
              ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
              : 'bg-green-700 hover:bg-green-600 text-white'
          }`}
        >
          {sim.isRunning ? '⏸ Пауза' : '▶ Запуск'}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Characters sidebar */}
        <div className="w-56 shrink-0 border-r border-gray-800 overflow-y-auto p-3 space-y-3">
          <div className="text-xs uppercase tracking-widest text-gray-500">Персонажи</div>
          {characters.map((c) => <CharacterCard key={c.id} char={c} />)}
        </div>

        {/* Event feed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="shrink-0 px-4 pt-3 pb-1 text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
            Лента событий
            {sim.isRunning && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </div>
          <div ref={logRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {sim.eventLog.length === 0
              ? <EmptyState running={sim.isRunning} />
              : sim.eventLog.map((ev) => <EventCard key={ev.id} event={ev} />)
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatChip({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-sm text-gray-200 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

function CharacterCard({ char }: { char: Character }) {
  const moodColor = getMoodColor(char.mood)
  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-start justify-between gap-1">
        <div className="font-semibold text-sm text-gray-200 truncate">{char.name}</div>
        <span className="text-xs text-gray-500 shrink-0">{getMoodLabel(char.mood)}</span>
      </div>

      <MiniBar label="Настроение" value={char.mood} color={moodColor} />
      <MiniBar
        label="Голод"
        value={char.needs.hunger.current}
        color={char.needs.hunger.current < char.needs.hunger.threshold ? 'bg-red-500' : 'bg-blue-500'}
      />
      <MiniBar
        label="Сон"
        value={char.needs.sleep.current}
        color={char.needs.sleep.current < char.needs.sleep.threshold ? 'bg-red-500' : 'bg-indigo-500'}
      />
      <MiniBar
        label="Общение"
        value={char.needs.social.current}
        color={char.needs.social.current < char.needs.social.threshold ? 'bg-red-500' : 'bg-teal-500'}
      />
    </div>
  )
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
        <span>{label}</span><span>{Math.round(value)}</span>
      </div>
      <div className="stat-bar">
        <div className={`stat-bar-fill ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

const EV_BORDER: Record<SimEvent['type'], string> = {
  thought: 'border-purple-800/50',
  action: 'border-gray-700',
  need: 'border-red-800/50',
  mood: 'border-yellow-800/50',
  social: 'border-blue-700/50',
  milestone: 'border-accent/50',
  world: 'border-green-800/50',
  idle: 'border-gray-800/40',
}

function EventCard({ event }: { event: SimEvent }) {
  return (
    <div className={`flex gap-3 p-3 rounded-lg bg-surface-raised border ${EV_BORDER[event.type]} text-sm`}>
      <span className="text-base shrink-0 leading-5">{event.icon}</span>
      <div className="flex-1 min-w-0">
        {event.characterName && (
          <span className="text-accent font-semibold mr-1">{event.characterName}.</span>
        )}
        <span className="text-gray-300">{event.text}</span>
        <div className="text-xs text-gray-600 mt-0.5">{formatDate(event.worldDate)}</div>
      </div>
    </div>
  )
}

function EmptyState({ running }: { running: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
      <div className="text-5xl mb-4">{running ? '⏳' : '▶️'}</div>
      <p className="text-sm">{running ? 'Симуляция запущена…' : 'Нажмите «Запуск» чтобы начать.'}</p>
      <p className="text-xs mt-2 text-gray-600">События появятся здесь по мере их возникновения</p>
    </div>
  )
}
