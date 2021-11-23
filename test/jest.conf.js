const path = require('path')

module.exports = {
  verbose: false,
  rootDir: path.resolve(__dirname, '../'),
  // 支持源代码中相同的 `@` -> `src` 别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/util/*.js',
    'src/components/**/*.{vue, js}',
    'src/page/**/*.{vue, js}',
    'src/router/**',
    '!src/store/**',
    '!src/service/**',
    '!src/locael/**',
    '!src/assets/**',
    '!src/config/**',
    '!**/node_modules/**'
  ],
  coverageReporters: ['html', 'text-summary'],
  testMatch: [
    '<rootDir>/src/**/__test__/**/*.spec.js',
    '<rootDir>/src/**/__test__/*.spec.js'
  ],
  coverageDirectory: './test/coverage'
}