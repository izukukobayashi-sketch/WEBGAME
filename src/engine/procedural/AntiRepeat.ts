export class AntiRepeat {
  private history = new Map<string, number[]>()
  private readonly maxHistory: number

  constructor(maxHistory = 12) {
    this.maxHistory = maxHistory
  }

  /** Weight 0..1 — lower means "recently used, prefer not to pick". */
  getWeight(poolId: string, index: number): number {
    const hist = this.history.get(poolId) ?? []
    const pos = hist.indexOf(index)
    if (pos === -1) return 1
    return Math.max(0.05, pos / this.maxHistory)
  }

  record(poolId: string, index: number): void {
    const hist = this.history.get(poolId) ?? []
    const existing = hist.indexOf(index)
    if (existing !== -1) hist.splice(existing, 1)
    hist.unshift(index)
    if (hist.length > this.maxHistory) hist.pop()
    this.history.set(poolId, hist)
  }

  /** Pick a random index from a pool weighted by anti-repeat. */
  pick(poolId: string, size: number): number {
    const weights = Array.from({ length: size }, (_, i) => this.getWeight(poolId, i))
    const total = weights.reduce((s, w) => s + w, 0)
    let r = Math.random() * total
    for (let i = 0; i < size; i++) {
      r -= weights[i]
      if (r <= 0) {
        this.record(poolId, i)
        return i
      }
    }
    const idx = size - 1
    this.record(poolId, idx)
    return idx
  }

  /** Pick a random item from an array with anti-repeat. */
  pickFrom<T>(poolId: string, items: T[]): T {
    return items[this.pick(poolId, items.length)]
  }
}

export const globalAntiRepeat = new AntiRepeat()
