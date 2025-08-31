<template>
  <!-- Overlay -->
  <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
    <div class="w-full max-w-3xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 class="text-lg">Nuevo plan</h3>
        <button @click="onClose" class="text-gray-400 hover:text-white">✕</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="save" class="p-5 space-y-6">
        <!-- Básicos -->
        <section class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input v-model.trim="form.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                   :class="{'border-red-600': errors.nombre}" maxlength="255" />
            <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
          </div>

          <div class="flex items-center gap-3 pt-6 sm:pt-0">
            <input id="multi" type="checkbox" v-model="form.acceso_multisucursal" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
            <label for="multi" class="text-sm text-gray-300">Acceso multisucursal</label>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea v-model.trim="form.descripcion" rows="2"
                      class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
          </div>
        </section>

        <!-- Tipo de plan -->
        <section class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Tipo de plan *</label>
            <select v-model="form.tipo_plan" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                    :class="{'border-red-600': errors.tipo_plan}">
              <option disabled value="">Selecciona…</option>
              <option value="tiempo">Por tiempo</option>
              <option value="sesiones">Por sesiones</option>
            </select>
            <p v-if="errors.tipo_plan" class="text-red-400 text-xs mt-1">{{ errors.tipo_plan }}</p>
          </div>

          <div v-if="form.tipo_plan==='tiempo'">
            <label class="block text-xs text-gray-400 mb-1">Periodicidad *</label>
            <!-- Nota: el backend acepta 'semanal' y 'mensual' (y 'sesiones'); evitamos bimestral para no romper enums -->
            <select v-model="form.periodicidad" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                    :class="{'border-red-600': errors.periodicidad}">
              <option disabled value="">Selecciona…</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
            <p v-if="errors.periodicidad" class="text-red-400 text-xs mt-1">{{ errors.periodicidad }}</p>
          </div>

          <div v-if="form.tipo_plan==='tiempo'">
            <label class="block text-xs text-gray-400 mb-1">Preventa</label>
            <div class="flex items-center gap-2">
              <input id="preventa" type="checkbox" v-model="form.preventa" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              <label for="preventa" class="text-sm text-gray-300">Habilitar</label>
            </div>
          </div>

          <!-- Sesiones -->
          <div v-if="form.tipo_plan==='sesiones'">
            <label class="block text-xs text-gray-400 mb-1"># de sesiones *</label>
            <input v-model="form.numero_sesiones" @input="onlyInt('numero_sesiones')"
                   class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                   :class="{'border-red-600': errors.numero_sesiones}" inputmode="numeric" />
            <p v-if="errors.numero_sesiones" class="text-red-400 text-xs mt-1">{{ errors.numero_sesiones }}</p>
          </div>
          <div v-if="form.tipo_plan==='sesiones'">
            <label class="block text-xs text-gray-400 mb-1">Rango (días) *</label>
            <input v-model="form.rango_dias" @input="onlyInt('rango_dias')"
                   class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                   :class="{'border-red-600': errors.rango_dias}" inputmode="numeric" />
            <p v-if="errors.rango_dias" class="text-red-400 text-xs mt-1">{{ errors.rango_dias }}</p>
          </div>
        </section>

        <!-- Vigencia opcional -->
        <section class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Vigente desde (YYYY-MM-DD)</label>
            <input v-model="form.desde" placeholder="2025-01-01"
                   class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Vigente hasta (YYYY-MM-DD)</label>
            <input v-model="form.hasta" placeholder="2025-12-31"
                   class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
        </section>

        <!-- Esquemas de precio (dentro del modal de crear plan) -->
        <section class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm text-gray-300">Esquemas de precio</h4>
            <button type="button" @click="addPrecioRow"
                    class="text-xs px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">+ Agregar</button>
          </div>

          <div v-if="!precios.length" class="text-xs text-gray-500">Sin filas. Agrega al menos una.</div>

          <div v-for="(p,idx) in precios" :key="p._k"
               class="grid sm:grid-cols-5 gap-2 items-end bg-gray-900/40 border border-gray-800 rounded-xl p-3">
            <div>
              <label class="block text-[11px] text-gray-400 mb-1">Esquema *</label>
              <select v-model="p.esquema" class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5">
                <option disabled value="">Selecciona…</option>
                <option value="individual">Individual</option>
                <option value="grupal">Grupal</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-1">Tipo *</label>
              <!-- forzamos relación: si el plan es por sesiones, el tipo es 'sesiones'; si es por tiempo, el tipo viene de periodicidad -->
              <input :value="precioTipo(p)" disabled
                     class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-400" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-1">Precio *</label>
              <input v-model="p.precio" @input="moneyMask(p, 'precio')" inputmode="decimal"
                     class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5"
                     placeholder="0.00" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-1"># visitas</label>
              <input v-model="p.numero_visitas" @input="onlyIntRow(p, 'numero_visitas')" inputmode="numeric"
                     class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5"
                     :placeholder="form.tipo_plan==='sesiones' ? String(form.numero_sesiones || 0) : '0 (ilimitado)'" />
            </div>
            <div class="flex items-center justify-end gap-2">
              <button type="button" @click="removePrecioRow(idx)"
                      class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Quitar</button>
            </div>
          </div>

          <p v-if="errors.precios" class="text-red-400 text-xs mt-1">{{ errors.precios }}</p>
        </section>

        <!-- Servicios (checks) -->
        <section>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm text-gray-300">Servicios</h4>
            <RouterLink class="text-xs text-apolo-primary hover:underline" :to="{name:'ServiciosLista'}">Administrar servicios</RouterLink>
          </div>

          <div v-if="loading.servicios" class="grid gap-2">
            <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 3" :key="i"></div>
          </div>

          <div v-else class="space-y-2 max-h-56 overflow-auto pr-1">
            <div v-for="s in servicios" :key="s.id"
                 class="flex items-center justify-between gap-3 bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="svcState[s.id].checked"
                       class="h-4 w-4 rounded border-gray-700 bg-gray-900"/>
                <span class="text-sm">{{ s.nombre }}</span>
              </label>

              <div class="flex items-center gap-2">
                <input v-model="svcState[s.id].precio" @input="moneyMask(svcState[s.id], 'precio')" inputmode="decimal"
                       class="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                       placeholder="$ opcional" />
                <!-- Menú de acciones del servicio -->
                <div class="relative" :data-svc-menu="s.id">
                  <button type="button" class="px-2 py-1 rounded hover:bg-gray-800" @click.stop="toggleSvcMenu(s.id)">⋯</button>
                  <div v-if="openSvcMenuId===s.id"
                       class="absolute right-0 mt-1 w-56 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-1 z-20">
                    <button type="button" class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70"
                            @click="openBeneficiosForService(s)">
                      Agregar beneficios al plan…
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p v-if="errors.servicios" class="text-red-400 text-xs mt-1">{{ errors.servicios }}</p>
          </div>
        </section>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" @click="onClose"
                  class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="saving"
                  class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal: elegir beneficios (se aplican al plan) -->
    <div v-if="showBeneficios" class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl">
        <div class="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Agregar beneficios</h3>
          <button @click="closeBeneficios" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-5 space-y-3">
          <div v-if="loading.beneficios" class="grid gap-2">
            <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 3" :key="i"></div>
          </div>
          <div v-else class="space-y-2 max-h-64 overflow-auto pr-1">
            <label v-for="b in beneficios" :key="b.id" class="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2">
              <input type="checkbox" v-model="beneficiosSeleccionados" :value="b.id"
                     class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              <div>
                <div class="text-sm">{{ b.nombre }}</div>
                <div class="text-[11px] text-gray-400">{{ b.descripcion || '—' }}</div>
              </div>
            </label>
          </div>
        </div>
        <div class="px-5 pb-4 flex items-center justify-end gap-2">
          <button @click="closeBeneficios" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cerrar</button>
          <button @click="applyBeneficios" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">Aplicar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/services'

