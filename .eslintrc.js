module.exports = {
  root: true,
  extends: '@heise',
  rules: {
    'toplevel/no-toplevel-side-effect': 'off',
    'no-prototype-builtins': 'off'
  },
  env: {
    node: true,
    mocha: true,
    es6: true
  }
}
