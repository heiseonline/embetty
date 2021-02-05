import hogan from 'hogan.js'

export function wait(ms = undefined) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function computedStyle(element, key) {
  return window.getComputedStyle(element)[key]
}

export function marginHeight(element) {
  const top = parseFloat(computedStyle(element, 'margin-top'))
  const bottom = parseFloat(computedStyle(element, 'margin-bottom'))
  return top + bottom
}

export function height(element) {
  return parseFloat(computedStyle(element, 'height')) + marginHeight(element)
}

export function parseHostname(url) {
  const a = document.createElement('a')
  a.setAttribute('href', url)
  return a.hostname
}

export function createTemplate(content, css) {
  const html = `<style>${css}</style>${content}`
  const template = document.createElement('template')
  template.innerHTML = html
  return template
}

export function defineElement(name, Class) {
  const template = createTemplate(Class.template, Class.css)
  window.ShadyCSS.prepareTemplate(template, name)

  Class.compiledTemplate =
    Class.compiledTemplate || hogan.compile(Class.template)

  if (window.WebComponents?.ready) {
    window.customElements.define(name, Class)
  } else {
    window.addEventListener('WebComponentsReady', function() {
      window.customElements.define(name, Class)
    })
  }
}
