import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import * as actionsTypes from './type'
import modals from './module/modals'
import notebook from './module/notebook'
import user from './module/user'
import datacatalog from './module/datacatalog'
import jobs from './module/jobs'
import schedules from './module/schedules'
import settings from './module/settings'
import workflow from './module/workflow'
import global from './module/global'
export default new Vuex.Store({
  modules: {
    notebook,
    user,
    datacatalog,
    jobs,
    schedules,
    settings,
    modals,
    workflow,
    global
  }
})
export { actionsTypes }
