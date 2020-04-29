import { defineElement } from './util'

export function webcomponent(tag: string, options?: ElementDefinitionOptions) {
  return (target: any) => {
    defineElement(tag, target)
  }
}
