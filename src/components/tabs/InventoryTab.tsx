import { useWorldStore } from '@/store/worldStore'

export function InventoryTab() {
  const { world } = useWorldStore()

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Инвентарь</h2>
      <p className="text-gray-400 text-sm">
        Предметы, деньги, недвижимость, реликвии. Реализуется в Этапе 7 (прогрессия и глубина).
      </p>
    </div>
  )
}
