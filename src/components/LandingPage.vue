<template>
  <div class="scroll-smooth">
    <!-- HEADER GLOBAL: se queda siempre arriba -->
    <header class="sticky top-0 z-50 backdrop-blur-sm font-serif bg-black/30 px-4 sm:px-6 lg:px-8 py-4">
      <nav class="flex items-center justify-between max-w-7xl mx-auto">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <img
            src="../assets/images/apolo-name.png"
            alt="Apolo Fitness Center"
            class="h-12 sm:h-16 w-auto"
          />
        </div>
        <!-- Links desktop -->
        <div class="hidden md:flex items-center space-x-8 lg:space-x-12">
          <a
            @click.prevent="scrollToSection('inicio')"
            class="text-white hover:text-apolo-primary font-normal  cursor-pointer"
          >
            INICIO
          </a>
          <a
            @click.prevent="scrollToSection('gimnasios')"
            class="text-white hover:text-apolo-primary font-medium  cursor-pointer"
          >
            GIMNASIOS
          </a>
          <a
            @click.prevent="scrollToSection('planes')"
            class="text-white hover:text-apolo-primary font-medium  cursor-pointer"
          >
            PLANES
          </a>
          <router-link
            to="/login"
            class="bg-[#C47A3B] hover:bg-[#B8692F] text-black font-bold py-3 px-6 rounded-lg text-base"
          >
            ÁGORA
          </router-link>
        </div>
        <!-- Botón móvil -->
        <div class="md:hidden">
          <button @click="toggleMobileMenu" class="text-white hover:text-apolo-primary" aria-label="Menú">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </nav>

      <!-- Menú móvil -->
      <div v-if="mobileMenuOpen" class="md:hidden mt-2 bg-black/80 rounded-lg p-4">
        <a
          @click.prevent="scrollToSection('inicio'); closeMobileMenu()"
          class="block text-white py-2 hover:text-apolo-primary font-medium text-base"
        >
          INICIO
        </a>
        <a
          @click.prevent="scrollToSection('gimnasios'); closeMobileMenu()"
          class="block text-white py-2 hover:text-apolo-primary font-medium text-base"
        >
          GIMNASIOS
        </a>
        <a
          @click.prevent="scrollToSection('planes'); closeMobileMenu()"
          class="block text-white py-2 hover:text-apolo-primary font-medium text-base"
        >
          PLANES
        </a>
        <router-link
          to="/login"
          @click.native="closeMobileMenu"
          class="block mt-2 bg-[#C47A3B] text-black font-bold py-3 px-6 rounded-lg text-center text-base"
        >
          ÁGORA
        </router-link>
      </div>
    </header>

    <!-- HERO -->
    <section
      id="inicio"
      class="relative min-h-screen font-sans flex items-center overflow-hidden px-4"
    >
      <!-- fondo y overlay via CSS -->
      <!-- contenido centrado dentro de contenedor -->
      <div class="relative z-10 w-full font-serif">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-center lg:justify-start items-center lg:items-start">
          <div class="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left py-16">
            <h1 class="text-4xl  sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              ES MOMENTO<br />
              DE TU MEJOR<br />
              <span class="text-apolo-primary">VERSIÓN</span>
            </h1>
            <button
              @click="handleJoinNow"
              class="mt-4 inline-block bg-[#C47A3B] hover:bg-[#B8692F] text-black font-semibold py-3 px-8 rounded-lg text-base sm:text-lg tracking-wide transform hover:scale-105 shadow-lg"
            >
              ÚNETE AHORA
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Segunda sección - Encuentra tu gimnasio -->
    <section class="relative min-h-screen font-serif flex items-center justify-center overflow-hidden" id="gimnasios">
      <!-- Imagen de fondo de la fachada -->
      <div class="absolute inset-0">
        <img 
          src="../assets/images/apolo-templo.png" 
          alt="Apolo Fitness Center Building" 
          class="w-full h-full object-cover object-center"
        />
        <!-- Overlay para mejorar contraste -->
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Contenido centrado dentro de contenedor -->
      <div class="relative z-10 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="max-w-2xl mx-auto">
            <!-- Botón principal -->
            <button 
              @click="handleFindLocation"
              class="bg-white hover:bg-gray-100 text-apolo-primary font-bold py-4 px-4 sm:py-5 sm:px-10 rounded-full transition-all duration-300 sm:text-lg tracking-wide transform hover:scale-105 shadow-2xl hover:shadow-3xl border-2 border-transparent hover:border-[#C47A3B]"
            >
              ENCUENTRA TU APOLO FITNESS CENTER <i class="fa-solid fa-magnifying-glass text-apolo-primary"></i>
            </button>

            <!-- Texto adicional opcional -->
            <!-- <div class="mt-8 text-white/90 text-base sm:text-lg leading-relaxed">
              Descubre la ubicación más cercana a ti y comienza tu transformación hoy mismo.
            </div> -->
          </div>
        </div>
      </div>

      <!-- Elementos decorativos opcionales -->
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
    </section>

    <!-- Tercera sección - Planes de membresía -->
    <section id="planes" class="relative min-h-screen font-sans flex items-center overflow-hidden">
      <!-- fondo con imagen y degradado (se define en CSS) -->
      <div class="absolute inset-0 z-0"></div>

      <!-- contenido principal dentro de contenedor -->
      <div class="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16">
        <div class="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <!-- Título centrado -->
          <div class="text-center mb-4">
            <h3 class="text-4xl font-garamond sm:text-5xl lg:text-6xl font-bold text-white leading-tight normal-case">
              Elije el mejor plan<br />
              y <span class="text-apolo-primary ml-1">entrena ya</span>
            </h3>
          </div>

          <!-- Tarjetas centradas -->
          <div class="grid md:grid-cols-2 gap-8 lg:gap-12 w-full max-w-2xl">
            <!-- Plan Olimpo -->
            <div
              id="plan-olimpo"
              :class="[
                'relative bg-black/70 backdrop-blur-sm rounded-2xl p-8 transform transition-all duration-300',
                activePlan === 'olimpo'
                  ? 'ring-4 ring-[#C47A3B] scale-105 border-transparent shadow-2xl'
                  : 'border-2 border-[#C47A3B] hover:shadow-2xl hover:scale-105'
              ]"
            >
              <!-- Badge "Más beneficios" -->
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span class="bg-[#C47A3B] text-black font-bold py-2 px-6 rounded-full text-sm">
                  Más beneficios
                </span>
              </div>

              <div class="pt-4">
                <h3 class="text-3xl lg:text-4xl font-garamond font-bold text-apolo-primary mb-4">
                  Plan Olimpo
                </h3>

                <p class="text-white text-lg mb-6">
                  Entrena en todos nuestros gimnasios
                </p>

                <div class="mb-8">
                  <span class="text-gray-400 text-sm block">DESDE</span>
                  <span class="text-apolo-primary text-4xl lg:text-5xl font-bold">$999.00</span>
                </div>

                <button
                  @click="handleSubscribe('olimpo')"
                  class="w-full font-serif bg-[#C47A3B] hover:bg-[#B8692F] text-black font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg mb-8"
                >
                  INSCRÍBETE AHORA
                </button>

                <div class="space-y-4">
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-apolo-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"></path>
                    </svg>
                    <span>Acceso a todos los gimnasios</span>
                  </div>
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-apolo-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"></path>
                    </svg>
                    <span>Clases grupales ilimitadas</span>
                  </div>
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-apolo-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"></path>
                    </svg>
                    <span>Entrenador personal incluido</span>
                  </div>
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-apolo-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"></path>
                    </svg>
                    <span>Acceso 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Plan Apolo -->
            <div
              id="plan-apolo"
              :class="[
                'relative bg-black/70 backdrop-blur-sm rounded-2xl p-8 transform transition-all duration-300',
                activePlan === 'apolo'
                  ? 'ring-4 ring-[#C47A3B] scale-105 border-transparent shadow-2xl'
                  : 'border-2 border-[#C47A3B] hover:shadow-2xl hover:scale-105'
              ]"
            >
              <div class="pt-8">
                <h3 class="text-3xl lg:text-4xl font-bold font-garamond text-apolo-primary mb-4">
                  Plan Apolo
                </h3>

                <p class="text-white text-lg mb-6">
                  Entrena en un gimnasio
                </p>

                <div class="mb-8">
                  <span class="text-gray-400 text-sm block">DESDE</span>
                  <span class="text-apolo-primary text-4xl lg:text-5xl font-bold">$799.00</span>
                </div>

                <button
                  @click="handleSubscribe('apolo')"
                  class="w-full font-serif bg-[#C47A3B] hover:bg-[#B8692F] text-black font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg mb-8"
                >
                  INSCRÍBETE AHORA
                </button>

                <div class="space-y-4">
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-apolo-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"></path>
                    </svg>
                    <span>Acceso a un gimnasio</span>
                  </div>
                  <div class="flex items-center text-white">
                    <svg class="w-5 h-5 text-apolo-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"></path>
                    </svg>
                    <span>Clases grupales básicas</span>
                  </div>
                </div>
              </div>
            </div>
          </div> <!-- end grid -->
        </div> <!-- end flex column -->
      </div> <!-- end container -->
    </section>



    <!-- Footer -->
    <footer class="bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Logo y redes sociales -->
        <div class="text-center mb-12">
          <!-- Logo -->
          <div class="mb-8">
            <img 
              src="../assets/images/apolo-name.png" 
              alt="Apolo Fitness Center" 
              class="h-32 sm:h-36 w-auto mx-auto"
            />
          </div>

          <!-- Texto "Síguenos" -->
          <p class="text-white text-2xl font-garamond mb-6 font-medium">
            Síguenos
          </p>

          <!-- Iconos de redes sociales -->
          <div class="flex justify-center space-x-10 mb-12">
            <a 
              href="https://facebook.com/apolofitnesscenter" 
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-[#C47A3B] hover:bg-[#B8692F] rounded-full flex items-center justify-center transition-colors duration-300 transform hover:scale-110"
            >
              <i class="fa-brands fa-facebook text-black font-bold text-xl"></i>
            </a>
            <a 
              href="https://instagram.com/apolofitnesscenter" 
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-[#C47A3B] hover:bg-[#B8692F] rounded-full flex items-center justify-center transition-colors duration-300 transform hover:scale-110"
            >
              <i class="fa-brands fa-instagram text-black font-bold text-xl"></i>
            </a>
          </div>

          <!-- Línea divisoria -->
          <div class="w-full h-px bg-gray-700 mb-12"></div>
        </div>
       
        <div class="max-w-3xl mx-auto font-garamond flex flex-col md:flex-row justify-between gap-6 py-6">
          <!-- Columna izquierda -->
          <div class="flex flex-col items-center text-center space-y-1">
            <h3 class="text-apolo-primary text-xl font-semibold">Apolo Fitness Center</h3>
            <div class="text-white text-lg space-y-1">
              <p class="">León</p>
              <p class="">Tomás Padilla</p>
              <p class="">Zapata</p>
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="flex flex-col font-garamond items-center text-center space-y-1">
            <h3 class="text-apolo-primary text-xl font-semibold">Planes</h3>
            <div class="text-white text-lg space-y-1">
              <p @click="selectPlan('olimpo')" class="cursor-pointer hover:underline">Olimpo</p>
              <p @click="selectPlan('apolo')" class="cursor-pointer hover:underline">Apolo</p>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Estado
const mobileMenuOpen = ref(false)
const activePlan = ref(null)
let highlightTimer = null

// Computeds
const currentYear = computed(() => new Date().getFullYear())

// Helpers
const getHeaderOffset = () => document.querySelector('header')?.offsetHeight || 0

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset() - 16
  window.scrollTo({ top, behavior: 'smooth' })
}

// Plan selection & highlight
function selectPlan(plan) {
  if (highlightTimer) clearTimeout(highlightTimer)
  activePlan.value = plan

  // Ir a sección
  scrollToSection('planes')

  // Después enfocar tarjeta específica
  setTimeout(() => {
    const card = document.getElementById(`plan-${plan}`)
    if (card) {
      const targetTop = card.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset() - 16
      window.scrollTo({ top: targetTop, behavior: 'smooth' })
      card.setAttribute('tabindex', '-1')
      card.focus()
    }
  }, 300)

  // Quitar resaltado tras 5s
  highlightTimer = setTimeout(() => {
    if (activePlan.value === plan) activePlan.value = null
  }, 5000)
}

// Acciones expuestas
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

function handleSubscribe(planType) {
  selectPlan(planType)
  console.log(`Subscribing to ${planType} plan...`)
  alert(`Redirigiendo al proceso de inscripción para el Plan ${planType.charAt(0).toUpperCase() + planType.slice(1)}`)
}

const handleJoinNow = () => {
  console.log('ÚNETE AHORA clickeado')
  scrollToSection('planes')
}

const handleFindLocation = () => {
  console.log('Buscando ubicación...')
  scrollToSection('gimnasios')
}

// Cerrar menú móvil al hacer clic fuera
const handleClickOutside = (event) => {
  if (mobileMenuOpen.value && !event.target.closest('nav')) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>

 /*HERO*/
#inicio {
    background-image: url('../assets/images/personas-hero.png');
    background-repeat: no-repeat;
    background-position: right  center;
    background-size: auto 100%;
    position: relative;
  }
  /* overlay más ligero para dejar que la imagen resalte */
  #inicio::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to left, rgba(196,122,59,0.25) 0%, rgba(0,0,0,0.25) 60%);
    pointer-events: none;
  }
  @media (max-width: 1024px) {
    #inicio {
      background-size: cover;
    }
  }
  @media (min-width: 1420px) {
  #inicio {
    background-size: auto 90%; /* altura completa pero no expande demasiado el ancho */
    background-position: calc(100% - 150px) center; /* desplaza un poco hacia la izquierda para mostrar más de la pareja */
  }
}
  @media (min-width: 2020px) {
  #inicio {
    background-size: auto 90%; /* altura completa pero no expande demasiado el ancho */
    background-position: calc(100% - 450px) center; /* desplaza un poco hacia la izquierda para mostrar más de la pareja */
  }
}

/*PLANES*/
#planes {
    background-image:
      linear-gradient(
        to left,
        rgba(0, 0, 0, 0.6) 30%,
        rgba(0, 0, 0, 0.05) 60%,
        rgba(196, 122, 59, 0.15) 100%
      ),
      url('../assets/images/persona.png');
    background-repeat: no-repeat;
    background-position: left center;
    background-size: auto 100%;
    position: relative;
  }
  @media (max-width: 1024px) {
    #planes {
      background-size: cover;
      background-position: center;
    }
  }
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