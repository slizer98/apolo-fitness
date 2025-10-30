<!-- src/views/empresas/EmpresaDetalle.vue -->
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/services'

const route = useRoute()
const empresaId = Number(route.params.id)

const empresa = ref(null)
const loadingEmpresa = ref(false)
const loadingSuc = ref(false)
const sucursales = ref([])

const showEmpresaModal = ref(false)
const isEditingEmpresa = ref(false)
const eForm = reactive({
  id: null,
  nombre: '',
  razon_social: '',
  rfc: '',
  direccion: '',
  telefono: '',
  correo: '',
  sitio_web: '',
  is_active: true,
})

const showSucModal = ref(false)
const isEditingSuc = ref(false)
const sForm = reactive({
  id: null,
  empresa: empresaId,
  nombre: '',
  direccion: '',
  telefono: '',
  correo: '',
  responsable: '',
  horario_apertura: '',
  horario_cierre: '',
  is_active: true,
})

/* ====================== Empresa ====================== */
async function loadEmpresa(){
  loadingEmpresa.value = true
  try{
    const { data } = await api.empresas.retrieve(empresaId)
    empresa.value = data
  }finally{
    loadingEmpresa.value = false
  }
}

async function loadSucursales(){
  loadingSuc.value = true
  try{
    const { data } = await api.sucursales.list({ empresa: empresaId, page_size: 500, ordering: 'nombre' })
    sucursales.value = data?.results || data || []
  }finally{
    loadingSuc.value = false
  }
}

function openEditEmpresa(){
  if(!empresa.value) return
  isEditingEmpresa.value = true
  Object.assign(eForm, {
    id: empresa.value.id,
    nombre: empresa.value.nombre || '',
    razon_social: empresa.value.razon_social || '',
    rfc: empresa.value.rfc || '',
    direccion: empresa.value.direccion || '',
    telefono: empresa.value.telefono || '',
    correo: empresa.value.correo || '',
    sitio_web: empresa.value.sitio_web || '',
    is_active: empresa.value.is_active !== false,
  })
  showEmpresaModal.value = true
}

async function saveEmpresa(){
  const payload = {
    nombre: eForm.nombre?.trim(),
    razon_social: eForm.razon_social?.trim(),
    rfc: eForm.rfc?.trim(),
    direccion: eForm.direccion?.trim(),
    telefono: eForm.telefono?.trim(),
    correo: eForm.correo?.trim(),
    sitio_web: eForm.sitio_web?.trim(),
    is_active: !!eForm.is_active,
  }
  try{
    await api.empresas.update(eForm.id, payload)
    showEmpresaModal.value = false
    await loadEmpresa()
  }catch(e){
    alert(e?.response?.data?.detail || 'Error al guardar empresa')
  }
}

async function toggleEmpresaActive(){
  if(!empresa.value) return
  try{
    await api.empresas.patch(empresa.value.id, { is_active: !empresa.value.is_active })
    await loadEmpresa()
  }catch{ alert('No se pudo actualizar estado') }
}

/* ====================== Sucursales ====================== */
function openNewSuc(){
  isEditingSuc.value = false
  Object.assign(sForm, {
    id: null,
    empresa: empresaId,
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
    responsable: '',
    horario_apertura: '',
    horario_cierre: '',
    is_active: true,
  })
  showSucModal.value = true
}

function openEditSuc(s){
  isEditingSuc.value = true
  Object.assign(sForm, {
    id: s.id,
    empresa: empresaId,
    nombre: s.nombre || '',
    direccion: s.direccion || '',
    telefono: s.telefono || '',
    correo: s.correo || '',
    responsable: s.responsable || '',
    horario_apertura: s.horario_apertura || '',
    horario_cierre: s.horario_cierre || '',
    is_active: s.is_active !== false,
  })
  showSucModal.value = true
}

