

import axios from '../handleService'

export default {
  getEnv: () => axios.get('/api/settings/env')
}