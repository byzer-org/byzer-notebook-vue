


import axios from '../handleService'
import { Base64Encode } from '../../util'

export default {
  submitLogin: ({ username, password }) => {
    return axios.post('/api/user/authentication', {}, {
      headers: {
        Authorization: 'Basic ' + Base64Encode(username + ':' + password),
        'Accept-Language': localStorage.getItem('kynotebook_lang') || 'en'
      }
    })
  },
  submitSignUp: (params) => axios.post('/api/user/join', params),
  submitLogout: () => axios.delete('/api/user/authentication'),
  getUserInfo: () => axios.get('/api/user/me')
}