

import { actionsTypes } from '../../store'

export function getInitState () {
  return {
    isShow: false,
    taskInfo: {},
    form: {
      taskName: '',
      taskDescription: '',
      scheduleName: '',
      previousTask: null
    },
    callback: () => { }
  }
}

export default {
  namespaced: true,
  state: getInitState(),
  mutations: {
    [actionsTypes.SET_TASK_INFO]: (state, payload) => {
      for (const [key, value] of Object.entries(payload || {})) {
        state[key] = value
      }
    },
    [actionsTypes.SHOW_MODAL]: state => {
      state.isShow = true
    },
    [actionsTypes.HIDE_MODAL]: state => {
      state.isShow = false
    }
  },
  actions: {
    [actionsTypes.CALL_MODAL] ({ commit }, payload) {
      return new Promise(resolve => {
        commit(actionsTypes.SET_TASK_INFO, { callback: resolve, ...payload })
        commit(actionsTypes.SHOW_MODAL)
      })
    }
  }
}
