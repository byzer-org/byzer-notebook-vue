


import store, { actionsTypes } from '../store'

export default async function beforeEach (to, from, next) {
  try {
    const res = await store.dispatch(actionsTypes.GET_ENV)
    const is_trial = res.data.is_trial
    store.commit('SET_CURRENT_ENV', is_trial)
    document.title = 'Byzer Notebook'
  } catch (e) {
    console.log(e)
  }
  if (store.state.user.userInfo) {
    next()
  } else if (to.meta.needLogin) {
    store.dispatch(actionsTypes.GET_USER_INFO).then(res => {
      store.commit('SET_USER_INFO', res.data)
      next({ name: to.name })
    })
  } else {
    next()
  }
}
