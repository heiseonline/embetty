import { defineElement } from './util'

export function webcomponent(tag: string) {
  return (target: CustomElementConstructor) => {
    defineElement(tag, target)
  }
}

interface ObservableElement extends HTMLElement {
  connectedCallback: (this: ObservableElement) => void
  isVisible(): boolean
  becomesVisible(): Promise<void>
  initialized?: boolean
  observableRoot?: Element | Document | null
  observableRootMargin?: string
  observableRootThreshold?: number | number[]
}

export function observable() {
  return (target: { prototype: ObservableElement }) => {
    const origConnectedCallback = target.prototype.connectedCallback

    target.prototype.initialized = false
    target.prototype.observableRootMargin = '0px 0px 10% 0px'

    target.prototype.connectedCallback = function (this: ObservableElement) {
      origConnectedCallback.call(this)

      new window.IntersectionObserver(
        ([entry]) => {
          if (
            !this.isVisible() ||
            entry?.intersectionRatio === 0 ||
            this.initialized
          ) {
            return
          }

          this.initialized = true
          this.becomesVisible().catch((error: unknown) => console.error(error))
        },
        {
          root: this.observableRoot,
          rootMargin: this.observableRootMargin,
          threshold: this.observableRootThreshold,
        },
      ).observe(this)
    }
  }
}
