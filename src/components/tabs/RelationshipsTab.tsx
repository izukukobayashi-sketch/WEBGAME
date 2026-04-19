import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useUIStore } from '@/store/uiStore'
import { RelationshipEditor } from '@/components/editors/RelationshipEditor'
import { createDefaultRelationship, type Relationship } from '@/types'

export function RelationshipsTab() {
  const { world, characters, relationships, createRelationship, updateRelationship, deleteRelationship } = useWorldStore()
  const showNotification = useUIStore((s) => s.showNotification)
  const [editing, setEditing] = useState<Relationship | null>(null)

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  const getName = (id: string) => characters.find((c) => c.id === id)?.name ?? id

  if (editing) {
    return (
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(null)} className="btn-ghost text-sm">← Назад</button>
          <h2 className="text-lg font-semibold">Отношение</h2>
        </div>
        <RelationshipEditor
          relationship={editing}
          characters={characters}
          onSave={async (r) => {
            const isNew = !relationships.find((x) => x.id === r.id)
            if (isNew) await createRelationship(r)
            else await updateRelationship(r)
            showNotification('Отношение сохранено', 'success')
            setEditing(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Отношения</h2>
        <button
          onClick={() => {
            if (characters.length < 2) {
              showNotification('Нужно минимум 2 персонажа', 'error')
              return
            }
            setEditing(createDefaultRelationship(world.id, characters[0].id, characters[1].id))
          }}
          className="btn-primary"
        >
          + Добавить
        </button>
      </div>

      {relationships.length === 0 && (
        <p className="text-gray-400 text-sm">Отношений пока нет.</p>
      )}

      <div className="space-y-3">
        {relationships.map((r) => (
          <div key={r.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">
                {getName(r.fromCharacterId)} → {getName(r.toCharacterId)}
              </div>
              <div className="text-xs text-gray-400">
                {r.status} · доверие {r.trust} · уважение {r.respect}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(r)} className="btn-secondary text-xs">Изменить</button>
              <button
                onClick={async () => {
                  await deleteRelationship(r.id)
                  showNotification('Удалено', 'info')
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
