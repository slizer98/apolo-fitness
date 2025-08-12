// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomePage from '@/components/landing/HomePage.vue'
import LoginPage from '@/components/LoginPage.vue'
import Dashboard from '@/components/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Home' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Asegura estado desde localStorage / refresh si aplica
  await authStore.init()

  // Usa el getter del store (ajusta a tu nombre real: isAuthenticated o isLoggedIn)
  const isAuthenticated = authStore.isAuthenticated // o authStore.isLoggedIn si dejaste alias
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
