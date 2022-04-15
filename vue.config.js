const path = require('path')
const fs = require('fs');
const FileManagerPlugin = require('filemanager-webpack-plugin')

function resolvePath (dir) {
  return path.resolve(__dirname, '.', dir)
}
function getCompressionName () {
  try {
    const projectName = JSON.parse(fs.readFileSync('package.json')).name;
    const projectVersion = JSON.parse(fs.readFileSync('package.json')).version;
    return `./build/${projectName}-${projectVersion}.tar.gz`;
  } catch (e) {
    return './build/dist.tar.gz';
  }
}
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  lintOnSave: true,
  publicPath: process.env.BASE_URL,
  assetsDir: 'static', // 配置js、css静态资源二级目录的位置
  devServer: {
    port: 9090,
    proxy: process.env.PROXY_SERVER
  },
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'dev' ? 'eval-source-map' : undefined,
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.common.js'
      }
    }
  },
  chainWebpack: config => {
    const oneOfsMap = config.module.rule('scss').oneOfs.store;
    oneOfsMap.forEach(item => {
      item
        .use('style-resources-loader')
        .loader('style-resources-loader')
        .options({
          patterns: './src/assets/css/variable.scss'
        })
        .end()
    })
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
        args[0].title = 'Byzer Notebook'
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
    if (isProd) {
      config.plugin('filemanager')
      .use(
        new FileManagerPlugin({
          events: {
            onEnd: [{
              delete: [ getCompressionName() ],
              archive: [
                { source: './dist', format: 'tar', destination: getCompressionName()}
              ]
            }]
          }
        })
      )
    }
  }
}
