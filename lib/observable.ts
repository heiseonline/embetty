import { Constructor } from './interfaces'
import Embed from './embed'

export default <TBase extends Constructor<Embed>>(Base: TBase) =>
  class Observable extends Base {
    initialized = false
    observableRoot: Element | null = null
    observableRootMargin = '0px 0px 10% 0px'
    observableRootThreshold: number | number[] = 0

    // TODO: Reduce complexity of connectedCallback()
    // eslint-disable-next-line sonarjs/cognitive-complexity
    async connectedCallback() {
      await super.connectedCallback()

      await new Promise<void>((resolve) => {
        new window.IntersectionObserver(
          async ([entry]) => {
            if (!this.isVisible()) return
            if (entry.intersectionRatio === 0) return
            if (this.initialized) return

            this.initialized = true
            await this.becomesVisible()
            resolve()
          },
          {
            root: this.observableRoot,
            rootMargin: this.observableRootMargin,
            threshold: this.observableRootThreshold,
          }
        ).observe(this)
      })
    }
  }
