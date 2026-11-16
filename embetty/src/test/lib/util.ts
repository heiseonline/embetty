import { spyOn } from 'bun:test'
import Video from '../../embed/video'
import { respondWith } from './fetch'

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

// Embeds fetch their data from the Embetty server once visible.
export const mockServerResponse = (data: unknown) =>
  spyOn(window, 'fetch').mockImplementation(respondWith(data))
