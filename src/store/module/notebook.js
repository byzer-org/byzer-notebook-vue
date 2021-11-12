/*

*/

import * as types from '../type'
import { notebook } from '../../service'
import _ from 'lodash'
export default {
  state: {
    notebookList: [],
    openedNotebooks: [],
    notebookDirList: [],
    activeNotebook: null,
    activeSidebar: 'notebook',
    showSideBar: true
  },
  mutations: {
    [types.SET_NOTEBOOK_LIST]: (state, data) => {
      state.notebookList = data
    },
    [types.SET_OPENED_NOTEBOOK]: (state, data) => {
      state.openedNotebooks = data
    },
    [types.SET_ACTIVE_NOTEBOOK]: (state, data) => {
      state.activeNotebook = data
    },
    [types.CHANGE_ACTIVE_SIDEBAR]: (state, data) => {
      state.activeSidebar = data
    },
    [types.CHANGE_SIDE_BAR_VISIBLE]: (state, data) => {
      state.showSideBar = data
    },
    [types.CHANGE_NOTEBOOK_MODE]: (state, { notebookId, type, mode }) => {
      const index = state.openedNotebooks.findIndex(v => v.id === notebookId && v.type === type)
      const temp = [...state.openedNotebooks]
      temp[index].mode = mode
      state.openedNotebooks = temp
    }
  },
  actions: {
    [types.HANDLE_EXCUTE_CELL]: ({}, payload) => {
      return notebook.excuteCode(payload)
    },
    [types.CANCEL_EXCUTE_CELL]: ({}, payload) => {
      return notebook.cancelExcuteCell(payload)
    },
    [types.GET_JOB_STATUS]: ({}, payload) => {
      return notebook.getJobStatus(payload)
    },
    [types.HADNLE_DELETE_CELL]: ({state, commit}, payload) => {
      const newList = state.cellList.filter((v) => v.id !== payload.id);
      commit('CHANGE_CELL_LIST', newList)
    },
    [types.HANDLE_ADD_CELL]: ({state, commit}, payload) => {
      let newList = [];
      const { id, type } = payload;
      const index = state.cellList.findIndex((v) => v.id === id);
      const insertIndex = type === 'add-below' ? index + 1 : index;
      newList = _.cloneDeep(state.cellList);
      newList.splice(insertIndex, 0, { key: Date.now(), value: '' });
      commit('CHANGE_CELL_LIST', newList)
    },
    [types.GET_NOTEBOOK_LIST]: ({ commit }, payload) => {
      return notebook.getNotebookList(payload)
    },
    [types.CREATE_NOTEBOOK_LIST]: ({ commit }, payload) => {
      return notebook.createNotebook(payload)
    },
    [types.RENAME_NOTEBOOK]: ({ commit }, payload) => {
      return notebook.renameNotebook(payload)
    },
    [types.CLONE_NOTEBOOK]: ({ commit }, payload) => {
      return notebook.cloneNotebook(payload)
    },
    [types.DEL_NOTEBOOK]: ({ commit }, payload) => {
      return notebook.delNotebook(payload)
    },
    [types.SAVE_NOTEBOOK]: ({ commit }, payload) => {
      return notebook.saveNotebookById(payload)
    },
    [types.GET_NOTEBOOK_BY_ID]: ({ commit }, { id }) => {
      return notebook.getNotebookById(id)
    },
    [types.GET_CURRENT_SCRIPT]: ({ commit }, id) => {
      return notebook.getCurrentScript(id)
    },
    [types.CREATE_CELL]: ({ commit }, payload) => {
      return notebook.createCell(payload)
    },
    [types.DELETE_CELL]: ({ commit }, payload) => {
      return notebook.deleteCell(payload)
    },
    [types.SAVE_OPEND_NOTEBOOK]: ({ commit }, payload) => {
      return notebook.saveOpenedNotebook(payload)
    },
    [types.GET_OPENED_NOTEBOOK]: () => {
      return notebook.getOpenedNotebook()
    },
    [types.MOVE_NOTEBOOK]: ({ commit }, payload) => {
      return notebook.moveNotebook(payload)
    },
    [types.CREATE_FOLDER]: ({}, payload) => {
      return notebook.createFolder(payload)
    },
    [types.MOVE_FOLDER]: ({}, payload) => {
      return notebook.moveFolder(payload)
    },
    [types.DELETE_FOLDER]: ({}, id) => {
      return notebook.deleteFolder(id)
    },
    [types.RENAME_FOLDER]: ({}, payload) => {
      return notebook.renameFolder(payload)
    },
    [types.CLONE_FOLDER]: ({}, payload) => {
      return notebook.cloneFolder(payload)
    },
    [types.IMPORT_NOTEBOOK]: ({}, payload) => {
      return notebook.importNotebook(payload)
    },
    [types.EXPORT_NOTEBOOK]: ({}, payload) => {
      return notebook.exportNotebook(payload)
    },
    [types.GET_DEFAULT_NOTEBOOK]: () => {
      return notebook.getDefaultNotebook()
    },
    [types.CLEAR_RESULT]: ({}, id) => {
      return notebook.clearAllResults(id)
    },
    [types.AUTO_COMPLETE]: ({}, payload) => {
      return notebook.autoComplete(payload)
    },
  }
}

