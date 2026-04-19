import { useState } from 'react'
import { useSimulationStore } from '@/store/simulationStore'
import { useWorldStore } from '@/store/worldStore'
import type { Character } from '@/types'

// ── Quest generation ──────────────────────────────────────────────────────────

interface SystemQuest {
  id: string; title: string; description: string; reward: string
  priority: 'low' | 'normal' | 'urgent'
}

function generateQuests(char: Character): SystemQuest[] {
  const q: SystemQuest[] = []
  if (char.needs.hunger.current < char.needs.hunger.threshold)
    q.push({ id: 'hunger', title: 'Восполни питание', description: 'Уровень голода критически низкий. Найди еду.', reward: '+15 к сытости, +5 настроение', priority: 'urgent' })
  if (char.needs.sleep.current < char.needs.sleep.threshold)
    q.push({ id: 'sleep', title: 'Найди место для отдыха', description: 'Усталость накапливается. Хозяину необходим сон.', reward: '+20 к сну, восстановление воли', priority: 'urgent' })
  if (char.needs.social.current < char.needs.social.threshold)
    q.push({ id: 'social', title: 'Социальное взаимодействие', description: 'Изоляция вредит психике. Побеседуй с кем-нибудь.', reward: '+20 к общению, +3 настроение', priority: 'normal' })
  if (char.mood < 30)
    q.push({ id: 'mood', title: 'Стабилизация психики', description: 'Эмоциональное состояние ниже порога. Требуется вмешательство.', reward: 'Предотвращение срыва', priority: 'urgent' })
  if (char.needs.meaning.current < char.needs.meaning.threshold)
    q.push({ id: 'meaning', title: 'Найди смысл', description: 'Ощущение бессмысленности нарастает. Поставь цель.', reward: '+15 к смыслу, рост воли', priority: 'normal' })
  if (char.activeGoals.length === 0)
    q.push({ id: 'goals', title: 'Определи цели', description: 'Хозяин без ориентиров — корабль без курса.', reward: 'Разблокировка прогрессии', priority: 'low' })
  if (q.length === 0)
    q.push({ id: 'idle', title: 'Продолжай в том же духе', description: 'Все показатели в норме. Система наблюдает.', reward: 'Пассивный рост характеристик', priority: 'low' })
  return q
}

