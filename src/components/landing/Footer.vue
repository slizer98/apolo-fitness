<template>
  <footer class="bg-black py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <div class="mb-8">
          <img 
            src="../../assets/images/apolo-name.png" 
            alt="Apolo Fitness Center" 
            class="h-32 sm:h-36 w-auto mx-auto"
          />
        </div>

        <p class="text-white text-2xl font-garamond mb-6 font-medium">
          Síguenos
        </p>

        <div class="flex justify-center space-x-10 mb-12">
          <a 
            href="https://www.facebook.com/profile.php?id=61562645576679&locale=es_LA" 
            target="_blank"
            rel="noopener noreferrer"
            class="w-10 h-10 bg-apolo-primary hover:bg-[#B8692F] rounded-full flex items-center justify-center transition-colors duration-300 transform hover:scale-110"
          >
            <i class="fa-brands fa-facebook text-black font-bold text-xl"></i>
          </a>
          <a 
            href="https://www.instagram.com/apolofitnesscenterleon/" 
            target="_blank"
            rel="noopener noreferrer"
            class="w-10 h-10 bg-apolo-primary hover:bg-[#B8692F] rounded-full flex items-center justify-center transition-colors duration-300 transform hover:scale-110"
          >
            <i class="fa-brands fa-instagram text-black font-bold text-xl"></i>
          </a>
        </div>

        <div class="w-full h-px bg-gray-700 mb-12"></div>
      </div>

      <div class="max-w-3xl mx-auto font-garamond flex flex-col md:flex-row justify-between gap-6 py-6">
        <div class="flex flex-col items-center text-center space-y-1">
          <h3 class="text-apolo-primary text-xl font-semibold">Apolo Fitness Center</h3>
          <div class="text-white text-lg space-y-1">
            <p>León</p>
            <p>Tomás Padilla</p>
            <p>Zapata</p>
          </div>
        </div>

        <div class="flex flex-col font-garamond items-center text-center space-y-1">
          <h3 class="text-apolo-primary text-xl font-semibold">Planes</h3>
          <div class="text-white text-lg space-y-1">
            <p @click="$emit('select-plan', 'olimpo')" class="cursor-pointer hover:underline">Olimpo</p>
            <p @click="$emit('select-plan', 'apolo')" class="cursor-pointer hover:underline">Apolo</p>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-700 text-center">
        <p class="text-gray-400 text-sm">
          © {{ currentYear }} Apolo Fitness Center. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
