import { useState } from 'react'
import { useSimulationStore } from '@/store/simulationStore'
import { useWorldStore } from '@/store/worldStore'
import type { Item, ItemCategory, Character } from '@/types'

// ── Constants ────────────────────────────────────────────────────────────────

const CAT_LABEL: Record<ItemCategory, string> = {
  money: '💰 Деньги', object: '📦 Предметы', document: '📄 Документы',
  weapon: '⚔️ Оружие', clothing: '👗 Одежда', relic: '🏺 Реликвии',
  digital: '💾 Цифровое', other: '🗃 Прочее',
}

const CATEGORIES = Object.keys(CAT_LABEL) as ItemCategory[]

// ── Item Form ────────────────────────────────────────────────────────────────

function ItemForm({ onAdd }: { onAdd: (item: Item) => void }) {
  const [name, setName] = useState('')
  const [cat, setCat] = useState<ItemCategory>('object')
  const [qty, setQty] = useState(1)
  const [desc, setDesc] = useState('')
  const [value, setValue] = useState(0)
  const [key, setKey] = useState(false)

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({ id: crypto.randomUUID(), name: name.trim(), category: cat, quantity: qty, description: desc, value, isKeyItem: key })
    setName(''); setDesc(''); setQty(1); setValue(0); setKey(false)
  }

  return (
    <div className="card space-y-3">
      <div className="text-xs uppercase tracking-widest text-gray-500">Добавить предмет</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input
            className="input w-full" placeholder="Название"
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value as ItemCategory)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
        </select>
        <input type="number" min={1} className="input" placeholder="Кол-во"
          value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
        <input type="number" min={0} className="input" placeholder="Стоимость"
          value={value} onChange={(e) => setValue(Math.max(0, Number(e.target.value)))} />
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={key} onChange={(e) => setKey(e.target.checked)}
            className="w-4 h-4 accent-accent" />
          Ключевой предмет
        </label>
        <div className="col-span-2">
          <input className="input w-full" placeholder="Описание (необязательно)"
            value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleAdd} disabled={!name.trim()} className="btn-primary disabled:opacity-50">
          + Добавить
        </button>
      </div>
    </div>
  )
}

// ── Main Tab ─────────────────────────────────────────────────────────────────

export function InventoryTab() {
  const simChars = useSimulationStore((s) => s.characters)
  const { world, characters: storeChars, updateCharacter } = useWorldStore()

  const allChars = simChars.length > 0 ? simChars : storeChars
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState<ItemCategory | 'all'>('all')
  const [localItems, setLocalItems] = useState<Record<string, Item[]>>({})

  if (!world) return <div className="p-6 text-gray-400">Сначала откройте мир.</div>
  if (allChars.length === 0) return <div className="p-6 text-gray-400">Создайте персонажей.</div>

  const char: Character = allChars.find((c) => c.id === selectedId) ?? allChars[0]
  const storedItems = char.items ?? []
  const extraItems = localItems[char.id] ?? []
  const items = [...storedItems, ...extraItems]

  const filtered = filterCat === 'all' ? items : items.filter((i) => i.category === filterCat)
  const keyItems = items.filter((i) => i.isKeyItem)
  const totalValue = items.reduce((s, i) => s + i.value * i.quantity, 0)

  const handleAdd = (item: Item) => {
    setLocalItems((prev) => ({ ...prev, [char.id]: [...(prev[char.id] ?? []), item] }))
  }

  const handleRemove = (itemId: string) => {
    setLocalItems((prev) => ({
      ...prev,
      [char.id]: (prev[char.id] ?? []).filter((i) => i.id !== itemId),
    }))
  }

  const handleSave = async () => {
    const merged = [...storedItems, ...extraItems]
    await updateCharacter({ ...char, items: merged })
    setLocalItems((prev) => ({ ...prev, [char.id]: [] }))
  }

  const hasUnsaved = extraItems.length > 0

  // Group displayed items by category
  const byCat = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    ;(acc[item.category] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold flex-1">Инвентарь</h2>
        {allChars.length > 1 && (
          <select className="bg-surface-overlay text-gray-200 rounded px-3 py-1.5 text-sm border border-gray-700"
            value={char.id} onChange={(e) => setSelectedId(e.target.value)}>
            {allChars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-2">
          <div className="text-xl font-bold text-gray-100">{items.length}</div>
          <div className="text-xs text-gray-500">предметов</div>
        </div>
        <div className="card text-center py-2">
          <div className="text-xl font-bold text-yellow-400">{keyItems.length}</div>
          <div className="text-xs text-gray-500">ключевых</div>
        </div>
        <div className="card text-center py-2">
          <div className="text-xl font-bold text-green-400">{totalValue.toLocaleString('ru')}</div>
          <div className="text-xs text-gray-500">стоимость</div>
        </div>
      </div>

      {/* Key items */}
      {keyItems.length > 0 && (
        <div className="card border-accent/30 space-y-2">
          <div className="text-xs uppercase tracking-widest text-accent/70">Ключевые предметы</div>
          {keyItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <span className="text-lg shrink-0">{item.category === 'relic' ? '🏺' : item.category === 'document' ? '📄' : '⭐'}</span>
              <div className="flex-1">
                <span className="font-medium text-accent">{item.name}</span>
                {item.description && <span className="text-gray-500 ml-2 text-xs">{item.description}</span>}
              </div>
              <span className="text-xs text-gray-600 shrink-0">×{item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setFilterCat('all')}
          className={`px-3 py-1 rounded text-xs transition-colors ${filterCat === 'all' ? 'bg-accent text-white' : 'bg-surface-overlay text-gray-400 hover:bg-gray-700'}`}>
          Все
        </button>
        {CATEGORIES.filter((c) => items.some((i) => i.category === c)).map((c) => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded text-xs transition-colors ${filterCat === c ? 'bg-accent text-white' : 'bg-surface-overlay text-gray-400 hover:bg-gray-700'}`}>
            {CAT_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Item list by category */}
      {Object.keys(byCat).length === 0 ? (
        <p className="text-gray-500 text-sm">Предметов нет. Добавьте через форму ниже.</p>
      ) : (
        Object.entries(byCat).map(([cat, catItems]) => (
          <div key={cat} className="card space-y-2">
            <div className="text-xs text-gray-500 font-medium">{CAT_LABEL[cat as ItemCategory] ?? cat}</div>
            {catItems.map((item) => {
              const isExtra = extraItems.some((e) => e.id === item.id)
              return (
                <div key={item.id} className={`flex items-center gap-3 text-sm py-1 border-b border-gray-800/40 last:border-0 ${isExtra ? 'opacity-75' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-200 font-medium">{item.name}</span>
                    {item.description && <span className="text-gray-600 text-xs ml-2">{item.description}</span>}
                    {isExtra && <span className="text-xs text-yellow-600 ml-1">(не сохранено)</span>}
                  </div>
                  <span className="text-gray-500 text-xs shrink-0">×{item.quantity}</span>
                  {item.value > 0 && <span className="text-green-600 text-xs shrink-0 font-mono">{item.value}</span>}
                  {isExtra && (
                    <button onClick={() => handleRemove(item.id)} className="text-gray-600 hover:text-red-400 text-xs shrink-0">✕</button>
                  )}
                </div>
              )
            })}
          </div>
        ))
      )}

      {/* Add item form */}
      <ItemForm onAdd={handleAdd} />

      {/* Save button */}
      {hasUnsaved && (
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary">Сохранить инвентарь</button>
          <span className="text-xs text-gray-500">{extraItems.length} несохранённых предметов</span>
        </div>
      )}
    </div>
  )
}
