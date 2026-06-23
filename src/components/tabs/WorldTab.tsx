import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useUIStore } from '@/store/uiStore'
import { WorldEditor } from '@/components/editors/WorldEditor'
import { LocationEditor } from '@/components/editors/LocationEditor'
import { createDefaultWorld, createDefaultLocation, type Location } from '@/types'

type WorldSubView = 'list' | 'settings' | 'locations' | 'new-world'

export function WorldTab() {
  const { world, worldList, loadWorldList, loadWorld, createWorld, updateWorld, deleteWorld, unloadWorld, locations, createLocation, updateLocation, deleteLocation } = useWorldStore()
  const showNotification = useUIStore((s) => s.showNotification)
  const [view, setView] = useState<WorldSubView>('list')
  const [listLoaded, setListLoaded] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [newWorldDraft] = useState(() => createDefaultWorld())

  const handleLoadList = async () => {
    await loadWorldList()
    setListLoaded(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить мир? Это удалит всех персонажей и данные.')) return
    await deleteWorld(id)
    showNotification('Мир удалён', 'info')
  }

  // ── World list ─────────────────────────────────────────────────────────────
  if (!world) {
    if (view === 'new-world') {
      return (
        <div className="p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView('list')} className="btn-ghost text-sm">← Назад</button>
            <h2 className="text-lg font-semibold">Создать мир</h2>
          </div>
          <WorldEditor
            world={newWorldDraft}
            onSave={async (w) => {
              await createWorld(w)
              await loadWorld(w.id)
              showNotification('Мир создан', 'success')
            }}
          />
        </div>
      )
    }

    return (
      <div className="p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Миры</h2>
          <div className="flex gap-2">
            {!listLoaded && (
              <button onClick={handleLoadList} className="btn-secondary">Загрузить список</button>
            )}
            <button onClick={() => setView('new-world')} className="btn-primary">+ Новый мир</button>
          </div>
        </div>

        {listLoaded && worldList.length === 0 && (
          <p className="text-gray-400 text-sm">Миров пока нет. Создайте первый!</p>
        )}

        <div className="space-y-3">
          {worldList.map((w) => (
            <div key={w.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{w.name}</div>
                <div className="text-xs text-gray-400">
                  {w.settings.genre} · {w.settings.startYear} · обновлён {new Date(w.updatedAt).toLocaleDateString('ru')}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => loadWorld(w.id)} className="btn-primary text-xs">Открыть</button>
                <button onClick={() => handleDelete(w.id)} className="btn-danger text-xs">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── World loaded ───────────────────────────────────────────────────────────

  // Sub-nav when world is open
  const SubNav = () => (
    <div className="flex gap-1 mb-6 flex-wrap">
      {([['settings', 'Настройки'], ['locations', 'Локации']] as const).map(([id, label]) => (
        <button key={id} onClick={() => setView(id)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            view === id ? 'bg-accent text-white' : 'bg-surface-overlay text-gray-300 hover:bg-gray-600'
          }`}>
          {label}
        </button>
      ))}
      <button onClick={unloadWorld} className="ml-auto btn-ghost text-xs">← К списку миров</button>
    </div>
  )

  // Location editing
  if (editingLocation) {
    return (
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditingLocation(null)} className="btn-ghost text-sm">← Назад</button>
          <h2 className="text-lg font-semibold">{editingLocation.name}</h2>
        </div>
        <LocationEditor
          location={editingLocation}
          onSave={async (l) => {
            const isNew = !locations.find((x) => x.id === l.id)
            if (isNew) await createLocation(l)
            else await updateLocation(l)
            showNotification('Локация сохранена', 'success')
            setEditingLocation(null)
          }}
        />
      </div>
    )
  }

  // World settings
  if (view === 'settings') {
    return (
      <div className="p-6 max-w-2xl">
        <SubNav />
        <WorldEditor
          world={world}
          onSave={async (w) => {
            await updateWorld(w)
            showNotification('Мир сохранён', 'success')
          }}
        />
      </div>
    )
  }

  // Locations list
  return (
    <div className="p-6 max-w-2xl">
      <SubNav />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Локации — {world.name}</h2>
        <button onClick={() => setEditingLocation(createDefaultLocation(world.id))} className="btn-primary">
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
              <button onClick={() => setEditingLocation(l)} className="btn-secondary text-xs">Изменить</button>
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
