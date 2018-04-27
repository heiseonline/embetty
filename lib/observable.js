export default Base => class Observable extends Base {
  constructor() {
    super(...arguments)
    this.initialized = false
  }

  async connectedCallback() {
    await super.connectedCallback()

    await new Promise(resolve => {
      new window.IntersectionObserver(
        async ([entry]) => {
          if (!this.isVisible()) return
          if (entry.intersectionRatio === 0) return
          if (this.initialized) return

          this.initialized = true
          await this.becomesVisible(entry)
          resolve()
        },
        {
          root: this.observableRoot || null,
          rootMargin: this.observableRootMargin || '0px 0px 10% 0px',
          threshold: this.observableRootThreshold || 0
        }
      ).observe(this)
    })
  }
}
