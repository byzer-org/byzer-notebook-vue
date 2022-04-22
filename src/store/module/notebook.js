import * as types from '../type'
import { notebook } from '../../service'
import _ from 'lodash'
export default {
  state: {
    notebookList: [],
    openedNotebooks: [],
    notebookDirList: [],
    activeNotebook: undefined,
    demoList: [],
    logMessageList: {},
    resultList: {},
    activeSidebar: 'notebook',
    showSideBar: true,
    isRunningAll: false,
    showProgress: false
  },
  mutations: {
    [types.CHANGE_RUN_ALL]: (state, payload) => {
      state.isRunningAll = payload
    },
    [types.CHANGE_SHOW_PROGRESS]: (state, payload) => {
      state.showProgress = payload
    },
    [types.SET_NOTEBOOK_LIST]: (state, data) => {
      state.notebookList = data
    },
    [types.SET_OPENED_NOTEBOOK]: (state, data) => {
      state.openedNotebooks = data
    },
    [types.SET_ACTIVE_NOTEBOOK]: (state, data) => {
      state.activeNotebook = data
    },
    [types.SET_DEMO_LIST]: (state, data) => {
      state.demoList = data
    },
    [types.SET_LOADED_CELL_LIST]: (state, { name, notebookId, cellId }) => {
      if (state[name][notebookId]) {
        state[name][notebookId].push(cellId)
      } else {
        state[name] = Object.assign({}, state[name], {
          [notebookId]: [cellId]
        })
      }
    },
    [types.RESET_LOADED_CELL_LIST]: state => {
      state.logMessageList = []
      state.resultList = []
    },
    [types.REMOVE_LOADED_CELL_LIST]: (state, { name, notebookId, cellIdList }) => {
      if (!state[name][notebookId]) {
        return
      }
      state[name][notebookId] = state[name][notebookId].filter(i => !cellIdList.includes(i))
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
    [types.HANDLE_EXCUTE_CELL]: (_, payload) => {
      return notebook.excuteCode(payload)
    },
    [types.CANCEL_EXCUTE_CELL]: (_, payload) => {
      return notebook.cancelExcuteCell(payload)
    },
    [types.GET_JOB_STATUS]: (_, payload) => {
      return notebook.getJobStatus(payload)
    },
    [types.HADNLE_DELETE_CELL]: ({state, commit}, payload) => {
      const newList = state.cellList.filter(v => v.id !== payload.id)
      commit('CHANGE_CELL_LIST', newList)
    },
    [types.HANDLE_ADD_CELL]: ({state, commit}, payload) => {
      let newList = [];
      const { id, type } = payload;
      const index = state.cellList.findIndex(v => v.id === id)
      const insertIndex = type === 'add-below' ? index + 1 : index
      newList = _.cloneDeep(state.cellList);
      newList.splice(insertIndex, 0, { key: Date.now(), value: '' })
      commit('CHANGE_CELL_LIST', newList)
    },
    [types.GET_NOTEBOOK_LIST]: (_, payload) => {
      return notebook.getNotebookList(payload)
    },
    [types.CREATE_NOTEBOOK_LIST]: (_, payload) => {
      return notebook.createNotebook(payload)
    },
    [types.RENAME_NOTEBOOK]: (_, payload) => {
      return notebook.renameNotebook(payload)
    },
    [types.CLONE_NOTEBOOK]: (_, payload) => {
      return notebook.cloneNotebook(payload)
    },
    [types.DEL_NOTEBOOK]: (_, payload) => {
      return notebook.delNotebook(payload)
    },
    [types.SAVE_NOTEBOOK]: (_, payload) => {
      return notebook.saveNotebookById(payload)
    },
    [types.GET_NOTEBOOK_BY_ID]: (_, { id, commit_id }) => {
      return notebook.getNotebookById(id, commit_id)
    },
    [types.GET_CURRENT_SCRIPT]: (_, id) => {
      return notebook.getCurrentScript(id)
    },
    [types.CREATE_CELL]: (_, payload) => {
      return notebook.createCell(payload)
    },
    [types.DELETE_CELL]: (_, payload) => {
      return notebook.deleteCell(payload)
    },
    [types.SAVE_OPEND_NOTEBOOK]: (_, payload) => {
      return notebook.saveOpenedNotebook(payload)
    },
    [types.GET_OPENED_NOTEBOOK]: () => {
      return notebook.getOpenedNotebook()
    },
    [types.MOVE_NOTEBOOK]: (_, payload) => {
      return notebook.moveNotebook(payload)
    },
    [types.CREATE_FOLDER]: (_, payload) => {
      return notebook.createFolder(payload)
    },
    [types.MOVE_FOLDER]: (_, payload) => {
      return notebook.moveFolder(payload)
    },
    [types.DELETE_FOLDER]: (_, id) => {
      return notebook.deleteFolder(id)
    },
    [types.RENAME_FOLDER]: (_, payload) => {
      return notebook.renameFolder(payload)
    },
    [types.CLONE_FOLDER]: (_, payload) => {
      return notebook.cloneFolder(payload)
    },
    [types.IMPORT_NOTEBOOK]: (_, payload) => {
      return notebook.importNotebook(payload)
    },
    [types.EXPORT_NOTEBOOK]: (_, payload) => {
      return notebook.exportNotebook(payload)
    },
    [types.GET_DEFAULT_NOTEBOOK]: () => {
      return notebook.getDefaultNotebook()
    },
    [types.CLEAR_RESULT]: (_, id) => {
      return notebook.clearAllResults(id)
    },
    [types.AUTO_COMPLETE]: (_, payload) => {
      return notebook.autoComplete(payload)
    },
    [types.SET_DEMO]: (_, payload) => {
      return notebook.setDemo(payload)
    },
    [types.OFFLINE_DEMO]: (_, payload) => {
      return notebook.offlineDemo(payload)
    }
  },
  getters: {
    isDemo: state => {
      const { activeNotebook = {}, demoList } = state
      const { id = '', commit_id = '' } = (activeNotebook || {})
      return Boolean(demoList.includes(id) && commit_id)
    }
  }
}

