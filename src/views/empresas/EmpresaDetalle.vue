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
  <div class="p-4 space-y-6 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="text-xs text-apolo-gray-light">
          <router-link to="/empresas" class="underline text-apolo-secondary hover:text-apolo-primary">← Volver</router-link>
        </div>
        <h2 class="text-xl text-white font-semibold">
          {{ loadingEmpresa ? 'Cargando…' : (empresa?.nombre || '—') }}
        </h2>
        <div class="text-sm text-apolo-gray-light">
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
        <button class="px-3 py-2 border border-apolo-primary/40 rounded text-white hover:border-apolo-secondary hover:text-apolo-secondary transition-colors" @click="openEditEmpresa">
          Editar empresa
        </button>
        <button
          class="px-3 py-2 border rounded transition-colors"
          :class="empresa?.is_active !== false ? 'border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10' : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'"
          @click="toggleEmpresaActive"
        >
          {{ empresa?.is_active !== false ? 'Desactivar' : 'Activar' }}
        </button>
      </div>
    </div>

    <!-- Info empresa -->
    <div class="border border-apolo-primary/30 rounded-xl p-4 bg-apolo-dark/80 text-sm text-apolo-gray-light">
      <div class="grid md:grid-cols-3 gap-3">
        <div><span class="text-apolo-gray-light">RFC:</span> <span class="text-white">{{ empresa?.rfc || '—' }}</span></div>
        <div><span class="text-apolo-gray-light">Correo:</span> <span class="text-white">{{ empresa?.correo || '—' }}</span></div>
        <div><span class="text-apolo-gray-light">Teléfono:</span> <span class="text-white">{{ empresa?.telefono || '—' }}</span></div>
        <div class="md:col-span-3"><span class="text-apolo-gray-light">Dirección:</span> <span class="text-white">{{ empresa?.direccion || '—' }}</span></div>
        <div class="md:col-span-3"><span class="text-apolo-gray-light">Sitio web:</span> <span class="text-white">{{ empresa?.sitio_web || '—' }}</span></div>
      </div>
    </div>

    <!-- Sucursales -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg text-white">Sucursales</h3>
      <button class="px-3 py-2 rounded-lg border border-apolo-primary bg-apolo-primary text-apolo-dark font-medium hover:bg-apolo-secondary hover:border-apolo-secondary transition-colors" @click="openNewSuc">
        Nueva sucursal
      </button>
    </div>

    <div class="border border-apolo-primary/30 rounded-xl p-3 bg-apolo-dark/80">
      <div v-if="loadingSuc" class="py-10 text-center text-apolo-gray-light">Cargando…</div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="s in sucursales"
          :key="s.id"
          class="border border-apolo-primary/30 rounded-lg p-3 bg-apolo-gray-dark hover:border-apolo-secondary transition-colors cursor-pointer"
          @click="$router.push({ name: 'EmpresaSucursalDetalle', params: { id: empresaId, sucursalId: s.id } })"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-white">{{ s.nombre }}</div>
              <div class="text-xs text-apolo-gray-light">{{ s.empresa_nombre }}</div>
            </div>
            <span
              class="text-[11px] px-2 py-0.5 rounded-full"
              :class="s.is_active !== false ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'"
            >
              {{ s.is_active !== false ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <div class="mt-2 text-xs text-apolo-gray-light space-y-0.5">
            <div>Tel: <b class="text-white">{{ s.telefono || '—' }}</b></div>
            <div>Correo: <b class="text-white">{{ s.correo || '—' }}</b></div>
            <div>Resp.: <b class="text-white">{{ s.responsable || '—' }}</b></div>
          </div>
          <div class="mt-2 text-xs text-apolo-gray-light">
            {{ s.direccion || '—' }}
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-[11px] text-apolo-gray-light">
              {{ s.horario_apertura || '—' }} - {{ s.horario_cierre || '—' }}
            </div>
            <div class="flex gap-2">
              <button class="px-2 py-1 border border-apolo-primary/40 rounded text-white hover:border-apolo-secondary hover:text-apolo-secondary transition-colors" @click.stop="openEditSuc(s)">
                Editar
              </button>
              <button
                class="px-2 py-1 border rounded transition-colors"
                :class="s.is_active !== false ? 'border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10' : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'"
                @click.stop="toggleSucursalActive(s)"
              >
                {{ s.is_active !== false ? 'Desactivar' : 'Activar' }}
              </button>
              <button
                class="px-2 py-1 border border-apolo-primary/40 rounded text-apolo-secondary hover:border-apolo-secondary hover:bg-apolo-secondary/10 transition-colors"
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
    <div v-if="showEmpresaModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showEmpresaModal=false">
      <div class="w-full max-w-2xl bg-apolo-dark border border-apolo-primary/40 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-apolo-primary/30 flex items-center justify-between">
          <h3 class="text-lg text-white">Editar empresa</h3>
          <button @click="showEmpresaModal=false" class="text-apolo-gray-light hover:text-white">✕</button>
        </div>

        <form @submit.prevent="saveEmpresa" class="p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-sm text-apolo-gray-light">Nombre</label>
            <input v-model.trim="eForm.nombre" required class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">Razón social</label>
            <input v-model.trim="eForm.razon_social" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">RFC</label>
            <input v-model.trim="eForm.rfc" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-apolo-gray-light">Dirección</label>
            <textarea v-model.trim="eForm.direccion" rows="2" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"></textarea>
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">Teléfono</label>
            <input v-model.trim="eForm.telefono" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">Correo</label>
            <input v-model.trim="eForm.correo" type="email" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-apolo-gray-light">Sitio web</label>
            <input v-model.trim="eForm.sitio_web" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div class="sm:col-span-2 flex items-center justify-between">
            <label class="flex items-center gap-2 text-white">
              <input type="checkbox" v-model="eForm.is_active" class="accent-white"/>
              Activa
            </label>
            <div class="flex gap-2">
              <button type="button" @click="showEmpresaModal=false" class="px-3 py-2 border border-apolo-primary/40 rounded-lg text-white hover:border-apolo-secondary hover:text-apolo-secondary transition-colors">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-apolo-dark bg-apolo-primary hover:bg-apolo-secondary transition-colors">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Sucursal -->
    <div v-if="showSucModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showSucModal=false">
      <div class="w-full max-w-xl bg-apolo-dark border border-apolo-primary/40 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-apolo-primary/30 flex items-center justify-between">
          <h3 class="text-lg text-white">{{ isEditingSuc ? 'Editar sucursal' : 'Nueva sucursal' }}</h3>
          <button @click="showSucModal=false" class="text-apolo-gray-light hover:text-white">✕</button>
        </div>

        <form @submit.prevent="saveSucursal" class="p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-sm text-apolo-gray-light">Nombre</label>
            <input v-model.trim="sForm.nombre" required class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-apolo-gray-light">Dirección</label>
            <textarea v-model.trim="sForm.direccion" rows="2" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"></textarea>
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">Teléfono</label>
            <input v-model.trim="sForm.telefono" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">Correo</label>
            <input v-model.trim="sForm.correo" type="email" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-apolo-gray-light">Responsable</label>
            <input v-model.trim="sForm.responsable" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">Apertura</label>
            <input v-model="sForm.horario_apertura" type="time" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">Cierre</label>
            <input v-model="sForm.horario_cierre" type="time" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"/>
          </div>

          <div class="sm:col-span-2 flex items-center justify-between mt-1">
            <label class="flex items-center gap-2 text-white">
              <input type="checkbox" v-model="sForm.is_active" class="accent-white"/>
              Activa
            </label>
            <div class="flex gap-2">
              <button type="button" @click="showSucModal=false" class="px-3 py-2 border border-apolo-primary/40 rounded-lg text-white hover:border-apolo-secondary hover:text-apolo-secondary transition-colors">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-apolo-dark bg-apolo-primary hover:bg-apolo-secondary transition-colors">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
