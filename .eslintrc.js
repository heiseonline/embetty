module.exports = {
  root: true,
  extends: '@heise',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: __dirname
  },
  env: {
    browser: true
  },
  rules: {
   ' no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn',
  },
  overrides: [
    {
     files: ['test/*.ts', '**/*.test.ts', '*.js'],
        rules: {
          'toplevel/no-toplevel-side-effect': 'off',
          'no-magic-numbers': 'off'
        }
    }
  ]
}