const PRIORITY_STYLE: Record<string, string> = {
  urgent: 'border-red-700/60 bg-red-950/20',
  normal: 'border-yellow-700/40 bg-yellow-950/10',
  low:    'border-gray-700',
}
const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500 animate-pulse', normal: 'bg-yellow-500', low: 'bg-gray-600',
}
const TONE_COLOR: Record<string, string> = {
  cold: 'text-cyan-300 border-cyan-800/40', ironic: 'text-purple-300 border-purple-800/40',
  caring: 'text-pink-300 border-pink-800/40', formal: 'text-blue-300 border-blue-800/40',
}
const TONE_LABEL: Record<string, string> = {
  cold: 'СИСТЕМА', ironic: 'СИСТЕМА [ИРОНИЧНАЯ]', caring: 'СИСТЕМА [ЗАБОТЛИВАЯ]', formal: 'СИСТЕМА [ОФИЦИАЛЬНАЯ]',
}
const TONE_DESC: Record<string, string> = {
  cold: 'бесстрастный, как компьютерный ИИ, без эмоций',
  ironic: 'слегка саркастический, наблюдает с иронией',
  caring: 'заботливый, тёплый, беспокоится о хозяине',
  formal: 'официальный, как военный отчёт',
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function SystemTab() {
  const simChars = useSimulationStore((s) => s.characters)
  const simWorld = useSimulationStore((s) => s.world)
  const simLog = useSimulationStore((s) => s.eventLog)
  const aiProvider = useSimulationStore((s) => s.aiProvider)
  const { world: storeWorld, characters: storeChars } = useWorldStore()

  const world = simWorld ?? storeWorld
  const allChars = simChars.length > 0 ? simChars : storeChars
  const systemChars = allChars.filter((c) => c.hasSystem)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, string[]>>({})
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  if (!world) return <div className="p-6 text-gray-400">Сначала откройте мир.</div>

  if (systemChars.length === 0) {
    return (
      <div className="p-6 max-w-xl">
        <h2 className="text-xl font-bold mb-4">Система</h2>
        <div className="card text-sm text-gray-400 space-y-2">
          <p>Нет персонажей с активной Системой.</p>
          <p className="text-xs text-gray-600">
            В редакторе персонажа включите «Есть Система» и выберите тон голоса.
            Система — RPG-интерфейс внутри персонажа: квесты, мониторинг, голос наставника.
          </p>
        </div>
      </div>
    )
  }

  const char = systemChars.find((c) => c.id === selectedId) ?? systemChars[0]
  const tone = char.systemTone ?? 'cold'
  const quests = generateQuests(char)
  const urgent = quests.filter((q) => q.priority === 'urgent').length
  const charMessages = messages[char.id] ?? []

  const handleGetMessage = async () => {
    if (!aiProvider || !world) return
    setGenerating(true)
    setGenError(null)
    try {
      const questLines = quests.map((q) => `[${q.priority.toUpperCase()}] ${q.title}: ${q.description}`).join('\n')
      const eventLines = simLog
        .filter((e) => e.characterId === char.id || !e.characterId)
        .slice(0, 12)
        .map((e) => `- ${e.text}`).join('\n')

      const prompt = `Ты — Система, встроенный в сознание ${char.name} ИИ-интерфейс. Тон: ${TONE_DESC[tone] ?? 'нейтральный'}.

Состояние хозяина:
- Настроение: ${char.mood}/100
- Голод: ${Math.round(char.needs.hunger.current)}, Сон: ${Math.round(char.needs.sleep.current)}, Общение: ${Math.round(char.needs.social.current)}

Активные задания:
${questLines}

Последние события:
${eventLines || '— данных нет'}

Напиши 2–4 предложения на русском в стиле своего тона. Обращайся к ${char.name} на «ты». Прокомментируй ситуацию или дай совет. Используй оформление [СИСТЕМА]: в начале.`

      const r = await aiProvider.complete([{ role: 'user', content: prompt }])
      setMessages((prev) => ({ ...prev, [char.id]: [r.text, ...(prev[char.id] ?? [])].slice(0, 8) }))
    } catch (e) {
      setGenError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  const toneStyle = TONE_COLOR[tone] ?? 'text-cyan-300 border-cyan-800/40'

  return (
    <div className="p-6 max-w-xl space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold flex-1">Система</h2>
        {systemChars.length > 1 && (
          <select className="bg-surface-overlay text-gray-200 rounded px-3 py-1.5 text-sm border border-gray-700"
            value={char.id} onChange={(e) => setSelectedId(e.target.value)}>
            {systemChars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* System banner */}
      <div className={`card border ${toneStyle} space-y-1`}>
        <div className="text-xs font-mono tracking-widest opacity-60">{TONE_LABEL[tone] ?? 'СИСТЕМА'}</div>
        <div className="font-semibold">Хозяин: {char.name}</div>
        <div className="text-xs opacity-70">
          Настроение {char.mood}/100 · {urgent > 0 ? `⚠ ${urgent} срочных заданий` : '✓ Показатели в норме'}
        </div>
      </div>

      {/* Quests */}
      <div>
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Задания Системы ({quests.length})</div>
        <div className="space-y-2">
          {quests.map((q) => (
            <div key={q.id} className={`card border ${PRIORITY_STYLE[q.priority]} space-y-1`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[q.priority]}`} />
                <span className="font-medium text-sm">{q.title}</span>
              </div>
              <p className="text-xs text-gray-400 pl-4">{q.description}</p>
              <p className="text-xs text-gray-600 pl-4">Награда: {q.reward}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monitoring bars */}
      <div className="card space-y-2">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Мониторинг параметров</div>
        {([
          ['Голод',    char.needs.hunger.current,  char.needs.hunger.threshold],
          ['Сон',      char.needs.sleep.current,   char.needs.sleep.threshold],
          ['Общение',  char.needs.social.current,  char.needs.social.threshold],
          ['Смысл',    char.needs.meaning.current, char.needs.meaning.threshold],
          ['Настроение', char.mood, 30],
        ] as [string, number, number][]).map(([label, val, thr]) => {
          const crit = val < thr
          return (
            <div key={label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className={crit ? 'text-red-400' : 'text-gray-500'}>{label}</span>
                <span className={`font-mono ${crit ? 'text-red-400' : 'text-gray-600'}`}>{Math.round(val)}</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${crit ? 'bg-red-500' : 'bg-cyan-700/60'}`}
                  style={{ width: `${Math.max(0, Math.min(100, val))}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Voice messages */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs uppercase tracking-widest text-gray-500">Голос Системы</div>
          <button onClick={handleGetMessage} disabled={generating || !aiProvider}
            className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">
            {generating ? '⏳ Обработка…' : '📡 Получить сообщение'}
          </button>
        </div>
        {!aiProvider && <p className="text-xs text-gray-600">Добавьте API-ключ Claude в редакторе мира.</p>}
        {genError && <p className="text-red-400 text-xs">{genError}</p>}
        {charMessages.length === 0 && !generating && (
          <p className="text-xs text-gray-600">Сообщений нет. Нажмите «Получить сообщение».</p>
        )}
        <div className="space-y-2">
          {charMessages.map((msg, i) => (
            <div key={i} className={`text-sm italic border-l-2 pl-3 leading-relaxed ${toneStyle}`}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
