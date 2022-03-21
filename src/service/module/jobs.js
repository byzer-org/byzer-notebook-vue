
import axios from '../handleService'

export default {
  getJobList: params => axios.get(`/api/jobs?${params}`),
  getCodeById: job_id => axios.get(`/api/job/${job_id}/content`),
  deleteJobs: ids => axios.delete(`/api/jobs/${ids}`),
  getJobLogs: job_id => axios.get(`/api/job/${job_id}/log`)
}