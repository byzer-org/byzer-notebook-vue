import VueRouter from 'vue-router'
import Vue from 'vue'
import routes from './routes'
import beforEach from './beforeEach'

Vue.use(VueRouter)

const router = new VueRouter({
  routes
})

router.beforeEach(beforEach)
export default router
