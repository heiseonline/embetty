import { defineElement } from './util'

export function webcomponent(tag: string, _options?: ElementDefinitionOptions) {
  return (target: Function) => {
    defineElement(tag, target)
  }
}

export function observable() {
  return (target: Function) => {
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
        ).observe(this)
      })
    }
  }
}
