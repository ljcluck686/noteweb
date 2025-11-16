import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase.js'

// 页面组件
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import NoteEditor from '../views/NoteEditor.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/note/:id?',
    name: 'NoteEditor',
    component: NoteEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.name === 'Login' && user) {
    next('/')
  } else {
    next()
  }
})

export default router
