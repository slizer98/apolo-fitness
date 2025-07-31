<template>
  <div class="scroll-smooth">
    <Navbar />
    <main>
      <slot />
    </main>
    <Footer @select-plan="onSelectPlan" />
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
import { ref } from 'vue'

const emit = defineEmits(['select-plan'])

function onSelectPlan(plan) {
  // reemite hacia el padre si quiere reaccionar
  emit('select-plan', plan)
}
</script>
