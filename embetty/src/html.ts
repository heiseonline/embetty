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
