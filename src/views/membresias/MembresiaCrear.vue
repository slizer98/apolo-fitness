<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

/**
 * MembresiaCrear.vue
 * - Modo oscuro (sin fondos blancos)
 * - Selección de revisión del plan (opcional; si no se elige, backend usa vigente)
 * - Resumen de revisión (precios, restricciones, servicios, beneficios, disciplinas)
 */

const route = useRoute()
const router = useRouter()
const ws = useWorkspaceStore()

const form = reactive({
  empresa: null,
  sucursal: null,
  cliente: null,
  plan: null,
  plan_revision: null,
  fecha_alta: new Date().toISOString().slice(0,10),
  fecha_vencimiento: '',
  renovacion: false,
})

const empresas = ref([])      // Si tu API de empresas ya está en otro store, puedes poblarla desde ahí
const sucursales = ref([])
const clientes = ref([])
const planes = ref([])
const revisiones = ref([])

const loading = ref(false)
const saving = ref(false)

/* Snapshot de la revisión seleccionada */
const snapshot = ref({ precios: [], restricciones: [], servicios: [], beneficios: [], disciplinas: [] })
const loadingSnap = ref(false)

/* Query params (por si venimos desde la lista con ?plan=&revision=) */
const planQuery = computed(() => Number(route.query.plan || 0) || null)
const revisionQuery = computed(() => Number(route.query.revision || 0) || null)

/* ====== Carga de datos base ====== */
async function loadBasics () {
  loading.value = true
  try {
    // Si manejas empresa actual en store
    if (ws?.empresaId) form.empresa = ws.empresaId

    const [sucs, cls, pls] = await Promise.all([
      api.sucursales.list({ page_size: 200, ordering: 'nombre' }),
      api.clientes.list({ page_size: 200, ordering: '-id' }),
      api.planes.list({ page_size: 200, ordering: 'nombre' }),
    ])
    sucursales.value = sucs.data?.results || sucs.data || []
    clientes.value = cls.data?.results || cls.data || []
    planes.value = pls.data?.results || pls.data || []

    // Si venimos con plan preseleccionado
    if (planQuery.value) {
      form.plan = planQuery.value
      await loadRevisiones()
      if (revisionQuery.value) {
        form.plan_revision = revisionQuery.value
      } else {
        const rv = await api.planes.revisiones.getVigente(form.plan, form.fecha_alta)
        form.plan_revision = rv?.id || null
      }
    }
  } finally {
    loading.value = false
  }
}

/* ====== Revisiones ====== */
async function loadRevisiones () {
  revisiones.value = []
  form.plan_revision = null
  if (!form.plan) return
  const { data } = await api.planes.revisiones.list({ plan: form.plan, ordering: '-version', page_size: 50 })
  revisiones.value = data?.results || data || []
  const rv = await api.planes.revisiones.getVigente(form.plan, form.fecha_alta)
  if (rv) form.plan_revision = rv.id
}

watch(() => form.plan, loadRevisiones)

/* Fecha cambia -> recalcular “vigente” por cortesía (si el usuario no eligió manualmente) */
watch(() => form.fecha_alta, async () => {
  if (form.plan) {
    const rv = await api.planes.revisiones.getVigente(form.plan, form.fecha_alta)
    if (rv) form.plan_revision = rv.id
  }
})

/* ====== Snapshot de la revisión ====== */
async function loadSnapshot() {
  snapshot.value = { precios: [], restricciones: [], servicios: [], beneficios: [], disciplinas: [] }
  if (!form.plan_revision) return
  loadingSnap.value = true
  try {
    snapshot.value = await api.planes.revisiones.getSnapshot(form.plan_revision)
  } finally {
    loadingSnap.value = false
  }
}
watch(() => form.plan_revision, loadSnapshot)

/* ====== Guardar alta ====== */
async function save () {
  saving.value = true
  try {
    const payload = {
      empresa: form.empresa,
      sucursal: form.sucursal,
      cliente: form.cliente,
      plan: form.plan,
      plan_revision: form.plan_revision || undefined, // backend decide vigente si viene vacío
      fecha_alta: form.fecha_alta || undefined,
      fecha_vencimiento: form.fecha_vencimiento || undefined,
      renovacion: form.renovacion,
    }
    await api.altasPlan.create(payload)
    alert('Alta creada correctamente')
    router.push({ name: 'MembresiasLista' })
  } catch (e) {
    console.error(e)
    alert('No se pudo crear el alta')
  } finally {
    saving.value = false
  }
}

