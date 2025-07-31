<template>
  <Layout @select-plan="selectPlan">
    <!-- HERO -->
    <section
      id="inicio"
      class="relative min-h-screen font-sans flex items-center overflow-hidden px-4"
    >
      <div class="relative z-10 w-full font-serif">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-center lg:justify-start items-center lg:items-start">
          <div class="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left py-16">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              ES MOMENTO<br />
              DE TU MEJOR<br />
              <span class="text-apolo-primary">VERSIÓN</span>
            </h1>
            <button
              @click="handleJoinNow"
              class="mt-4 inline-block bg-apolo-primary hover:bg-[#B8692F] text-black font-semibold py-3 px-8 rounded-lg text-base sm:text-lg tracking-wide transform hover:scale-105 shadow-lg"
            >
              ÚNETE AHORA
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Segunda sección - Encuentra tu gimnasio -->
    <section class="relative min-h-screen font-serif flex items-center justify-center overflow-hidden" id="gimnasios">
      <div class="absolute inset-0">
        <img 
          src="@/assets/images/apolo-templo.png" 
          alt="Apolo Fitness Center Building" 
          class="w-full h-full object-cover object-center"
        />
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <div class="relative z-10 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="max-w-2xl mx-auto">
            <button 
              @click="handleFindLocation"
              class="bg-white hover:bg-gray-100 text-apolo-primary font-bold py-4 px-4 sm:py-5 sm:px-10 rounded-full transition-all duration-300 sm:text-lg tracking-wide transform hover:scale-105 shadow-2xl hover:shadow-3xl border-2 border-transparent hover:border-[#C47A3B]"
            >
              ENCUENTRA TU APOLO FITNESS CENTER <i class="fa-solid fa-magnifying-glass text-apolo-primary"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
    </section>

    <!-- Tercera sección - Planes de membresía -->
    <section id="planes" class="relative min-h-screen font-sans flex items-center overflow-hidden">
      <div class="absolute inset-0 z-0"></div>

      <div class="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16">
        <div class="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <div class="text-center mb-4">
            <h3 class="text-4xl font-garamond sm:text-5xl lg:text-6xl font-bold text-white leading-tight normal-case">
              Elije el mejor plan<br />
              y <span class="text-apolo-primary ml-1">entrena ya</span>
            </h3>
          </div>

          <div class="grid md:grid-cols-2 gap-8 lg:gap-12 w-full max-w-2xl">
            <!-- Plan Olimpo -->
            <div
              id="plan-olimpo"
              :class="[
                'relative bg-black/70 backdrop-blur-sm rounded-2xl p-8 transform transition-all duration-300',
                activePlan === 'olimpo'
                  ? 'ring-4 ring-[#D89B3C] scale-105 border-transparent shadow-2xl'
                  : 'border-2 border-[#D89B3C] hover:shadow-2xl hover:scale-105'
              ]"
            >
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span class="bg-[#D89B3C] text-gray-100 font-bold py-2 px-6 rounded-full text-sm">
                  Más beneficios
                </span>
              </div>

              <div class="pt-4">
                <h3 class="text-3xl lg:text-4xl font-garamond font-bold text--[#D89B3C] mb-4">
                  Plan Olimpo
                </h3>

                <p class="text-white text-lg mb-6">
                  Entrena en todos nuestros gimnasios
                </p>

                <div class="mb-8">
                  <span class="text-gray-400 text-sm block">DESDE</span>
                  <span class="text-[#D89B3C] text-4xl lg:text-5xl font-bold">$999.00</span>
                </div>

                <button
                  @click="handleSubscribe('olimpo')"
                  class="w-full font-serif bg-[#D89B3C] hover:bg-[#b8832f] text-gray-100 font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg mb-8"
                >
                  INSCRÍBETE AHORA
                </button>

                <div class="space-y-4">
                  <div class="flex items-center text-white">
                    <img src="@/assets/images/check.png" class="w-5 text-apolo-primary mr-3 flex-shrink-0" alt="check">
                    <span>Acceso a todos los gimnasios</span>
                  </div>
                  <div class="flex items-center text-white">
                    <img src="@/assets/images/check.png" class="w-5 text-apolo-primary mr-3 flex-shrink-0" alt="check">
                    <span>Clases grupales ilimitadas</span>
                  </div>
                  <div class="flex items-center text-white">
                    <img src="@/assets/images/check.png" class="w-5 text-apolo-primary mr-3 flex-shrink-0" alt="check">
                    <span>Entrenador personal incluido</span>
                  </div>
                  <div class="flex items-center text-white">
                    <img src="@/assets/images/check.png" class="w-5 text-apolo-primary mr-3 flex-shrink-0" alt="check">
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
                  class="w-full font-serif bg-apolo-primary hover:bg-[#B8692F] text-black font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg mb-8"
                >
                  INSCRÍBETE AHORA
                </button>

                <div class="space-y-4">
                  <div class="flex items-center text-white">
                    <img src="@/assets/images/check.png" class="w-5 text-apolo-primary mr-3 flex-shrink-0" alt="check">
                    <span>Acceso a un gimnasio</span>
                  </div>
                  <div class="flex items-center text-white">
                    <img src="@/assets/images/check.png" class="w-5 text-apolo-primary mr-3 flex-shrink-0" alt="check">
                    <span>Clases grupales básicas</span>
                  </div>
                </div>
              </div>
            </div>
          </div> <!-- end grid -->
        </div> <!-- end flex column -->
      </div> <!-- end container -->
    </section>
  </Layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/components/landing/Layout.vue'

