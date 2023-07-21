import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import zh from './zh.json'
import en from './en.json'
import { getGlobalLang } from '@/util'

Vue.use(VueI18n)

const messages = {
  en: {
    ...en,
    ...enLocale
  },
  zh: {
    ...zh,
    ...zhLocale
  }
}

const i18n =  new VueI18n({
  locale: getGlobalLang(),
  messages,
  silentFallbackWarn: true
})

Vue.mixin({i18n})

export default i18n
