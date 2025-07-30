import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isAuthenticated = ref(false)

  // Getters
  const currentUser = computed(() => user.value)
  const isLoggedIn = computed(() => isAuthenticated.value)

  // Actions
  const login = async (credentials) => {
    try {
      // Simular autenticación con credenciales predefinidas
      const validCredentials = [
        { email: 'admin@apolo.com', password: 'admin123', role: 'admin', name: 'Administrador' },
        { email: 'user@apolo.com', password: 'user123', role: 'user', name: 'Usuario Demo' }
      ]

      const foundUser = validCredentials.find(
        u => u.email === credentials.email && u.password === credentials.password
      )

      if (foundUser) {
        user.value = {
          id: Date.now(),
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role
        }
        isAuthenticated.value = true
        
        // Guardar en localStorage
        localStorage.setItem('apolo_user', JSON.stringify(user.value))
        localStorage.setItem('apolo_authenticated', 'true')
        
        return { success: true, user: user.value }
      } else {
        throw new Error('Credenciales inválidas')
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('apolo_user')
    localStorage.removeItem('apolo_authenticated')
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('apolo_user')
    const savedAuth = localStorage.getItem('apolo_authenticated')
    
    if (savedUser && savedAuth === 'true') {
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  // Inicializar autenticación al cargar
  checkAuth()

  return {
    user,
    isAuthenticated,
    currentUser,
    isLoggedIn,
    login,
    logout,
    checkAuth
  }
})

