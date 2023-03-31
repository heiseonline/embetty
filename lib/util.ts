import hogan from 'hogan.js'

export function wait(ms = undefined) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function computedStyle(
  element: Element,
  key: keyof CSSStyleDeclaration
) {
  return window.getComputedStyle(element)[key]
}

export function marginHeight(element: Element) {
  const top = Number.parseFloat(computedStyle(element, 'marginTop') as string)
  const bottom = Number.parseFloat(
    computedStyle(element, 'marginBottom') as string
  )
  return top + bottom
}

export function height(element: Element) {
  return (
    Number.parseFloat(computedStyle(element, 'height') as string) +
    marginHeight(element)
  )
}

export function parseHostname(url: string) {
  const a = document.createElement('a')
  a.setAttribute('href', url)
  return a.hostname
}

export function createTemplate(content: string, css: string) {
  const html = `<style>${css}</style>${content}`
  const template = document.createElement('template')
  template.innerHTML = html
  return template
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function defineElement(name: string, Class: any) {
  const template = createTemplate(Class.template, Class.css)
  window.ShadyCSS.prepareTemplate(template, name)

  Class.compiledTemplate =
    Class.compiledTemplate || hogan.compile(Class.template)
  // @ts-ignore
  if (window.WebComponents.ready) {
    if (!window.customElements.get(name)) {
      window.customElements.define(name, Class)
    }
  } else {
    window.addEventListener('WebComponentsReady', function () {
      if (!window.customElements.get(name)) {
        window.customElements.define(name, Class)
      }
    })
  }
}
