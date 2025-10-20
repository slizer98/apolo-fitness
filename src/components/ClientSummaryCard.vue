<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div class="flex justify-between items-start mb-3">
      <div class="text-center w-full">
        <div class="flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mx-auto mb-2">
          <i class="fa-solid fa-user text-2xl text-gray-400"></i>
        </div>
        <div class="font-semibold text-gray-900 leading-tight">
          {{ titleLine }}
        </div>
        <div
          class="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full mt-2"
          :class="badgeClass"
        >
          <i class="fa-solid" :class="cliente?.is_active ? 'fa-circle-check' : 'fa-circle-xmark'"></i>
          <span>{{ cliente?.is_active ? 'Activo' : 'Suspendido' }}</span>
          <template v-if="plan">
            <span>–</span>
            <span>Plan {{ plan }}</span>
          </template>
        </div>
      </div>
    </div>

    <div class="space-y-1 text-sm">
      <div class="flex gap-2"><span class="font-semibold">Próximo cobro:</span><span>{{ d(cliente?.proximo_cobro) }}</span></div>
      <div class="flex gap-2"><span class="font-semibold">Último pago:</span><span>{{ d(cliente?.ultimo_pago) }}</span></div>
      <div class="flex gap-2"><span class="font-semibold">Inscripción:</span><span>{{ d(cliente?.inscripcion) }}</span></div>
      <div class="flex gap-2" v-if="email"><span class="font-semibold">Email:</span><span class="truncate">{{ email }}</span></div>
      <div class="flex gap-2" v-if="rfc"><span class="font-semibold">RFC:</span><span>{{ rfc }}</span></div>
    </div>

    <div class="mt-4 flex items-center gap-2">
      <button class="px-4 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90" @click="$emit('cobrar')">
        Cobrar
      </button>
      <button class="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50" @click="$emit('renovar')">
        Renovar
      </button>

      <div class="relative ml-auto" ref="menuRoot">
        <button class="h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50" @click="toggle">
          …
        </button>
        <div
          v-if="open"
          class="absolute right-0 mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-lg p-1 z-10"
        >
          <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50" @click="emit('ver')">Ver / Editar</button>
          <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50" @click="emit('contacto')">Datos de contacto</button>
          <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50" @click="emit('fiscales')">Datos fiscales</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  cliente: { type: Object, default: null },
})
const emit = defineEmits(['ver', 'contacto', 'fiscales', 'cobrar', 'renovar'])

const titleLine = computed(() => {
  const n = [props.cliente?.nombre, props.cliente?.apellidos].filter(Boolean).join(' ').trim()
  if (!n) return 'Miembro'
  const parts = n.split(' ')
  if (parts.length > 1) return `${parts[0]} ${parts[1]?.[0] || ''}.`
  return n
})
const email = computed(() => props.cliente?.contacto?.email || props.cliente?.email || '')
const rfc = computed(() => props.cliente?.fiscal?.rfc || '')
const plan = computed(() => props.cliente?.plan_actual || '')
const badgeClass = computed(() =>
  props.cliente?.is_active
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : 'bg-red-50 text-red-700 border border-red-200'
)

function d(v) { try { return v ? new Date(v).toLocaleDateString('es-MX', { weekday:'short', day:'2-digit', month:'short', year:'numeric' }) : '—' } catch { return v || '—' } }

const open = ref(false)
const menuRoot = ref(null)
function toggle(){ open.value = !open.value }
function onDoc(e){ if (!menuRoot.value?.contains(e.target)) open.value = false }
onMounted(()=> document.addEventListener('click', onDoc))
onBeforeUnmount(()=> document.removeEventListener('click', onDoc))
</script>
