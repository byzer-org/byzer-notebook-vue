import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import i18n from './locale'
import 'normalize.css'
import './assets/iconfont/iconfont.css'
import '../theme/index.css'
import './assets/css/index.scss'
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)
import keymaster from 'keymaster'
import Contextmenu from 'vue-contextmenujs'
Vue.use(Contextmenu);
// import directive from './directives'
import { findChildren } from './util'
import '@/icons/index.js'
import IconBtn from './components/IconBtn'
import editor from 'vue2-ace-editor'
import 'brace/theme/chrome'
import 'brace/mode/javascript'
import 'brace/snippets/sql'
import 'brace/snippets/python'
import 'brace/mode/python'
import 'brace/ext/language_tools'
import './config/editor_highlight'

Vue.component('editor', editor)
Vue.component('icon-btn', IconBtn)

const bindKeyHandler = fn => {
  return () => {
    fn()
    return false
  }
}
keymaster.filter = event => {
  var tagName = (event.target || event.srcElement).tagName

  // 所有的FindAndReplace组件
  const result = findChildren(window.NotebookVue, 'findAndReplace')
  // 是否没有打开的
  const workStatus = result && result.every(i => !i.showMsg)

  return !['INPUT', 'SELECT'].includes(tagName) && workStatus && !store.getters.isDemo
}
export const shortcut = {
  bind: (seed, func) => keymaster(seed, bindKeyHandler(func)),
  ...keymaster
}

Vue.prototype.$shortcut = shortcut

Vue.config.productionTip = false
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
})

window.NotebookVue = new Vue({
  render: h => h(App),
  router,
  store,
  i18n
}).$mount('#app')
