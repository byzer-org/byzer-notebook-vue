import * as types from '../type'
import { workflow } from '@/service'
export default {
  state: {
    currentDragNode: null,
    nodeList: []
  },
  mutations: {
    [types.SET_CURRENT_DRAG_NODE]: (state, payload) => {
      state.currentDragNode = payload
    },
    [types.SET_NODE_LIST]: (state, payload) => {
      state.nodeList = payload
    }
  },
  actions: {
    [types.CREATE_WORKFLOW]: (_, payload) => {
      return workflow.createWorkflow(payload)
    },
    [types.CREATE_WORKFLOW_NODE]: ({ getters }, payload) => {
      return workflow.createWorkflowNode(getters.activeNotebookId, payload)
    },
    [types.DELETE_WORKFLOW_NODE]: ({getters}, node_id) => {
      return workflow.deleteWorkflowNode(getters.activeNotebookId, node_id)
    },
    [types.GET_NODE_LIST]: (_, { workflow_id, commit_id }) => {
      return workflow.getNodeList(workflow_id, commit_id)
    },
    [types.GET_WORKFLOW_PREVIEW]: (_, { workflow_id, commit_id }) => {
      return workflow.getWorkflowPreview(workflow_id, commit_id)
    },
    [types.SAVE_WORKFLOW_AS_NOTEBOOK]: ({ getters }, payload) => {
      return workflow.saveAsNotebook(getters.activeNotebookId, payload)
    },
    [types.CHECK_MLSQL]: (_, payload) => {
      return workflow.checkMlsql(payload)
    },
    [types.GET_NODE_INFO]: ({ getters }, { node_id }) => {
      return workflow.getNodeInfo(getters.activeNotebookId, node_id)
    },
    [types.UPDATE_FLOW_NODE]: ({ getters }, { node_id, data }) => {
      return workflow.updateFlowNode(getters.activeNotebookId, node_id, data)
    },
    [types.GET_EXISTING_TABLE]: ({ getters }) => {
      return workflow.getExsitingTable(getters.activeNotebookId)
    },
    [types.GET_EXISTING_MODEL]: (_, id) => {
      return workflow.getExsitingModel(id)
    },
    [types.UPDATE_NODE_POSITION]: (_, { workflow_id, node_id, data }) => {
      return workflow.updateNodePosition(workflow_id, node_id, data)
    },
    [types.GET_LOAD_PARAMS]: (_, payload) => {
      return workflow.getLoadParams(payload)
    },
    [types.GET_ET_LIST]: () => {
      return workflow.getETList()
    },
    [types.GET_ET_PARAMS]: (_, id) => {
      return workflow.getETParams(id)
    },
    [types.GET_ET_DEPENENCY]: (_, payload) => {
      return workflow.getETDependency(payload)
    }
  },
  getters: {
    activeNotebookId: (state, getters, rootState) => {
      return rootState.notebook.activeNotebook?.id
    }
  }
}
