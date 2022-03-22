


import axios from '../handleService'

export default {
  createNotebook: params => axios.post('/api/file', params),
  renameNotebook: params => axios.put('/api/file', params),
  cloneNotebook: params => axios.post('/api/file/clone', params),
  delNotebook: ({ id, type }) => axios.delete(`/api/file/${id}?type=${type}`),
  saveOpenedNotebook: list => axios.put('/api/files/opened', list),
  getOpenedNotebook: () => axios.get('/api/files/opened'),
  importNotebook: data => axios.post('/api/file/import', data, { headers: {
    'Content-Type': 'multipart/form-data'
  }}),
  moveNotebook: data => axios.post('/api/file/move', data),
  getNotebookList: () => axios.get('/api/files'),
  excuteCode: params => axios.post('/api/script/execution', params),
  getJobStatus: id => axios.get(`/api/job/${id}`),
  saveNotebookById: ({id, data}) => axios.put(`/api/notebook/${id}`, data),
  getNotebookById: (id, commit_id) => axios.get(`/api/notebook/${id}${commit_id ? '?commit_id=' + commit_id : ''}`),
  cancelExcuteCell: id => axios.post(`/api/job/${id}/cancel`),
  getExcuteProcess: id => axios.get(`/api/job/${id}/progress`),
  getCurrentScript: id => axios.get(`/api/job/${id}/current_script`),
  createCell: ({id, data}) => axios.post(`/api/notebook/${id}/cell`, data),
  deleteCell: ({id, cell_id}) => axios.delete(`/api/notebook/${id}/cell/${cell_id}`),
  getDefaultNotebook: () => axios.get('/api/notebook/default'),
  clearAllResults: notebookId => axios.delete(`/api/notebook/${notebookId}/result`),
  createFolder: data => axios.post('/api/folder', data),
  moveFolder: data => axios.post('/api/folder/move', data),
  renameFolder: data => axios.put('/api/folder', data),
  cloneFolder: data => axios.post('/api/folder/clone', data),
  deleteFolder: id => axios.delete(`/api/folder/${id}`),
  autoComplete: params => axios.post('/api/notebook/code/suggestion', params),
  exportNotebook: ({ type, id, output }) => axios.get(`/api/file/export/${id}?type=${type}${output ? '&output=' + output : ''}`, { responseType: 'blob' }),
  setDemo: params => axios.post('/api/settings/demo', params),
  offlineDemo: params => axios.post('/api/settings/demo/remove', params)
}
