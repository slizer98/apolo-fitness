<template>
  <div class="relative flex justify-end" data-menu-root>
    <button class="px-2 py-1 rounded hover:bg-gray-800" @click.stop="toggle">⋯</button>
    <div v-if="open" class="absolute right-0 mt-1 w-48 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-1 z-20">
      <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70" @click="emit('edit', row); close()">Editar</button>
      <!-- Agrega más acciones aquí si quieres -->
      <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-red-900/40" @click="emit('delete', row); close()">Eliminar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({ row: { type: Object, required: true } })
const emit = defineEmits(['edit', 'delete'])

const open = ref(false)
function toggle(){ open.value = !open.value }
function close(){ open.value = false }

function onDocClick(e){
  const inside = e.target.closest?.('[data-menu-root]')
  if(!inside) close()
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
