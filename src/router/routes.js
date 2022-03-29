


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
      needLogin: false,
      menuIndex: 'login'
    }
  },
  {
    name: 'home',
    path: '/home',
    component: () => import('../page/Home'),
    meta: {
      needLogin: true,
      menuIndex: 'home'
    }
  },
  {
    name: 'notebook',
    path: '/notebook/:uniq?',
    component: () => import('../page/Workspace'),
    meta: {
      needLogin: true,
      menuIndex: 'notebook'
    }
  },
  {
    name: 'jobs',
    path: '/jobs',
    component: () => import('../page/Jobs'),
    meta: {
      needLogin: true,
      menuIndex: 'jobs'
    }
  },
  {
    name: 'schedules',
    path: '/schedules',
    component: () => import('../page/Schedules'),
    redirect: {
      name: 'schedulesHome'
    },
    meta: {
      needLogin: true,
      menuIndex: 'schedules'
    },
    children: [
      {
        name: 'schedulesHome',
        path: 'schedules',
        component: () => import('../page/Schedules/Schedules'),
        meta: {
          needLogin: true,
          menuIndex: 'schedules'
        }
      },
      {
        name: 'instance',
        path: 'instance/:id',
        component: () => import('../page/Schedules/Instance'),
        meta: {
          needLogin: true,
          menuIndex: 'schedules'
        }
      },
      {
        name: 'dag',
        path: 'dag/:id',
        component: () => import('../page/Schedules/Dag'),
        meta: {
          needLogin: true,
          menuIndex: 'schedules'
        }
      }
    ]
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import('../page/Settings'),
    meta: {
      needLogin: true,
      menuIndex: 'settings'
    }
  },
  {
    name: 'result',
    path: '/result/:id',
    component: () => import('../page/IframeImage'),
    meta: {
      needLogin: true,
      menuIndex: 'result'
    }
  }
  // {
  //   name: '*',
  //   redirect: {name: 'result'}
  // }
]

export default routes
