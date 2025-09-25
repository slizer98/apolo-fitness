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
    await alm_refreshAll() // refresca también almacenes
  }catch(e){
    const msg = e?.response?.data
    alert(msg?.detail || msg?.nombre?.[0] || 'Error al guardar sucursal')
  }
}

async function toggleSucursalActive(s){
  try{
    await api.sucursales.patch(s.id, { is_active: !s.is_active })
    await loadSucursales()
    await alm_refreshAll()
  }catch{ alert('No se pudo actualizar estado') }
}

/* ====================== Almacenes por sucursal ====================== */
/*  Usa tu servicio:
    api.inventario.almacenes.list({ sucursal, search?, ordering?, page_size? })
    api.inventario.almacenes.create / update / patch
*/
const alm_search = ref('')
const alm_loading = ref(false)
const alm_showModal = ref(false)
const alm_isEditing = ref(false)

const alm_map = reactive({}) // { [sucursalId]: { loading:bool, items: [] } }

const alm_form = reactive({
  id: null,
  empresa: empresaId,
  sucursal: null,
  nombre: '',
  descripcion: '',
  is_active: true,
})

function alm_resetForm(){
  Object.assign(alm_form, {
    id: null,
    empresa: empresaId,
    sucursal: null,
    nombre: '',
    descripcion: '',
    is_active: true,
  })
}

function alm_openCreate(sucursalId){
  alm_resetForm()
  alm_form.sucursal = sucursalId
  alm_isEditing.value = false
  alm_showModal.value = true
}

function alm_openEdit(item){
  alm_resetForm()
  alm_isEditing.value = true
  Object.assign(alm_form, {
    id: item.id,
    empresa: item.empresa,
    sucursal: item.sucursal,
    nombre: item.nombre || '',
    descripcion: item.descripcion || '',
    is_active: item.is_active !== false,
  })
  alm_showModal.value = true
}

async function alm_fetchAlmacenesFor(sucursalId){
  alm_map[sucursalId] = alm_map[sucursalId] || { loading:false, items: [] }
  alm_map[sucursalId].loading = true
  try{
    const params = { sucursal: sucursalId, ordering: 'nombre', page_size: 500 }
    if(alm_search.value) params.search = alm_search.value
    const { data } = await api.inventario.almacenes.list(params)
    alm_map[sucursalId].items = data?.results || data || []
  }finally{
    alm_map[sucursalId].loading = false
  }
}

async function alm_refreshAll(){
  // Reutiliza las sucursales ya cargadas
  alm_loading.value = true
  try{
    for (const s of sucursales.value) {
      await alm_fetchAlmacenesFor(s.id)
    }
  }finally{
    alm_loading.value = false
  }
}

async function alm_save(){
  const payload = {
    empresa: alm_form.empresa,
    sucursal: alm_form.sucursal,
    nombre: alm_form.nombre?.trim(),
    descripcion: alm_form.descripcion?.trim() || '',
    is_active: !!alm_form.is_active,
  }
  if(!payload.empresa || !payload.sucursal || !payload.nombre){
    alert('Selecciona sucursal y escribe el nombre.')
    return
  }
  try{
    if(alm_isEditing.value && alm_form.id){
      await api.inventario.almacenes.update(alm_form.id, payload)
    }else{
      await api.inventario.almacenes.create(payload)
    }
    alm_showModal.value = false
    await alm_fetchAlmacenesFor(payload.sucursal)
  }catch(e){
    const msg = e?.response?.data
    // Muestra errores comunes de unique/validación
    alert(msg?.detail || msg?.non_field_errors?.[0] || msg?.nombre?.[0] || 'Error al guardar almacén')
  }
}

async function alm_toggleActive(item){
  try{
    await api.inventario.almacenes.patch(item.id, { is_active: !item.is_active })
    await alm_fetchAlmacenesFor(item.sucursal)
  }catch{
    alert('No se pudo actualizar estado del almacén')
  }
}

/* ====================== Lifecycle ====================== */
onMounted(async () => {
  await loadEmpresa()
  await loadSucursales()
  await alm_refreshAll()
})
</script>

