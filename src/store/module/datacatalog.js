/*

*/
import * as types from '../type'
import { datacatalog } from '../../service'
export default {
  state: {},
  mutations: {},
  actions: {
    [types.GET_DB_LIST]: ({ commit }, payload) => {
      return datacatalog.getDBList(payload)
    },
    [types.GET_TABLE_LIST]: ({ commit }, payload) => {
      return datacatalog.getTableList(payload)
    },
    [types.UPLOAD_SYSTEM_FILE]: ({ commit }, payload) => {
      return datacatalog.uploadFile(payload)
    },
    [types.GET_FILE_LIST]: ({ commit }, payload) => {
      return datacatalog.getFileList(payload)
    },
    [types.DELETE_UPLOAD_FILE]: ({}, payload) => {
      return datacatalog.deleteUploadFile(payload)
    }
  }
}