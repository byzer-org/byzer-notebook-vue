
import axios from '../handleService'

export default {
  getJobList: ({ params, dataTypeSubUrl }) => axios.get(`/api/jobs${dataTypeSubUrl}?${params}`),
  getCodeById: job_id => axios.get(`/api/job/${job_id}/content`),
  deleteJobs: ids => axios.delete(`/api/jobs/${ids}`),
  getJobLogs: ({ job_id, offset = -1 }) => axios.get(`/api/job/${job_id}/log?offset=${offset}`)
}