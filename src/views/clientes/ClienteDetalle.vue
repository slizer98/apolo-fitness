<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-light">Cliente</h1>
        <p class="text-gray-400 mt-1">{{ fullName || '—' }}</p>
      </div>
      <div class="flex gap-2">
        <RouterLink :to="{ name:'ClienteEditar', params:{ id } }"
          class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Editar</RouterLink>
        <RouterLink :to="{ name:'ClientesLista' }"
          class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Volver</RouterLink>
      </div>
    </div>

    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Datos básicos -->
      <section class="lg:col-span-1 rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <h2 class="text-lg font-medium mb-2">Datos básicos</h2>
        <ul class="text-sm text-gray-300 space-y-1">
          <li><span class="text-gray-400">Nombre:</span> {{ fullName || '—' }}</li>
          <li><span class="text-gray-400">Correo:</span> {{ cliente.email || '—' }}</li>
          <li><span class="text-gray-400">Género:</span> {{ cliente.genero || '—' }}</li>
          <li><span class="text-gray-400">Fecha nacimiento:</span> {{ fmtDate(cliente.fecha_nacimiento) }}</li>
          <li><span class="text-gray-400">Contacto emergencia:</span> {{ cliente.contacto_emergencia || '—' }}</li>
          <li><span class="text-gray-400">Observaciones:</span> <span class="whitespace-pre-line">{{ cliente.observaciones || '—' }}</span></li>
          <li class="pt-2 grid grid-cols-2 gap-2">
            <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-800/70 border border-gray-700">
              <i class="fa fa-receipt"></i> Recibo: {{ cliente.recibo_pago ? 'Sí' : 'No' }}
            </span>
            <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-800/70 border border-gray-700">
              <i class="fa fa-bell"></i> Recordar venc.: {{ cliente.recordar_vencimiento ? 'Sí' : 'No' }}
            </span>
            <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-800/70 border border-gray-700">
              <i class="fa fa-bolt"></i> Promos: {{ cliente.recibir_promociones ? 'Sí' : 'No' }}
            </span>
            <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-800/70 border border-gray-700">
              <i class="fa fa-file-invoice"></i> Factura: {{ cliente.factura ? 'Sí' : 'No' }}
            </span>
          </li>
        </ul>
      </section>

      <!-- Contacto + Fiscales -->
      <section class="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
          <h2 class="text-lg font-medium mb-2">Datos de contacto</h2>
          <ul class="text-sm text-gray-300 space-y-1">
            <li v-for="d in datosContacto" :key="d.id" class="flex items-center justify-between border-b border-gray-800/60 py-1.5">
              <div>
                <span class="text-gray-400">{{ d.tipo }}:</span>
                <span class="ml-1">{{ d.valor }}</span>
              </div>
            </li>
            <li v-if="!datosContacto.length" class="text-gray-400">Sin datos.</li>
          </ul>
        </div>

        <div class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
          <h2 class="text-lg font-medium mb-2">Datos fiscales</h2>
          <ul class="text-sm text-gray-300 space-y-1">
            <li><span class="text-gray-400">RFC:</span> {{ fiscales.rfc || '—' }}</li>
            <li><span class="text-gray-400">Razón social:</span> {{ fiscales.razon_social || '—' }}</li>
            <li><span class="text-gray-400">Persona:</span> {{ fiscales.persona || '—' }}</li>
            <li><span class="text-gray-400">C.P.:</span> {{ fiscales.codigo_postal || '—' }}</li>
            <li><span class="text-gray-400">Régimen:</span> {{ fiscales.regimen_fiscal || '—' }}</li>
          </ul>
        </div>

        <div class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
          <h2 class="text-lg font-medium mb-2">Convenios</h2>
          <ul class="text-sm text-gray-300 space-y-1">
            <li v-for="cv in convenios" :key="cv.id" class="flex items-center justify-between border-b border-gray-800/60 py-1.5">
              <div class="truncate">
                <span class="text-gray-400">Empresa:</span> {{ cv.empresa_convenio || '—' }}
                <span class="text-gray-400 ml-3">Tipo:</span> {{ cv.tipo_cliente || '—' }}
              </div>
            </li>
            <li v-if="!convenios.length" class="text-gray-400">Sin convenios.</li>
          </ul>
        </div>

        <div class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
          <h2 class="text-lg font-medium mb-2">Sucursales asignadas</h2>
          <ul class="text-sm text-gray-300 space-y-1">
            <li v-for="cs in sucursales" :key="cs.id" class="flex items-center justify-between border-b border-gray-800/60 py-1.5">
              <div>
                <span class="text-gray-400">Sucursal:</span> {{ cs.sucursal_nombre || '—' }}
                <span class="text-gray-400 ml-3">Inicio:</span> {{ fmtDate(cs.fecha_inicio) }}
                <span class="text-gray-400 ml-3">Fin:</span> {{ fmtDate(cs.fecha_fin) }}
              </div>
            </li>
            <li v-if="!sucursales.length" class="text-gray-400">Sin asignaciones.</li>
          </ul>
        </div>

        <div class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4 lg:col-span-2">
          <h2 class="text-lg font-medium mb-2">Datos adicionales</h2>
          <ul class="text-sm text-gray-300 grid sm:grid-cols-2 gap-x-6">
            <li v-for="da in adicionales" :key="da.id" class="border-b border-gray-800/60 py-1.5">
              <span class="text-gray-400">{{ da.caracteristica_nombre || da.campo || 'Campo' }}:</span>
              <span class="ml-1">{{ da.valor || '—' }}</span>
            </li>
            <li v-if="!adicionales.length" class="text-gray-400">Sin datos.</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/api/services'

const route = useRoute()
const id = Number(route.params.id)

const loading = ref(true)
const cliente = ref({})
const datosContacto = ref([])
const fiscales = ref({})
const convenios = ref([])
const adicionales = ref([])
const sucursales = ref([])

const fullName = computed(() => [cliente.value.nombre, cliente.value.apellidos].filter(Boolean).join(' '))

onMounted(load)

async function load(){
  loading.value = true
  try{
    const [{ data: c },
       { data: dc },
       { data: df },
       { data: cv },
       { data: da },
       { data: cs }] = await Promise.all([
  api.clientes.retrieve(id),
  api.clientes.datosContacto.getByCliente(id),
  api.clientes.datosFiscales.getByCliente(id),
  api.clientes.convenios.getByCliente(id),
  api.clientes.datosAdicionales.getByCliente(id),
  api.clientes.clienteSucursales.getByCliente(id),
])

cliente.value      = c || {}

const toArray = (resp) => resp?.results ?? resp ?? []
datosContacto.value = toArray(dc)
convenios.value     = toArray(cv)
adicionales.value   = toArray(da)
sucursales.value    = toArray(cs)

// Datos fiscales: lista -> toma primero o null
const dfList = toArray(df)
fiscales.value = dfList.length ? dfList[0] : null
  } finally {
    loading.value = false
  }
}

function fmtDate(d){ if(!d) return '—'; try{ return new Date(d).toLocaleDateString('es-MX') }catch{ return d } }
</script>
