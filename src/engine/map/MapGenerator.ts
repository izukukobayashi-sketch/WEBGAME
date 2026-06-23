import type { Coordinates } from '@/types/location'
import { Noise } from './NoiseGenerator'

export type BiomeType = 'ocean' | 'coast' | 'plains' | 'forest' | 'mountain' | 'desert'

export interface BiomeInfo {
  type: BiomeType
  temperature: number // -30 to 50
  humidity: number // 0-100
  elevation: number // 0-1
}

export class MapGenerator {
  private noise: Noise
  private width: number
  private height: number

  constructor(seed: number, width: number, height: number) {
    this.noise = new Noise(seed)
    this.width = width
    this.height = height
  }

  /** Generate 2D heightmap using Perlin-like noise. */
  generateHeightmap(): number[][] {
    const map: number[][] = []
    for (let y = 0; y < this.height; y++) {
      map[y] = []
      for (let x = 0; x < this.width; x++) {
        const scale = 100
        const elevation = this.noise.perlin2(x / scale, y / scale)
        map[y][x] = elevation
      }
    }
    return map
  }

  /** Get biome at coordinates based on elevation and moisture. */
  getBiomeAt(heightmap: number[][], coords: Coordinates): BiomeInfo {
    const x = Math.floor(coords.x) % this.width
    const y = Math.floor(coords.y) % this.height
    const elevation = heightmap[y]?.[x] ?? 0.5

    // Moisture (secondary noise)
    const moisture = this.noise.perlin2(x / 150, y / 150)

    let type: BiomeType
    let temperature = 20 - elevation * 40 // higher = colder

    if (elevation < 0.2) {
      type = 'ocean'
      temperature -= 5
    } else if (elevation < 0.3) {
      type = 'coast'
    } else if (elevation < 0.5) {
      type = moisture > 0.2 ? 'forest' : 'plains'
    } else if (elevation < 0.7) {
      type = moisture > 0.3 ? 'forest' : 'mountain'
    } else {
      type = 'mountain'
      temperature -= 10
    }

    // Desert if low moisture and plains/coast
    if (moisture < -0.4 && (type === 'plains' || type === 'coast')) {
      type = 'desert'
      temperature += 15
    }

    return {
      type,
      temperature: Math.max(-30, Math.min(50, temperature)),
      humidity: Math.max(0, Math.min(100, (moisture + 1) * 50)),
      elevation,
    }
  }

  /** Generate settlement positions using clustering. */
  generateSettlements(count: number, heightmap: number[][]): Coordinates[] {
    const settlements: Coordinates[] = []
    const attempts = count * 10

    for (let i = 0; i < attempts && settlements.length < count; i++) {
      const x = Math.random() * this.width
      const y = Math.random() * this.height
      const biome = this.getBiomeAt(heightmap, { x, y })

      // Settlements prefer coast and plains
      if (biome.type === 'coast' || biome.type === 'plains') {
        // Check minimum distance from existing settlements
        const minDist = 50
        const tooClose = settlements.some((s) => {
          const dx = s.x - x
          const dy = s.y - y
          return Math.sqrt(dx * dx + dy * dy) < minDist
        })

        if (!tooClose) {
          settlements.push({ x, y })
        }
      }
    }

    return settlements
  }
}
