import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useUIStore } from '@/store/uiStore'
import { LocationEditor } from '@/components/editors/LocationEditor'
import { createDefaultLocation, type Location } from '@/types'

export function LocationsTab() {
  const { world, locations, createLocation, updateLocation, deleteLocation } = useWorldStore()
  const showNotification = useUIStore((s) => s.showNotification)
  const [editing, setEditing] = useState<Location | null>(null)

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  if (editing) {
    return (
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(null)} className="btn-ghost text-sm">← Назад</button>
          <h2 className="text-lg font-semibold">{editing.name}</h2>
        </div>
        <LocationEditor
          location={editing}
          onSave={async (l) => {
            const isNew = !locations.find((x) => x.id === l.id)
            if (isNew) await createLocation(l)
            else await updateLocation(l)
            showNotification('Локация сохранена', 'success')
            setEditing(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Локации</h2>
        <button onClick={() => setEditing(createDefaultLocation(world.id))} className="btn-primary">
          + Новая локация
        </button>
      </div>

      {locations.length === 0 && (
        <p className="text-gray-400 text-sm">Локаций пока нет.</p>
      )}

      <div className="space-y-3">
        {locations.map((l) => (
          <div key={l.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{l.name}</div>
              <div className="text-xs text-gray-400">
                {l.type} · безопасность {l.atmosphere.safety} · население {l.atmosphere.population.toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(l)} className="btn-secondary text-xs">Изменить</button>
              <button
                onClick={async () => {
                  if (!confirm(`Удалить «${l.name}»?`)) return
                  await deleteLocation(l.id)
                  showNotification('Локация удалена', 'info')
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