const activePlan = ref(null)
let highlightTimer = null
const route = useRoute()

const getHeaderOffset = () => document.querySelector('header')?.offsetHeight || 0

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset() - 16
  window.scrollTo({ top, behavior: 'smooth' })
}

function selectPlan(plan) {
  if (highlightTimer) clearTimeout(highlightTimer)
  activePlan.value = plan

  // scroll a sección de planes
  scrollToSection('planes')

  // enfocar tarjeta específica después
  setTimeout(() => {
    const card = document.getElementById(`plan-${plan}`)
    if (card) {
      const targetTop = card.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset() - 16
      window.scrollTo({ top: targetTop, behavior: 'smooth' })
      card.setAttribute('tabindex', '-1')
      card.focus()
    }
  }, 300)

  // limpiar resaltado
  highlightTimer = setTimeout(() => {
    if (activePlan.value === plan) activePlan.value = null
  }, 5000)
}

function handleSubscribe(planType) {
  selectPlan(planType)
  alert(`Redirigiendo al proceso de inscripción para el Plan ${planType.charAt(0).toUpperCase() + planType.slice(1)}`)
}

function handleJoinNow() {
  scrollToSection('planes')
}

function handleFindLocation() {
  scrollToSection('gimnasios')
}

// responder al hash inicial y cambios
onMounted(() => {
  if (route.hash) {
    setTimeout(() => scrollToSection(route.hash.slice(1)), 100)
  }
})

watch(() => route.hash, (newHash) => {
  if (newHash) {
    setTimeout(() => scrollToSection(newHash.slice(1)), 100)
  }
})
</script>

<style scoped>
/* HERO */
#inicio {
  background-image: url('@/assets/images/personas-hero.png');
  background-repeat: no-repeat;
  background-position: right center;
  background-size: auto 100%;
  position: relative;
}
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
    background-size: auto 90%;
    background-position: calc(100% - 150px) center;
  }
}
@media (min-width: 2020px) {
  #inicio {
    background-size: auto 90%;
    background-position: calc(100% - 450px) center;
  }
}

/* PLANES */
#planes {
  background-image:
    linear-gradient(
      to left,
      rgba(0, 0, 0, 0.6) 30%,
      rgba(0, 0, 0, 0.05) 60%,
      rgba(196, 122, 59, 0.15) 100%
    ),
    url('@/assets/images/persona.png');
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

/* Animaciones */
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
  from { opacity: 0; }
  to { opacity: 1; }
}
h1, h2 { animation: fadeInUp 1s ease-out; }
button { animation: fadeInUp 1s ease-out 0.3s both; }

.shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
}

@media (max-width: 640px) {
  h1, h2 {
    font-size: 2.5rem;
    line-height: 1.1;
  }
  .grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  h1, h2 { font-size: 2rem; }
}

html { scroll-behavior: smooth; }

section {
  opacity: 0;
  animation: fadeIn 1s ease-out forwards;
}
section:nth-child(2) { animation-delay: 0.5s; }
section:nth-child(3) { animation-delay: 1s; }

.backdrop-blur-sm { backdrop-filter: blur(8px); }
</style>
