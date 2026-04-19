import { useState } from 'react'
import type { Location, LocationType } from '@/types'

interface Props {
  location: Location
  onSave: (l: Location) => Promise<void>
}

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'country', label: 'Страна' },
  { value: 'region', label: 'Регион' },
  { value: 'city', label: 'Город' },
  { value: 'town', label: 'Посёлок' },
  { value: 'village', label: 'Деревня' },
  { value: 'building', label: 'Здание' },
  { value: 'room', label: 'Комната' },
  { value: 'dungeon', label: 'Подземелье' },
  { value: 'wilderness', label: 'Дикая природа' },
  { value: 'custom', label: 'Кастомная' },
]

export function LocationEditor({ location, onSave }: Props) {
  const [draft, setDraft] = useState<Location>(location)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof Location>(key: K, val: Location[K]) =>
    setDraft((d) => ({ ...d, [key]: val }))

  const setAtm = (key: keyof Location['atmosphere'], val: number) =>
    setDraft((d) => ({ ...d, atmosphere: { ...d.atmosphere, [key]: val } }))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(draft) } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="section-title">Основное</div>
      <div className="field">
        <label className="label">Название</label>
        <input className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div className="field">
        <label className="label">Тип</label>
        <select className="select" value={draft.type} onChange={(e) => set('type', e.target.value as LocationType)}>
          {LOCATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label className="label">Описание</label>
        <textarea className="textarea" value={draft.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="section-title">Координаты на карте</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label className="label">X</label>
          <input className="input" type="number" value={draft.coordinates.x}
            onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, x: Number(e.target.value) } }))} />
        </div>
        <div className="field">
          <label className="label">Y</label>
          <input className="input" type="number" value={draft.coordinates.y}
            onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, y: Number(e.target.value) } }))} />
        </div>
      </div>

      <div className="section-title">Атмосфера</div>
      {(['beauty', 'safety', 'prosperity', 'magic'] as const).map((key) => {
        const labels = { beauty: 'Красота', safety: 'Безопасность', prosperity: 'Процветание', magic: 'Магия' }
        return (
          <div key={key} className="flex items-center gap-3 mb-3">
            <div className="w-36 text-sm text-gray-300 shrink-0">{labels[key]}: {draft.atmosphere[key]}</div>
            <input type="range" min={0} max={100} value={draft.atmosphere[key]}
              onChange={(e) => setAtm(key, Number(e.target.value))}
              className="flex-1 accent-accent" />
          </div>
        )
      })}
      <div className="field">
        <label className="label">Население</label>
        <input className="input" type="number" min={0} value={draft.atmosphere.population}
          onChange={(e) => setAtm('population', Number(e.target.value))} />
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Сохранение…' : 'Сохранить локацию'}
        </button>
      </div>
    </div>
  )
}
