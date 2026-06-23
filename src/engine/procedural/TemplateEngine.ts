import { globalAntiRepeat } from './AntiRepeat'

export type SlotResolver = (slotName: string, context: Record<string, unknown>) => string | null

/**
 * Parses templates like:
 *   "#time# #hero# #action#. #atmosphere#."
 * Slots can be nested: #outer# resolves to a string that may contain more #slots#.
 */
export class TemplateEngine {
  private pools = new Map<string, string[]>()
  private resolvers: SlotResolver[] = []
  private maxDepth = 5

  registerPool(name: string, items: string[]): void {
    this.pools.set(name, items)
  }

  registerResolver(fn: SlotResolver): void {
    this.resolvers.push(fn)
  }

  resolve(template: string, context: Record<string, unknown> = {}, depth = 0): string {
    if (depth >= this.maxDepth) return template
    return template.replace(/#([a-zA-Z_]+)#/g, (_, slot: string) => {
      const resolved = this.resolveSlot(slot, context, depth)
      return resolved ?? `#${slot}#`
    })
  }

  private resolveSlot(name: string, context: Record<string, unknown>, depth: number): string | null {
    // 1. Context variable
    if (name in context) {
      const val = String(context[name])
      return this.resolve(val, context, depth + 1)
    }

    // 2. Custom resolvers
    for (const fn of this.resolvers) {
      const result = fn(name, context)
      if (result !== null) return this.resolve(result, context, depth + 1)
    }

    // 3. Registered pool
    const pool = this.pools.get(name)
    if (pool && pool.length > 0) {
      const item = globalAntiRepeat.pickFrom(name, pool)
      return this.resolve(item, context, depth + 1)
    }

    return null
  }

  /** Quick helper: resolve a one-off template without registering it. */
  quick(template: string, vars: Record<string, string>): string {
    return this.resolve(template, vars as Record<string, unknown>)
  }
}

export const globalTemplateEngine = new TemplateEngine()
