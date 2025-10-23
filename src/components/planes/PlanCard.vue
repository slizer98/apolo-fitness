<template>
  <article class="rounded-2xl border border-[#e6e9ef] bg-white shadow-sm p-4">
    <!-- Título + estado + clientes -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-semibold text-[#111]">{{ plan.nombre }}</h3>
        <p class="text-[13px] text-[#667] mt-1 line-clamp-2">
          {{ plan.descripcion || 'Descripción breve del plan…' }}
        </p>
      </div>
      <div class="text-right">
        <div class="text-[13px] text-[#111] font-medium">
          {{ precioTexto }}
        </div>
        <button
          class="mt-2 text-[12px] px-2 py-1 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
          @click="$emit('archivar', plan)"
        >Archivar</button>
      </div>
    </div>

    <!-- Chips: estado, clientes, multisucursal -->
    <div class="mt-3 flex flex-wrap gap-2">
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200 bg-emerald-50 text-emerald-700"
        v-if="plan.is_active ?? true"
      >Activo</span>
      <span
        v-if="plan.acceso_multisucursal"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-[#e6e9ef] bg-[#fafbfe] text-[#445]"
      >Multisucursal</span>
      <span
        v-if="clientes!=null"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-[#e6e9ef] bg-[#fafbfe] text-[#445]"
      >Clientes: {{ clientes }}</span>
    </div>

    <!-- Servicios (máx 2 “chips” largos para emular mockup) -->
    <div v-if="plan.servicios?.length" class="mt-3 space-y-1">
      <div
        v-for="(s, i) in plan.servicios.slice(0, 2)"
        :key="s.id || i"
        class="text-[12px] px-2 py-1 rounded-md inline-block bg-[#ecfdf5] text-[#0f8f57]"
      >
        Servicio: {{ s.servicio_nombre || s.nombre }}
      </div>
      <div v-if="plan.servicios.length>2" class="text-[12px] text-[#667]">
        +{{ plan.servicios.length - 2 }} más
      </div>
    </div>

    <!-- Footer acciones -->
    <div class="mt-4 flex items-center justify-end gap-2">
      <button
        class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
        @click="$emit('ver', plan)"
      >Editar</button>
      <button
        class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
        @click="$emit('duplicar', plan)"
      >Duplicar</button>
      <button
        class="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100"
        @click="$emit('eliminar', plan)"
      >Eliminar</button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  plan: { type: Object, required: true }
})

/* precio si lo tienes en el plan; si no, intenta leer de “precios”/“revisiones” que hayas incluido.
   De lo contrario muestra “— / mensual”. */
const precioTexto = computed(() => {
  const p = props.plan.precio || props.plan.precio_mensual || props.plan.total || null
  if (!p) return '$ — / mensual'
  try {
    return Number(p).toLocaleString('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:2 }) + ' / mensual'
  } catch { return `$ ${p} / mensual` }
})

const clientes = computed(() => props.plan.clientes ?? null)
</script>
