import { useState } from 'react'
import type { Character, Species, Gender, CharacterRole } from '@/types'
import { STAT_DEFINITIONS } from '@/data/stats'
import { BASE_TRAITS } from '@/data/traits'
import { BASE_SKILLS } from '@/data/skills'

interface Props {
  character: Character
  worldId: string
  onSave: (c: Character) => Promise<void>
}

type Section = 'identity' | 'biography' | 'personality' | 'stats' | 'psychology' | 'meta'

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'identity', label: 'Идентичность' },
  { id: 'biography', label: 'Биография' },
  { id: 'personality', label: 'Личность' },
  { id: 'stats', label: 'Статы и навыки' },
  { id: 'psychology', label: 'Психология' },
  { id: 'meta', label: 'Мета' },
]

export function CharacterEditor({ character, onSave }: Props) {
  const [draft, setDraft] = useState<Character>(character)
  const [section, setSection] = useState<Section>('identity')
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof Character>(key: K, val: Character[K]) =>
    setDraft((d) => ({ ...d, [key]: val }))

  const setStat = (key: keyof Character['stats'], val: number) =>
    setDraft((d) => ({ ...d, stats: { ...d.stats, [key]: Math.min(100, Math.max(1, val)) } }))

  const toggleTrait = (id: string) => {
    setDraft((d) => ({
      ...d,
      traitIds: d.traitIds.includes(id) ? d.traitIds.filter((t) => t !== id) : [...d.traitIds, id],
    }))
  }

  const toggleSkill = (id: string) => {
    setDraft((d) => ({
      ...d,
      skillIds: d.skillIds.includes(id) ? d.skillIds.filter((s) => s !== id) : [...d.skillIds, id],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(draft) } finally { setSaving(false) }
  }

  const addListItem = (key: 'fears' | 'dreams' | 'secrets', value: string) => {
    if (!value.trim()) return
    setDraft((d) => ({ ...d, [key]: [...d[key], value.trim()] }))
  }

  const removeListItem = (key: 'fears' | 'dreams' | 'secrets', index: number) =>
    setDraft((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) }))

  return (
    <div>
      {/* Section nav */}
      <div className="flex gap-1 flex-wrap mb-6">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              section === s.id ? 'bg-accent text-white' : 'bg-surface-overlay text-gray-300 hover:bg-gray-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Identity */}
      {section === 'identity' && (
        <div>
          <div className="field">
            <label className="label">Имя</label>
            <input className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="label">Вид</label>
              <select className="select" value={draft.species} onChange={(e) => set('species', e.target.value as Species)}>
                <option value="human">Человек</option>
                <option value="furry">Антропоморф</option>
                <option value="elf">Эльф</option>
                <option value="custom">Кастомный</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Пол</label>
              <select className="select" value={draft.gender} onChange={(e) => set('gender', e.target.value as Gender)}>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="nonbinary">Небинарный</option>
                <option value="unknown">Неизвестно</option>
              </select>
            </div>
          </div>
          {draft.species === 'furry' && (
            <div className="field">
              <label className="label">Вид антропоморфа</label>
              <input className="input" placeholder="Снежный барс, волк, лиса…"
                value={draft.speciesCustomName} onChange={(e) => set('speciesCustomName', e.target.value)} />
            </div>
          )}
          {draft.species === 'custom' && (
            <div className="field">
              <label className="label">Название вида</label>
              <input className="input" value={draft.speciesCustomName} onChange={(e) => set('speciesCustomName', e.target.value)} />
            </div>
          )}
          <div className="field">
            <label className="label">Внешность (описание)</label>
            <textarea className="textarea" value={draft.appearance.current}
              onChange={(e) => set('appearance', { ...draft.appearance, current: e.target.value })} />
          </div>
        </div>
      )}

      {/* Biography */}
      {section === 'biography' && (
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="label">Дата рождения</label>
              <input className="input" type="date" value={draft.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Дата смерти (если применимо)</label>
              <input className="input" type="date" value={draft.deathDate ?? ''}
                onChange={(e) => set('deathDate', e.target.value || undefined)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="label">Место рождения</label>
              <input className="input" value={draft.birthplace} onChange={(e) => set('birthplace', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Национальность</label>
              <input className="input" value={draft.nationality} onChange={(e) => set('nationality', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label className="label">Культура</label>
            <input className="input" value={draft.culture} onChange={(e) => set('culture', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Биография</label>
            <textarea className="textarea min-h-[150px]" value={draft.biography} onChange={(e) => set('biography', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Мировоззрение</label>
            <textarea className="textarea" value={draft.worldview} onChange={(e) => set('worldview', e.target.value)} />
          </div>
        </div>
      )}

      {/* Personality */}
      {section === 'personality' && (
        <div>
          <div className="section-title">Черты характера</div>
          <div className="grid grid-cols-1 gap-2 mb-4 max-h-64 overflow-y-auto pr-1">
            {BASE_TRAITS.map((t) => (
              <label key={t.id} className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
                draft.traitIds.includes(t.id) ? 'bg-accent/20 border border-accent/40' : 'bg-surface-overlay hover:bg-gray-700'
              }`}>
                <input type="checkbox" checked={draft.traitIds.includes(t.id)}
                  onChange={() => toggleTrait(t.id)} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-200">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.description}</div>
                </div>
              </label>
            ))}
          </div>

          <ListEditor label="Страхи" items={draft.fears}
            onAdd={(v) => addListItem('fears', v)}
            onRemove={(i) => removeListItem('fears', i)} />
          <ListEditor label="Мечты" items={draft.dreams}
            onAdd={(v) => addListItem('dreams', v)}
            onRemove={(i) => removeListItem('dreams', i)} />
          <ListEditor label="Секреты" items={draft.secrets}
            onAdd={(v) => addListItem('secrets', v)}
            onRemove={(i) => removeListItem('secrets', i)} />
        </div>
      )}

      {/* Stats */}
      {section === 'stats' && (
        <div>
          <div className="section-title">Базовые статы (1–100)</div>
          <div className="space-y-3 mb-6">
            {STAT_DEFINITIONS.map((sd) => (
              <div key={sd.key} className="flex items-center gap-3">
                <div className="w-32 text-sm text-gray-300 shrink-0">{sd.label}</div>
                <input type="range" min={1} max={100} value={draft.stats[sd.key]}
                  onChange={(e) => setStat(sd.key, Number(e.target.value))}
                  className="flex-1 accent-accent" />
                <input type="number" min={1} max={100} value={draft.stats[sd.key]}
                  onChange={(e) => setStat(sd.key, Number(e.target.value))}
                  className="input w-16 text-center" />
              </div>
            ))}
          </div>

          <div className="section-title">Навыки</div>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
            {BASE_SKILLS.map((sk) => (
              <label key={sk.id} className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
                draft.skillIds.includes(sk.id) ? 'bg-accent/20 border border-accent/40' : 'bg-surface-overlay hover:bg-gray-700'
              }`}>
                <input type="checkbox" checked={draft.skillIds.includes(sk.id)}
                  onChange={() => toggleSkill(sk.id)} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-200">{sk.name}</div>
                  <div className="text-xs text-gray-400">{sk.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Psychology */}
      {section === 'psychology' && (
        <div>
          <div className="section-title">Настроение</div>
          <div className="field">
            <label className="label">Текущее настроение: {draft.mood}</label>
            <input type="range" min={0} max={100} value={draft.mood}
              onChange={(e) => set('mood', Number(e.target.value))}
              className="w-full accent-accent" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Отчаяние (0)</span><span>Счастье (100)</span>
            </div>
          </div>
          <div className="field">
            <label className="label">Порог срыва: {draft.mentalBreakThreshold}</label>
            <input type="range" min={0} max={50} value={draft.mentalBreakThreshold}
              onChange={(e) => set('mentalBreakThreshold', Number(e.target.value))}
              className="w-full accent-accent" />
            <p className="text-xs text-gray-500 mt-1">Если настроение упадёт ниже этого — срыв</p>
          </div>

          <div className="section-title">Расписание</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="label">Подъём</label>
              <input className="input" type="time" value={draft.schedule.wakeTime}
                onChange={(e) => set('schedule', { ...draft.schedule, wakeTime: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Отбой</label>
              <input className="input" type="time" value={draft.schedule.sleepTime}
                onChange={(e) => set('schedule', { ...draft.schedule, sleepTime: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label className="label">Обычный день (описание)</label>
            <textarea className="textarea" value={draft.schedule.dailyRoutine}
              onChange={(e) => set('schedule', { ...draft.schedule, dailyRoutine: e.target.value })} />
          </div>
        </div>
      )}

      {/* Meta */}
      {section === 'meta' && (
        <div>
          <div className="field">
            <label className="label">Роль</label>
            <select className="select" value={draft.role} onChange={(e) => set('role', e.target.value as CharacterRole)}>
              <option value="playerCharacter">Главный герой</option>
              <option value="majorNPC">Важный NPC</option>
              <option value="backgroundNPC">Фоновый NPC</option>
            </select>
          </div>

          <div className="section-title">Система (для персонажей с RPG-системой)</div>
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input type="checkbox" checked={draft.hasSystem}
              onChange={(e) => set('hasSystem', e.target.checked)} />
            <span className="text-sm text-gray-300">Есть Система</span>
          </label>
          {draft.hasSystem && (
            <div className="field">
              <label className="label">Тон Системы</label>
              <select className="select" value={draft.systemTone ?? 'cold'}
                onChange={(e) => set('systemTone', e.target.value as Character['systemTone'])}>
                <option value="cold">Холодный</option>
                <option value="ironic">Ироничный</option>
                <option value="caring">Заботливый</option>
                <option value="formal">Формальный</option>
              </select>
            </div>
          )}

          <div className="section-title">Прошлая жизнь</div>
          <div className="field">
            <label className="label">Имя в прошлой жизни</label>
            <input className="input" value={draft.previousLife?.name ?? ''}
              onChange={(e) => set('previousLife', e.target.value
                ? { ...draft.previousLife, name: e.target.value, deathDate: draft.previousLife?.deathDate ?? '', deathCause: draft.previousLife?.deathCause ?? '', summary: draft.previousLife?.summary ?? '', keyMemories: draft.previousLife?.keyMemories ?? [] }
                : undefined
              )}
            />
          </div>
          {draft.previousLife && (
            <>
              <div className="field">
                <label className="label">Причина смерти</label>
                <input className="input" value={draft.previousLife.deathCause}
                  onChange={(e) => set('previousLife', { ...draft.previousLife!, deathCause: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Краткое описание прошлой жизни</label>
                <textarea className="textarea" value={draft.previousLife.summary}
                  onChange={(e) => set('previousLife', { ...draft.previousLife!, summary: e.target.value })} />
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Сохранение…' : 'Сохранить персонажа'}
        </button>
      </div>
    </div>
  )
}

// ── Helper ───────────────────────────────────────────────────────────────────

interface ListEditorProps {
  label: string
  items: string[]
  onAdd: (v: string) => void
  onRemove: (i: number) => void
}

function ListEditor({ label, items, onAdd, onRemove }: ListEditorProps) {
  const [value, setValue] = useState('')
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="flex gap-2 mb-2">
        <input className="input flex-1" value={value} placeholder="Добавить…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(value); setValue('') } }} />
        <button className="btn-secondary shrink-0" onClick={() => { onAdd(value); setValue('') }}>+</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="tag">
            {item}
            <button onClick={() => onRemove(i)} className="ml-1 text-gray-500 hover:text-red-400">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}
