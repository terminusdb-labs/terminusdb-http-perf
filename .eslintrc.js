module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    'standard',
  ],
  globals: {
    __ITER: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
  },
}
