import { useWorldStore } from '@/store/worldStore'

export function JournalTab() {
  const { world, characters } = useWorldStore()

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }

  const pc = characters.find((c) => c.role === 'playerCharacter')

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Дневник</h2>
      {pc ? (
        <p className="text-gray-400 text-sm">
          Автоматический дневник от лица {pc.name}. Записи появляются после важных событий.
          Реализуется в Этапе 6 (режимы игры).
        </p>
      ) : (
        <p className="text-gray-400 text-sm">
          Создайте персонажа с ролью «Главный герой» для ведения дневника.
        </p>
      )}
    </div>
  )
}
