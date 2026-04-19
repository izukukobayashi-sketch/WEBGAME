import { useRef, useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useUIStore } from '@/store/uiStore'
import { exportWorldBundle, importWorldBundle, type WorldBundle } from '@/db'
import { createAlterHarutoScenario } from '@/scenarios/alterHaruto'

export function SettingsTab() {
  const { world, loadWorld, loadWorldList, createWorld, createCharacter, createAnchor, createRelationship } = useWorldStore()
  const showNotification = useUIStore((s) => s.showNotification)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loadingScenario, setLoadingScenario] = useState(false)

  const handleExport = async () => {
    if (!world) { showNotification('Сначала откройте мир', 'error'); return }
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

  const handleLoadScenario = async () => {
    if (!confirm('Загрузить стартовый сценарий «Альтер и Харуто»? Добавится новый мир в список.')) return
    setLoadingScenario(true)
    try {
      const { world: w, characters, anchors, relationships } = createAlterHarutoScenario()
      await createWorld(w)
      for (const c of characters) await createCharacter(c)
      for (const a of anchors) await createAnchor(a)
      for (const r of relationships) await createRelationship(r)
      await loadWorldList()
      await loadWorld(w.id)
      showNotification('Сценарий «Альтер и Харуто» загружен!', 'success')
    } catch (e) {
      showNotification(`Ошибка загрузки: ${e}`, 'error')
    } finally {
      setLoadingScenario(false)
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h2 className="text-xl font-bold">Настройки</h2>

      {/* Starter scenario */}
      <div className="card border-accent/30 space-y-3">
        <div className="font-medium text-accent">Стартовый сценарий</div>
        <div className="text-sm text-gray-300 space-y-1">
          <p className="font-medium">«Альтер и Харуто»</p>
          <p className="text-gray-400 text-xs">
            Харуто Судзуки — офисный работник, очнувшийся в больнице с голосом внутри головы.
            Альтер — холодная цифровая сущность которая называет себя Системой.
            Современная Япония, тема реинкарнации и потерянной памяти.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleLoadScenario} disabled={loadingScenario}
            className="btn-primary disabled:opacity-50">
            {loadingScenario ? '⏳ Загрузка…' : '▶ Загрузить сценарий'}
          </button>
          <span className="text-xs text-gray-500">
            2 персонажа · 5 сюжетных якорей · 1 отношение
          </span>
        </div>
      </div>

      {/* Save / Export */}
      <div className="card space-y-3">
        <div className="font-medium">Сохранение и экспорт</div>
        <p className="text-gray-400 text-sm">
          Все данные хранятся в IndexedDB браузера. Экспортируйте мир в JSON-файл для резервной копии.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleExport} className="btn-primary" disabled={!world}>Экспортировать мир</button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">Импортировать мир</button>
          <input ref={fileInputRef} type="file" accept=".json,.als.json" className="hidden" onChange={handleImport} />
        </div>
        {world && <p className="text-xs text-gray-500">Текущий мир: {world.name}</p>}
      </div>

      {/* AI Settings */}
      <div className="card space-y-2">
        <div className="font-medium">ИИ-настройки</div>
        <p className="text-gray-400 text-sm">
          Провайдер, модель и API-ключ настраиваются в редакторе мира (вкладка «Мир» → настройки).
        </p>
        {world && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Провайдер: <span className="text-gray-300">{world.settings.aiProvider}</span></div>
            <div>Модель: <span className="text-gray-300">{world.settings.aiModel || '—'}</span></div>
            <div>API-ключ: <span className="text-gray-300">{world.settings.aiApiKey ? '••••••••' : 'не задан'}</span></div>
            <div>Лимит токенов/день: <span className="text-gray-300">{world.settings.dailyTokenLimit.toLocaleString()}</span></div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="card">
        <div className="font-medium mb-1">AI Life Simulator</div>
        <div className="text-xs text-gray-500">Этапы 0–9 реализованы · IndexedDB · TypeScript + Claude AI</div>
      </div>
    </div>
  )
}
