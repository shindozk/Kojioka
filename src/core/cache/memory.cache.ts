export interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export interface CacheOptions {
  maxSize?: number
  defaultTtl?: number
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>()
  private maxSize: number
  private defaultTtl: number

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000
    this.defaultTtl = options.defaultTtl ?? 5 * 60 * 1000
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    return entry.value as T
  }

  set<T>(key: string, value: T, ttl?: number): void {
    if (this.store.size >= this.maxSize) {
      this.evict()
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.defaultTtl),
    })
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }

  private evict(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }

    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value
      if (firstKey) {
        this.store.delete(firstKey)
      }
    }
  }
}
