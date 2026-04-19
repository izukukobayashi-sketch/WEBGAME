import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import type { Character } from '@/types'

export function MemoryTab() {
  const { world, characters } = useWorldStore()
  const [selected, setSelected] = useState<string>('')

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  const char: Character | undefined = characters.find((c) => c.id === selected)

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Память</h2>

      <div className="field">
        <label className="label">Персонаж</label>
        <select className="select" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">— выберите —</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {char && (
        <div className="space-y-4">
          <div className="card">
            <div className="section-title">Горячая (недавние сцены)</div>
            {char.memory.hot.length === 0 ? (
              <p className="text-gray-500 text-sm">Пусто</p>
            ) : (
              char.memory.hot.map((e) => (
                <div key={e.id} className="text-sm text-gray-300 mb-2">{e.description}</div>
              ))
            )}
          </div>

          <div className="card">
            <div className="section-title">Тёплая (последние месяцы)</div>
            {char.memory.warm.length === 0 ? (
              <p className="text-gray-500 text-sm">Пусто</p>
            ) : (
              char.memory.warm.map((s, i) => (
                <div key={i} className="text-sm text-gray-300 mb-2">{s.summary}</div>
              ))
            )}
          </div>

          <div className="card">
            <div className="section-title">Холодная (давнее прошлое)</div>
            {char.memory.cold.length === 0 ? (
              <p className="text-gray-500 text-sm">Пусто</p>
            ) : (
              char.memory.cold.map((s, i) => (
                <div key={i} className="text-sm text-gray-300 mb-2">{s.summary}</div>
              ))
            )}
          </div>

          {char.previousLife && (
            <div className="card border-accent/30">
              <div className="section-title">Прошлая жизнь</div>
              <div className="text-sm text-gray-300">{char.previousLife.name}</div>
              <div className="text-xs text-gray-500">{char.previousLife.summary}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
