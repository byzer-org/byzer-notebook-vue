
import * as types from '../type'
import { datacatalog } from '../../service'
export default {
  state: {},
  mutations: {},
  actions: {
    [types.GET_DB_LIST]: (_, payload) => {
      return datacatalog.getDBList(payload)
    },
    [types.GET_TABLE_LIST]: (_, payload) => {
      return datacatalog.getTableList(payload)
    },
    [types.UPLOAD_SYSTEM_FILE]: (_, payload) => {
      return datacatalog.uploadFile(payload)
    },
    [types.GET_FILE_LIST]: (_, payload) => {
      return datacatalog.getFileList(payload)
    },
    [types.DELETE_UPLOAD_FILE]: (_, payload) => {
      return datacatalog.deleteUploadFile(payload)
    }
  }
}