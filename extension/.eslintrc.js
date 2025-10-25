module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // 代码质量规则
    'no-unused-vars': ['error', {
      'vars': 'all',
      'args': 'after-used',
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_'
    }],
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',

    // 最佳实践规则
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'default-case': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // 变量声明规则
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',

    // 代码风格规则
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always'
    }],

    // 扩展API特定规则
    'no-undef': 'error'
  },
  globals: {
    // Chrome扩展API
    chrome: 'readonly',
    browser: 'readonly',

    // 常见的全局变量
    document: 'readonly',
    window: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',

    // ES6+ 全局变量
    Promise: 'readonly',
    Map: 'readonly',
    Set: 'readonly',
    WeakMap: 'readonly',
    WeakSet: 'readonly'
  }
};