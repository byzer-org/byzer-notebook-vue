

import * as types from '../type'

export default {
  state: {
  },
  mutations: {
    [types.HIDE_ALL_MODALS]: state => {
      for (const [, modalState] of Object.entries(state)) {
        if (modalState.isShow) {
          modalState.isShow = false
        }
      }
    }
  },
  actions: {
  }
}
