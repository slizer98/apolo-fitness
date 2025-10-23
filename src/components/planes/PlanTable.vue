<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="text-[#667]">
        <tr class="border-b border-[#e6e9ef]">
          <th class="text-left py-2 px-2">Plan</th>
          <th class="text-left py-2 px-2">Precio</th>
          <th class="text-left py-2 px-2">Servicios</th>
          <th class="text-left py-2 px-2">Beneficios</th>
          <th class="text-left py-2 px-2">Clientes</th>
          <th class="text-left py-2 px-2">Estado</th>
          <th class="text-right py-2 px-2">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="p in rows"
          :key="p.id"
          class="border-b border-[#f0f2f6] hover:bg-[#fafbfe]"
        >
          <td class="py-3 px-2">
            <div class="font-medium text-[#111]">{{ p.nombre }}</div>
            <div class="text-[12px] text-[#9aa]">
              {{ p.tipo_plan || 'Acceso general' }}
            </div>
          </td>

          <td class="py-3 px-2">{{ precio(p) }}</td>

          <td class="py-3 px-2">
            <span v-if="!p.servicios?.length" class="text-[#667]">—</span>
            <span v-else class="text-[#223]">
              {{ p.servicios.map(s => s.servicio_nombre || s.nombre).join(', ') }}
            </span>
          </td>

          <td class="py-3 px-2 text-[#667]">—</td>

          <td class="py-3 px-2">{{ p.clientes ?? '—' }}</td>

          <td class="py-3 px-2">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border"
              :class="(p.is_active ?? true)
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'"
            >
              {{ (p.is_active ?? true) ? 'Activo' : 'Archivado' }}
            </span>
          </td>

          <!-- Acciones: menú … -->
          <td class="py-3 px-2">
            <div class="relative flex justify-end" data-menu-root>
              <button
                class="h-9 w-9 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa] text-lg"
                :aria-expanded="openMenuId===p.id"
                aria-haspopup="menu"
                title="Acciones"
                @click.stop="toggleMenu(p.id)"
              >⋯</button>

              <div
                v-if="openMenuId===p.id"
                class="absolute right-0 mt-1 w-48 rounded-xl border border-[#e6e9ef] bg-white shadow-lg p-1 z-20"
                role="menu"
              >
                <button class="menu-item" role="menuitem" @click="emit('ver', p); closeMenu()">
                  Ver
                </button>
                <button class="menu-item" role="menuitem" @click="emit('editar', p); closeMenu()">
                  Editar
                </button>
                <button class="menu-item" role="menuitem" @click="emit('archivar', p); closeMenu()">
                  {{ (p.is_active ?? true) ? 'Archivar' : 'Activar' }}
                </button>
                <button class="menu-item" role="menuitem" @click="emit('duplicar', p); closeMenu()">
                  Duplicar
                </button>
                <button
                  class="menu-item !text-rose-600 hover:!bg-rose-50"
                  role="menuitem"
                  @click="emit('eliminar', p); closeMenu()"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({ rows: { type: Array, default: () => [] } })
const emit  = defineEmits(['ver','editar','archivar','eliminar','duplicar'])

/* menú … */
const openMenuId = ref(null)
function toggleMenu(id){ openMenuId.value = openMenuId.value===id ? null : id }
function closeMenu(){ openMenuId.value = null }
function onDocClick(e){ if(!e.target.closest?.('[data-menu-root]')) closeMenu() }
function onEsc(e){ if(e.key==='Escape') closeMenu() }
onMounted(()=>{ document.addEventListener('click', onDocClick); document.addEventListener('keydown', onEsc) })
onBeforeUnmount(()=>{ document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onEsc) })

function precio (p) {
  const val = p.precio || p.precio_mensual || p.total || null
  if (!val) return '$ — / mensual'
  try {
    return Number(val).toLocaleString('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:2 }) + ' / mensual'
  } catch { return `$ ${val} / mensual` }
}
</script>

<style scoped>
.menu-item{
  @apply w-full text-left px-3 py-2 rounded-lg text-[14px] text-[#223] hover:bg-[#f5f7fa];
}
</style>
