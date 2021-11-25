
import * as types from '../type'
import { global } from '../../service'
import { getGlobalLang } from '../../util'
export default {
  state: {
    is_trial: true,
    lang: getGlobalLang()
  },
  mutations: {
    [types.SET_CURRENT_ENV]: (state, data) => {
      state.is_trial = data
    },
    [types.CHANGE_LANG]: (state, data) => {
      state.lang = data
      localStorage.setItem('lang', data)
    }
  },
  actions: {
    [types.GET_ENV]: () => {
      return global.getEnv()
    }
  }
}