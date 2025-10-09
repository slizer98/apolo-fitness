<template>
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
    @click.self="onClose"
  >
    <div class="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-2xl">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Nuevo plan</h3>
        <button
          @click="onClose"
          class="h-8 w-8 grid place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Cerrar"
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      <!-- Tabs (claro / pill) -->
      <div class="px-5 pt-4 border-b border-gray-200">
        <nav class="flex flex-wrap gap-2">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            class="px-3 py-2 rounded-lg text-sm border"
            :class="tab===t.key
              ? 'bg-gray-100 border-gray-300 text-gray-900'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
            @click="tab=t.key"
          >
            {{ t.label }}
          </button>
        </nav>
      </div>

      <!-- Form -->
      <form @submit.prevent="save" class="p-5 space-y-6">
        <!-- ============ TAB: BÁSICOS (CLARO) ============ -->
        <section v-show="tab==='basicos'" class="space-y-4">
  <div class="grid sm:grid-cols-2 gap-4">
    <div>
      <label class="block text-xs text-gray-600 mb-1">Nombre</label>
      <input
        v-model.trim="form.nombre"
        class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
        :class="{'border-red-400 ring-2 ring-red-100': errors.nombre}"
        maxlength="255"
      />
      <p v-if="errors.nombre" class="text-red-600 text-xs mt-1">{{ errors.nombre }}</p>
    </div>

    <div class="flex items-center gap-3 sm:pt-6">
      <input
        id="multi"
        type="checkbox"
        v-model="form.acceso_multisucursal"
        class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary"
      />
      <label for="multi" class="text-sm text-gray-800">Acceso multisucursal</label>
    </div>
  </div>

  <div>
    <label class="block text-xs text-gray-600 mb-1">Descripción</label>
    <textarea
      v-model.trim="form.descripcion"
      rows="2"
      class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
    ></textarea>
  </div>

  <div class="grid sm:grid-cols-3 gap-4">
    <div>
      <label class="block text-xs text-gray-600 mb-1">Tipo de plan</label>
      <select
        v-model="form.tipo_plan"
        class="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
        :class="{'border-red-400 ring-2 ring-red-100': errors.tipo_plan}"
      >
        <option disabled value="">Seleccione…</option>
        <option value="tiempo">Por tiempo (mensual/semanal)</option>
        <option value="sesiones">Por sesiones</option>
      </select>
      <p v-if="errors.tipo_plan" class="text-red-600 text-xs mt-1">{{ errors.tipo_plan }}</p>
    </div>

    <div v-if="form.tipo_plan==='sesiones'">
      <label class="block text-xs text-gray-600 mb-1"># de sesiones</label>
      <input
        v-model.number="form.numero_sesiones"
        type="number"
        min="1"
        step="1"
        class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
        :class="{'border-red-400 ring-2 ring-red-100': errors.numero_sesiones}"
      />
      <p v-if="errors.numero_sesiones" class="text-red-600 text-xs mt-1">{{ errors.numero_sesiones }}</p>
    </div>
  </div>

  <div class="grid sm:grid-cols-3 gap-4">
    <div class="flex items-center gap-2">
      <input
        id="preventa"
        type="checkbox"
        v-model="form.preventa"
        class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary"
      />
      <label for="preventa" class="text-sm text-gray-800">Preventa</label>
    </div>

    <div>
      <label class="block text-xs text-gray-600 mb-1">Vigente desde</label>
      <input
        v-model="form.desde"
        type="date"
        class="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
      />
    </div>

    <div>
      <label class="block text-xs text-gray-600 mb-1">Vigente hasta</label>
      <input
        v-model="form.hasta"
        type="date"
        class="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
      />
    </div>
  </div>
