<template>
  <div class="rounded-2xl bg-white border border-gray-200 shadow-sm">
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-800">Esquema de precios</h3>

      <!-- Indicador del tipo activo -->
      <div v-if="tipo" class="text-sm text-gray-600">
        Mostrando precios para:
        <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
          {{ tipo }}
        </span>
      </div>
    </div>

    <div class="p-4">
      <!-- Vacío si no hay tipo -->
      <div v-if="!tipo" class="text-sm text-gray-500">
        Selecciona un <strong>Tipo de plan</strong> en la sección anterior para ver los precios disponibles.
      </div>

      <!-- Tabla de precios filtrados -->
      <div v-else class="overflow-x-auto border border-gray-200 rounded-xl">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr class="text-gray-600">
              <th class="px-3 py-2 text-left font-medium">Nombre</th>
              <th class="px-3 py-2 text-left font-medium">Frecuencia</th>
              <th class="px-3 py-2 text-left font-medium">Precio</th>
              <th class="px-3 py-2 text-left font-medium">Moneda</th>
              <th class="px-3 py-2 text-left font-medium">Activo</th>
              <th class="px-3 py-2 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in preciosFiltrados"
              :key="p.id || p._key"
              class="border-t border-gray-100 hover:bg-gray-50/60"
            >
              <td class="px-3 py-2 text-gray-800">{{ p.nombre }}</td>
              <td class="px-3 py-2 text-gray-700">{{ p.frecuencia || '—' }}</td>
              <td class="px-3 py-2 text-gray-800">
                {{ money(p.monto) }}
              </td>
              <td class="px-3 py-2 text-gray-700">{{ p.moneda || 'MXN' }}</td>
              <td class="px-3 py-2">
                <span
                  :class="p.activo ? chip.ok : chip.bad"
                  class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                >
                  <i :class="p.activo ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle-xmark'"></i>
                  {{ p.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-3 py-2 text-right">
                <button
                  class="px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700"
                  @click="$emit('edit', p)"
                >
                  Editar
                </button>
              </td>
            </tr>

            <tr v-if="!preciosFiltrados.length">
              <td colspan="6" class="px-3 py-6 text-center text-gray-500">
                No hay precios asignados a <strong>{{ tipo }}</strong>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Botón agregar -->
      <div class="mt-3 flex items-center justify-end">
        <button
          class="px-3 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90"
          @click="$emit('create', tipo)"
          :disabled="!tipo"
          :title="!tipo ? 'Selecciona un tipo de plan primero' : 'Agregar precio para este tipo'"
        >
          Agregar precio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** tipo seleccionado en PlanInfo (string) */
  tipo: { type: String, default: '' },
  /**
   * Lista completa de precios (Array)
   * Estructura recomendada de cada precio:
   * { id, nombre, tipo, frecuencia, monto, moneda, activo }
   * donde `tipo` debe coincidir con el tipo de plan (p. ej. "Estandar")
   */
  precios: { type: Array, default: () => [] },
})
defineEmits(['create', 'edit'])

const preciosFiltrados = computed(() => {
  const t = (props.tipo || '').toLowerCase()
  if (!t) return []
  return (props.precios || []).filter(p => String(p.tipo || '').toLowerCase() === t)
})

const chip = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  bad: 'bg-red-50 text-red-700 border-red-200',
}

function money (n) {
  if (n == null || n === '') return '—'
  try {
    return Number(n).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    })
  } catch { return n }
}
</script>
