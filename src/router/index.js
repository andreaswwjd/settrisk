import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/views/Index'
import Login from '@/views/Login'
import Games from '@/views/Games'
import New from '@/views/New'
import App from '@/views/App'
import Bank from '@/views/Bank'
import Rules from '@/views/Rules'
import Guide from '@/views/Guide'
import About from '@/views/About'
//import Gameboard from '@/views/Gameboard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/games',
      name: 'Games',
      component: Games
    },
    {
      path: '/games/new',
      name: 'New',
      component: New
    },
    // {
    //   path: '/games/new/board',
    //   name: 'Gameboard',
    //   component: Gameboard
    // },
    {
      path: '/game/app',
      name: 'App',
      component: App
    },
    {
      path: '/game/bank',
      name: 'Bank',
      component: Bank
    },
    {
      path: '/rules',
      name: 'Rules',
      component: Rules
    },
    {
      path: '/guide',
      name: 'Guide',
      component: Guide
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
})
