<template>
  <div class="min-h-screen bg-black flex flex-col">
    <Navbar />

    <div class="flex-grow flex items-center justify-center px-4 py-8 relative font-garamond">
      <!-- Credenciales de prueba -->
      <div
        v-if="showInfoBox"
        class="fixed top-4 right-4 z-50 w-72 bg-gray-900 bg-opacity-95 text-white rounded-lg shadow-xl border border-gray-700 overflow-hidden"
      >
        <div class="flex items-center justify-between px-3 py-2 border-b border-gray-700">
          <div class="text-xs font-semibold">Credenciales de prueba</div>
          <button @click="closeInfoBox" aria-label="Cerrar" class="text-gray-400 hover:text-white text-lg leading-none">×</button>
        </div>
        <div class="px-3 py-2 text-xs space-y-2">
          <div class="flex flex-col gap-1">
            <div class="font-medium">Admin</div>
            <div class="truncate"><span class="font-semibold">Usuario:</span> root</div>
            <div class="truncate"><span class="font-semibold">Pass:</span> Temporal2025</div>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div class="w-full max-w-md space-y-2">
        <div class="relative py-4">
          <div class="text-center">
            <img :src="apoloImage" alt="Logo Ágora" class="mx-auto w-24 h-auto sm:w-32 md:w-48 lg:w-64" />
          </div>
        </div>

        <div class="text-center space-y-2 pt-2">
          <h1 class="text-white text-7xl md:text-6xl font-light tracking-wide">ÁGORA</h1>
          <p class="text-gray-300 text-xl">Accede a tu cuenta</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4 pt-8">
          <div class="space-y-1">
            <input
              v-model="usernameOrEmail"
              type="text"
              id="usernameOrEmail"
              class="w-full bg-transparent border-0 border-b-2 border-apolo-gray-dark text-white placeholder-apolo-gray-light py-3 px-0 focus:outline-none focus:border-apolo-gray-dark focus:ring-0"
              placeholder="Usuario o correo"
              aria-label="Usuario o correo"
              autocomplete="username"
            />
            <p v-if="usernameError" class="text-apolo-primary text-sm">{{ usernameError }}</p>
          </div>

          <div class="space-y-1 relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="w-full bg-transparent border-0 border-b-2 border-apolo-gray-dark text-white placeholder-apolo-gray-light py-3 px-0 pr-16 focus:outline-none focus:border-apolo-gray-dark focus:ring-0"
              placeholder="Contraseña"
              aria-label="Contraseña"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute right-0 top-3 text-apolo-primary hover:text-apolo-secondary text-sm font-medium"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
            <p v-if="passwordError" class="text-apolo-primary text-sm">{{ passwordError }}</p>
          </div>

          <div v-if="loginError" class="text-center text-apolo-primary text-sm">
            {{ loginError }}
          </div>

          <button
            type="submit"
            class="w-full mt-2 flex items-center justify-center gap-2 bg-apolo-primary hover:bg-apolo-secondary text-black font-semibold py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-60 font-serif"
            :disabled="isLoading"
            aria-label="Iniciar sesión"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </span>
            <span>{{ isLoading ? 'Iniciando...' : 'Iniciar sesión' }}</span>
          </button>
        </form>

        <div class="text-center space-y-4 pt-6">
          <a href="#" class="block text-gray-300 hover:text-white transition-colors duration-200">¿Olvidaste tu contraseña?</a>
          <p class="text-gray-300">
            ¿No tienes cuenta?
            <a href="#" class="text-apolo-primary hover:text-orange-400 transition-colors duration-200 font-medium">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/landing/Navbar.vue'
import apoloImage from '@/assets/images/apolo-name.png'
import { useAuthStore } from '@/stores/auth'
import  api  from "@/api/services";

const router = useRouter()
const authStore = useAuthStore()

const usernameOrEmail = ref('')
const password = ref('')
const showPassword = ref(false)

const usernameError = ref('')
const passwordError = ref('')
const loginError = ref('')
const isLoading = ref(false)
const showInfoBox = ref(true)

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'Dashboard' })
    return
  }
  const stored = localStorage.getItem('apolo_show_info_box')
  if (stored === 'false') showInfoBox.value = false
})

function togglePassword() {
  showPassword.value = !showPassword.value
}

function closeInfoBox() {
  showInfoBox.value = false
  localStorage.setItem('apolo_show_info_box', 'false')
}

async function handleLogin() {
  usernameError.value = ''
  passwordError.value = ''
  loginError.value = ''

  if (!usernameOrEmail.value) usernameError.value = 'El usuario o correo es obligatorio'
  if (!password.value)       passwordError.value = 'La contraseña es obligatoria'
  if (usernameError.value || passwordError.value) return

  isLoading.value = true
  try {
    // El store llama a api.auth.login -> POST /token/ { username, password }
    const result = await api.auth.login({
      username: usernameOrEmail.value.trim(), // puede ser 'root' o 'correo'
      password: password.value
    })
    console.log(usernameOrEmail.value.trim(), password.value)
    console.log(result)
    if (!result.success) {
      // Backend típico: {detail: "..."} o errores de validación
      loginError.value = result.error || 'Usuario o contraseña inválidos'
      return
    }

    router.push({ name: 'Dashboard' })
  } catch (e) {
    loginError.value = 'No se pudo iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
input::placeholder { color: #9CA3AF; }
input:focus::placeholder { color: #6B7280; }
input { transition: all 0.3s ease; }
@media (max-width: 640px) {
  .tracking-widest { letter-spacing: 0.1em; }
  .tracking-wide { letter-spacing: 0.05em; }
}
</style>