<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="text-xs text-gray-400">
          <router-link to="/empresas" class="underline">← Volver</router-link>
        </div>
        <h2 class="text-xl text-gray-100 font-semibold">
          {{ loadingEmpresa ? 'Cargando…' : (empresa?.nombre || '—') }}
        </h2>
        <div class="text-sm text-gray-400">
          {{ empresa?.razon_social || '—' }}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="text-[11px] px-2 py-0.5 rounded-full"
          :class="empresa?.is_active !== false ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'"
        >
          {{ empresa?.is_active !== false ? 'Activa' : 'Inactiva' }}
        </span>
        <button class="px-3 py-2 border border-gray-700 rounded text-gray-100 hover:border-gray-500" @click="openEditEmpresa">
          Editar empresa
        </button>
        <button
          class="px-3 py-2 border border-gray-700 rounded"
          :class="empresa?.is_active !== false ? 'text-amber-300 hover:border-amber-400' : 'text-emerald-300 hover:border-emerald-400'"
          @click="toggleEmpresaActive"
        >
          {{ empresa?.is_active !== false ? 'Desactivar' : 'Activar' }}
        </button>
      </div>
    </div>

    <!-- Info empresa -->
    <div class="border border-gray-800 rounded-xl p-4 bg-gray-950 text-sm text-gray-300">
      <div class="grid md:grid-cols-3 gap-3">
        <div><span class="text-gray-400">RFC:</span> <span class="text-gray-200">{{ empresa?.rfc || '—' }}</span></div>
        <div><span class="text-gray-400">Correo:</span> <span class="text-gray-200">{{ empresa?.correo || '—' }}</span></div>
        <div><span class="text-gray-400">Teléfono:</span> <span class="text-gray-200">{{ empresa?.telefono || '—' }}</span></div>
        <div class="md:col-span-3"><span class="text-gray-400">Dirección:</span> <span class="text-gray-200">{{ empresa?.direccion || '—' }}</span></div>
        <div class="md:col-span-3"><span class="text-gray-400">Sitio web:</span> <span class="text-gray-200">{{ empresa?.sitio_web || '—' }}</span></div>
      </div>
    </div>

    <!-- Sucursales -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg text-gray-100">Sucursales</h3>
      <button class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100" @click="openNewSuc">
        Nueva sucursal
      </button>
    </div>

    <div class="border border-gray-800 rounded-xl p-3 bg-gray-950">
      <div v-if="loadingSuc" class="py-10 text-center text-gray-400">Cargando…</div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="s in sucursales"
          :key="s.id"
          class="border border-gray-800 rounded-lg p-3 bg-gray-900"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-gray-100">{{ s.nombre }}</div>
              <div class="text-xs text-gray-400">{{ s.empresa_nombre }}</div>
            </div>
            <span
              class="text-[11px] px-2 py-0.5 rounded-full"
              :class="s.is_active !== false ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'"
            >
              {{ s.is_active !== false ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <div class="mt-2 text-xs text-gray-400 space-y-0.5">
            <div>Tel: <b class="text-gray-300">{{ s.telefono || '—' }}</b></div>
            <div>Correo: <b class="text-gray-300">{{ s.correo || '—' }}</b></div>
            <div>Resp.: <b class="text-gray-300">{{ s.responsable || '—' }}</b></div>
          </div>
          <div class="mt-2 text-xs text-gray-400">
            {{ s.direccion || '—' }}
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-[11px] text-gray-400">
              {{ s.horario_apertura || '—' }} - {{ s.horario_cierre || '—' }}
            </div>
            <div class="flex gap-2">
              <button class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500" @click="openEditSuc(s)">
                Editar
              </button>
              <button
                class="px-2 py-1 border border-gray-700 rounded"
                :class="s.is_active !== false ? 'text-amber-300 hover:border-amber-400' : 'text-emerald-300 hover:border-emerald-400'"
                @click="toggleSucursalActive(s)"
              >
                {{ s.is_active !== false ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ================================= Almacenes por sucursal ================================= -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg text-gray-100">Almacenes por sucursal</h3>
      <div class="flex gap-2">
        <input
          v-model="alm_search"
          @keyup.enter="alm_refreshAll"
          type="search"
          placeholder="Buscar almacén..."
          class="border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100 placeholder-gray-500"
        />
        <button class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100" @click="alm_refreshAll">
          Buscar
        </button>
      </div>
    </div>

    <div class="border border-gray-800 rounded-xl p-3 bg-gray-950">
      <div v-if="alm_loading" class="py-10 text-center text-gray-400">Cargando almacenes…</div>

      <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="s in sucursales" :key="s.id" class="border border-gray-800 rounded-xl p-4 bg-gray-900">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-gray-100">{{ s.nombre }}</h4>
            <button class="text-sm underline text-gray-200 hover:text-white" @click="alm_openCreate(s.id)">Nuevo almacén</button>
          </div>

          <div v-if="(alm_map[s.id]?.loading)" class="text-sm text-gray-500">Cargando…</div>

          <template v-else>
            <div v-if="(alm_map[s.id]?.items || []).length === 0" class="text-sm text-gray-500">
              Sin almacenes en esta sucursal.
            </div>

            <ul class="divide-y divide-gray-800">
              <li
                v-for="a in (alm_map[s.id]?.items || [])"
                :key="a.id"
                class="py-2 flex items-center justify-between"
              >
                <div>
                  <div class="font-medium text-gray-100">
                    {{ a.nombre }}
                    <span v-if="!a.is_active" class="ml-2 text-[11px] px-2 py-0.5 rounded-full border border-gray-700 text-gray-300">Inactivo</span>
                  </div>
                  <div v-if="a.descripcion" class="text-sm text-gray-400">
                    {{ a.descripcion }}
                  </div>
                </div>

                <details class="relative">
                  <summary class="cursor-pointer px-2 text-xl leading-none select-none text-gray-300">…</summary>
                  <div class="absolute right-0 mt-2 w-44 bg-gray-950 border border-gray-800 rounded-lg shadow z-10">
                    <button class="w-full text-left px-3 py-2 hover:bg-gray-900 text-gray-100" @click="alm_openEdit(a)">Editar</button>
                    <button class="w-full text-left px-3 py-2 hover:bg-gray-900 text-gray-100" @click="alm_toggleActive(a)">
                      {{ a.is_active ? 'Desactivar' : 'Reactivar' }}
                    </button>
                  </div>
                </details>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Almacén -->
    <div
      v-if="alm_showModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="alm_showModal=false"
    >
      <div class="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg text-gray-100">{{ alm_isEditing ? 'Editar almacén' : 'Nuevo almacén' }}</h3>
          <button @click="alm_showModal=false" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form class="p-4 space-y-4" @submit.prevent="alm_save" novalidate>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="text-sm text-gray-300">Empresa</label>
              <input class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100" :value="empresaId" disabled>
            </div>
            <div>
              <label class="text-sm text-gray-300">Sucursal</label>
              <select v-model="alm_form.sucursal" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100">
                <option :value="null" disabled>Selecciona sucursal</option>
                <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-300">Nombre</label>
            <input v-model.trim="alm_form.nombre" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100" placeholder="Nombre del almacén">
          </div>

          <div>
            <label class="text-sm text-gray-300">Descripción</label>
            <textarea v-model.trim="alm_form.descripcion" rows="3" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100" placeholder="Descripción (opcional)"></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input id="alm_activo" type="checkbox" v-model="alm_form.is_active" class="accent-white"/>
            <label for="alm_activo" class="text-sm text-gray-200">Activo</label>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-3 py-2 border border-gray-700 rounded-lg text-gray-100 hover:border-gray-500" @click="alm_showModal=false">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg text-white bg-black border border-gray-700 hover:border-gray-500">
              {{ alm_isEditing ? 'Guardar cambios' : 'Crear almacén' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================== Modales Empresa / Sucursal ========================== -->
    <!-- Modal Empresa -->
    <div v-if="showEmpresaModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showEmpresaModal=false">
      <div class="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg text-gray-100">Editar empresa</h3>
          <button @click="showEmpresaModal=false" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="saveEmpresa" class="p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Nombre</label>
            <input v-model.trim="eForm.nombre" required class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">Razón social</label>
            <input v-model.trim="eForm.razon_social" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">RFC</label>
            <input v-model.trim="eForm.rfc" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Dirección</label>
            <textarea v-model.trim="eForm.direccion" rows="2" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"></textarea>
          </div>
          <div>
            <label class="text-sm text-gray-300">Teléfono</label>
            <input v-model.trim="eForm.telefono" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">Correo</label>
            <input v-model.trim="eForm.correo" type="email" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Sitio web</label>
            <input v-model.trim="eForm.sitio_web" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div class="sm:col-span-2 flex items-center justify-between">
            <label class="flex items-center gap-2 text-gray-200">
              <input type="checkbox" v-model="eForm.is_active" class="accent-white"/>
              Activa
            </label>
            <div class="flex gap-2">
              <button type="button" @click="showEmpresaModal=false" class="px-3 py-2 border border-gray-700 rounded-lg text-gray-100 hover:border-gray-500">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-white bg-black border border-gray-700 hover:border-gray-500">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Sucursal -->
    <div v-if="showSucModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showSucModal=false">
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg text-gray-100">{{ isEditingSuc ? 'Editar sucursal' : 'Nueva sucursal' }}</h3>
          <button @click="showSucModal=false" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="saveSucursal" class="p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Nombre</label>
            <input v-model.trim="sForm.nombre" required class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Dirección</label>
            <textarea v-model.trim="sForm.direccion" rows="2" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"></textarea>
          </div>
          <div>
            <label class="text-sm text-gray-300">Teléfono</label>
            <input v-model.trim="sForm.telefono" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">Correo</label>
            <input v-model.trim="sForm.correo" type="email" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Responsable</label>
            <input v-model.trim="sForm.responsable" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">Apertura</label>
            <input v-model="sForm.horario_apertura" type="time" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">Cierre</label>
            <input v-model="sForm.horario_cierre" type="time" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>

          <div class="sm:col-span-2 flex items-center justify-between mt-1">
            <label class="flex items-center gap-2 text-gray-200">
              <input type="checkbox" v-model="sForm.is_active" class="accent-white"/>
              Activa
            </label>
            <div class="flex gap-2">
              <button type="button" @click="showSucModal=false" class="px-3 py-2 border border-gray-700 rounded-lg text-gray-100 hover:border-gray-500">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-white bg-black border border-gray-700 hover:border-gray-500">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
