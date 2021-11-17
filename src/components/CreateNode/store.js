

import { actionsTypes } from '../../store'

export function getInitState () {
  return {
    isShow: false,
    selectForm: {
      sql: ''
    },
    loadForm: {
      datasource_type: '',
      database: '',
      connection: '',
      source: '',
      target: '',
      header: 'true'
    },
    saveForm: {
      mode: 'overwrite',
      datasource_type: '',
      data_type: '',
      connection: '',
      source: '',
      target: ''
    },
    trainForm: {
      source: '',
      target: '',
      algorithm: '',
      save_path: '',
      train_param: null
    },
    registerForm: {
      target: '',
      group: '',
      deploy_mode_param: {
        url: '',
        access_token: ''
      }
    },
    predictForm: {
      source: '',
      model: '',
      predict_param: {
        auto: true, 
        value: ''
      },
      target: ''
    },
    form: null,
    nodeInfo: null,
    callback: () => {}
  }
}

export default {
  namespaced: true,
  state: getInitState(),
  mutations: {
    [actionsTypes.SET_MODAL]: (state, payload = {}) => {
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'form') {
          state['form'] = state[value]
        } else {
          state[key] = value
        }
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
      for (const [key, value] of Object.entries(getInitState()[`${state.nodeInfo.type}Form`])) {
        state.form[key] = value
      }
    }
  },
  actions: {
    [actionsTypes.CALL_MODAL] ({ commit }, { nodeInfo }) {
      return new Promise(resolve => {
        const { type } = nodeInfo
        commit(actionsTypes.SET_MODAL, { callback: resolve, form: `${type}Form` })
        // 初始化 form 中的数据
        commit(actionsTypes.SET_MODAL, { nodeInfo })
        
        commit(actionsTypes.SHOW_MODAL)
      })
    }
  }
}
