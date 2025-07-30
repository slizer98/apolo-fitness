<template>
  <div class="scroll-smooth">
    <!-- HEADER GLOBAL: se queda siempre arriba -->
    <header class="sticky top-0 z-50 backdrop-blur-sm bg-black/30 px-4 sm:px-6 lg:px-8 py-4">
      <nav class="flex items-center justify-between max-w-7xl mx-auto">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/APOLO%20LOGO%20COBRE%20SIN%20LINEA%201-vpfiAC5f6tzKoPTkWK59Ic10Kl6QlM.png"
            alt="Apolo Fitness Center"
            class="h-12 sm:h-16 w-auto"
          />
        </div>
        <!-- Links desktop -->
        <div class="hidden md:flex items-center space-x-8 lg:space-x-12">
           <a @click.prevent="scrollToSection('inicio')"
            class="text-white hover:text-[#C47A3B] font-medium text-lg cursor-pointer">
            INICIO
          </a>
          <a @click.prevent="scrollToSection('gimnasios')"
            class="text-white hover:text-[#C47A3B] font-medium text-lg cursor-pointer">
            GIMNASIOS
          </a>
          <a @click.prevent="scrollToSection('planes')"
            class="text-white hover:text-[#C47A3B] font-medium text-lg cursor-pointer">
            PLANES
          </a>
          <router-link
            to="/login"
            class="bg-[#C47A3B] hover:bg-[#B8692F] text-black font-bold py-3 px-6 rounded-lg text-lg"
          >ÁGORA</router-link>
        </div>
        <!-- Botón móvil -->
        <div class="md:hidden">
          <button @click="toggleMobileMenu" class="text-white hover:text-[#C47A3B]">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </nav>

      <!-- Menú móvil -->
      <div v-if="mobileMenuOpen" class="md:hidden mt-2 bg-black/80 rounded-lg p-4">
        <a @click.prevent="scrollToSection('inicio'); closeMobileMenu()"
           class="block text-white py-2 hover:text-[#C47A3B] font-medium text-lg">INICIO</a>
        <a @click.prevent="scrollToSection('gimnasios'); closeMobileMenu()"
           class="block text-white py-2 hover:text-[#C47A3B] font-medium text-lg">GIMNASIOS</a>
        <a @click.prevent="scrollToSection('planes'); closeMobileMenu()"
           class="block text-white py-2 hover:text-[#C47A3B] font-medium text-lg">PLANES</a>
        <router-link
          to="/login"
          @click.native="closeMobileMenu"
          class="block mt-2 bg-[#C47A3B] text-black font-bold py-3 px-6 rounded-lg text-center text-lg"
        >ÁGORA</router-link>
      </div>
    </header>

    <!-- HERO -->
    <section id="inicio"  class="relative min-h-screen flex flex-col justify-center items-start overflow-hidden">
      <!-- Degradado de derecha a izquierda -->
      <div class="absolute inset-0 bg-gradient-to-l from-[#C47A3B] via-black to-black"></div>

      <!-- Imagen en la mitad derecha -->
      <div class="absolute inset-y-0 right-0 w-1/2">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Personas%20Hero%202%201-9zhtuVdjo1T40rklQ2VtXtiHoqJzUv.png"
          alt="Fitness couple"
          class="w-full h-full object-cover object-right"
        />
        <!-- <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30"></div> -->
      </div>

      <!-- Contenido del Hero -->
      <div class="relative z-10 flex flex-col justify-center items-start h-full px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-8">
          ES MOMENTO<br>
          DE TU MEJOR<br>
          <span class="text-[#C47A3B]">VERSIÓN</span>
        </h1>
        <button
          @click="handleJoinNow"
          class="inline-block w-auto me-auto
                bg-[#C47A3B] hover:bg-[#B8692F]
                text-black font-bold py-4 px-8
                rounded-lg text-lg sm:text-xl
                tracking-wide transform hover:scale-105
                shadow-lg"
        >
          ÚNETE AHORA
        </button>
      </div>
    </section>

    <!-- Segunda sección - Encuentra tu gimnasio -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden" id="gimnasios">
      <!-- Imagen de fondo de la fachada -->
      <div class="absolute inset-0">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/center%202%201-jcS3gNNSI16qUFv7ezcSoHIXIJuYmR.png" 
          alt="Apolo Fitness Center Building" 
          class="w-full h-full object-cover object-center"
        />
        <!-- Overlay para mejorar contraste -->
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Contenido centrado -->
      <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto">
          <!-- Botón principal -->
          <button 
            @click="handleFindLocation"
            class="bg-white hover:bg-gray-100 text-[#C47A3B] font-bold py-4 px-8 sm:py-5 sm:px-12 rounded-full transition-all duration-300 text-lg sm:text-xl tracking-wide transform hover:scale-105 shadow-2xl hover:shadow-3xl border-2 border-transparent hover:border-[#C47A3B]"
          >
            ENCUENTRA TU APOLO FITNESS CENTER
          </button>

          <!-- Texto adicional opcional -->
          <div class="mt-8 text-white/90 text-base sm:text-lg">
            <p class="leading-relaxed">
              Descubre la ubicación más cercana a ti y comienza tu transformación hoy mismo.
            </p>
          </div>
        </div>
      </div>

      <!-- Elementos decorativos opcionales -->
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
    </section>

    <!-- Tercera sección - Planes de membresía -->
    <section id="planes" class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Imagen de fondo del atleta -->
      <div class="absolute inset-0">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fondo%20persona%20con%20margen%202-DCOy53cGBV6ufXBQ4vGRK4QCcdo10S.png" 
          alt="Athlete training with barbell" 
          class="w-full h-full object-cover object-center"
        />
        <!-- Overlay para mejorar contraste -->
        <div class="absolute inset-0 bg-black/50"></div>
      </div>

      <!-- Contenido principal -->
      <div class="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16">
        <div class="max-w-7xl mx-auto">
          <!-- Título de la sección -->
          <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Elije el mejor plan<br>
              y <span class="text-[#C47A3B]">entrena ya</span>
            </h2>
          </div>

          <!-- Tarjetas de planes -->
          <div class="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <!-- Plan Olimpo -->
            <div class="relative bg-black/70 backdrop-blur-sm border-2 border-[#C47A3B] rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <!-- Badge "Más beneficios" -->
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span class="bg-[#C47A3B] text-black font-bold py-2 px-6 rounded-full text-sm">
                  Más beneficios
                </span>
              </div>

              <!-- Contenido del plan -->
              <div class="pt-4">
                <h3 class="text-2xl lg:text-3xl font-bold text-[#C47A3B] mb-4">
                  Plan Olimpo
                </h3>
                
                <p class="text-white text-lg mb-6">
                  Entrena en todos nuestros gimnasios
                </p>

                <!-- Precio -->
                <div class="mb-8">
                  <span class="text-gray-400 text-sm block">DESDE</span>
                  <span class="text-[#C47A3B] text-4xl lg:text-5xl font-bold">$999.00</span>
                </div>

                <!-- Botón -->
                <button 
                  @click="handleSubscribe('olimpo')"
                  class="w-full bg-[#C47A3B] hover:bg-[#B8692F] text-black font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg mb-8"
                >
                  INSCRÍBETE AHORA
                </button>

                <!-- Lista de beneficios -->
                <div class="space-y-4">
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-[#C47A3B] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Acceso a todos los gimnasios</span>
                  </div>
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-[#C47A3B] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Clases grupales ilimitadas</span>
                  </div>
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-[#C47A3B] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Entrenador personal incluido</span>
                  </div>
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-[#C47A3B] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Acceso 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Plan Apolo -->
            <div class="relative bg-black/70 backdrop-blur-sm border-2 border-[#C47A3B] rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <!-- Contenido del plan -->
              <div class="pt-8">
                <h3 class="text-2xl lg:text-3xl font-bold text-[#C47A3B] mb-4">
                  Plan Apolo
                </h3>
                
                <p class="text-white text-lg mb-6">
                  Entrena en un gimnasio
                </p>

                <!-- Precio -->
                <div class="mb-8">
                  <span class="text-gray-400 text-sm block">DESDE</span>
                  <span class="text-[#C47A3B] text-4xl lg:text-5xl font-bold">$799.00</span>
                </div>

                <!-- Botón -->
                <button 
                  @click="handleSubscribe('apolo')"
                  class="w-full bg-[#C47A3B] hover:bg-[#B8692F] text-black font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg mb-8"
                >
                  INSCRÍBETE AHORA
                </button>

                <!-- Lista de beneficios -->
                <div class="space-y-4">
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-[#C47A3B] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Acceso a un gimnasio</span>
                  </div>
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-[#C47A3B] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Clases grupales básicas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <!-- Logo y redes sociales -->
        <div class="text-center mb-12">
          <!-- Logo -->
          <div class="mb-8">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/APOLO%20LOGO%20COBRE%20SIN%20LINEA%201-vpfiAC5f6tzKoPTkWK59Ic10Kl6QlM.png" 
              alt="Apolo Fitness Center" 
              class="h-20 sm:h-24 w-auto mx-auto"
            />
          </div>

          <!-- Texto "Síguenos" -->
          <p class="text-white text-lg mb-6 font-medium">
            Síguenos
          </p>

          <!-- Iconos de redes sociales -->
          <div class="flex justify-center space-x-6 mb-12">
            <a 
              href="https://facebook.com/apolofitnesscenter" 
              target="_blank"
              rel="noopener noreferrer"
              class="w-12 h-12 bg-[#C47A3B] hover:bg-[#B8692F] rounded-full flex items-center justify-center transition-colors duration-300 transform hover:scale-110"
            >
              <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
              href="https://instagram.com/apolofitnesscenter" 
              target="_blank"
              rel="noopener noreferrer"
              class="w-12 h-12 bg-[#C47A3B] hover:bg-[#B8692F] rounded-full flex items-center justify-center transition-colors duration-300 transform hover:scale-110"
            >
              <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
              </svg>
            </a>
          </div>

          <!-- Línea divisoria -->
          <div class="w-full h-px bg-gray-700 mb-12"></div>
        </div>

        <!-- Información de contacto y planes -->
        <div class="grid md:grid-cols-2 gap-12 text-center md:text-left">
          <!-- Columna izquierda - Ubicaciones -->
          <div>
            <h3 class="text-[#C47A3B] text-xl font-bold mb-6">
              Apolo Fitness Center
            </h3>
            <div class="space-y-4">
              <div class="text-white hover:text-[#C47A3B] transition-colors duration-300 cursor-pointer">
                <p class="text-lg">León</p>
              </div>
              <div class="text-white hover:text-[#C47A3B] transition-colors duration-300 cursor-pointer">
                <p class="text-lg">Tomás Padilla</p>
              </div>
              <div class="text-white hover:text-[#C47A3B] transition-colors duration-300 cursor-pointer">
                <p class="text-lg">Zapata</p>
              </div>
            </div>
          </div>

          <!-- Columna derecha - Planes -->
          <div>
            <h3 class="text-[#C47A3B] text-xl font-bold mb-6">
              Planes
            </h3>
            <div class="space-y-4">
              <div class="text-white hover:text-[#C47A3B] transition-colors duration-300 cursor-pointer">
                <p class="text-lg">Olimpo</p>
              </div>
              <div class="text-white hover:text-[#C47A3B] transition-colors duration-300 cursor-pointer">
                <p class="text-lg">Apolo</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="mt-12 pt-8 border-t border-gray-700 text-center">
          <p class="text-gray-400 text-sm">
            © {{ currentYear }} Apolo Fitness Center. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Estado reactivo
const mobileMenuOpen = ref(false)

// Computed properties
const currentYear = computed(() => new Date().getFullYear())

// Métodos
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}


const handleJoinNow = () => {
  // Lógica para unirse ahora
  console.log('Redirecting to registration...')
  // Scroll a la sección de planes
  document.querySelector('#planes')?.scrollIntoView({ behavior: 'smooth' })
}

const handleFindLocation = () => {
  // Lógica para encontrar ubicaciones
  console.log('Opening location finder...')
  // Scroll a la sección de gimnasios
  document.querySelector('#gimnasios')?.scrollIntoView({ behavior: 'smooth' })
}

const handleSubscribe = (planType) => {
  // Lógica para suscribirse a un plan
  console.log(`Subscribing to ${planType} plan...`)
  // Aquí puedes redirigir a la página de pago o abrir un modal
  alert(`Redirigiendo al proceso de inscripción para el Plan ${planType.charAt(0).toUpperCase() + planType.slice(1)}`)
}

// Cerrar menú móvil al hacer clic fuera
const handleClickOutside = (event) => {
  if (mobileMenuOpen.value && !event.target.closest('nav')) {
    mobileMenuOpen.value = false
  }
}

// Agregar event listener para cerrar menú móvil
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
/* Animaciones personalizadas */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

h1, h2 {
  animation: fadeInUp 1s ease-out;
}

button {
  animation: fadeInUp 1s ease-out 0.3s both;
}

/* Efecto de sombra personalizada */
.shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
}

/* Mejoras de responsive */
@media (max-width: 640px) {
  h1, h2 {
    font-size: 2.5rem;
    line-height: 1.1;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  h1, h2 {
    font-size: 2rem;
  }
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Intersection observer para animaciones */
section {
  opacity: 0;
  animation: fadeIn 1s ease-out forwards;
}

section:nth-child(2) {
  animation-delay: 0.5s;
}

section:nth-child(3) {
  animation-delay: 1s;
}

/* Efecto glassmorphism para las tarjetas */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* Animaciones para el footer */
footer {
  animation: fadeIn 1s ease-out 1.5s both;
}
</style>