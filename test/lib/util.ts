import { Tweet } from '../../lib/embed/tweet'
import Video from '../../lib/embed/video'
import path from 'path'
import { readJson } from 'fs-extra'

export function createElement<T extends HTMLElement>(
  tag: string,
  attrs: { [name: string]: string } = {},
): Promise<{
  element: T
  query: (...args: Parameters<typeof document.querySelector>) => T
}> {
  return new Promise((resolve) => {
    const element = document.createElement(tag)
    Object.keys(attrs).forEach((attr) => {
      element.setAttribute(attr, attrs[attr])
    })

    element.addEventListener('initialized', (_e) => {
      const query = element.shadowRoot!.querySelector.bind(element.shadowRoot)
      // @ts-ignore
      resolve({ element, query })
    })
    document.body.append(element)
  })
}

export function createTweet(status: string, attrs = {}) {
  return createElement<Tweet>('embetty-tweet', { status, ...attrs })
}

export const createVideo = (videoId: string, type: string, attrs = {}) => {
  return createElement<Video>('embetty-video', {
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

const fetchSpy = jest.spyOn(window, 'fetch')
export async function getFetchSpy(status: string) {
  const json = await readJson(
    path.join(__dirname, `../responses/${status}.json`),
  )
  return fetchSpy.mockReturnValue({
    // @ts-ignore
    json() {
      return Promise.resolve(json)
    },
  })
}
