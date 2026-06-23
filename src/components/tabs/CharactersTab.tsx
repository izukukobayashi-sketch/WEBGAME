import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useUIStore } from '@/store/uiStore'
import { CharacterEditor } from '@/components/editors/CharacterEditor'
import { createDefaultCharacter, type Character } from '@/types'

export function CharactersTab() {
  const { world, characters, createCharacter, updateCharacter, deleteCharacter } = useWorldStore()
  const showNotification = useUIStore((s) => s.showNotification)
  const [editing, setEditing] = useState<Character | null>(null)

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  if (editing) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(null)} className="btn-ghost text-sm">← Назад</button>
          <h2 className="text-lg font-semibold">{editing.name === 'Новый персонаж' ? 'Создать персонажа' : editing.name}</h2>
        </div>
        <CharacterEditor
          character={editing}
          worldId={world.id}
          onSave={async (c) => {
            const isNew = !characters.find((x) => x.id === c.id)
            if (isNew) await createCharacter(c)
            else await updateCharacter(c)
            showNotification('Персонаж сохранён', 'success')
            setEditing(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Персонажи</h2>
        <button onClick={() => setEditing(createDefaultCharacter(world.id, { role: 'majorNPC' }))} className="btn-primary">
          + Новый персонаж
        </button>
      </div>

      {characters.length === 0 && (
        <p className="text-gray-400 text-sm">Персонажей пока нет.</p>
      )}

      <div className="space-y-3">
        {characters.map((c) => (
          <div key={c.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-400">
                {c.species} · {c.gender} · {c.role} · настроение {c.mood}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="btn-secondary text-xs">Редактировать</button>
              <button
                onClick={async () => {
                  if (!confirm(`Удалить ${c.name}?`)) return
                  await deleteCharacter(c.id)
                  showNotification('Персонаж удалён', 'info')
                }}
                className="btn-danger text-xs"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
