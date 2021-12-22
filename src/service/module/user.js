


import axios from '../handleService'
import { encode } from 'js-base64'
export default {
  submitLogin: ({ username, password }) => {
    return axios.post('/api/user/authentication', {}, {
      headers: {
        Authorization: 'Basic ' + encode(username + ':' + password),
        'Accept-Language': localStorage.getItem('kynotebook_lang') || 'en'
      }
    })
  },
  submitSignUp: params => axios.post('/api/user/join', params),
  submitLogout: () => axios.delete('/api/user/authentication'),
  getUserInfo: () => axios.get('/api/user/me')
}