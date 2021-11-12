const path = require('path')
function resolvePath(dir) {
  return path.resolve(__dirname, '.', dir)
}

module.exports = {
  lintOnSave: false,
  publicPath: process.env.BASE_URL,
  assetsDir: 'static', // 配置js、css静态资源二级目录的位置
  devServer: {
    port: 9090,
    proxy: process.env.PROXY_SERVER
  },
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.common.js',
      }
    }
  },
  chainWebpack: config => {
    // 定义组件中文案翻译
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@kazupon/vue-i18n-loader')
      .end()
    // 配置项目标题 
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Byzer'
        return args
      })
      .end()
    // 让其他svg loader不要对src/icons进行操作
    config.module
    .rule('svg')
    .exclude.add(resolvePath('src/icons/svg'))
    .end()
    // 使用svg-sprite-loader 对 src/icons下的svg进行操作
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolvePath('src/icons/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
}
