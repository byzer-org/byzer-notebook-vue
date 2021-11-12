/*

*/
import * as types from '../type'
import { jobs } from '../../service'
export default {
  state: {},
  mutations: {},
  actions: {
    [types.GET_JOB_LIST]: ({ commit }, payload) => {
      return jobs.getJobList(payload)
    },
    [types.GET_CODE_BY_ID]: ({ commit }, payload) => {
      return jobs.getCodeById(payload)
    },
    [types.DELETE_JOBS]: ({ commit }, payload) => {
      return jobs.deleteJobs(payload)
    },
    [types.GET_JOB_LOGS]: ({}, payload) => {
      return jobs.getJobLogs(payload)
    }
  }
}