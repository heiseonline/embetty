// Stylesheets are bundled to CSS text (see css-plugin.ts), for shadow roots.
declare module '*.css' {
  const css: string
  export default css
}

declare module '*.svg' {
  const markup: string
  export default markup
}
