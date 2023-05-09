/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { readJson } from 'fs-extra'
// eslint-disable-next-line unicorn/import-style
import { join } from 'path'
import { Tweet } from '../../embed/tweet'
import Video from '../../embed/video'

export function createElement<T extends HTMLElement>(
  tag: string,
  attrs: { [name: string]: string } = {},
): Promise<{
  element: T
  query: (...args: Parameters<typeof document.querySelector>) => T
}> {
  return new Promise((resolve) => {
    const wrapper = document.createElement('div')
    const htmlAttrs = Object.keys(attrs)
      .map((attr) => `${attr}="${attrs[attr]}"`)
      .join(' ')

    wrapper.innerHTML = `<${tag} ${htmlAttrs}></${tag}>`

    const element = wrapper.firstElementChild as T

    document.body.append(element)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    element.becomesVisible()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const query = element.shadowRoot!.querySelector.bind(element.shadowRoot)
    resolve({ element, query })
  })
}

export function createTweet(status: string, attrs = {}) {
  return createElement<Tweet>('embetty-tweet', { status, ...attrs })
}

export const createVideo = (videoId: string, type: string, attrs = {}) => {
  return createElement<Video<unknown>>('embetty-video', {
    ...attrs,
    'video-id': videoId,
    type,
  })
}

export const createYoutubeVideo = (videoId: string, attrs = {}) =>
  createVideo(videoId, 'youtube', attrs)

export const createVimeoVideo = (videoId: string, attrs = {}) =>
  createVideo(videoId, 'vimeo', attrs)

export const createFacebookVideo = (videoId: string, attrs = {}) =>
  createVideo(videoId, 'facebook', attrs)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line toplevel/no-toplevel-side-effect
window.fetch = jest.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({}) }),
)

const fetchSpy = jest.spyOn(window, 'fetch')
export async function getFetchSpy(status: string) {
  const json = await readJson(join(__dirname, `../responses/${status}.json`))
  return fetchSpy.mockReturnValue({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    json() {
      return Promise.resolve(json)
    },
  })
}
