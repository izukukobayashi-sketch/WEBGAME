import { useRef } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useUIStore } from '@/store/uiStore'
import { exportWorldBundle, importWorldBundle, type WorldBundle } from '@/db'

export function SettingsTab() {
  const { world, loadWorld, loadWorldList } = useWorldStore()
  const showNotification = useUIStore((s) => s.showNotification)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    if (!world) {
      showNotification('Сначала откройте мир', 'error')
      return
    }
    try {
      const bundle = await exportWorldBundle(world.id)
      const json = JSON.stringify(bundle, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${world.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.als.json`
      a.click()
      URL.revokeObjectURL(url)
      showNotification('Мир экспортирован', 'success')
    } catch (e) {
      showNotification(`Ошибка: ${e}`, 'error')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const bundle = JSON.parse(text) as WorldBundle
      if (!bundle.world || !bundle.characters) throw new Error('Неверный формат файла')
      await importWorldBundle(bundle)
      await loadWorldList()
      await loadWorld(bundle.world.id)
      showNotification(`Мир «${bundle.world.name}» импортирован`, 'success')
    } catch (e) {
      showNotification(`Ошибка импорта: ${e}`, 'error')
    }
    e.target.value = ''
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h2 className="text-xl font-bold">Настройки</h2>

      {/* Save / Export */}
      <div className="card space-y-3">
        <div className="font-medium">Сохранение и экспорт</div>
        <p className="text-gray-400 text-sm">
          Все данные хранятся в IndexedDB браузера. Экспортируйте мир в JSON-файл для резервной копии или переноса.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleExport} className="btn-primary" disabled={!world}>
            Экспортировать мир
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
            Импортировать мир
          </button>
          <input ref={fileInputRef} type="file" accept=".json,.als.json" className="hidden" onChange={handleImport} />
        </div>
        {world && (
          <p className="text-xs text-gray-500">Текущий мир: {world.name}</p>
        )}
      </div>

      {/* AI Settings — info only, editing in WorldEditor */}
      <div className="card space-y-2">
        <div className="font-medium">ИИ-настройки</div>
        <p className="text-gray-400 text-sm">
          Провайдер, модель и API-ключ настраиваются в редакторе мира (вкладка «Мир» → настройки).
        </p>
        {world && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Провайдер: <span className="text-gray-300">{world.settings.aiProvider}</span></div>
            <div>Модель: <span className="text-gray-300">{world.settings.aiModel || '—'}</span></div>
            <div>Лимит токенов/день: <span className="text-gray-300">{world.settings.dailyTokenLimit.toLocaleString()}</span></div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="card">
        <div className="font-medium mb-1">AI Life Simulator</div>
        <div className="text-xs text-gray-500">Этап 0–1 реализован · Данные: IndexedDB · Движок: чистый TypeScript</div>
      </div>
    </div>
  )
}
