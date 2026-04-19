import { useWorldStore } from '@/store/worldStore'

export function SystemTab() {
  const { world, characters } = useWorldStore()

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  const systemChars = characters.filter((c) => c.hasSystem)

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-xl font-bold mb-4">Система</h2>
      {systemChars.length === 0 ? (
        <p className="text-gray-400 text-sm">
          Нет персонажей с активной Системой. Включите «Есть Система» в редакторе персонажа.
        </p>
      ) : (
        <div className="space-y-4">
          {systemChars.map((c) => (
            <div key={c.id} className="card">
              <div className="font-medium mb-1">{c.name}</div>
              <div className="text-xs text-gray-400">
                Тон системы: {c.systemTone ?? 'не задан'}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Интерфейс Системы (задания, достижения, реплики) реализуется в Этапе 7.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
