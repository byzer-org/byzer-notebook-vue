

import { actionsTypes } from '../../store'

export function getInitState () {
  return {
    isShow: false,
    failureDetail: {}
  }
}

export default {
  namespaced: true,
  state: getInitState(),
  mutations: {
    [actionsTypes.SET_FAILURE_DETAIL]: (state, payload = {}) => {
      state.failureDetail = payload
    },
    [actionsTypes.SHOW_MODAL]: state => {
      state.isShow = true
    },
    [actionsTypes.HIDE_MODAL]: state => {
      state.isShow = false
    },
    [actionsTypes.RESET_MODAL]: state => {
      for (const [key, value] of Object.entries(getInitState())) {
        state[key] = value
      }
    }
  },
  actions: {
    [actionsTypes.CALL_MODAL] ({ commit }, payload) {
      return new Promise(() => {
        commit(actionsTypes.SET_FAILURE_DETAIL, payload)
        commit(actionsTypes.SHOW_MODAL)
      })
    }
  }
}