async function saveSucursal(){
  const payload = {
    empresa: empresaId,
    nombre: sForm.nombre?.trim(),
    direccion: sForm.direccion?.trim(),
    telefono: sForm.telefono?.trim(),
    correo: sForm.correo?.trim(),
    responsable: sForm.responsable?.trim(),
    horario_apertura: sForm.horario_apertura || null,
    horario_cierre: sForm.horario_cierre || null,
    is_active: !!sForm.is_active,
  }
  try{
    if(isEditingSuc.value && sForm.id){
      await api.sucursales.update(sForm.id, payload)
    }else{
    await api.sucursales.create(payload)
    }
    showSucModal.value = false
    await loadSucursales()
  }catch(e){
    const msg = e?.response?.data
    alert(msg?.detail || msg?.nombre?.[0] || 'Error al guardar sucursal')
  }
}

async function toggleSucursalActive(s){
  try{
    await api.sucursales.patch(s.id, { is_active: !s.is_active })
    await loadSucursales()
  }catch{ alert('No se pudo actualizar estado') }
}

/* ====================== Lifecycle ====================== */
onMounted(async () => {
  await loadEmpresa()
  await loadSucursales()
})
</script>

<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="text-xs text-gray-500">
          <router-link to="/empresas" class="underline text-apolo-secondary hover:text-apolo-primary">← Volver</router-link>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">
          {{ loadingEmpresa ? 'Cargando…' : (empresa?.nombre || '—') }}
        </h2>
        <div class="text-sm text-gray-500">
          {{ empresa?.razon_social || '—' }}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="text-[11px] px-2 py-0.5 rounded-full"
          :class="empresa?.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'"
        >
          {{ empresa?.is_active !== false ? 'Activa' : 'Inactiva' }}
        </span>
        <button class="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition" @click="openEditEmpresa">
          Editar empresa
        </button>
        <button
          class="px-3 py-2 border rounded transition"
          :class="empresa?.is_active !== false ? 'border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'"
          @click="toggleEmpresaActive"
        >
          {{ empresa?.is_active !== false ? 'Desactivar' : 'Activar' }}
        </button>
      </div>
    </div>

    <!-- Info empresa -->
    <div class="border border-gray-200 rounded-xl p-4 bg-white text-sm text-gray-600">
      <div class="grid md:grid-cols-3 gap-3">
        <div><span class="text-gray-500">RFC:</span> <span class="text-gray-800">{{ empresa?.rfc || '—' }}</span></div>
        <div><span class="text-gray-500">Correo:</span> <span class="text-gray-800">{{ empresa?.correo || '—' }}</span></div>
        <div><span class="text-gray-500">Teléfono:</span> <span class="text-gray-800">{{ empresa?.telefono || '—' }}</span></div>
        <div class="md:col-span-3"><span class="text-gray-500">Dirección:</span> <span class="text-gray-800">{{ empresa?.direccion || '—' }}</span></div>
        <div class="md:col-span-3"><span class="text-gray-500">Sitio web:</span> <span class="text-gray-800">{{ empresa?.sitio_web || '—' }}</span></div>
      </div>
    </div>

    <!-- Sucursales -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">Sucursales</h3>
      <button class="px-3 py-2 rounded-lg border border-apolo-primary bg-apolo-primary text-white font-medium hover:bg-apolo-secondary hover:border-apolo-secondary transition-colors" @click="openNewSuc">
        Nueva sucursal
      </button>
    </div>

    <div class="border border-gray-200 rounded-xl p-3 bg-white shadow-sm">
      <div v-if="loadingSuc" class="py-10 text-center text-gray-500">Cargando…</div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="s in sucursales"
          :key="s.id"
          class="border border-gray-200 rounded-lg p-3 bg-white hover:border-apolo-primary hover:shadow-md transition cursor-pointer"
          @click="$router.push({ name: 'EmpresaSucursalDetalle', params: { id: empresaId, sucursalId: s.id } })"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-gray-800">{{ s.nombre }}</div>
              <div class="text-xs text-gray-500">{{ s.empresa_nombre }}</div>
            </div>
            <span
              class="text-[11px] px-2 py-0.5 rounded-full"
              :class="s.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'"
            >
              {{ s.is_active !== false ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <div class="mt-2 text-xs text-gray-500 space-y-0.5">
            <div>Tel: <b class="text-gray-700">{{ s.telefono || '—' }}</b></div>
            <div>Correo: <b class="text-gray-700">{{ s.correo || '—' }}</b></div>
            <div>Resp.: <b class="text-gray-700">{{ s.responsable || '—' }}</b></div>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            {{ s.direccion || '—' }}
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-[11px] text-gray-500">
              {{ s.horario_apertura || '—' }} - {{ s.horario_cierre || '—' }}
            </div>
            <div class="flex gap-2">
              <button class="px-2 py-1 border border-gray-300 rounded text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition" @click.stop="openEditSuc(s)">
                Editar
              </button>
              <button
                class="px-2 py-1 border rounded transition"
                :class="s.is_active !== false ? 'border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'"
                @click.stop="toggleSucursalActive(s)"
              >
                {{ s.is_active !== false ? 'Desactivar' : 'Activar' }}
              </button>
              <button
                class="px-2 py-1 border border-apolo-secondary rounded text-apolo-secondary hover:bg-apolo-secondary/10 transition"
                @click.stop="$router.push({ name: 'EmpresaSucursalDetalle', params: { id: empresaId, sucursalId: s.id } })"
              >
                Ver detalle
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ========================== Modales Empresa / Sucursal ========================== -->
    <!-- Modal Empresa -->
    <div v-if="showEmpresaModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showEmpresaModal=false">
      <div class="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Editar empresa</h3>
          <button @click="showEmpresaModal=false" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form @submit.prevent="saveEmpresa" class="p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Nombre</label>
            <input v-model.trim="eForm.nombre" required class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">Razón social</label>
            <input v-model.trim="eForm.razon_social" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">RFC</label>
            <input v-model.trim="eForm.rfc" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Dirección</label>
            <textarea v-model.trim="eForm.direccion" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"></textarea>
          </div>
          <div>
            <label class="text-sm text-gray-500">Teléfono</label>
            <input v-model.trim="eForm.telefono" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">Correo</label>
            <input v-model.trim="eForm.correo" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Sitio web</label>
            <input v-model.trim="eForm.sitio_web" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div class="sm:col-span-2 flex items-center justify-between">
            <label class="flex items-center gap-2 text-gray-700">
              <input type="checkbox" v-model="eForm.is_active" class="accent-apolo-primary"/>
              Activa
            </label>
            <div class="flex gap-2">
              <button type="button" @click="showEmpresaModal=false" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-white bg-apolo-primary hover:bg-apolo-secondary transition">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Sucursal -->
    <div v-if="showSucModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showSucModal=false">
      <div class="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ isEditingSuc ? 'Editar sucursal' : 'Nueva sucursal' }}</h3>
          <button @click="showSucModal=false" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form @submit.prevent="saveSucursal" class="p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Nombre</label>
            <input v-model.trim="sForm.nombre" required class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Dirección</label>
            <textarea v-model.trim="sForm.direccion" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"></textarea>
          </div>
          <div>
            <label class="text-sm text-gray-500">Teléfono</label>
            <input v-model.trim="sForm.telefono" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">Correo</label>
            <input v-model.trim="sForm.correo" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Responsable</label>
            <input v-model.trim="sForm.responsable" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">Apertura</label>
            <input v-model="sForm.horario_apertura" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">Cierre</label>
            <input v-model="sForm.horario_cierre" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>

          <div class="sm:col-span-2 flex items-center justify-between mt-1">
            <label class="flex items-center gap-2 text-gray-700">
              <input type="checkbox" v-model="sForm.is_active" class="accent-apolo-primary"/>
              Activa
            </label>
            <div class="flex gap-2">
              <button type="button" @click="showSucModal=false" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-white bg-apolo-primary hover:bg-apolo-secondary transition">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