onMounted(loadBasics)

/* ====== Helpers de UI ====== */
function fmtRange(a, b){
  const f = (x) => x ? new Date(x).toLocaleDateString() : '—'
  return `${f(a)} → ${f(b)}`
}
</script>

<template>
  <div class="p-4 max-w-6xl mx-auto text-gray-100">
    <div class="mb-4">
      <h1 class="text-xl font-semibold">Nueva alta de membresía</h1>
      <p class="text-sm text-gray-400">El alta quedará ligada a la revisión publicada del plan.</p>
    </div>

    <!-- Contenedor principal oscuro -->
    <div class="rounded-xl border border-gray-800 bg-gray-950 p-4">
      <div v-if="loading" class="text-sm text-gray-400">Cargando…</div>

      <div v-else class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Empresa</label>
          <select v-model="form.empresa" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option :value="null" disabled>Selecciona empresa</option>
            <!-- Si necesitas cargar empresas desde API, reemplázalo; aquí se deja vacío o se puede poblar desde ws -->
            <option v-if="!empresas.length && form.empresa" :value="form.empresa">Empresa #{{ form.empresa }}</option>
            <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Sucursal</label>
          <select v-model="form.sucursal" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option :value="null" disabled>Selecciona sucursal</option>
            <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Cliente</label>
          <select v-model="form.cliente" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option :value="null" disabled>Selecciona cliente</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombres }} {{ c.apellidos }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Plan</label>
          <select v-model="form.plan" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option :value="null" disabled>Selecciona plan</option>
            <option v-for="p in planes" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Fecha de alta</label>
          <input type="date" v-model="form.fecha_alta" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Fecha de vencimiento</label>
          <input type="date" v-model="form.fecha_vencimiento" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-medium text-gray-400 mb-1">Revisión del plan</label>
          <div class="flex items-center gap-2">
            <select v-model="form.plan_revision" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              <option :value="null">— Usar vigente automáticamente —</option>
              <option v-for="r in revisiones" :key="r.id" :value="r.id">
                v{{ r.version }} — {{ r.vigente_desde || 'sin inicio' }} → {{ r.vigente_hasta || 'sin fin' }}
              </option>
            </select>
            <span v-if="form.plan_revision"
                  class="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-800">
              v{{ (revisiones.find(x => x.id === form.plan_revision) || {}).version }}
            </span>
          </div>
          <p class="mt-1 text-[11px] text-gray-500">
            Si no eliges una revisión, se usará la vigente a la fecha de alta.
          </p>
        </div>

        <div class="sm:col-span-2">
          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.renovacion" class="rounded border-gray-600 bg-gray-900" />
            Renovación automática
          </label>
        </div>

        <div class="sm:col-span-2 flex items-center justify-end gap-2">
          <router-link
            :to="{ name: 'MembresiasLista' }"
            class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100">
            Cancelar
          </router-link>
          <button :disabled="saving" @click="save"
                  class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100 disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Guardar alta' }}
          </button>
        </div>
      </div>
    </div>

    <!-- RESUMEN DE REVISIÓN (oscuro) -->
    <div class="mt-4 border border-gray-800 rounded-xl p-3 bg-gray-950">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-sm font-semibold text-gray-100">Resumen de la revisión seleccionada</h2>
        <span v-if="form.plan_revision" class="text-xs text-gray-400">
          Revisión #{{ (revisiones.find(x => x.id === form.plan_revision) || {}).version || '—' }}
        </span>
      </div>

      <div v-if="!form.plan_revision" class="text-sm text-gray-400">
        Selecciona una revisión para ver el detalle congelado.
      </div>
      <div v-else-if="loadingSnap" class="text-sm text-gray-400">Cargando resumen…</div>

      <div v-else class="grid md:grid-cols-2 gap-3">
        <!-- Precios -->
        <div class="border border-gray-800 rounded-lg p-2 bg-gray-900">
          <h3 class="text-xs text-gray-300 mb-2">Precios</h3>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-400 border-b border-gray-800">
                <th class="py-1 text-left">Esquema</th>
                <th class="py-1 text-left">Tipo</th>
                <th class="py-1 text-right">Precio</th>
                <th class="py-1 text-right">Visitas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in snapshot.precios" :key="p.id" class="border-b border-gray-900">
                <td class="py-1">{{ p.esquema }}</td>
                <td class="py-1">{{ p.tipo }}</td>
                <td class="py-1 text-right">{{ Number(p.precio).toLocaleString() }}</td>
                <td class="py-1 text-right">{{ p.numero_visitas }}</td>
              </tr>
              <tr v-if="!snapshot.precios.length"><td colspan="4" class="py-2 text-gray-500">Sin precios</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Restricciones -->
        <div class="border border-gray-800 rounded-lg p-2 bg-gray-900">
          <h3 class="text-xs text-gray-300 mb-2">Restricciones</h3>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-400 border-b border-gray-800">
                <th class="py-1 text-left">Día</th>
                <th class="py-1 text-left">Inicio</th>
                <th class="py-1 text-left">Fin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in snapshot.restricciones" :key="r.id" class="border-b border-gray-900">
                <td class="py-1">{{ r.dia }}</td>
                <td class="py-1">{{ r.hora_inicio || '—' }}</td>
                <td class="py-1">{{ r.hora_fin || '—' }}</td>
              </tr>
              <tr v-if="!snapshot.restricciones.length"><td colspan="3" class="py-2 text-gray-500">Sin restricciones</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Servicios -->
        <div class="border border-gray-800 rounded-lg p-2 bg-gray-900">
          <h3 class="text-xs text-gray-300 mb-2">Servicios</h3>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-400 border-b border-gray-800">
                <th class="py-1 text-left">Servicio</th>
                <th class="py-1 text-right">Precio</th>
                <th class="py-1 text-left">Icono</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in snapshot.servicios" :key="s.id" class="border-b border-gray-900">
                <td class="py-1">{{ s.servicio_nombre || s.servicio }}</td>
                <td class="py-1 text-right">{{ Number(s.precio).toLocaleString() }}</td>
                <td class="py-1">{{ s.icono || '—' }}</td>
              </tr>
              <tr v-if="!snapshot.servicios.length"><td colspan="3" class="py-2 text-gray-500">Sin servicios</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Beneficios -->
        <div class="border border-gray-800 rounded-lg p-2 bg-gray-900">
          <h3 class="text-xs text-gray-300 mb-2">Beneficios</h3>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-400 border-b border-gray-800">
                <th class="py-1 text-left">Beneficio</th>
                <th class="py-1 text-left">Vigencia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in snapshot.beneficios" :key="b.id" class="border-b border-gray-900">
                <td class="py-1">{{ b.beneficio_nombre || b.beneficio }}</td>
                <td class="py-1">
                  {{ (b.vigencia_inicio || '—') }} → {{ (b.vigencia_fin || '—') }}
                </td>
              </tr>
              <tr v-if="!snapshot.beneficios.length"><td colspan="2" class="py-2 text-gray-500">Sin beneficios</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Disciplinas -->
        <div class="md:col-span-2 border border-gray-800 rounded-lg p-2 bg-gray-900">
          <h3 class="text-xs text-gray-300 mb-2">Disciplinas</h3>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-400 border-b border-gray-800">
                <th class="py-1 text-left">Disciplina</th>
                <th class="py-1 text-left">Acceso</th>
                <th class="py-1 text-right">#</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in snapshot.disciplinas" :key="d.id" class="border-b border-gray-900">
                <td class="py-1">{{ d.disciplina_nombre || d.disciplina }}</td>
                <td class="py-1">{{ d.tipo_acceso || '—' }}</td>
                <td class="py-1 text-right">{{ d.numero_accesos }}</td>
              </tr>
              <tr v-if="!snapshot.disciplinas.length"><td colspan="3" class="py-2 text-gray-500">Sin disciplinas</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