</section>

        <!-- ============ TAB: SERVICIOS (CLARO) ============ -->
        <section v-show="tab==='servicios'" class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-gray-800">Servicios</h4>
            <RouterLink class="text-xs text-apolo-primary hover:underline" :to="{name:'ServiciosLista'}">
              Administrar servicios
            </RouterLink>
          </div>

          <div v-if="loading.servicios" class="grid gap-2">
            <div v-for="i in 4" :key="i" class="animate-pulse h-10 bg-gray-100 rounded"></div>
          </div>

          <div v-else class="grid sm:grid-cols-2 gap-3">
            <label
              v-for="s in servicios"
              :key="s.id"
              class="rounded-xl border border-gray-200 bg-white p-3 flex flex-col gap-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="svcState[s.id].checked"
                    class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary"
                  />
                  <span class="text-xl" :class="svcState[s.id].icono || s.icono"></span>
                  <span class="text-sm font-medium text-gray-900">{{ s.nombre }}</span>
                </div>
              </div>

              <div
                class="grid sm:grid-cols-2 gap-2"
                :class="{'opacity-50 pointer-events-none': !svcState[s.id].checked}"
              >
                <input
                  v-model="svcState[s.id].precio"
                  @input="moneyMask(svcState[s.id],'precio')"
                  inputmode="decimal"
                  class="bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/20"
                  placeholder="$ precio (opcional)"
                />
                <input
                  v-model="svcState[s.id].icono"
                  class="bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/20"
                  placeholder="icono (opcional)"
                />
              </div>
            </label>
          </div>

          <p v-if="errors.servicios" class="text-red-600 text-xs">{{ errors.servicios }}</p>
        </section>

        <!-- ============ TAB: BENEFICIOS (CLARO) ============ -->
        <section v-show="tab==='beneficios'" class="space-y-3">
          <details class="rounded-xl border border-gray-200 bg-white">
            <summary class="cursor-pointer px-4 py-3 text-gray-800">Agregar beneficios</summary>
            <div class="p-4 space-y-3">
              <div v-if="loading.beneficios" class="grid gap-2">
                <div v-for="i in 4" :key="i" class="animate-pulse h-8 bg-gray-100 rounded"></div>
              </div>

              <div v-else class="space-y-2 max-h-72 overflow-auto pr-1">
                <label v-for="b in beneficios" :key="b.id" class="flex items-start gap-3">
                  <input
                    type="checkbox"
                    v-model="beneficiosChecks"
                    :value="b.id"
                    class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary mt-1.5"
                  />
                  <div class="w-full">
                    <div class="text-sm font-medium text-gray-900">{{ b.nombre }}</div>
                    <div class="text-xs text-gray-500">{{ b.descripcion || '—' }}</div>

                    <!-- Aplica a: plan o servicio -->
                    <div v-if="beneficiosChecks.includes(b.id)" class="mt-2 grid sm:grid-cols-3 gap-2 items-center">
                      <span class="text-xs text-gray-700">Aplica a</span>
                      <div class="flex items-center gap-3 sm:col-span-2">
                        <label class="flex items-center gap-2 text-sm text-gray-800">
                          <input type="radio" :name="'aplica_'+b.id" value="plan" v-model="beneficiosDestino[b.id]" />
                          Plan
                        </label>
                        <label class="flex items-center gap-2 text-sm text-gray-800">
                          <input type="radio" :name="'aplica_'+b.id" value="servicio" v-model="beneficiosDestino[b.id]" />
                          Servicio
                        </label>
                        <select
                          v-if="beneficiosDestino[b.id]==='servicio'"
                          v-model="beneficiosServicio[b.id]"
                          class="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/20"
                        >
                          <option disabled value="">Seleccione servicio…</option>
                          <option v-for="s in serviciosSeleccionados" :key="s.id" :value="s.id">{{ s.nombre }}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </details>
        </section>

        <!-- ============ TAB: ESQUEMA DE PRECIOS (CLARO) ============ -->
        <section v-show="tab==='precios'" class="space-y-3">
          <div class="grid sm:grid-cols-5 gap-2 items-center">
            <select
              v-model="priceForm.esquema"
              class="bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
            >
              <option disabled value="">Esquema…</option>
              <option value="individual">Individual</option>
              <option value="grupal">Grupal</option>
              <option value="empresa">Empresa</option>
            </select>

            <select
              v-model="priceForm.tipo"
              class="bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
            >
              <option disabled value="">Periodicidad…</option>
              <option value="mensual">Mensual</option>
              <option value="semanal">Semanal</option>
              <option value="sesiones">Sesiones</option>
            </select>

            <input
              v-model="priceForm.precio"
              type="number"
              min="0"
              step="0.01"
              class="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
              placeholder="Precio"
            />
            <input
              v-model="priceForm.numero_visitas"
              type="number"
              min="0"
              step="1"
              class="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
              :placeholder="priceForm.tipo==='sesiones' ? '# visitas' : '# visitas (opcional)'"
            />
            <button
              type="button"
              @click="agregarPrecio"
              class="px-3 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90"
            >
              Agregar
            </button>
          </div>

          <ul class="text-sm divide-y divide-gray-200">
            <li
              v-for="(p,idx) in preciosList"
              :key="p.id || 'tmp-'+idx"
              class="py-2 flex items-center justify-between"
            >
              <div class="text-gray-800">
                {{ p.esquema }} · {{ p.tipo }} — {{ currency(p.precio) }} ({{ p.numero_visitas || 0 }} visitas)
              </div>
              <button class="text-red-600 hover:text-red-700" @click="eliminarPrecio(p, idx)">Eliminar</button>
            </li>
          </ul>
        </section>

        <!-- ============ TAB: RESTRICCIONES (CLARO) ============ -->
        <section v-show="tab==='restricciones'" class="space-y-4">
          <div class="text-sm text-gray-700">Define reglas de acceso/uso para este plan.</div>

          <div class="grid sm:grid-cols-4 gap-2 items-end">
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Nombre</label>
              <input
                v-model.trim="restrForm.nombre"
                class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Descripción</label>
              <input
                v-model.trim="restrForm.descripcion"
                class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
              />
            </div>
          </div>

          <div class="grid sm:grid-cols-4 gap-2 items-end">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Días/semana</label>
              <input
                v-model.number="restrForm.dias_por_semana"
                type="number"
                min="0"
                step="1"
                class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Minutos/visita</label>
              <input
                v-model.number="restrForm.minutos_por_visita"
                type="number"
                min="0"
                step="1"
                class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Hora inicio</label>
              <input
                v-model="restrForm.hora_inicio"
                type="time"
                class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Hora fin</label>
              <input
                v-model="restrForm.hora_fin"
                type="time"
                class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
              />
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              @click="agregarRestr"
              class="px-3 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90"
            >
              Agregar restricción
            </button>
          </div>

          <ul class="text-sm divide-y divide-gray-200">
            <li v-for="(r,idx) in restrList" :key="r.id || 'r'+idx" class="py-2 flex items-center justify-between">
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ r.nombre || '—' }}</div>
                <div class="text-gray-600">
                  {{ r.descripcion || '—' }} · {{ r.dias_por_semana || 0 }} d/sem · {{ r.minutos_por_visita || 0 }} min/visita
                  · {{ r.hora_inicio || '—' }} - {{ r.hora_fin || '—' }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button class="text-red-600 hover:text-red-700" @click="eliminarRestr(r, idx)">Eliminar</button>
              </div>
            </li>
          </ul>
        </section>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="onClose"
            class="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90 disabled:opacity-60"
          >
            {{ saving ? 'Guardando…' : 'Guardar plan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const emit = defineEmits(['close','saved'])
const router = useRouter()
const ws = useWorkspaceStore()

/* ================= state ================= */
const saving = ref(false)
const errors = reactive({})
const form = reactive({
  nombre: '',
  descripcion: '',
  acceso_multisucursal: false,
  tipo_plan: '',
  // periodicidad: '',
  preventa: false,
  desde: '',
  hasta: '',
  numero_sesiones: '',
})

/* tabs */
const tabs = [
  { key: 'basicos', label: 'Básicos' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'beneficios', label: 'Beneficios' },
  { key: 'precios', label: 'Esquema de precios' },
  { key: 'restricciones', label: 'Restricciones' },
]
const tab = ref('basicos')

/* catálogos */
const loading = reactive({ servicios: true, beneficios: true })
const servicios = ref([])
const beneficios = ref([])

/* servicios seleccionados */
const svcState = reactive({})                 // {[id]: {checked, precio, icono}}
const serviciosSeleccionados = computed(() => servicios.value.filter(s => svcState[s.id]?.checked))

/* beneficios */
const beneficiosChecks = ref([])              // [id]
const beneficiosDestino = reactive({})        // { [idBeneficio]: 'plan'|'servicio' }
const beneficiosServicio = reactive({})       // { [idBeneficio]: <idServicio> }

/* precios (UI) */
const priceForm = reactive({ esquema:'', tipo:'', precio:'', numero_visitas:0 })
const preciosList = ref([])

/* restricciones (UI) */
const restrForm = reactive({
  nombre:'', descripcion:'', dias_por_semana:'', minutos_por_visita:'', hora_inicio:'', hora_fin:''
})
const restrList = ref([])

/* ================= methods ================= */
function onClose () {
  emit('close')
  const hasHistory = window.history.length > 1
  try {
    if (hasHistory) router.back()
    else router.push({ name: 'PlanesLista' })
  } catch {}
}

function moneyMask(target, key){
  let v = (target[key] ?? '').toString().replace(/[^\d.]/g,'')
  const parts = v.split('.')
  if (parts.length > 2) v = parts.shift() + '.' + parts.join('')
  if (v) target[key] = v
}

function currency(v){
  if (v === '' || v === null || v === undefined) return '$0.00'
  const n = Number(v) || 0
  return n.toLocaleString('es-MX', { style:'currency', currency:'MXN' })
}

/* precios: add/remove (UI) */
function agregarPrecio(){
  if (!priceForm.esquema || !priceForm.tipo || !priceForm.precio){
    return
  }
  let numeroVisitas = priceForm.numero_visitas
  if (priceForm.tipo === 'sesiones') {
    if (!numeroVisitas && form.numero_sesiones) numeroVisitas = form.numero_sesiones
    if (!numeroVisitas || Number(numeroVisitas) <= 0) {
      alert('Para "sesiones", debes indicar # de visitas/sesiones.')
      return
    }
  }
  preciosList.value.push({
    esquema: priceForm.esquema,
    tipo: priceForm.tipo,
    precio: Number(priceForm.precio),
    numero_visitas: numeroVisitas ? Number(numeroVisitas) : 0,
  })
  priceForm.esquema = ''
  priceForm.tipo = ''
  priceForm.precio = ''
  priceForm.numero_visitas = 0
}

async function eliminarPrecio(p, idx){
  if (p.id){
    try { await api.planes.precios.delete(p.id) } catch {}
  }
  preciosList.value.splice(idx,1)
}

/* restricciones: add/remove (UI) */
function agregarRestr(){
  const r = { ...restrForm }
  restrList.value.push(r)
  Object.assign(restrForm, { nombre:'', descripcion:'', dias_por_semana:'', minutos_por_visita:'', hora_inicio:'', hora_fin:'' })
}
async function eliminarRestr(r, idx){
  if (r.id){
    try { await api.planes.restricciones.delete(r.id) } catch {}
  }
  restrList.value.splice(idx,1)
}

/* ================= validation ================= */
function validate(){
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.nombre) errors.nombre = 'El nombre es obligatorio'
  if (!form.tipo_plan) errors.tipo_plan = 'Selecciona el tipo de plan'
  // if (form.tipo_plan === 'tiempo' && !form.periodicidad) errors.periodicidad = 'Selecciona la periodicidad'
  if (form.tipo_plan === 'sesiones' && !form.numero_sesiones) errors.numero_sesiones = 'Indica cuántas sesiones'
  return Object.keys(errors).length === 0
}

/* ================= save ================= */
async function save(){
  if (!validate()) return
  saving.value = true
  try {
    await ws.ensureEmpresaSet()
    const empresa = ws.empresaId
    if (!empresa) throw new Error('No se pudo determinar la empresa activa.')

    // 1) Crear plan
    const payloadPlan = {
      empresa,
      nombre: form.nombre,
      descripcion: form.descripcion,
      acceso_multisucursal: form.acceso_multisucursal,
      tipo_plan: form.tipo_plan,
      // periodicidad: form.tipo_plan==='tiempo' ? form.periodicidad : '',
      preventa: form.preventa,
      desde: form.desde || null,
      hasta: form.hasta || null,
      numero_sesiones: form.tipo_plan==='sesiones' ? (form.numero_sesiones || null) : null,
    }
    const { data: plan } = await api.planes.create(payloadPlan)

    // 2) Servicios
    const svcIds = serviciosSeleccionados.value.map(s => s.id)
    for (const sId of svcIds){
      const st = svcState[sId] || {}
      await api.planesServicios.create({
        plan: plan.id,
        servicio: sId,
        precio: st.precio ? Number(st.precio) : 0,
        icono: st.icono || '',
      })
    }

    // 3) Beneficios
    for (const bId of beneficiosChecks.value){
      const destino = beneficiosDestino[bId] || 'plan'
      if (destino === 'plan'){
        await api.planesBeneficios.create({ plan: plan.id, beneficio: bId })
      } else {
        const srvId = beneficiosServicio[bId]
        if (srvId) await api.servicioBeneficios.create({ servicio: srvId, beneficio: bId })
      }
    }

    // 4) Precios
    for (const p of preciosList.value){
      const payload = {
        plan: plan.id,
        esquema: p.esquema,
        tipo: p.tipo,
        precio: Number(p.precio),
        numero_visitas: p.tipo === 'sesiones'
          ? Number(p.numero_visitas || form.numero_sesiones || 0)
          : (p.numero_visitas != null ? Number(p.numero_visitas) : 0),
      }
      if (payload.tipo === 'sesiones' && (!payload.numero_visitas || payload.numero_visitas <= 0)) {
        console.warn('Precio omitido por falta de numero_visitas para "sesiones"', payload)
        continue
      }
      await api.planes.precios.create(payload)
    }

    // 5) Restricciones
    for (const r of restrList.value){
      await api.planes.restricciones.create({ ...r, plan: plan.id })
    }

    emit('saved', plan)
    router.push({ name:'PlanesLista' })
  } catch (e){
    console.error('Error creando plan', e)
    alert(e?.response?.data ? JSON.stringify(e.response.data) : (e.message || 'No se pudo crear el plan'))
  } finally {
    saving.value = false
  }
}

/* ================= data loads ================= */
async function loadServicios(){
  try {
    const { data } = await api.servicios.list({ page_size: 1000 })
    const arr = data?.results || data || []
    servicios.value = arr
    arr.forEach(s => { if (!svcState[s.id]) svcState[s.id] = { checked:false, precio:'', icono:'' } })
  } finally { loading.servicios = false }
}
async function loadBeneficios(){
  try {
    const { data } = await api.beneficios.list({ page_size: 1000 })
    beneficios.value = data?.results || data || []
  } finally { loading.beneficios = false }
}

onMounted(async () => {
  await ws.ensureEmpresaSet()
  await Promise.all([loadServicios(), loadBeneficios()])
})
</script>
