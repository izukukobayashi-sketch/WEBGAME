import { useWorldStore } from '@/store/worldStore'
import { STAT_DEFINITIONS } from '@/data/stats'

export function ProgressionTab() {
  const { world, characters } = useWorldStore()

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  const pc = characters.find((c) => c.role === 'playerCharacter')

  if (!pc) {
    return (
      <div className="p-6 max-w-xl">
        <h2 className="text-xl font-bold mb-4">Прогрессия</h2>
        <p className="text-gray-400 text-sm">
          Создайте персонажа с ролью «Главный герой» для просмотра прогрессии.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-xl font-bold mb-4">Прогрессия — {pc.name}</h2>

      <div className="section-title">Статы</div>
      <div className="space-y-2">
        {STAT_DEFINITIONS.map((stat) => {
          const value = pc.stats[stat.key]
          return (
            <div key={stat.key} className="flex items-center gap-3">
              <div className="w-32 text-sm text-gray-300">{stat.label}</div>
              <div className="flex-1 stat-bar">
                <div
                  className="stat-bar-fill bg-accent"
                  style={{ width: `${value}%` }}
                />
              </div>
              <div className="w-8 text-right text-sm font-mono text-gray-300">{value}</div>
            </div>
          )
        })}
      </div>

      <div className="section-title mt-6">Черты характера</div>
      {pc.traitIds.length === 0 ? (
        <p className="text-gray-500 text-sm">Нет черт. Добавьте их в редакторе персонажа.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {pc.traitIds.map((id) => (
            <span key={id} className="tag">{id}</span>
          ))}
        </div>
      )}
    </div>
  )
}
