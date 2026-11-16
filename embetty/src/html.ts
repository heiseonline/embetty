// Markup for the shadow roots. Interpolated values are escaped unless they
// are already Html, so markup only comes from templates and from raw(),
// which marks a string as trusted.

export class Html {
  constructor(readonly value: string) {}

  toString() {
    return this.value
  }
}

const EMPTY = new Html('')

const ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export const escapeHtml = (value: string): string =>
  value.replaceAll(/[&<>"']/g, (char) => ENTITIES[char] ?? char)

type Interpolation = Html | string | number | null | undefined

const interpolate = (value: Interpolation): string => {
  if (value instanceof Html) {
    return value.value
  }
  return value === undefined || value === null ? '' : escapeHtml(String(value))
}

// Not named `html`: formatters would reformat the markup inside.
export const markup = (
  strings: TemplateStringsArray,
  ...values: readonly Interpolation[]
): Html =>
  new Html(
    strings.reduce(
      (out, string, index) => out + interpolate(values[index - 1]) + string,
    ),
  )

export const raw = (value: string | undefined): Html => new Html(value ?? '')

// A Mustache section: renders only for truthy values, which it passes on.
export const when = <T>(
  value: T | false | 0 | '' | null | undefined,
  render: (value: T) => Html,
): Html => (value ? render(value) : EMPTY)

export const each = <T>(items: readonly T[], render: (item: T) => Html): Html =>
  new Html(items.map((item) => render(item).value).join(''))

const WEB_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:'])

/** Only http(s) URLs may end up in a link; anything else could run script. */
export function safeUrl(url: string | null | undefined): string {
  if (!url) {
    return '#'
  }
  try {
    return WEB_PROTOCOLS.has(new URL(url).protocol) ? url : '#'
  } catch {
    return '#'
  }
}

// What Mastodon-compatible servers put into a status. Mastodon sanitizes
// its own statuses, but embeds may come from any server.
const ALLOWED_ATTRIBUTES: Readonly<Record<string, ReadonlySet<string>>> = {
  A: new Set(['href', 'class', 'rel', 'target', 'translate']),
  SPAN: new Set(['class', 'translate']),
  P: new Set(),
  BR: new Set(),
  B: new Set(),
  STRONG: new Set(),
  I: new Set(),
  EM: new Set(),
  U: new Set(),
  S: new Set(),
  DEL: new Set(),
  CODE: new Set(),
  PRE: new Set(),
  BLOCKQUOTE: new Set(),
  UL: new Set(),
  OL: new Set(),
  LI: new Set(),
}

// Removed with their content; other unknown elements are unwrapped.
const DROPPED_ELEMENTS: ReadonlySet<string> = new Set([
  'SCRIPT',
  'STYLE',
  'TEMPLATE',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'NOSCRIPT',
  'SVG',
  'MATH',
  'TEXTAREA',
  'SELECT',
  'TITLE',
])

function sanitizeElement(element: Element): void {
  const allowed = ALLOWED_ATTRIBUTES[element.tagName]
  for (const { name } of Array.from(element.attributes)) {
    if (!allowed?.has(name)) {
      element.removeAttribute(name)
    }
  }

  if (element.tagName === 'A') {
    element.setAttribute('href', safeUrl(element.getAttribute('href')))
    if (element.hasAttribute('target')) {
      element.setAttribute('target', '_blank')
      if (!/\bnoopener\b/.test(element.getAttribute('rel') ?? '')) {
        element.setAttribute(
          'rel',
          `${element.getAttribute('rel') ?? ''} noopener`.trim(),
        )
      }
    }
  }
}

function sanitizeChildren(parent: ParentNode): void {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      continue
    }
    if (!(node instanceof Element) || DROPPED_ELEMENTS.has(node.tagName)) {
      node.remove()
      continue
    }

    sanitizeChildren(node)
    if (node.tagName in ALLOWED_ATTRIBUTES) {
      sanitizeElement(node)
    } else {
      node.replaceWith(...Array.from(node.childNodes))
    }
  }
}

/**
 * Keeps the formatting of untrusted HTML and drops everything that could
 * run script. Parsed in a <template>, so nothing loads or runs meanwhile.
 */
export function sanitizeHtml(html: string | undefined): Html {
  const template = document.createElement('template')
  template.innerHTML = html ?? ''
  sanitizeChildren(template.content)
  return new Html(template.innerHTML)
}
