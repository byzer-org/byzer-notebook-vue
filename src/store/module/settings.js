import * as types from '../type'
import { settings } from '../../service'
export default {
  state: {
    isRunningAll: false,
    engineInfo: {}
  },
  mutations: {
    [types.SET_ENGINE_INFO]: (state, payload) => {
      state.engineInfo = payload
    }
  },
  actions: {
    [types.GET_CONFIGS]: () => {
      return settings.getDefaultConfig()
    },
    [types.GET_ENGINE_LIST]: () => {
      return settings.getEngineList()
    },
    [types.SAVE_CONFIG]: (_, payload) => {
      return settings.saveConfig(payload)
    },
    [types.RESET_TIMEOUT]: () => {
      return settings.resetTimout()
    },
    [types.CHECK_CONNECTION]: (_, payload) => {
      return settings.checkConnection(payload)
    },
    [types.CREATE_CONNECTION]: (_, payload) => {
      return settings.createConnect(payload)
    },
    [types.GET_CONNECTION_LIST]: (_, payload = '') => {
      return settings.getConnectionList(payload)
    },
    [types.GET_CONNECTION_TABLE]: (_, connectionId) => {
      return settings.getExistingTableList(connectionId)
    },
    [types.UPDATE_CONNECTION]: (_, { connectionId, data }) => {
      return settings.updateConnection(connectionId, data)
    },
    [types.DELETE_CONNECTION]: (_, connectionId) => {
      return settings.deleteConnection(connectionId)
    },
    [types.GET_ALGORITHM_LIST]: () => {
      return settings.getAlgorithmList()
    },
    [types.GET_PARAM_BY_ID]: (_, id) => {
      return settings.getParamsByAlgorithmId(id)
    },
    [types.GET_ENGINE_INFO]: async ({ commit }, payload = '') => {
      let res = {}
      try {
        res = await settings.getEngineInfo(payload)
        commit(types.SET_ENGINE_INFO, res.data)
      } catch (err) {
        console.log(err)
      }
      return res
    }
  }
}