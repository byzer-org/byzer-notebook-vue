


import store, { actionsTypes } from '../store'

export default async function beforeEach (to, from, next) {
  try {
    const res = await store.dispatch(actionsTypes.GET_ENV)
    store.commit('SET_CURRENT_ENV', res.data.is_trial)
    store.commit('SET_SCHEDULE_ENABLE', res.data.is_scheduler_enabled)
    document.title = 'Byzer Notebook'
  } catch (e) {
    console.log(e)
  }
  if (store.state.user.userInfo) {
    next()
  } else if (to.meta.needLogin) {
    store.dispatch(actionsTypes.GET_USER_INFO).then(res => {
      let data = res.data
      store.commit('SET_USER_INFO', data)
      next({ ...to })
    })
  } else {
    next()
  }
}
