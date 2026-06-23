import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useUIStore } from '@/store/uiStore'
import { StoryAnchorEditor } from '@/components/editors/StoryAnchorEditor'
import { createDefaultStoryAnchor, type StoryAnchor } from '@/types'

const IMPORTANCE_COLOR: Record<string, string> = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ожидает',
  active: 'Активен',
  completed: 'Завершён',
  skipped: 'Пропущен',
}

export function PlotTab() {
  const { world, anchors, createAnchor, updateAnchor, deleteAnchor } = useWorldStore()
  const showNotification = useUIStore((s) => s.showNotification)
  const [editing, setEditing] = useState<StoryAnchor | null>(null)

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  if (editing) {
    return (
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(null)} className="btn-ghost text-sm">← Назад</button>
          <h2 className="text-lg font-semibold">Сюжетный якорь</h2>
        </div>
        <StoryAnchorEditor
          anchor={editing}
          characters={useWorldStore.getState().characters}
          onSave={async (a) => {
            const isNew = !anchors.find((x) => x.id === a.id)
            if (isNew) await createAnchor(a)
            else await updateAnchor(a)
            showNotification('Якорь сохранён', 'success')
            setEditing(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Сюжетные якоря</h2>
        <button onClick={() => setEditing(createDefaultStoryAnchor(world.id))} className="btn-primary">
          + Добавить якорь
        </button>
      </div>

      {anchors.length === 0 && (
        <p className="text-gray-400 text-sm">Якорей пока нет. Якори — запланированные события которые движок будет реализовывать.</p>
      )}

      <div className="space-y-3">
        {anchors.map((a) => (
          <div key={a.id} className="card flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{a.title}</span>
                <span className={`text-xs ${IMPORTANCE_COLOR[a.importance]}`}>{a.importance}</span>
                <span className="text-xs text-gray-500">{STATUS_LABEL[a.status]}</span>
              </div>
              {a.description && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{a.description}</div>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing(a)} className="btn-secondary text-xs">Изменить</button>
              <button
                onClick={async () => {
                  await deleteAnchor(a.id)
                  showNotification('Якорь удалён', 'info')
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