const emit = defineEmits(['close','saved'])
const router = useRouter()

// ---------- estado ----------
const saving = ref(false)
const errors = reactive({})
const form = reactive({
  nombre: '',
  descripcion: '',
  acceso_multisucursal: false,
  tipo_plan: '',
  periodicidad: '',
  preventa: false,
  desde: '',
  hasta: '',
  numero_sesiones: '',
  rango_dias: '',
})

// precios embebidos
const precios = ref([])

// servicios y beneficios
const loading = reactive({ servicios: true, beneficios: true })
const servicios = ref([])
const beneficios = ref([])

const svcState = reactive({})                // id -> {checked, precio}
const openSvcMenuId = ref(null)              // menú "…" por servicio
const showBeneficios = ref(false)
const beneficiosSeleccionados = ref([])

// ---------- init ----------
onMounted(async () => {
  await Promise.all([loadServicios(), loadBeneficios()])
  // arranca con 1 fila de precio
  addPrecioRow()
  // cierra menús al hacer click fuera
  document.addEventListener('click', onDocClick)
})

function onClose(){
  document.removeEventListener('click', onDocClick)
  emit('close')
}

// ---------- cargar catálogos ----------
async function loadServicios () {
  loading.servicios = true
  try {
    const { data } = await api.servicios.list({ ordering: 'id', page_size: 200 })
    servicios.value = data?.results || data || []
    // inicializa estado de checks
    servicios.value.forEach(s => { svcState[s.id] = { checked: false, precio: '' } })
  } catch { servicios.value = [] }
  finally { loading.servicios = false }
}

