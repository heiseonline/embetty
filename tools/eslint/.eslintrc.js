module.exports = {
  extends: ['@heise'],
  root: false,
  parserOptions: {
    // allowAutomaticSingleRunInference: true,
    project: ['./tsconfig.json'],
  },
  rules: {
    'prettier/prettier': 'off',
    yoda: ['error', 'never'],
    'react/react-in-jsx-scope': 'off',
    'node/no-missing-import': 'off',
    'no-return-await': 'error',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/no-array-method-this-argument': 'off',
    'unicorn/consistent-destructuring': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
  },
  overrides: [
    {
      files: ['jest.config.ts', 'jest.config.*.ts'],
      rules: {
        'node/no-extraneous-import': 'off',
        'node/no-unpublished-import': 'off',
      },
    },
    {
      files: ['webpack*.js'],
      rules: {
        '@typescript-eslint/no-unsafe-call': 'off',
        'node/no-extraneous-require': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.test.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.e2e.ts', '*.test.ts'],
      rules: {
        'node/no-unpublished-import': 'off',
      },
    },
  ],
}
