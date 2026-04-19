import type { LLMProvider } from './LLMProvider'
import type { World, Character, MemoryEvent } from '@/types'

export interface NarrativeEvent {
  icon: string
  text: string
  characterName?: string
  worldDate: string
  type: string
}

/** Generate a literary chapter from a batch of simulation events. */
export async function generateChapter(
  events: NarrativeEvent[],
  world: World,
  characters: Character[],
  provider: LLMProvider,
): Promise<string> {
  const charNames = characters.map((c) => c.name).join(', ')
  const eventLines = [...events]
    .reverse()
    .map((e) => `[${e.worldDate.slice(0, 10)}] ${e.characterName ? e.characterName + ': ' : ''}${e.text}`)
    .join('\n')

  const system = `Ты литературный нарратор жизненной симуляции. Пишешь на русском языке, от третьего лица. Стиль: атмосферный, эмоционально насыщенный, художественная проза. Не пересказывай список событий напрямую — превращай их в живой нарратив.`

  const prompt = `Мир: «${world.name}». Дата: ${world.timeline.currentDate}.
Персонажи: ${charNames || 'нет'}.

Журнал событий (хронологически):
${eventLines}

Напиши литературную главу (3–4 абзаца), передающую суть этих событий. Сосредоточься на человеческой драме, внутренних состояниях персонажей, атмосфере. Заверши на эмоционально значимой ноте.`

  const response = await provider.complete([
    { role: 'user', content: `${system}\n\n${prompt}` },
  ])
  return response.text
}

/** Generate a first-person diary entry for a character. */
export async function generateJournalEntry(
  character: Character,
  events: NarrativeEvent[],
  world: World,
  provider: LLMProvider,
): Promise<string> {
  const eventLines = [...events]
    .reverse()
    .map((e) => `- ${e.text}`)
    .join('\n')

  const prompt = `Ты пишешь дневниковую запись от первого лица от имени ${character.name}.
Дата: ${world.timeline.currentDate}.
Настроение: ${character.mood}/100 (${character.mood >= 70 ? 'хорошее' : character.mood >= 40 ? 'среднее' : 'плохое'}).
Черты характера: ${character.traitIds.slice(0, 3).join(', ') || 'не определены'}.

Что произошло:
${eventLines || '— тихий день, ничего особенного.'}

Напиши короткую дневниковую запись (2–3 абзаца) на русском, от первого лица, искреннюю и эмоциональную. Отрази внутреннее состояние ${character.name}.`

  const response = await provider.complete([{ role: 'user', content: prompt }])
  return response.text
}

/** Generate a philosophical reflection summarising hot memories into warm. */
export async function generateReflection(
  character: Character,
  hotMemories: MemoryEvent[],
  world: World,
  provider: LLMProvider,
): Promise<string> {
  const lines = hotMemories
    .slice(-12)
    .map((m) => `- ${m.description}`)
    .join('\n')

  const prompt = `Ты пишешь внутренний монолог-рефлексию от имени ${character.name}.
Дата: ${world.timeline.currentDate}.
Настроение: ${character.mood}/100.

Недавние воспоминания:
${lines || '— пустая страница.'}

Напиши короткую философскую рефлексию (1–2 абзаца) от первого лица: что ${character.name} понял о себе, мире и происходящем. Без пафоса, искренне, с характером персонажа.`

  const response = await provider.complete([{ role: 'user', content: prompt }])
  return response.text
}
