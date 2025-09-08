<template>
  <div class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
       @click.self="$emit('close')">
    <div class="w-full max-w-3xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg">Elegir icono</h3>
        <button class="text-gray-400 hover:text-white" @click="$emit('close')">✕</button>
      </div>

      <!-- Buscador -->
      <div class="flex gap-2 mb-3">
        <input
          v-model="q"
          placeholder="Buscar… (ej. dumbbell, user, calendar)"
          class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2"
          autofocus
        />
        <!-- selector de colección (por si luego agregas más) -->
        <select v-model="collection" class="bg-gray-900 border border-gray-700 rounded px-2 py-2">
          <option value="lucide">Lucide</option>
        </select>
      </div>

      <!-- Rejilla de iconos -->
      <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 max-h-[60vh] overflow-auto pr-1">
        <button
          v-for="name in filtered"
          :key="name"
          class="group flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800"
          @click="$emit('select', `${collection}:${name}`)"
        >
          <Icon :icon="`${collection}:${name}`" class="w-7 h-7" />
          <span class="text-[11px] text-gray-300 truncate w-full text-center">{{ name }}</span>
        </button>
      </div>

      <div v-if="!filtered.length" class="text-sm text-gray-400 text-center py-6">Sin resultados</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import lucide from '@iconify-json/lucide/icons.json'

// Colecciones cargadas (puedes agregar más después)
const collections = {
  lucide: Object.keys(lucide.icons)  // array de nombres: ['dumbbell', 'user', ...]
}

const collection = ref('lucide')
const q = ref('')

// lista actual
const names = computed(() => collections[collection.value] || [])

// filtro
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return names.value
  return names.value.filter(n => n.toLowerCase().includes(term))
})
</script>
