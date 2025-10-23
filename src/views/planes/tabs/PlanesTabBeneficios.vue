<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-900">Beneficios</h1>
      <button
        @click="openNew"
        class="rounded-lg px-4 py-2 bg-apolo-primary text-black hover:opacity-90 transition"
      >
        + Nuevo
      </button>
    </div>

    <!-- Card filtros + tabla -->
    <div class="rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
      <!-- Filtros -->
      <!-- <div class="mb-4 flex flex-wrap items-center gap-2">
        <div class="relative flex items-center rounded-lg border border-gray-300 bg-white px-2">
          <i class="fa fa-search text-gray-500 text-sm mr-1"></i>
          <input
            v-model="q"
            @keyup.enter="fetch"
            placeholder="Buscar beneficio…"
            class="h-9 w-64 outline-none text-[14px] placeholder-gray-400"
          />
        </div>
        <button
          @click="fetch"
          class="h-9 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-[14px] text-gray-700"
        >
          Buscar
        </button>
        <button
          @click="resetFilters"
          class="h-9 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-[14px] text-gray-700"
        >
          Limpiar
        </button>
        <span v-if="!loading" class="ml-auto text-sm text-gray-500">
          {{ count ?? rows.length }} resultados
        </span>
      </div> -->

      <!-- Skeleton -->
      <div v-if="loading" class="space-y-2">
        <div class="animate-pulse h-8 bg-gray-100 rounded" v-for="i in 6" :key="i"></div>
      </div>

      <!-- Tabla -->
      <div v-else class="overflow-x-auto">
        <TableBasic
          :rows="rows"
          :columns="columns"
          :initial-page-size="pageSize"
          :manual-pagination="true"
        />

        <!-- Paginación backend -->
        <div class="mt-4 flex items-center gap-2">
          <button
            :disabled="page<=1"
            @click="prev"
            class="px-3 h-9 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span class="text-gray-700">Página {{ page }}</span>
          <button
            :disabled="!hasMore"
            @click="next"
            class="px-3 h-9 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
          <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Editar beneficio' : 'Nuevo beneficio' }}
          </h3>
          <button class="h-8 w-8 rounded-lg border border-gray-200 hover:bg-gray-50" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-4" novalidate>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Nombre *</label>
              <input
                v-model.trim="form.nombre"
                @blur="form.nombre = (form.nombre || '').trim()"
                class="w-full h-10 rounded-lg border px-3"
                :class="errors.nombre ? 'border-red-400' : 'border-gray-300 focus:border-gray-400'"
                autocomplete="off"
              />
              <p v-if="errors.nombre" class="text-red-600 text-xs mt-1">{{ errors.nombre }}</p>
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">Tipo de descuento</label>
              <select
                v-model="form.tipo_descuento"
                class="w-full h-10 rounded-lg border border-gray-300 px-3 bg-white"
              >
                <option value="">—</option>
                <option value="porcentaje">Porcentaje</option>
                <option value="monto">Monto</option>
              </select>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                v-model.number="form.valor"
                :disabled="!form.tipo_descuento"
                class="w-full h-10 rounded-lg border px-3"
                :class="errors.valor ? 'border-red-400' : 'border-gray-300 focus:border-gray-400'"
              />
              <p v-if="errors.valor" class="text-red-600 text-xs mt-1">{{ errors.valor }}</p>
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">Unidad (opcional)</label>
              <input
                type="number"
                v-model.number="form.unidad"
                :disabled="!form.tipo_descuento"
                class="w-full h-10 rounded-lg border border-gray-300 px-3"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Descripción</label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              @click="closeModal"
              class="px-4 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 h-10 rounded-lg bg-apolo-primary text-black hover:opacity-90 disabled:opacity-60"
            >
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmación -->
    <div
      v-if="confirm.open"
      class="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50 p-4"
      @click.self="confirm.open=false"
    >
      <div class="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar</h3>
        <p class="text-sm text-gray-700">
          ¿Eliminar el beneficio <span class="font-semibold">{{ confirm.target?.nombre }}</span>?
        </p>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            @click="confirm.open=false"
            class="px-4 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="remove()"
            class="px-4 h-10 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toast.show"
        class="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xl z-50 text-gray-800"
      >
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, h } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
import TableBasic from '@/components/TableBasic.vue'

const ws = useWorkspaceStore()
const empresaId = computed(() => ws.empresaId)

const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 12
const count = ref(null)
const q = ref('')

const hasMore = computed(() =>
  count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize
)

const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = ref({})
const form = ref({ id:null, nombre:'', descripcion:'', tipo_descuento:'', valor:null, unidad:null })

const confirm = ref({ open:false, target:null })
const toast = ref({ show:false, message:'' })
function showToast(msg){ toast.value={ show:true, message:msg }; setTimeout(()=>toast.value.show=false, 2200) }

onMounted(fetch)

