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
  const top = Number.parseFloat(computedStyle(element, 'marginTop'))
  const bottom = Number.parseFloat(computedStyle(element, 'marginBottom'))
  return top + bottom
}

export function height(element: Element) {
  return (
    Number.parseFloat(computedStyle(element, 'height')) + marginHeight(element)
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

export function defineElement(name: string, Class: any) {
  const template = createTemplate(Class.template, Class.css)
  window.ShadyCSS.prepareTemplate(template, name)

  Class.compiledTemplate =
    Class.compiledTemplate || hogan.compile(Class.template)
  window.addEventListener('WebComponentsReady', function () {
    window.customElements.define(name, Class)
  })
}
