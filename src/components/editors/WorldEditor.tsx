import { useState, type ReactNode } from 'react'
import type { World, WorldGenre } from '@/types'

interface Props {
  world: World
  onSave: (w: World) => Promise<void>
  toolbar?: ReactNode
}

const GENRES: { value: WorldGenre; label: string }[] = [
  { value: 'modern', label: 'Современность' },
  { value: 'magical-realism', label: 'Магический реализм' },
  { value: 'fantasy', label: 'Фэнтези' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'historical', label: 'Историческое' },
  { value: 'post-apocalypse', label: 'Постапокалипсис' },
  { value: 'custom', label: 'Кастомный' },
]

const AI_PROVIDERS = [
  { value: 'claude', label: 'Anthropic Claude' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'ollama', label: 'Ollama (локальный)' },
  { value: 'none', label: 'Без ИИ' },
]

const CLAUDE_MODELS = [
  { value: 'claude-opus-4-7', label: 'Claude Opus 4 (максимум качества)' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4 (рекомендуется)' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4 (быстрый/дешёвый)' },
]

export function WorldEditor({ world, onSave, toolbar }: Props) {
  const [draft, setDraft] = useState<World>(world)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof World>(key: K, value: World[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const setSetting = <K extends keyof World['settings']>(key: K, value: World['settings'][K]) =>
    setDraft((d) => ({ ...d, settings: { ...d.settings, [key]: value } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(draft)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      {toolbar && <div className="mb-4">{toolbar}</div>}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{draft.name}</h2>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>

      {/* Basic */}
      <div className="section-title">Основное</div>
      <div className="field">
        <label className="label">Название мира</label>
        <input className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label className="label">Жанр</label>
          <select className="select" value={draft.settings.genre} onChange={(e) => setSetting('genre', e.target.value as WorldGenre)}>
            {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Начальный год</label>
          <input className="input" type="number" value={draft.settings.startYear}
            onChange={(e) => setSetting('startYear', Number(e.target.value))} />
        </div>
      </div>
      <div className="field">
        <label className="label">Эпоха / сеттинг</label>
        <input className="input" placeholder="Например: Современный мегаполис" value={draft.settings.epoch}
          onChange={(e) => setSetting('epoch', e.target.value)} />
      </div>
      <div className="field">
        <label className="label">Описание мира</label>
        <textarea className="textarea" placeholder="Краткое описание…" value={draft.settings.description}
          onChange={(e) => setSetting('description', e.target.value)} />
      </div>
      <div className="field">
        <label className="label">Правила мира (реинкарнация, магия и т.д.)</label>
        <textarea className="textarea" placeholder="Особые правила…" value={draft.settings.rules}
          onChange={(e) => setSetting('rules', e.target.value)} />
      </div>

      {/* Rules */}
      <div className="section-title">Правила симуляции</div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={draft.settings.reincarnationEnabled}
            onChange={(e) => setSetting('reincarnationEnabled', e.target.checked)}
            className="rounded" />
          <span className="text-sm text-gray-300">Реинкарнация</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={draft.settings.magicEnabled}
            onChange={(e) => setSetting('magicEnabled', e.target.checked)}
            className="rounded" />
          <span className="text-sm text-gray-300">Магия</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={draft.settings.anthropomorphsEnabled}
            onChange={(e) => setSetting('anthropomorphsEnabled', e.target.checked)}
            className="rounded" />
          <span className="text-sm text-gray-300">Антропоморфы</span>
        </label>
      </div>
      <div className="field mt-4">
        <label className="label">Уровень ксенофобии в обществе: {draft.settings.xenophobiaLevel}</label>
        <input type="range" min={0} max={100} value={draft.settings.xenophobiaLevel}
          onChange={(e) => setSetting('xenophobiaLevel', Number(e.target.value))}
          className="w-full accent-accent" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Полное принятие</span><span>Жёсткая ксенофобия</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="section-title">Время</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label className="label">Текущая дата</label>
          <input className="input" type="date" value={draft.timeline.currentDate}
            onChange={(e) => setDraft((d) => ({ ...d, timeline: { ...d.timeline, currentDate: e.target.value } }))} />
        </div>
        <div className="field">
          <label className="label">Размер тика</label>
          <select className="select" value={draft.settings.tickSize}
            onChange={(e) => setSetting('tickSize', e.target.value as World['settings']['tickSize'])}>
            <option value="minute">Минута</option>
            <option value="hour">Час</option>
            <option value="day">День</option>
            <option value="week">Неделя</option>
          </select>
        </div>
      </div>

      {/* AI */}
      <div className="section-title">Настройки ИИ</div>
      <div className="field">
        <label className="label">Провайдер</label>
        <select className="select" value={draft.settings.aiProvider}
          onChange={(e) => setSetting('aiProvider', e.target.value as World['settings']['aiProvider'])}>
          {AI_PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      {draft.settings.aiProvider === 'claude' && (
        <div className="field">
          <label className="label">Модель Claude</label>
          <select className="select" value={draft.settings.aiModel}
            onChange={(e) => setSetting('aiModel', e.target.value)}>
            {CLAUDE_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      )}
      {draft.settings.aiProvider !== 'none' && (
        <>
          <div className="field">
            <label className="label">API-ключ</label>
            <input className="input" type="password" placeholder="sk-…"
              value={draft.settings.aiApiKey}
              onChange={(e) => setSetting('aiApiKey', e.target.value)} />
            <p className="text-xs text-gray-500 mt-1">Хранится только в браузере, не отправляется на сервер.</p>
          </div>
          <div className="field">
            <label className="label">Лимит токенов в день</label>
            <input className="input" type="number" min={0} value={draft.settings.dailyTokenLimit}
              onChange={(e) => setSetting('dailyTokenLimit', Number(e.target.value))} />
          </div>
        </>
      )}

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Сохранение…' : 'Сохранить мир'}
        </button>
      </div>
    </div>
  )
}
