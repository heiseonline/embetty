import { Embed, EmbettyRequest } from './embed'
import { Embetty } from './embetty'

jest.mock('./embetty')

class MyEmbed extends Embed<unknown> {
  override get _requestOptions(): EmbettyRequest | undefined {
    return {
      url: 'https://example.com',
    }
  }
}

describe(`${Embed.name}`, () => {
  let embetty: jest.Mocked<Embetty<unknown>>

  beforeEach(() => {
    embetty = new Embetty() as jest.Mocked<Embetty<unknown>>
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
