
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    ['@babel/preset-env', { 'modules': false }]
  ],
  env: {
    test: {
      presets: [['env', { targets: { node: 'current' } }]]
    }
  },
  'plugins': [
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    ['@babel/plugin-proposal-class-properties', { 'loose': false }],
    ['@babel/plugin-transform-runtime']
  ]
}
