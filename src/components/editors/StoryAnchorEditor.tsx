import { useState } from 'react'
import type { StoryAnchor, AnchorImportance, AnchorStatus, AnchorTiming, Character } from '@/types'

interface Props {
  anchor: StoryAnchor
  characters: Character[]
  onSave: (a: StoryAnchor) => Promise<void>
}

export function StoryAnchorEditor({ anchor, characters, onSave }: Props) {
  const [draft, setDraft] = useState<StoryAnchor>(anchor)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof StoryAnchor>(key: K, val: StoryAnchor[K]) =>
    setDraft((d) => ({ ...d, [key]: val }))

  const toggleParticipant = (id: string) =>
    setDraft((d) => ({
      ...d,
      participantIds: d.participantIds.includes(id)
        ? d.participantIds.filter((p) => p !== id)
        : [...d.participantIds, id],
    }))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(draft) } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="field">
        <label className="label">Название</label>
        <input className="input" value={draft.title} onChange={(e) => set('title', e.target.value)} />
      </div>
      <div className="field">
        <label className="label">Описание</label>
        <textarea className="textarea" value={draft.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label className="label">Важность</label>
          <select className="select" value={draft.importance} onChange={(e) => set('importance', e.target.value as AnchorImportance)}>
            <option value="low">Низкая</option>
            <option value="medium">Средняя</option>
            <option value="high">Высокая</option>
            <option value="critical">Критическая</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Статус</label>
          <select className="select" value={draft.status} onChange={(e) => set('status', e.target.value as AnchorStatus)}>
            <option value="pending">Ожидает</option>
            <option value="active">Активен</option>
            <option value="completed">Завершён</option>
            <option value="skipped">Пропущен</option>
          </select>
        </div>
      </div>

      <div className="section-title">Тайминг</div>
      <div className="field">
        <label className="label">Тип тайминга</label>
        <select className="select" value={draft.timing} onChange={(e) => set('timing', e.target.value as AnchorTiming)}>
          <option value="absolute">Абсолютный (конкретная дата)</option>
          <option value="relative">Относительный (через N времени)</option>
          <option value="conditional">Условный (по условию)</option>
        </select>
      </div>
      {draft.timing === 'absolute' && (
        <div className="field">
          <label className="label">Целевая дата</label>
          <input className="input" type="date" value={draft.targetDate ?? ''}
            onChange={(e) => set('targetDate', e.target.value || undefined)} />
        </div>
      )}
      {draft.timing === 'relative' && (
        <div className="field">
          <label className="label">Возраст персонажа (лет)</label>
          <input className="input" type="number" min={0} value={draft.targetAge ?? 0}
            onChange={(e) => set('targetAge', Number(e.target.value))} />
        </div>
      )}

      <div className="section-title">Участники</div>
      {characters.length === 0 ? (
        <p className="text-gray-500 text-sm">Нет персонажей — создайте их во вкладке «Персонажи».</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {characters.map((c) => (
            <label key={c.id} className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors text-sm ${
              draft.participantIds.includes(c.id) ? 'bg-accent/20 border border-accent/40' : 'bg-surface-overlay hover:bg-gray-700'
            }`}>
              <input type="checkbox" checked={draft.participantIds.includes(c.id)}
                onChange={() => toggleParticipant(c.id)} />
              {c.name}
            </label>
          ))}
        </div>
      )}

      <div className="field mt-4">
        <label className="label">Заметки (для себя)</label>
        <textarea className="textarea" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Сохранение…' : 'Сохранить якорь'}
        </button>
      </div>
    </div>
  )
}
