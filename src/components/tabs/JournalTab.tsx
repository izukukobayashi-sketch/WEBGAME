import { useState } from 'react'
import { useSimulationStore } from '@/store/simulationStore'
import { useWorldStore } from '@/store/worldStore'
import { formatDate } from '@/engine/procedural/MorphologyHelper'
import { getMoodLabel } from '@/engine/simulation/MoodSystem'
import { generateJournalEntry, type NarrativeEvent } from '@/engine/ai/ChapterBuilder'

interface DiaryEntry {
  id: string
  characterId: string
  characterName: string
  worldDate: string
  mood: number
  text: string
}

export function JournalTab() {
  const simLog = useSimulationStore((s) => s.eventLog)
  const aiProvider = useSimulationStore((s) => s.aiProvider)
  const simWorld = useSimulationStore((s) => s.world)
  const simCharacters = useSimulationStore((s) => s.characters)
  const { world: storeWorld, characters: storeChars } = useWorldStore()

  const world = simWorld ?? storeWorld
  const characters = simCharacters.length > 0 ? simCharacters : storeChars

  const [selectedCharId, setSelectedCharId] = useState<string | null>(null)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const pc = characters.find((c) => c.role === 'playerCharacter') ?? characters[0]
  const selectedChar = characters.find((c) => c.id === selectedCharId) ?? pc

  const handleWriteEntry = async () => {
    if (!aiProvider || !world || !selectedChar) return
    setGenerating(true)
    setGenError(null)
    try {
      const charEvents: NarrativeEvent[] = simLog
        .filter((e) => !e.characterId || e.characterId === selectedChar.id)
        .slice(0, 20)
        .map((e) => ({
          icon: e.icon,
          text: e.text,
          characterName: e.characterName,
          worldDate: e.worldDate,
          type: e.type,
        }))

      const text = await generateJournalEntry(selectedChar, charEvents, world, aiProvider)
      setEntries((prev) => [
        {
          id: crypto.randomUUID(),
          characterId: selectedChar.id,
          characterName: selectedChar.name,
          worldDate: world.timeline.currentDate,
          mood: selectedChar.mood,
          text,
        },
        ...prev,
      ])
    } catch (e) {
      setGenError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  if (!world) {
    return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>
  }
  if (characters.length === 0) {
    return <div className="p-6 text-gray-400">Создайте персонажей во вкладке «Персонажи».</div>
  }

  const charEntries = entries.filter((e) => e.characterId === selectedChar?.id)

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h2 className="text-xl font-bold flex-1">Дневник</h2>

        {characters.length > 1 && (
          <select
            className="bg-surface-overlay text-gray-200 rounded px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-accent"
            value={selectedChar?.id ?? ''}
            onChange={(e) => setSelectedCharId(e.target.value)}
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {selectedChar && (
        <>
          {/* Character info + action */}
          <div className="card mb-6 flex items-center gap-4 flex-wrap">
            <div className="flex-1">
              <div className="font-semibold text-gray-200">{selectedChar.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {getMoodLabel(selectedChar.mood)} · настроение {selectedChar.mood}/100
                {selectedChar.role === 'playerCharacter' && ' · главный герой'}
              </div>
            </div>

            <button
              onClick={handleWriteEntry}
              disabled={generating || !aiProvider}
              className="btn-primary text-sm disabled:opacity-50 shrink-0"
            >
              {generating ? '⏳ Пишет…' : '✍ Написать запись'}
            </button>
          </div>

          {!aiProvider && (
            <div className="card mb-4 text-sm text-gray-400 space-y-1">
              <p>Дневник использует ИИ для генерации от первого лица.</p>
              <p className="text-xs text-gray-600">
                Добавьте Claude API-ключ в настройках мира, чтобы активировать.
              </p>
            </div>
          )}

          {genError && <p className="text-red-400 text-sm mb-4">{genError}</p>}

          {charEntries.length === 0 && (
            <p className="text-gray-400 text-sm">
              Дневниковых записей нет. Запустите симуляцию и нажмите «Написать запись» — ИИ напишет запись от лица {selectedChar.name}.
            </p>
          )}

          <div className="space-y-6">
            {charEntries.map((entry) => (
              <div key={entry.id} className="card space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-mono">{formatDate(entry.worldDate)}</span>
                  <span>{getMoodLabel(entry.mood)}</span>
                </div>
                <div className="text-gray-200 text-sm leading-relaxed italic whitespace-pre-wrap">
                  {entry.text}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
