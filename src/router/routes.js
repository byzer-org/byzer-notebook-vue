


const routes = [
  {
    path: '/',
    redirect: { name: 'home' }
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('../page/Login'),
    meta: {
      needLogin: false
    }
  },
  {
    name: 'home',
    path: '/home',
    component: () => import('../page/Home'),
    meta: {
      needLogin: true
    }
  },
  {
    name: 'notebook',
    path: '/notebook/:uniq?',
    component: () => import('../page/Workspace'),
    meta: {
      needLogin: true
    }
  },
  {
    name: 'jobs',
    path: '/jobs',
    component: () => import('../page/Jobs'),
    meta: {
      needLogin: true
    }
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import('../page/Settings'),
    meta: {
      needLogin: true
    }
  },
  {
    name: 'result',
    path: '/result/:id',
    component: () => import('../page/IframeImage'),
    meta: {
      needLogin: true
    }
  }
  // {
  //   name: '*',
  //   redirect: {name: 'result'}
  // }
]

export default routes
