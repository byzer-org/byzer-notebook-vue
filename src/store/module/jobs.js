
import * as types from '../type'
import { jobs } from '../../service'
export default {
  state: {},
  mutations: {},
  actions: {
    [types.GET_JOB_LIST]: (_, { params, dataType }) => {
      const dataTypeSubUrl = dataType === 'archived' ? '/archive' : ''
      return jobs.getJobList({ params, dataTypeSubUrl })
    },
    [types.GET_CODE_BY_ID]: (_, payload) => {
      return jobs.getCodeById(payload)
    },
    [types.DELETE_JOBS]: (_, payload) => {
      return jobs.deleteJobs(payload)
    },
    [types.GET_JOB_LOGS]: (_, payload) => {
      return jobs.getJobLogs(payload)
    }
  }
}