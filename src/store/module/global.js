
import * as types from '../type'
import { global } from '../../service'
export default {
  state: {
    is_trial: true
  },
  mutations: {
    [types.SET_CURRENT_ENV]: (state, data) => {
      state.is_trial = data
    }
  },
  actions: {
    [types.GET_ENV]: () => {
      return global.getEnv()
    }
  }
}