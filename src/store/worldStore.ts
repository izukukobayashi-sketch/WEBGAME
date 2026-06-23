import { create } from 'zustand'
import type { World, Character, Location, StoryAnchor, Relationship } from '@/types'
import * as db from '@/db'

export interface WorldState {
  // Loaded world
  activeWorldId: string | null
  world: World | null
  characters: Character[]
  locations: Location[]
  anchors: StoryAnchor[]
  relationships: Relationship[]

  // World list
  worldList: World[]

  // Loading state
  isLoading: boolean
  error: string | null

  // Actions
  loadWorldList: () => Promise<void>
  loadWorld: (worldId: string) => Promise<void>
  unloadWorld: () => void
  createWorld: (world: World) => Promise<void>
  updateWorld: (world: World) => Promise<void>
  deleteWorld: (worldId: string) => Promise<void>

  createCharacter: (char: Character) => Promise<void>
  updateCharacter: (char: Character) => Promise<void>
  deleteCharacter: (charId: string) => Promise<void>

  createLocation: (loc: Location) => Promise<void>
  updateLocation: (loc: Location) => Promise<void>
  deleteLocation: (locId: string) => Promise<void>

  createAnchor: (anchor: StoryAnchor) => Promise<void>
  updateAnchor: (anchor: StoryAnchor) => Promise<void>
  deleteAnchor: (anchorId: string) => Promise<void>

  createRelationship: (rel: Relationship) => Promise<void>
  updateRelationship: (rel: Relationship) => Promise<void>
  deleteRelationship: (relId: string) => Promise<void>
}

export const useWorldStore = create<WorldState>((set) => ({
  activeWorldId: null,
  world: null,
  characters: [],
  locations: [],
  anchors: [],
  relationships: [],
  worldList: [],
  isLoading: false,
  error: null,

  loadWorldList: async () => {
    set({ isLoading: true, error: null })
    try {
      const worldList = await db.getAllWorlds()
      set({ worldList, isLoading: false })
    } catch (e) {
      set({ error: String(e), isLoading: false })
    }
  },

  loadWorld: async (worldId) => {
    set({ isLoading: true, error: null })
    try {
      const [world, characters, locations, anchors, relationships] = await Promise.all([
        db.getWorld(worldId),
        db.getCharactersByWorld(worldId),
        db.getLocationsByWorld(worldId),
        db.getAnchorsByWorld(worldId),
        db.getRelationshipsByWorld(worldId),
      ])
      if (!world) throw new Error(`Мир ${worldId} не найден`)
      set({ activeWorldId: worldId, world, characters, locations, anchors, relationships, isLoading: false })
    } catch (e) {
      set({ error: String(e), isLoading: false })
    }
  },

  unloadWorld: () => {
    set({ activeWorldId: null, world: null, characters: [], locations: [], anchors: [], relationships: [] })
  },

  createWorld: async (world) => {
    await db.saveWorld(world)
    set((s) => ({ worldList: [...s.worldList, world] }))
  },

  updateWorld: async (world) => {
    await db.saveWorld(world)
    set((s) => ({
      world: s.activeWorldId === world.id ? world : s.world,
      worldList: s.worldList.map((w) => (w.id === world.id ? world : w)),
    }))
  },

  deleteWorld: async (worldId) => {
    await db.deleteWorld(worldId)
    set((s) => ({
      worldList: s.worldList.filter((w) => w.id !== worldId),
      ...(s.activeWorldId === worldId
        ? { activeWorldId: null, world: null, characters: [], locations: [], anchors: [], relationships: [] }
        : {}),
    }))
  },

  createCharacter: async (char) => {
    await db.saveCharacter(char)
    set((s) => ({ characters: [...s.characters, char] }))
  },

  updateCharacter: async (char) => {
    await db.saveCharacter(char)
    set((s) => ({ characters: s.characters.map((c) => (c.id === char.id ? char : c)) }))
  },

  deleteCharacter: async (charId) => {
    await db.deleteCharacter(charId)
    set((s) => ({ characters: s.characters.filter((c) => c.id !== charId) }))
  },

  createLocation: async (loc) => {
    await db.saveLocation(loc)
    set((s) => ({ locations: [...s.locations, loc] }))
  },

  updateLocation: async (loc) => {
    await db.saveLocation(loc)
    set((s) => ({ locations: s.locations.map((l) => (l.id === loc.id ? loc : l)) }))
  },

  deleteLocation: async (locId) => {
    await db.deleteLocation(locId)
    set((s) => ({ locations: s.locations.filter((l) => l.id !== locId) }))
  },

  createAnchor: async (anchor) => {
    await db.saveAnchor(anchor)
    set((s) => ({ anchors: [...s.anchors, anchor] }))
  },

  updateAnchor: async (anchor) => {
    await db.saveAnchor(anchor)
    set((s) => ({ anchors: s.anchors.map((a) => (a.id === anchor.id ? anchor : a)) }))
  },

  deleteAnchor: async (anchorId) => {
    await db.deleteAnchor(anchorId)
    set((s) => ({ anchors: s.anchors.filter((a) => a.id !== anchorId) }))
  },

  createRelationship: async (rel) => {
    await db.saveRelationship(rel)
    set((s) => ({ relationships: [...s.relationships, rel] }))
  },

  updateRelationship: async (rel) => {
    await db.saveRelationship(rel)
    set((s) => ({ relationships: s.relationships.map((r) => (r.id === rel.id ? rel : r)) }))
  },

  deleteRelationship: async (relId) => {
    await db.deleteRelationship(relId)
    set((s) => ({ relationships: s.relationships.filter((r) => r.id !== relId) }))
  },

}))
