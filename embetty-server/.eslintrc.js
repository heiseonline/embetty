module.exports = {
  extends: '@embetty',
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  rules: {
    'toplevel/no-toplevel-side-effect': 'off',
  },
}
