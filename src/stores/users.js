import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref([])
  const loading = ref(false)

  // Getters
  const allUsers = computed(() => users.value)
  const totalUsers = computed(() => users.value.length)

  // Datos de prueba iniciales
  const initializeUsers = () => {
    const savedUsers = localStorage.getItem('apolo_users')
    if (savedUsers) {
      users.value = JSON.parse(savedUsers)
    } else {
      // Usuarios de prueba
      users.value = [
        {
          id: 1,
          name: 'Carlos Mendoza',
          email: 'carlos@example.com',
          phone: '+52 555 123 4567',
          membershipType: 'Premium',
          status: 'Activo',
          joinDate: '2024-01-15',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 2,
          name: 'María González',
          email: 'maria@example.com',
          phone: '+52 555 987 6543',
          membershipType: 'Básico',
          status: 'Activo',
          joinDate: '2024-02-20',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 3,
          name: 'Roberto Silva',
          email: 'roberto@example.com',
          phone: '+52 555 456 7890',
          membershipType: 'Premium',
          status: 'Inactivo',
          joinDate: '2023-11-10',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 4,
          name: 'Ana Rodríguez',
          email: 'ana@example.com',
          phone: '+52 555 321 0987',
          membershipType: 'Estándar',
          status: 'Activo',
          joinDate: '2024-03-05',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 5,
          name: 'Luis Hernández',
          email: 'luis@example.com',
          phone: '+52 555 654 3210',
          membershipType: 'Básico',
          status: 'Activo',
          joinDate: '2024-01-30',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        }
      ]
      saveUsers()
    }
  }

  // Actions
  const saveUsers = () => {
    localStorage.setItem('apolo_users', JSON.stringify(users.value))
  }

  const addUser = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      joinDate: new Date().toISOString().split('T')[0],
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&sig=${Date.now()}`
    }
    users.value.push(newUser)
    saveUsers()
    return newUser
  }

  const updateUser = (id, userData) => {
    const index = users.value.findIndex(user => user.id === id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...userData }
      saveUsers()
      return users.value[index]
    }
    return null
  }

  const deleteUser = (id) => {
    const index = users.value.findIndex(user => user.id === id)
    if (index !== -1) {
      const deletedUser = users.value.splice(index, 1)[0]
      saveUsers()
      return deletedUser
    }
    return null
  }

  const getUserById = (id) => {
    return users.value.find(user => user.id === id)
  }

  const searchUsers = (query) => {
    if (!query) return users.value
    const lowercaseQuery = query.toLowerCase()
    return users.value.filter(user =>
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.membershipType.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Inicializar usuarios al cargar
  initializeUsers()

  return {
    users,
    loading,
    allUsers,
    totalUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    searchUsers,
    initializeUsers
  }
})

