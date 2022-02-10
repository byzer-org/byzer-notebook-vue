
import axios from '../handleService'
export default {
  createWorkflow: data => axios.post('/api/workflow', data),
  createWorkflowNode: (workflow_id, data) => axios.post(`/api/workflow/${workflow_id}/node`, data),
  getNodeList: (workflow_id, commit_id) => axios.get(`/api/workflow/${workflow_id}${commit_id ? '?commit_id=' + commit_id : ''}`),
  getWorkflowPreview: (workflow_id, commit_id) => axios.get(`/api/workflow/${workflow_id}/script${commit_id ? '?commit_id=' + commit_id : ''}`),
  saveAsNotebook: (workflow_id, data) => axios.post(`/api/workflow/${workflow_id}/notebook`, data),
  checkMlsql: data => axios.post('/api/sql/validation', data),
  getNodeInfo: (workflow_id, node_id) => axios.get(`/api/workflow/${workflow_id}/node/${node_id}`),
  updateFlowNode: (workflow_id, node_id, data) => axios.put(`/api/workflow/${workflow_id}/node/${node_id}`, data),
  getExsitingTable: workflow_id => axios.get(`/api/workflow/${workflow_id}/output`),
  getExsitingModel: id => axios.get(`/api/workflow${id ? ('/' + id) : ''}/model`),
  updateNodePosition: (workflow_id, node_id, data) => axios.put(`/api/workflow/${workflow_id}/node/${node_id}/position`, data),
  deleteWorkflowNode: (workflow_id, node_id) => axios.delete(`/api/workflow/${workflow_id}/node/${node_id}`),
  getLoadParams: ({node_type, node_name, param_name}) => axios.get(`/api/settings/node/param?node_type=${node_type}&node_name=${node_name}&param_name=${param_name}`),
  getETList: () => axios.get('/api/et'),
  getETParams: et_id => axios.get(`/api/et/${et_id}/params`),
  getETDependency: data => axios.post('/api/et/dependency', data)
}
