import { useWorldStore } from '@/store/worldStore'

export function HistoryTab() {
  const { world } = useWorldStore()

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">История</h2>
      <p className="text-gray-400 text-sm">
        Здесь будет хронологический лог всех событий мира. Реализуется в Этапе 3 (симуляция).
      </p>
      <div className="mt-6 card text-sm text-gray-500">
        <div className="text-xs uppercase tracking-widest text-gray-600 mb-2">Текущая дата мира</div>
        <div className="text-gray-300 font-mono">{world.timeline.currentDate}</div>
        <div className="text-xs text-gray-500 mt-1">Тиков: {world.timeline.tickCount}</div>
      </div>
    </div>
  )
}