/* Limpia valor/unidad cuando no hay tipo_descuento */
watch(() => form.value.tipo_descuento, (t) => {
  if (!t) { form.value.valor = null; form.value.unidad = null }
})

async function fetch() {
  loading.value = true
  try {
    const { data } = await api.beneficios.list({ search: q.value, page: page.value, page_size: pageSize, ordering: '-id' })
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}
function resetFilters(){ q.value=''; page.value=1; fetch() }
function next(){ if(hasMore.value){ page.value++; fetch() } }
function prev(){ if(page.value>1){ page.value--; fetch() } }

function openNew(){
  isEditing.value = false
  errors.value = {}
  form.value = { id:null, nombre:'', descripcion:'', tipo_descuento:'', valor:null, unidad:null }
  showModal.value = true
}
function openEdit(b){
  isEditing.value = true
  errors.value = {}
  form.value = {
    id: b.id,
    nombre: b.nombre || '',
    descripcion: b.descripcion || '',
    tipo_descuento: b.tipo_descuento || '',
    valor: b.valor ?? null,
    unidad: b.unidad ?? null
  }
  showModal.value = true
}
function closeModal(){ showModal.value = false }

function validate(){
  const e = {}
  if(!form.value.nombre || !form.value.nombre.trim()){
    e.nombre = 'El nombre es obligatorio'
  }
  if(form.value.tipo_descuento && (form.value.valor === null || form.value.valor === '' || isNaN(form.value.valor))){
    e.valor = 'Indica el valor del descuento'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

function extractApiErrorMessage(err){
  const data = err?.response?.data
  if(!data) return 'Error al guardar'
  if(typeof data === 'object' && !Array.isArray(data)){
    const e = {}
    Object.entries(data).forEach(([k,v]) => {
      if(Array.isArray(v)) e[k] = String(v[0])
      else if(typeof v === 'string') e[k] = v
    })
    errors.value = { ...errors.value, ...e }
    const first = Object.values(e)[0]
    if(first) return first
  }
  if(typeof data?.detail === 'string') return data.detail
  return 'Error al guardar'
}

async function save(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = {
      nombre: (form.value.nombre || '').trim(),
      descripcion: (form.value.descripcion || '').trim(),
      tipo_descuento: form.value.tipo_descuento || '',
      ...(form.value.tipo_descuento ? { valor: form.value.valor ?? null, unidad: form.value.unidad ?? 0 } : {})
    }
    if(isEditing.value && form.value.id){
      await api.beneficios.update(form.value.id, payload)
      showToast('Beneficio actualizado')
    } else {
      await api.beneficios.create({ empresa: empresaId.value, ...payload })
      showToast('Beneficio creado')
    }
    closeModal()
    await fetch()
  } catch(e){
    const msg = extractApiErrorMessage(e)
    showToast(msg)
    console.error('Error al guardar beneficio:', e?.response?.data || e)
  } finally {
    saving.value = false
  }
}

function confirmRemove(b){ confirm.value = { open:true, target: b } }
async function remove(){
  try{
    await api.beneficios.delete(confirm.value.target.id)
    confirm.value = { open:false, target:null }
    if(rows.value.length === 1 && page.value > 1){ page.value -= 1 }
    await fetch()
    showToast('Beneficio eliminado')
  } catch(e){
    showToast(extractApiErrorMessage(e))
  }
}

/* ---------- Columnas para TableBasic ---------- */
const columns = [
  { accessorKey: 'nombre', header: 'Nombre',
    cell: ({ getValue }) => h('span', { class: 'font-medium text-gray-900' }, getValue())
  },
  { accessorKey: 'descripcion', header: 'Descripción',
    cell: ({ getValue }) => h('span', { class: 'text-gray-700' }, getValue() || '—')
  },
  { id: 'tipo', header: 'Tipo',
    cell: ({ row }) => h('span', { class: 'capitalize text-gray-700' }, row.original.tipo_descuento || '—')
  },
  { accessorKey: 'valor', header: 'Valor',
    cell: ({ getValue }) => h('span', { class: 'text-gray-700' }, getValue() ?? '—')
  },
  { accessorKey: 'unidad', header: 'Unidad',
    cell: ({ getValue }) => h('span', { class: 'text-gray-700' }, getValue() ?? '—')
  },
  { id: 'acciones',
    header: () => h('div', { class: 'text-right' }, 'Acciones'),
    enableSorting: false,
    cell: ({ row }) =>
      h('div', { class: 'flex items-center justify-end gap-2' }, [
        h('button', {
          class: 'px-3 h-9 rounded-lg border border-gray-300 hover:bg-gray-50',
          onClick: () => openEdit(row.original)
        }, 'Editar'),
        h('button', {
          class: 'px-3 h-9 rounded-lg border border-red-200 text-red-700 hover:bg-red-50',
          onClick: () => confirmRemove(row.original)
        }, 'Eliminar')
      ])
  }
]
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
