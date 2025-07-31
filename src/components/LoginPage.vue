<template>
  <div class="min-h-screen bg-black flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md space-y-2">
      <!-- Logo y botón atrás -->
      <div class="relative py-4">
        <!-- Botón atrás -->
        <button
          type="button"
          @click="router.push('/')"
          class="absolute left-0 top-1/2 transform -translate-y-1/2 text-apolo-secondary hover:text-apolo-primary transition-colors duration-200"
          v-tippy="'Regresar'"
        >
          <i class="fa-regular fa-circle-left fa-2x"></i>
        </button>
        <!-- Logo centrado -->
        <div class="text-center">
          <img
            :src="apoloImage"
            alt="Logo Ágora"
            class="mx-auto w-24 h-auto sm:w-32 md:w-48 lg:w-64"
          />
        </div>
      </div>

      <!-- Título de sección -->
      <div class="text-center space-y-2 pt-2">
        <h1 class="text-white text-6xl md:text-5xl font-light tracking-wide">
          ÁGORA
        </h1>
        <p class="text-gray-300 text-lg">
          Accede a tu cuenta
        </p>
      </div>

      <!-- Formulario -->
       <form @submit.prevent="handleLogin" class="space-y-4 pt-8">
        <!-- Campo de email -->
        <div class="space-y-1">
         <input
            v-model="email"
            type="text"
            id="email"
            class="w-full
                  bg-transparent
                  border-0             
                  border-b-2          
                  border-apolo-gray-dark
                  text-white
                  placeholder-apolo-gray-light
                  py-3 px-0
                  focus:outline-none
                  focus:border-apolo-gray-dark  
                  focus:ring-0"        
            placeholder="Correo electrónico"
          />
          <p v-if="emailError" class="text-apolo-primary text-sm">{{ emailError }}</p>
        </div>

        <!-- Campo de contraseña -->
        <div class="space-y-1 relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            class="w-full
                  bg-transparent
                  border-0
                  border-b-2
                  border-apolo-gray-dark
                  text-white
                  placeholder-apolo-gray-light
                  py-3 px-0 pr-16
                  focus:outline-none
                  focus:border-apolo-gray-dark 
                  focus:ring-0"
            placeholder="Contraseña"
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
      </form>

      <!-- Enlaces adicionales -->
      <div class="text-center space-y-4 pt-6">
        <a
          href="#"
          class="block text-gray-300 hover:text-white transition-colors duration-200"
        >
          ¿Olvidaste tu contraseña?
        </a>
        <p class="text-gray-300">
          ¿No tienes cuenta?
          <a
            href="#"
            class="text-apolo-primary hover:text-orange-400 transition-colors duration-200 font-medium"
          >
            Regístrate
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apoloImage from '@/assets/images/apolo-name.png'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')
const loginError = ref('')

// Expresión regular simple para validar email
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function handleLogin() {
  // reset errores
  emailError.value = ''
  passwordError.value = ''
  loginError.value = ''

  // validaciones personalizadas
  if (!email.value) {
    emailError.value = 'El correo es obligatorio'
  } else if (!emailPattern.test(email.value)) {
    emailError.value = 'Formato de correo inválido'
  }

  if (!password.value) {
    passwordError.value = 'La contraseña es obligatoria'
  }

  if (emailError.value || passwordError.value) {
    return
  }

  // Aquí llamas a tu API real...
  // Simulación de fallo de login:
  const fakeSuccess = false

  if (!fakeSuccess) {
    loginError.value = 'Correo o contraseña incorrectos'
    return
  }

  // si el login es exitoso:
  router.push('/dashboard')
}
</script>

<style scoped>
input::placeholder {
  color: #9CA3AF;
}
input:focus::placeholder {
  color: #6B7280;
}
input {
  transition: all 0.3s ease;
}
@media (max-width: 640px) {
  .tracking-widest {
    letter-spacing: 0.1em;
  }
  .tracking-wide {
    letter-spacing: 0.05em;
  }
}

</style>
