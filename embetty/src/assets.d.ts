// Stylesheets compile to CSS text (see scss-plugin.ts), for shadow roots.
declare module '*.scss' {
  const css: string
  export default css
}

declare module '*.svg' {
  const markup: string
  export default markup
}
