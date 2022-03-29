import axios from '../handleService'

export default {
  // search schedules
  getSchedulesList: () => axios.get('/api/schedule/task/list'),
  // search by id
  getInstanceById: id => axios.get(`/api/schedule/task/instance/${id}`),
  // search file type when open notebook
  getNotebookInfo: params => axios.get(`/api/schedule/task?${params}`),
  // all instance
  getInstanceList: id => axios.get(`/api/schedule/task/instance?task_id=${id}`),
  // instance
  getInstance: id => axios.get(`/api/schedule/task/instance/${id}/status`),
  // set schedule
  setSchedule: params => axios.post('/api/schedule/task', params),
  // update/remove schedule
  updateSchedule: ({ id, params }) => axios.put(`/api/schedule/task/${id}`, params),
  // run schedule
  runSchedule: id => axios.post(`/api/schedule/task/${id}/execution`),
  // delete schedule
  deleteSchedule: id => axios.delete(`/api/schedule/task/${id}`),
  // toogle schedule release_state to online/offline
  toggleSchedule: ({ id, release_state }) => axios.post(`/api/schedule/task/${id}/${release_state}`),
  // set state of instance
  setInstanceState: ({ id, status }) => axios.post(`/api/schedule/task/instance/${id}/status?set_status=${status}`)
}
