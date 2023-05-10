/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import hogan from 'hogan.js'
import { defineElement } from './util'

export const TEMPLATE_METADATA_KEY = 'template'

export function webcomponent(tag: string, template: string) {
  return (target: CustomElementConstructor) => {
    Reflect.defineProperty(target, TEMPLATE_METADATA_KEY, {
      value: hogan.compile(template),
    })
    defineElement(tag, target)
  }
}

export function observable() {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  return (target: CustomElementConstructor) => {
    const origConnectedCallback = target.prototype.connectedCallback

    target.prototype.initialized = false
    target.prototype.observableRootMargin = '0px 0px 10% 0px'

    target.prototype.connectedCallback = async function () {
      origConnectedCallback.call(this)

      await new Promise<void>((resolve) => {
        new window.IntersectionObserver(
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          async ([entry]) => {
            if (!this.isVisible()) {
              return
            }
            if (entry?.intersectionRatio === 0) {
              return
            }
            if (this.initialized) {
              return
            }

            this.initialized = true
            await this.becomesVisible()
            resolve()
          },
          {
            root: this.observableRoot,
            rootMargin: this.observableRootMargin,
            threshold: this.observableRootThreshold,
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ).observe(this)
      })
    }
  }
}
