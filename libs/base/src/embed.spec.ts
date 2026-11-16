import { beforeEach, describe, expect, it } from 'bun:test'
import { Embed, EmbettyRequest } from './embed'
import { LRU } from './cache/lru'
import { Embetty } from './embetty'

class MyEmbed extends Embed<unknown> {
  override get _requestOptions(): EmbettyRequest | undefined {
    return {
      url: 'https://example.com',
    }
  }
}

describe(`${Embed.name}`, () => {
  let embetty: Embetty

  beforeEach(() => {
    embetty = new Embetty(new LRU('lru://', { ttl: 60 }))
  })

  it('should be defined', () => {
    expect(Embed).toBeDefined()
  })

  it('should be instantiable', () => {
    const myEmbed = new MyEmbed('foo', { embetty })

    expect(myEmbed).toBeDefined()
    expect(myEmbed.id).toBe('foo')
  })
})
