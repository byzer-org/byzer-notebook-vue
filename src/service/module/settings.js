


import axios from '../handleService'

export default {
  getDefaultConfig: () => axios.get('/api/settings/configuration'),
  getEngineList: () => axios.get('/api/settings/engines'),
  saveConfig: params => axios.put('/api/settings/configuration', params),
  resetTimout: () => axios.post('/api/settings/configuration/reset'),
  checkConnection: payload => axios.post('/api/settings/connection/test', payload),
  createConnect: payload => axios.post('/api/settings/connection', payload),
  getConnectionList: payload => axios.get(`/api/settings/connection${payload}`),
  getExistingTableList: connectionId => axios.get(`/api/settings/connection/${connectionId}/table`),
  updateConnection: (connectionId, data) => axios.put(`/api/settings/connection/${connectionId}`, data),
  deleteConnection: connectionId => axios.delete(`/api/settings/connection/${connectionId}`),
  getAlgorithmList: () => axios.get('/api/settings/node/def?node_type=train'),
  getParamsByAlgorithmId: id => axios.get(`/api/settings/node/def/${id}`),
  getEngineInfo: payload => axios.get(`/api/engine/status${payload}`)
}