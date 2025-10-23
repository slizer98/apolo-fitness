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
              {{ p.servicios.map(s=>s.servicio_nombre || s.nombre).join(', ') }}
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
            >{{ (p.is_active ?? true) ? 'Activo' : 'Archivado' }}</span>
          </td>
          <td class="py-3 px-2">
            <div class="flex justify-end gap-2">
              <button class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]" @click="$emit('ver', p)">
                Ver
              </button>
              <button class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]" @click="$emit('editar', p)">
                Editar
              </button>
              <button class="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100" @click="$emit('eliminar', p)">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({ rows: { type: Array, default: () => [] } })

function precio (p) {
  const val = p.precio || p.precio_mensual || p.total || null
  if (!val) return '$ — / mensual'
  try {
    return Number(val).toLocaleString('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:2 }) + ' / mensual'
  } catch { return `$ ${val} / mensual` }
}
</script>
