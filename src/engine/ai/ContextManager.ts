import type { World, Character } from '@/types'
import type { LLMMessage } from './LLMProvider'

export interface ContextPackage {
  worldBrief: string
  characterProfile: string
  recentMemories: string
  currentMood: string
  instruction: string
  maxTokens: number
}

/**
 * Builds optimised context for LLM calls.
 * Keeps token count under control by prioritising relevant information.
 */
export class ContextManager {
  /** Build context for a character action/dialogue. */
  buildCharacterContext(
    character: Character,
    world: World,
    scenario: string,
  ): ContextPackage {
    const worldBrief = `Мир: ${world.name}. Дата: ${world.timeline.currentDate}.`

    const characterProfile = `${character.name} (${character.gender}, ${character.species}):
Черты: ${character.traitIds.slice(0, 3).join(', ') || 'нет'}
Навыки: ${character.skillIds.slice(0, 3).join(', ') || 'нет'}
Статы: Интеллект ${character.stats.intelligence}, Харизма ${character.stats.charisma}, Воля ${character.stats.will}`

    // Last 2-3 hot memories only
    const recentMemories = character.memory.hot
      .slice(0, 3)
      .map((m) => `- ${m.description}`)
      .join('\n') || 'Нет недавних воспоминаний'

    const currentMood = `Настроение: ${character.mood}/100. Нужды: голод ${Math.round(
      character.needs.hunger.current,
    )}, сон ${Math.round(character.needs.sleep.current)}, общение ${Math.round(
      character.needs.social.current,
    )}`

    const instruction = `Сценарий: ${scenario}
Напиши одно предложение на русском языке от третьего лица, описывающее действие ${character.name}.
Будь атмосферным, эмоциональным, естественным.`

    return {
      worldBrief,
      characterProfile,
      recentMemories,
      currentMood,
      instruction,
      maxTokens: 100,
    }
  }

  /** Convert context to LLM messages. */
  toMessages(ctx: ContextPackage): LLMMessage[] {
    return [
      {
        role: 'user',
        content: `${ctx.worldBrief}

${ctx.characterProfile}

Недавнее:
${ctx.recentMemories}

${ctx.currentMood}

${ctx.instruction}`,
      },
    ]
  }

  /** Estimate tokens (rough approximation: 1 token ≈ 4 chars). */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }
}

export const contextManager = new ContextManager()
