/*

*/

import * as types from '../type'
import { settings } from '../../service'
export default {
  state: {
    isRunningAll: false
  },
  mutations: {},
  actions: {
    [types.GET_CONFIGS]: () => {
      return settings.getDefaultConfig()
    },
    [types.GET_ENGINE_LIST]: () => {
      return settings.getEngineList()
    },
    [types.SAVE_CONFIG]: ({}, payload) => {
      return settings.saveConfig(payload)
    },
    [types.RESET_TIMEOUT]: () => {
      return settings.resetTimout()
    },
    [types.CHECK_CONNECTION]: ({}, payload) => {
      return settings.checkConnection(payload)
    },
    [types.CREATE_CONNECTION]: ({}, payload) => {
      return settings.createConnect(payload)
    },
    [types.GET_CONNECTION_LIST]: () => {
      return settings.getConnectionList()
    },
    [types.GET_CONNECTION_TABLE]: ({}, connectionId) => {
      return settings.getExistingTableList(connectionId)
    },
    [types.UPDATE_CONNECTION]: ({}, { connectionId, data }) => {
      return settings.updateConnection(connectionId, data)
    },
    [types.DELETE_CONNECTION]: ({}, connectionId) => {
      return settings.deleteConnection(connectionId)
    },
    [types.GET_ALGORITHM_LIST]: () => {
      return settings.getAlgorithmList()
    },
    [types.GET_PARAM_BY_ID]: ({}, id) => {
      return settings.getParamsByAlgorithmId(id)
    }
  }
}