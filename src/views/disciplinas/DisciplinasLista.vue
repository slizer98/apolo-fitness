<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Disciplinas</h1>
      <button @click="openNew" class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition">
        + Nueva
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input v-model="q" @keyup.enter="fetch" placeholder="Buscar disciplina…"
             class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64" />
      <button @click="fetch" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Buscar</button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Limpiar</button>
    </div>

    <!-- Tabla -->
    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <table v-else class="w-full text-sm">
      <thead class="text-gray-400">
        <tr>
          <th class="text-left pb-2">Nombre</th>
          <th class="text-left pb-2">Instructor</th>
          <th class="text-left pb-2">Límite</th>
          <th class="text-left pb-2">Recomendaciones</th>
          <th class="text-right pb-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in rows" :key="d.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
          <td class="py-2">{{ d.nombre }}</td>
          <td class="py-2 text-gray-300">{{ d.instructor_nombre || '—' }}</td>
          <td class="py-2 text-gray-300">{{ d.limite_personas ?? '—' }}</td>
          <td class="py-2 text-gray-300 truncate max-w-[360px]">{{ d.recomendaciones || '—' }}</td>
          <td class="py-2">
            <div class="flex items-center justify-end gap-2">
              <button @click="openHorarios(d)" class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Horarios</button>
              <button @click="openEdit(d)" class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Editar</button>
              <button @click="confirmRemove(d)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Eliminar</button>
            </div>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="5" class="py-6 text-center text-gray-400">Sin resultados</td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div class="mt-4 flex items-center gap-2">
      <button :disabled="page<=1" @click="prev" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Anterior</button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button :disabled="!hasMore" @click="next" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Siguiente</button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>

    <!-- Modal Crear/Editar Disciplina -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">{{ isEditing ? 'Editar disciplina' : 'Nueva disciplina' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input v-model="form.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
            </div>

            <div>
              <label class="block text-xs text-gray-400 mb-1">Instructor</label>
              <!-- Buscador con debounce -->
              <div class="relative">
                <input
                  v-model="instructorQuery"
                  @input="debouncedSearchInstructors"
                  placeholder="Buscar por nombre/usuario…"
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                />
                <div v-if="showInstructorDrop" class="absolute z-10 mt-1 w-full bg-gray-950 border border-gray-800 rounded-xl max-h-48 overflow-auto">
                  <button
                    v-for="u in instructorOptions"
                    :key="u.id"
                    type="button"
                    class="w-full text-left px-3 py-2 hover:bg-gray-900"
                    @click="selectInstructor(u)"
                  >
                    {{ u.full_name || (u.first_name + ' ' + u.last_name).trim() || u.username }} <span class="text-gray-400 text-xs">(#{{ u.id }})</span>
                  </button>
                  <div v-if="!instructorOptions.length" class="px-3 py-2 text-gray-400 text-sm">Sin resultados</div>
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-1">Seleccionado: <span class="text-gray-200">{{ instructorLabel || '—' }}</span></p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Límite de personas</label>
              <input type="number" min="0" v-model.number="form.limite_personas" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p class="text-[11px] text-gray-400 mt-1">0 = sin límite</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Recomendaciones</label>
              <input v-model="form.recomendaciones" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Drawer Horarios -->
    <div v-if="horarios.open" class="fixed inset-0 z-50 flex">
      <div class="flex-1 bg-black/60" @click="closeHorarios"></div>
      <div class="w-full max-w-lg bg-gray-950 border-l border-gray-800 h-full overflow-auto">
        <div class="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Horarios: {{ horarios.disciplina?.nombre }}</h3>
          <button @click="closeHorarios" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 space-y-4">
          <!-- Form nuevo horario -->
          <form @submit.prevent="saveHorario" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora inicio *</label>
              <input v-model="horarioForm.hora_inicio" type="time" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora fin *</label>
              <input v-model="horarioForm.hora_fin" type="time" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div class="col-span-2 flex items-center justify-end gap-2">
              <button type="submit" :disabled="savingHorario" class="px-3 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
                {{ savingHorario ? 'Agregando…' : 'Agregar' }}
              </button>
            </div>
          </form>

          <!-- Lista horarios -->
          <div>
            <h4 class="text-sm text-gray-300 mb-2">Horarios actuales</h4>
            <div v-if="loadingHorarios" class="space-y-2">
              <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 3" :key="i"></div>
            </div>
            <ul v-else class="space-y-2">
              <li v-for="h in horarios.items" :key="h.id" class="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2">
                <span>{{ h.hora_inicio }} — {{ h.hora_fin }}</span>
                <button @click="confirmRemoveHorario(h)" class="text-red-400 hover:text-red-300 text-sm">Eliminar</button>
              </li>
              <li v-if="!horarios.items.length" class="text-gray-400 text-sm">Sin horarios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmación eliminar disciplina -->
    <div v-if="confirm.open" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl shadow-xl p-4">
        <h3 class="text-lg mb-2">Confirmar</h3>
        <p class="text-sm text-gray-300">¿Eliminar la disciplina <span class="font-semibold">{{ confirm.target?.nombre }}</span>?</p>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button @click="confirm.open=false" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button @click="remove" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Confirmación eliminar horario -->
    <div v-if="confirmHorario.open" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl shadow-xl p-4">
        <h3 class="text-lg mb-2">Confirmar</h3>
        <p class="text-sm text-gray-300">¿Eliminar este horario?</p>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button @click="confirmHorario.open=false" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button @click="removeHorario" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl z-50">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/services'

/* ====== listado ====== */
const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 12
const count = ref(null)
const q = ref('')

const hasMore = computed(() => count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize)
onMounted(fetch)

async function fetch(){
  loading.value = true
  try{
    const { data } = await api.disciplinas.list({ search: q.value, page: page.value, page_size: pageSize, ordering: '-id' })
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } finally { loading.value = false }
}
function resetFilters(){ q.value=''; page.value=1; fetch() }
function next(){ if(hasMore.value){ page.value++; fetch() } }
function prev(){ if(page.value>1){ page.value--; fetch() } }

/* ====== form disciplina ====== */
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = ref({})
const form = ref({
  id: null,
  nombre: '',
  instructor: null, // id
  limite_personas: 0,
  recomendaciones: ''
})
function openNew(){
  isEditing.value = false
  errors.value = {}
  form.value = { id:null, nombre:'', instructor:null, limite_personas:0, recomendaciones:'' }
  instructorQuery.value = ''
  instructorOptions.value = []
  instructorSelected.value = null
  showModal.value = true
}
function openEdit(d){
  isEditing.value = true
  errors.value = {}
  form.value = {
    id: d.id,
    nombre: d.nombre || '',
    instructor: d.instructor || null,
    limite_personas: d.limite_personas ?? 0,
    recomendaciones: d.recomendaciones || ''
  }
  instructorSelected.value = d.instructor ? { id:d.instructor, full_name: d.instructor_nombre } : null
  instructorQuery.value = instructorSelected.value?.full_name || ''
  showModal.value = true
}
function closeModal(){ showModal.value = false }

function validate(){
  const e = {}
  if(!form.value.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = {
      nombre: form.value.nombre.trim(),
      instructor: form.value.instructor || null,
      limite_personas: form.value.limite_personas ?? 0,
      recomendaciones: form.value.recomendaciones?.trim() || ''
    }
    if(isEditing.value && form.value.id){
      await api.disciplinas.update(form.value.id, payload)
      showToast('Disciplina actualizada')
    } else {
      await api.disciplinas.create(payload)
      showToast('Disciplina creada')
    }
    closeModal()
    await fetch()
  } catch(e){
    showToast(e?.response?.data?.detail || 'Error al guardar')
  } finally { saving.value = false }
}

/* ====== eliminar disciplina ====== */
const confirm = ref({ open:false, target:null })
function confirmRemove(d){ confirm.value = { open:true, target:d } }
async function remove(){
  try{
    await api.disciplinas.delete(confirm.value.target.id)
    confirm.value = { open:false, target:null }
    if(rows.value.length === 1 && page.value > 1){ page.value -= 1 }
    await fetch()
    showToast('Disciplina eliminada')
  } catch(e){
    showToast(e?.response?.data?.detail || 'No se pudo eliminar')
  }
}

/* ====== instructores (buscar usuarios) ====== */
const instructorQuery = ref('')
const instructorOptions = ref([])
const instructorSelected = ref(null)
const showInstructorDrop = computed(() => instructorQuery.value && document.activeElement === instructorInputEl.value)
const instructorInputEl = ref(null)

const instructorLabel = computed(() => {
  const u = instructorSelected.value
  if(!u) return ''
  return u.full_name || ((u.first_name||'') + ' ' + (u.last_name||'')).trim() || u.username || `#${u.id}`
})

function selectInstructor(u){
  instructorSelected.value = u
  form.value.instructor = u.id
  instructorQuery.value = instructorLabel.value
  instructorOptions.value = []
}

let searchTimer = null
function debouncedSearchInstructors(){
  clearTimeout(searchTimer)
  searchTimer = setTimeout(searchInstructors, 300)
}
async function searchInstructors(){
  if(!instructorQuery.value?.trim()){
    instructorOptions.value = []
    return
  }
  try{
    const { data } = await api.usuariosEmpresa.list({ search: instructorQuery.value.trim(), page_size: 10 })
    const rows = data?.results || data || []
    instructorOptions.value = rows.map(u => ({
      id: u.id,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      full_name: u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ')
    }))
  } catch{
    instructorOptions.value = []
  }
}

/* ====== horarios de una disciplina ====== */
const horarios = ref({ open:false, disciplina:null, items:[] })
const loadingHorarios = ref(false)
const savingHorario = ref(false)
const horarioForm = ref({ hora_inicio:'', hora_fin:'' })

function openHorarios(d){
  horarios.value = { open:true, disciplina:d, items:[] }
  horarioForm.value = { hora_inicio:'', hora_fin:'' }
  fetchHorarios()
}
function closeHorarios(){ horarios.value = { open:false, disciplina:null, items:[] } }

async function fetchHorarios(){
  if(!horarios.value.disciplina?.id) return
  loadingHorarios.value = true
  try{
    const { data } = await api.horariosDisciplinas.list({ disciplina: horarios.value.disciplina.id, ordering: 'hora_inicio' })
    horarios.value.items = data?.results || data || []
  } finally { loadingHorarios.value = false }
}

async function saveHorario(){
  if(!horarios.value.disciplina?.id) return
  if(!horarioForm.value.hora_inicio || !horarioForm.value.hora_fin){
    showToast('Completa hora inicio y fin'); return
  }
  savingHorario.value = true
  try{
    await api.horariosDisciplinas.create({
      disciplina: horarios.value.disciplina.id,
      hora_inicio: horarioForm.value.hora_inicio,
      hora_fin: horarioForm.value.hora_fin
    })
    horarioForm.value = { hora_inicio:'', hora_fin:'' }
    await fetchHorarios()
    showToast('Horario agregado')
  } catch(e){
    showToast(e?.response?.data?.detail || 'Error al agregar horario')
  } finally { savingHorario.value = false }
}

/* eliminar horario */
const confirmHorario = ref({ open:false, target:null })
function confirmRemoveHorario(h){ confirmHorario.value = { open:true, target:h } }
async function removeHorario(){
  try{
    await api.horariosDisciplinas.delete(confirmHorario.value.target.id)
    confirmHorario.value = { open:false, target:null }
    await fetchHorarios()
    showToast('Horario eliminado')
  } catch(e){
    showToast(e?.response?.data?.detail || 'No se pudo eliminar horario')
  }
}

/* ====== toast ====== */
const toast = ref({ show:false, message:'' })
function showToast(msg){ toast.value={ show:true, message:msg }; setTimeout(()=>toast.value.show=false, 1800) }
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
