/** Simple seeded Perlin-like noise for procedural generation. */
export class Noise {
  private permutation: number[]

  constructor(seed: number) {
    // Deterministic shuffle based on seed
    this.permutation = Array.from({ length: 256 }, (_, i) => i)
    let s = seed
    for (let i = this.permutation.length - 1; i > 0; i--) {
      s = (s * 16807) % 2147483647
      const j = (Math.abs(s) % (i + 1))
      ;[this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]]
    }
  }

  /** Hash function for pseudo-random values. */
  private hash(x: number): number {
    x = ((x >> 16) ^ x) * 0x7feb352d
    x = ((x >> 15) ^ x) * 0x846ca68b
    x = ((x >> 16) ^ x)
    return (x & 0x7fffffff) / 0x7fffffff
  }

  /** Smoothstep interpolation. */
  private smoothstep(t: number): number {
    return t * t * (3 - 2 * t)
  }

  /** 2D Perlin-like noise [-1, 1]. */
  perlin2(x: number, y: number): number {
    const xi = Math.floor(x) & 255
    const yi = Math.floor(y) & 255

    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)

    const u = this.smoothstep(xf)
    const v = this.smoothstep(yf)

    const p = this.permutation
    const a = (p[xi] + yi) % 256
    const aa = p[a]
    const ab = p[(a + 1) % 256]
    const b = (p[(xi + 1) % 256] + yi) % 256
    const ba = p[b]
    const bb = p[(b + 1) % 256]

    const h1 = this.hash(aa)
    const h2 = this.hash(ba)
    const h3 = this.hash(ab)
    const h4 = this.hash(bb)

    const x1 = this.lerp(h1, h2, u)
    const x2 = this.lerp(h3, h4, u)
    return this.lerp(x1, x2, v) * 2 - 1
  }

  /** Linear interpolation. */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
  }
}
