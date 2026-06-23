import { openDB, type IDBPDatabase } from 'idb'
import type { World, Character, Location, StoryAnchor, Relationship } from '@/types'

const DB_NAME = 'ai-life-simulator'
const DB_VERSION = 1

interface ALS_DB {
  worlds: {
    key: string
    value: World
  }
  characters: {
    key: string
    value: Character
    indexes: { worldId: string }
  }
  locations: {
    key: string
    value: Location
    indexes: { worldId: string }
  }
  storyAnchors: {
    key: string
    value: StoryAnchor
    indexes: { worldId: string }
  }
  relationships: {
    key: string
    value: Relationship
    indexes: { worldId: string; fromCharacterId: string }
  }
}

let dbPromise: Promise<IDBPDatabase<ALS_DB>> | null = null

function getDB(): Promise<IDBPDatabase<ALS_DB>> {
  if (!dbPromise) {
    dbPromise = openDB<ALS_DB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const worldsStore = db.createObjectStore('worlds', { keyPath: 'id' })
        void worldsStore

        const charStore = db.createObjectStore('characters', { keyPath: 'id' })
        charStore.createIndex('worldId', 'worldId')

        const locStore = db.createObjectStore('locations', { keyPath: 'id' })
        locStore.createIndex('worldId', 'worldId')

        const anchorStore = db.createObjectStore('storyAnchors', { keyPath: 'id' })
        anchorStore.createIndex('worldId', 'worldId')

        const relStore = db.createObjectStore('relationships', { keyPath: 'id' })
        relStore.createIndex('worldId', 'worldId')
        relStore.createIndex('fromCharacterId', 'fromCharacterId')
      },
    })
  }
  return dbPromise
}

// ── Worlds ──────────────────────────────────────────────────────────────────

export async function getAllWorlds(): Promise<World[]> {
  const db = await getDB()
  return db.getAll('worlds')
}

export async function getWorld(id: string): Promise<World | undefined> {
  const db = await getDB()
  return db.get('worlds', id)
}

export async function saveWorld(world: World): Promise<void> {
  const db = await getDB()
  await db.put('worlds', { ...world, updatedAt: new Date().toISOString() })
}

export async function deleteWorld(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['worlds', 'characters', 'locations', 'storyAnchors', 'relationships'], 'readwrite')
  await tx.objectStore('worlds').delete(id)
  for (const char of await tx.objectStore('characters').index('worldId').getAll(id)) {
    await tx.objectStore('characters').delete(char.id)
  }
  for (const loc of await tx.objectStore('locations').index('worldId').getAll(id)) {
    await tx.objectStore('locations').delete(loc.id)
  }
  for (const anchor of await tx.objectStore('storyAnchors').index('worldId').getAll(id)) {
    await tx.objectStore('storyAnchors').delete(anchor.id)
  }
  for (const rel of await tx.objectStore('relationships').index('worldId').getAll(id)) {
    await tx.objectStore('relationships').delete(rel.id)
  }
  await tx.done
}

// ── Characters ───────────────────────────────────────────────────────────────

export async function getCharactersByWorld(worldId: string): Promise<Character[]> {
  const db = await getDB()
  return db.getAllFromIndex('characters', 'worldId', worldId)
}

export async function saveCharacter(char: Character): Promise<void> {
  const db = await getDB()
  await db.put('characters', { ...char, updatedAt: new Date().toISOString() })
}

export async function deleteCharacter(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('characters', id)
}

// ── Locations ─────────────────────────────────────────────────────────────────

export async function getLocationsByWorld(worldId: string): Promise<Location[]> {
  const db = await getDB()
  return db.getAllFromIndex('locations', 'worldId', worldId)
}

export async function saveLocation(loc: Location): Promise<void> {
  const db = await getDB()
  await db.put('locations', { ...loc, updatedAt: new Date().toISOString() })
}

export async function deleteLocation(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('locations', id)
}

// ── Story Anchors ─────────────────────────────────────────────────────────────

export async function getAnchorsByWorld(worldId: string): Promise<StoryAnchor[]> {
  const db = await getDB()
  return db.getAllFromIndex('storyAnchors', 'worldId', worldId)
}

export async function saveAnchor(anchor: StoryAnchor): Promise<void> {
  const db = await getDB()
  await db.put('storyAnchors', { ...anchor, updatedAt: new Date().toISOString() })
}

export async function deleteAnchor(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('storyAnchors', id)
}

// ── Relationships ─────────────────────────────────────────────────────────────

export async function getRelationshipsByWorld(worldId: string): Promise<Relationship[]> {
  const db = await getDB()
  return db.getAllFromIndex('relationships', 'worldId', worldId)
}

export async function saveRelationship(rel: Relationship): Promise<void> {
  const db = await getDB()
  await db.put('relationships', { ...rel, updatedAt: new Date().toISOString() })
}

export async function deleteRelationship(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('relationships', id)
}

// ── Export / Import ───────────────────────────────────────────────────────────

export interface WorldBundle {
  world: World
  characters: Character[]
  locations: Location[]
  storyAnchors: StoryAnchor[]
  relationships: Relationship[]
  exportedAt: string
  schemaVersion: number
}

export async function exportWorldBundle(worldId: string): Promise<WorldBundle> {
  const db = await getDB()
  const world = await db.get('worlds', worldId)
  if (!world) throw new Error(`World ${worldId} not found`)

  return {
    world,
    characters: await db.getAllFromIndex('characters', 'worldId', worldId),
    locations: await db.getAllFromIndex('locations', 'worldId', worldId),
    storyAnchors: await db.getAllFromIndex('storyAnchors', 'worldId', worldId),
    relationships: await db.getAllFromIndex('relationships', 'worldId', worldId),
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
  }
}

export async function importWorldBundle(bundle: WorldBundle): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['worlds', 'characters', 'locations', 'storyAnchors', 'relationships'], 'readwrite')
  await tx.objectStore('worlds').put(bundle.world)
  for (const c of bundle.characters) await tx.objectStore('characters').put(c)
  for (const l of bundle.locations) await tx.objectStore('locations').put(l)
  for (const a of bundle.storyAnchors) await tx.objectStore('storyAnchors').put(a)
  for (const r of bundle.relationships) await tx.objectStore('relationships').put(r)
  await tx.done
}
