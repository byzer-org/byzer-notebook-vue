module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaFeatures: {
      "legacyDecorators": true
    }
  },
  rules: {
    'generator-star-spacing': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': ['off', 'always'],
    'eqeqeq': 2,
    'spaced-comment': 2,
    'keyword-spacing': 2,
    'space-before-function-paren': 2,
    'quotes': [2, 'single'],
    'comma-dangle': 2,
    'no-useless-escape': 'off',
    'arrow-spacing': 0,
    'arrow-parens': ['error', 'as-needed']
  }
}
