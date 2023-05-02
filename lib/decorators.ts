import { defineElement } from './util'

export function webcomponent(tag: string, _options?: ElementDefinitionOptions) {
  return (target: any) => {
    defineElement(tag, target)
  }
}
