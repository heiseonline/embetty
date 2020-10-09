module.exports = {
  root: true,
  extends: ['@heise'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    mocha: true,
  },
  rules: {
    'toplevel/no-toplevel-side-effect': 'off',
    'unicorn/no-null': 'off',
    'no-prototype-builtins': 'warn',
  },
  overrides: [
    {
      files: ['*.test.js', '**/test/*.js'],
      rules: {
        'sonarjs/no-duplicate-string': 'off'
      },
    }
  ],
}
