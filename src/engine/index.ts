import type { World, Character, Location, StoryAnchor, Relationship } from '@/types'

/**
 * Ядро движка — чистый TypeScript без зависимостей от React.
 * UI подписывается на состояние через Zustand-хранилища.
 * Этапы 2-3 наполнят этот класс симуляцией.
 */
export class GameEngine {
  private world: World | null = null
  private characters: Map<string, Character> = new Map()
  private locations: Map<string, Location> = new Map()
  private anchors: Map<string, StoryAnchor> = new Map()
  private relationships: Map<string, Relationship> = new Map()

  loadWorld(
    world: World,
    characters: Character[],
    locations: Location[],
    anchors: StoryAnchor[],
    relationships: Relationship[],
  ): void {
    this.world = world
    this.characters = new Map(characters.map((c) => [c.id, c]))
    this.locations = new Map(locations.map((l) => [l.id, l]))
    this.anchors = new Map(anchors.map((a) => [a.id, a]))
    this.relationships = new Map(relationships.map((r) => [r.id, r]))
  }

  getWorld(): World | null {
    return this.world
  }

  getCharacter(id: string): Character | undefined {
    return this.characters.get(id)
  }

  getCharacters(): Character[] {
    return Array.from(this.characters.values())
  }

  getLocations(): Location[] {
    return Array.from(this.locations.values())
  }

  getAnchors(): StoryAnchor[] {
    return Array.from(this.anchors.values())
  }

  getRelationships(): Relationship[] {
    return Array.from(this.relationships.values())
  }

  getRelationshipBetween(fromId: string, toId: string): Relationship | undefined {
    return Array.from(this.relationships.values()).find(
      (r) => r.fromCharacterId === fromId && r.toCharacterId === toId,
    )
  }

  /**
   * Продвигает время на один тик.
   * Этап 3 реализует симуляцию нужд, настроения и событий.
   */
  tick(): void {
    if (!this.world) return
    this.world.timeline.tickCount += 1
  }
}

export const engine = new GameEngine()
