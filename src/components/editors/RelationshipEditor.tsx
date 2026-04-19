import { useState } from 'react'
import type { Relationship, RelationshipStatus, Character } from '@/types'

interface Props {
  relationship: Relationship
  characters: Character[]
  onSave: (r: Relationship) => Promise<void>
}

const STATUSES: { value: RelationshipStatus; label: string }[] = [
  { value: 'stranger', label: 'Незнакомцы' },
  { value: 'acquaintance', label: 'Знакомые' },
  { value: 'friend', label: 'Друзья' },
  { value: 'close-friend', label: 'Близкие друзья' },
  { value: 'romantic', label: 'Романтический интерес' },
  { value: 'partner', label: 'Партнёры' },
  { value: 'spouse', label: 'Супруги' },
  { value: 'family', label: 'Семья' },
  { value: 'rival', label: 'Соперники' },
  { value: 'enemy', label: 'Враги' },
  { value: 'mentor', label: 'Наставник/Ученик' },
  { value: 'student', label: 'Ученик' },
]

type Dimension = 'trust' | 'attraction' | 'respect' | 'fear' | 'envy'

const DIMENSIONS: { key: Dimension; label: string; hint: string }[] = [
  { key: 'trust', label: 'Доверие', hint: '-100 недоверие · 0 нейтрально · +100 полное доверие' },
  { key: 'attraction', label: 'Влечение', hint: '-100 отвращение · 0 нейтрально · +100 сильное влечение' },
  { key: 'respect', label: 'Уважение', hint: '-100 презрение · 0 нейтрально · +100 глубокое уважение' },
  { key: 'fear', label: 'Страх', hint: '0 нет страха · +100 панический ужас' },
  { key: 'envy', label: 'Зависть', hint: '0 нет зависти · +100 жгучая зависть' },
]

export function RelationshipEditor({ relationship, characters, onSave }: Props) {
  const [draft, setDraft] = useState<Relationship>(relationship)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof Relationship>(key: K, val: Relationship[K]) =>
    setDraft((d) => ({ ...d, [key]: val }))

  const setDim = (key: Dimension, val: number) =>
    setDraft((d) => ({ ...d, [key]: Math.min(100, Math.max(-100, val)) }))

  const getName = (id: string) => characters.find((c) => c.id === id)?.name ?? id

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(draft) } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="section-title">Участники</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label className="label">От кого</label>
          <select className="select" value={draft.fromCharacterId}
            onChange={(e) => set('fromCharacterId', e.target.value)}>
            {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">К кому</label>
          <select className="select" value={draft.toCharacterId}
            onChange={(e) => set('toCharacterId', e.target.value)}>
            {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {getName(draft.fromCharacterId)} → {getName(draft.toCharacterId)} (однонаправленное)
      </p>

      <div className="field">
        <label className="label">Статус отношений</label>
        <select className="select" value={draft.status} onChange={(e) => set('status', e.target.value as RelationshipStatus)}>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="section-title">Измерения (-100 до +100)</div>
      <div className="space-y-4">
        {DIMENSIONS.map(({ key, label, hint }) => (
          <div key={key}>
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-300 shrink-0">{label}</div>
              <input type="range" min={-100} max={100} value={draft[key]}
                onChange={(e) => setDim(key, Number(e.target.value))}
                className="flex-1 accent-accent" />
              <input type="number" min={-100} max={100} value={draft[key]}
                onChange={(e) => setDim(key, Number(e.target.value))}
                className="input w-20 text-center" />
            </div>
            <p className="text-xs text-gray-600 mt-0.5 pl-28">{hint}</p>
          </div>
        ))}
      </div>

      <div className="field mt-4">
        <label className="label">Заметки</label>
        <textarea className="textarea" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Сохранение…' : 'Сохранить отношение'}
        </button>
      </div>
    </div>
  )
}
