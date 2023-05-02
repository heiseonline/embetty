import IORedis from 'ioredis'
import { deserialize, serialize } from 'v8'
import { CacheEntry, EmbettyCache } from './cache'

export class Redis implements EmbettyCache {
  #redis = new IORedis()

  async get<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const response = await this.#redis.getBuffer(key)

    if (!response) {
      return undefined
    }

    return deserialize(response) as CacheEntry<T>
  }

  async set(entry: CacheEntry): Promise<void> {
    const value = serialize(entry)

    await this.#redis.set(entry.key, value)
  }
}
