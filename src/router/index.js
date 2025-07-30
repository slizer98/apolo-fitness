import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LandingPage from '../components/LandingPage.vue'
import LoginPage from '../components/LoginPage.vue'
import Dashboard from '../components/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: LandingPage,
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
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar autenticación al cargar
  authStore.checkAuth()
  
  const isAuthenticated = authStore.isLoggedIn
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest

  if (requiresAuth && !isAuthenticated) {
    // Ruta protegida sin autenticación -> redirigir a login
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    // Ruta de invitado con autenticación -> redirigir a dashboard
    next('/dashboard')
  } else {
    // Permitir navegación
    next()
  }
})

export default router

