<template>
  <div class="min-h-screen bg-apolo-dark">
    <!-- Header -->
    <header class="bg-apolo-gray-dark shadow-lg">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo y título -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-apolo-primary rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a1 1 0 001 1h3v-8h6v8h3a1 1 0 001-1V7l-7-5z"/>
                </svg>
              </div>
              <span class="text-white font-bold text-lg">APOLO</span>
            </div>
            <div class="hidden md:block">
              <h1 class="text-xl font-semibold text-white">Panel de Administración</h1>
            </div>
          </div>

          <!-- Usuario y logout -->
          <div class="flex items-center space-x-4">
            <div class="text-right hidden sm:block">
              <p class="text-white font-medium">{{ authStore.currentUser?.name }}</p>
              <p class="text-apolo-gray-light text-sm">{{ authStore.currentUser?.role }}</p>
            </div>
            <button
              @click="logout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="p-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-apolo-gray-dark rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-apolo-gray-light text-sm">Total Usuarios</p>
              <p class="text-3xl font-bold text-white">{{ usersStore.totalUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-apolo-primary rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-apolo-gray-dark rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-apolo-gray-light text-sm">Usuarios Activos</p>
              <p class="text-3xl font-bold text-white">{{ activeUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-apolo-gray-dark rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-apolo-gray-light text-sm">Nuevos Este Mes</p>
              <p class="text-3xl font-bold text-white">{{ newUsersThisMonth }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Management -->
      <div class="bg-apolo-gray-dark rounded-lg shadow-lg">
        <!-- Header con búsqueda y botón agregar -->
        <div class="p-6 border-b border-gray-600">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 class="text-xl font-semibold text-white">Gestión de Usuarios</h2>
            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <!-- Búsqueda -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar usuarios..."
                  class="w-full sm:w-64 px-4 py-2 bg-apolo-dark border border-gray-600 rounded-lg text-white placeholder-apolo-gray-light focus:outline-none focus:border-apolo-primary"
                />
                <svg class="absolute right-3 top-2.5 w-5 h-5 text-apolo-gray-light" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                </svg>
              </div>
              <!-- Botón agregar -->
              <button
                @click="openAddModal"
                class="btn-primary whitespace-nowrap"
              >
                + Agregar Usuario
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla de usuarios -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-apolo-dark">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-apolo-gray-light uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-apolo-gray-light uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-apolo-gray-light uppercase tracking-wider">Membresía</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-apolo-gray-light uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-apolo-gray-light uppercase tracking-wider">Fecha Ingreso</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-apolo-gray-light uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-600">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-apolo-dark transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img :src="user.avatar" :alt="user.name" class="w-10 h-10 rounded-full mr-3">
                    <div>
                      <div class="text-sm font-medium text-white">{{ user.name }}</div>
                      <div class="text-sm text-apolo-gray-light">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ user.email }}</div>
                  <div class="text-sm text-apolo-gray-light">{{ user.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full"
                        :class="getMembershipClass(user.membershipType)">
                    {{ user.membershipType }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full"
                        :class="getStatusClass(user.status)">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {{ formatDate(user.joinDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="openEditModal(user)"
                      class="text-apolo-primary hover:text-apolo-secondary transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      @click="confirmDelete(user)"
                      class="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal para agregar/editar usuario -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-apolo-gray-dark rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-white mb-4">
          {{ editingUser ? 'Editar Usuario' : 'Agregar Usuario' }}
        </h3>
        
        <form @submit.prevent="saveUser">
          <div class="space-y-4">
            <div>
              <label class="block text-white text-sm font-medium mb-1">Nombre</label>
              <input
                v-model="userForm.name"
                type="text"
                required
                class="w-full px-3 py-2 bg-apolo-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-apolo-primary"
              />
            </div>
            
            <div>
              <label class="block text-white text-sm font-medium mb-1">Email</label>
              <input
                v-model="userForm.email"
                type="email"
                required
                class="w-full px-3 py-2 bg-apolo-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-apolo-primary"
              />
            </div>
            
            <div>
              <label class="block text-white text-sm font-medium mb-1">Teléfono</label>
              <input
                v-model="userForm.phone"
                type="tel"
                required
                class="w-full px-3 py-2 bg-apolo-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-apolo-primary"
              />
            </div>
            
            <div>
              <label class="block text-white text-sm font-medium mb-1">Tipo de Membresía</label>
              <select
                v-model="userForm.membershipType"
                required
                class="w-full px-3 py-2 bg-apolo-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-apolo-primary"
              >
                <option value="Básico">Básico</option>
                <option value="Estándar">Estándar</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            
            <div>
              <label class="block text-white text-sm font-medium mb-1">Estado</label>
              <select
                v-model="userForm.status"
                required
                class="w-full px-3 py-2 bg-apolo-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-apolo-primary"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button
              type="submit"
              class="flex-1 btn-primary"
            >
              {{ editingUser ? 'Actualizar' : 'Agregar' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-apolo-gray-dark rounded-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold text-white mb-4">Confirmar Eliminación</h3>
        <p class="text-apolo-gray-light mb-6">
          ¿Estás seguro de que deseas eliminar a {{ userToDelete?.name }}?
        </p>
        <div class="flex space-x-3">
          <button
            @click="deleteUser"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Eliminar
          </button>
          <button
            @click="closeDeleteModal"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()

// State
const searchQuery = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref(null)
const userToDelete = ref(null)

const userForm = reactive({
  name: '',
  email: '',
  phone: '',
  membershipType: 'Básico',
  status: 'Activo'
})

// Computed
const filteredUsers = computed(() => {
  return usersStore.searchUsers(searchQuery.value)
})

const activeUsers = computed(() => {
  return usersStore.allUsers.filter(user => user.status === 'Activo').length
})

const newUsersThisMonth = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  return usersStore.allUsers.filter(user => {
    const userDate = new Date(user.joinDate)
    return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear
  }).length
})

// Methods
const logout = () => {
  authStore.logout()
  router.push('/')
}

const openAddModal = () => {
  editingUser.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (user) => {
  editingUser.value = user
  userForm.name = user.name
  userForm.email = user.email
  userForm.phone = user.phone
  userForm.membershipType = user.membershipType
  userForm.status = user.status
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  userForm.name = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.membershipType = 'Básico'
  userForm.status = 'Activo'
}

const saveUser = () => {
  if (editingUser.value) {
    usersStore.updateUser(editingUser.value.id, { ...userForm })
  } else {
    usersStore.addUser({ ...userForm })
  }
  closeModal()
}

const confirmDelete = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = () => {
  if (userToDelete.value) {
    usersStore.deleteUser(userToDelete.value.id)
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const getMembershipClass = (type) => {
  const classes = {
    'Básico': 'bg-gray-600 text-gray-100',
    'Estándar': 'bg-blue-600 text-blue-100',
    'Premium': 'bg-apolo-primary text-white'
  }
  return classes[type] || 'bg-gray-600 text-gray-100'
}

const getStatusClass = (status) => {
  return status === 'Activo' 
    ? 'bg-green-600 text-green-100' 
    : 'bg-red-600 text-red-100'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}
</script>