async function loadBeneficios () {
  loading.beneficios = true
  try {
    const { data } = await api.beneficios.list({ ordering: 'id', page_size: 200 })
    beneficios.value = data?.results || data || []
  } catch { beneficios.value = [] }
  finally { loading.beneficios = false }
}

// ---------- helpers UI ----------
function addPrecioRow () {
  precios.value.push({_k: cryptoRandom(), esquema: '', precio: '', numero_visitas: ''})
}
function removePrecioRow (idx) { precios.value.splice(idx, 1) }

function precioTipo (p) {
  return form.tipo_plan === 'sesiones'
    ? 'sesiones'
    : (form.periodicidad || '—')
}

function onlyInt (field) {
  form[field] = String(form[field] ?? '').replace(/\D+/g, '').slice(0, 6)
}
function onlyIntRow (row, field) {
  row[field] = String(row[field] ?? '').replace(/\D+/g, '').slice(0, 6)
}
function moneyMask (obj, field) {
  let v = String(obj[field] ?? '').replace(/[^\d.]/g,'')
  const parts = v.split('.')
  if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('')
  v = v.replace(/^0+(\d)/, '$1')
  const [a,b=''] = v.split('.')
  obj[field] = b ? a + '.' + b.slice(0,2) : a
}

function toggleSvcMenu (id) {
  openSvcMenuId.value = (openSvcMenuId.value === id) ? null : id
}
function onDocClick(e){
  // cierra menú de servicio si click es fuera del contenedor con atributo data-svc-menu
  const inMenu = e.target.closest?.('[data-svc-menu]')
  if (!inMenu) openSvcMenuId.value = null
}
function openBeneficiosForService(_s) {
  openSvcMenuId.value = null
  showBeneficios.value = true
}
function closeBeneficios() { showBeneficios.value = false }

// Aplica beneficios seleccionados: se guardarán contra el PLAN al final (no por servicio)
function applyBeneficios() {
  showBeneficios.value = false
}

