import * as types from '../type'
import { user } from '../../service'
export default {
  state: {
    userInfo: null
  },
  mutations: {
    [types.SET_USER_INFO]: (state, payload) => {
      state.userInfo = payload
    },
    [types.CLEAR_USER_INFO]: state => {
      state.userInfo = null
      localStorage.clear()
    }
  },
  actions: {
    [types.HANDLE_LOGIN]: (_, payload) => {
      return user.submitLogin(payload)
    },
    [types.HANDLE_SIGN_UP]: (_, payload) => { // 注册完成之后的动作与登录保持一致
      return user.submitSignUp(payload)
    },
    [types.HANDLE_LOGOUT]: () => {
      return user.submitLogout()
    },
    [types.GET_USER_INFO]: () => {
      return user.getUserInfo()
    }
  }
}