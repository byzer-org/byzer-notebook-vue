

import { actionsTypes } from '../../store'

export function getInitState () {
  return {
    isShow: false,
    form: {
      // id: '',
      name: ''
    },
    targetfolderId: '',
    callback: () => {}
  }
}

export default {
  namespaced: true,
  state: getInitState(),
  mutations: {
    [actionsTypes.SET_MODAL]: (state, payload = {}) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = value
      }
    },
    [actionsTypes.SET_MODAL_FORM]: (state, payload = {}) => {
      for (const key of Object.keys(state.form)) {
        state.form[key] = payload[key] !== undefined ? payload[key] : state.form[key]
      }
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
    },
    [actionsTypes.RESET_MODAL_FORM]: state => {
      for (const [key, value] of Object.entries(getInitState().form)) {
        state.form[key] = value
      }
    }
  },
  actions: {
    [actionsTypes.CALL_MODAL] ({ commit }, payload) {
      return new Promise(resolve => {
        commit(actionsTypes.SET_MODAL, { callback: resolve })
        commit(actionsTypes.SET_MODAL, { ...payload })
        commit(actionsTypes.SHOW_MODAL)
      })
    }
  }
}