// ---------- validación ----------
function validate () {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.nombre) errors.nombre = 'El nombre es obligatorio'
  if (!form.tipo_plan) errors.tipo_plan = 'Selecciona el tipo de plan'
  if (form.tipo_plan === 'tiempo' && !form.periodicidad) errors.periodicidad = 'Selecciona la periodicidad'
  if (form.tipo_plan === 'sesiones') {
    if (!form.numero_sesiones) errors.numero_sesiones = 'Indica cuántas sesiones'
    if (!form.rango_dias) errors.rango_dias = 'Indica el rango en días'
  }
  if (!precios.value.length) {
    errors.precios = 'Agrega al menos un esquema de precio'
  } else {
    const bad = precios.value.find(p => !p.esquema || !p.precio)
    if (bad) errors.precios = 'Cada fila debe tener esquema y precio'
  }
  return Object.keys(errors).length === 0
}

// ---------- guardar ----------
async function save () {
  if (!validate()) return
  saving.value = true
  try {
    // 1) Crea el plan
    const payloadPlan = {
      nombre: form.nombre,
      descripcion: form.descripcion || '',
      acceso_multisucursal: !!form.acceso_multisucursal,
      tipo_plan: form.tipo_plan,                // libre en Plan
      preventa: !!form.preventa,
      desde: form.desde || null,
      hasta: form.hasta || null,
      visitas_gratis: 0,                        // puedes exponer luego
    }
    const { data: created } = await api.planes.create(payloadPlan)
    const planId = created?.id

    // 2) Precios (mapea a enums del backend)
    const opsPrecios = precios.value.map(p => {
      const tipo = (form.tipo_plan === 'sesiones') ? 'sesiones'
                 : (form.periodicidad === 'semanal' ? 'semanal' : 'mensual')
      const numero_visitas = (form.tipo_plan === 'sesiones')
        ? Number(form.numero_sesiones || 0)
        : Number(p.numero_visitas || 0)
      return api.planes.precios.create({
        plan: planId,
        esquema: p.esquema,          // individual/grupal/empresa
        tipo,                        // semanal/mensual/sesiones
        precio: Number(p.precio || 0),
        numero_visitas,
      })
    })
    await Promise.all(opsPrecios)

    // 3) Servicios seleccionados
    const svcIds = Object.keys(svcState).filter(id => svcState[id].checked)
    if (svcIds.length) {
      await Promise.all(svcIds.map(id => api.planesServicios.create({
        plan: planId,
        servicio: Number(id),
        precio: svcState[id].precio ? Number(svcState[id].precio) : null,
      })))
    }

    // 4) Beneficios seleccionados (aplican al plan)
    if (beneficiosSeleccionados.value.length) {
      await Promise.all(beneficiosSeleccionados.value.map(bid => api.planesBeneficios.create({
        plan: planId,
        beneficio: bid,
        // si tu backend acepta vigencias, puedes añadir:
        // vigencia_inicio: null, vigencia_fin: null
      })))
    }

    emit('saved', created)
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

// util
function cryptoRandom(){ try { return crypto.randomUUID() } catch { return String(Math.random()).slice(2) } }

// coherencia: si cambia tipo_plan, ajusta periodicidad / número_visitas
watch(() => form.tipo_plan, (tp) => {
  if (tp === 'sesiones') {
    form.periodicidad = ''
    // empuja #visitas por defecto en filas de precio
    precios.value.forEach(p => { if (!p.numero_visitas) p.numero_visitas = form.numero_sesiones || '' })
  } else if (tp === 'tiempo') {
    form.numero_sesiones = ''
    form.rango_dias = ''
    precios.value.forEach(p => { if (!p.numero_visitas) p.numero_visitas = '' })
  }
})
watch(() => form.numero_sesiones, (n) => {
  if (form.tipo_plan === 'sesiones') {
    precios.value.forEach(p => { p.numero_visitas = n || '' })
  }
})
</script>

<style scoped>
/* nada especial */
</style>
