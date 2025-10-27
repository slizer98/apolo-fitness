<!-- src/views/planes/PlanCrear.vue -->
<template>
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
    @click.self="onClose"
  >
    <div class="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow-2xl">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Nuevo plan</h3>
        <button
          @click="onClose"
          class="h-8 w-8 grid place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Cerrar"
          title="Cerrar"
        >✕</button>
      </div>

      <!-- Tabs subrayados -->
      <div class="px-5 pt-3 border-b border-gray-200">
        <nav class="flex flex-wrap gap-5">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            class="pb-2 text-sm border-b-2 -mb-[1px]"
            :class="tab===t.key
              ? 'border-apolo-primary text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-800'"
            @click="tab=t.key"
          >
            {{ t.label }}
          </button>
        </nav>
      </div>

      <!-- Form -->
      <form @submit.prevent="save" class="p-5">
        <div class="grid lg:grid-cols-3 gap-5">
          <!-- ================== CONTENIDO (izquierda) ================== -->
          <div class="lg:col-span-2 space-y-6">
            <!-- ================== TAB: RESUMEN ================== -->
            <section v-show="tab==='basicos'" class="space-y-6">
              <!-- Básicos -->
              <div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Nombre *</label>
                    <input
                      v-model.trim="form.nombre"
                      class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
                      :class="{'border-red-400 ring-2 ring-red-100': errors.nombre}"
                      maxlength="255"
                    />
                    <p v-if="errors.nombre" class="text-red-600 text-xs mt-1">{{ errors.nombre }}</p>
                  </div>
                  <div class="flex items-center gap-3 sm:pt-6">
                    <input id="multi" type="checkbox" v-model="form.acceso_multisucursal"
                           class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary" />
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
                    <label class="block text-xs text-gray-600 mb-1">Tipo de plan *</label>
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
                      type="number" min="1" step="1"
                      class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
                      :class="{'border-red-400 ring-2 ring-red-100': errors.numero_sesiones}"
                    />
                    <p v-if="errors.numero_sesiones" class="text-red-600 text-xs mt-1">{{ errors.numero_sesiones }}</p>
                  </div>

                  <div class="flex items-center gap-2">
                    <input id="preventa" type="checkbox" v-model="form.preventa"
                           class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary" />
                    <label for="preventa" class="text-sm text-gray-800">Preventa</label>
                  </div>
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Vigente desde</label>
                    <input v-model="form.desde" type="date"
                           class="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Vigente hasta</label>
                    <input v-model="form.hasta" type="date"
                           class="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30" />
                  </div>
                </div>
              </div>

              <!-- Servicios seleccionables -->
              <div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-gray-800">Servicios incluidos</h4>
                  <button type="button" class="px-3 py-1.5 rounded-lg bg-apolo-primary text-white hover:opacity-90"
                          @click="tab='servicios'">+ Crear servicio</button>
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
                    <div class="flex items-center gap-2">
                      <input type="checkbox" v-model="svcState[s.id].checked"
                             class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary" />
                      <span class="text-sm font-medium text-gray-900">{{ s.nombre }}</span>
                    </div>
                    <div class="grid sm:grid-cols-2 gap-2" :class="{'opacity-50 pointer-events-none': !svcState[s.id].checked}">
                      <input v-model="svcState[s.id].precio" @input="moneyMask(svcState[s.id],'precio')"
                             inputmode="decimal"
                             class="bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/20"
                             placeholder="$ precio (opcional)" />
                      <input v-model="svcState[s.id].icono"
                             class="bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/20"
                             placeholder="icono (opcional)" />
                    </div>
                  </label>
                </div>

                <p v-if="errors.servicios" class="text-red-600 text-xs">{{ errors.servicios }}</p>
              </div>

              <!-- Beneficios seleccionables -->
              <div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-gray-800">Beneficios</h4>
                  <button type="button" class="px-3 py-1.5 rounded-lg bg-apolo-primary text-white hover:opacity-90"
                          @click="tab='beneficios'">+ Crear beneficio</button>
                </div>

                <div v-if="loading.beneficios" class="grid gap-2">
                  <div v-for="i in 4" :key="i" class="animate-pulse h-8 bg-gray-100 rounded"></div>
                </div>

                <div v-else class="space-y-2 max-h-72 overflow-auto pr-1">
                  <label v-for="b in beneficios" :key="b.id" class="flex items-start gap-3">
                    <input type="checkbox" v-model="beneficiosChecks" :value="b.id"
                           class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary mt-1.5" />
                    <div class="w-full">
                      <div class="text-sm font-medium text-gray-900">{{ b.nombre }}</div>
                      <div class="text-xs text-gray-500">{{ b.descripcion || '—' }}</div>

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
                          <select v-if="beneficiosDestino[b.id]==='servicio'"
                                  v-model="beneficiosServicio[b.id]"
                                  class="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/20">
                            <option disabled value="">Seleccione servicio…</option>
                            <option v-for="s in serviciosSeleccionados" :key="s.id" :value="s.id">{{ s.nombre }}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            <!-- ================== TAB: SERVICIOS (crear inline) ================== -->
            <section v-show="tab==='servicios'" class="space-y-4">
              <div class="rounded-2xl border border-gray-200 bg-white p-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Crear servicio</h4>
                <div class="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Nombre *</label>
                    <input v-model.trim="svcForm.nombre" class="w-full bg-white border rounded px-3 py-2"
                           :class="svcErrors.nombre ? 'border-red-400' : 'border-gray-300'"/>
                    <p v-if="svcErrors.nombre" class="text-red-600 text-xs mt-1">{{ svcErrors.nombre }}</p>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Icono (opcional)</label>
                    <input v-model.trim="svcForm.icono" placeholder="lucide:dumbbell"
                           class="w-full bg-white border border-gray-300 rounded px-3 py-2"/>
                  </div>
                </div>
                <div class="mt-3">
                  <label class="block text-xs text-gray-600 mb-1">Descripción</label>
                  <textarea v-model="svcForm.descripcion" rows="3" class="w-full bg-white border border-gray-300 rounded px-3 py-2"></textarea>
                </div>
                <div class="mt-3 flex items-center justify-end gap-2">
                  <button type="button" class="px-4 py-2 rounded bg-apolo-primary text-white hover:opacity-90"
                          :disabled="svcSaving" @click="saveQuickService">
                    {{ svcSaving ? 'Guardando…' : 'Crear servicio' }}
                  </button>
                </div>
              </div>
            </section>

            <!-- ================== TAB: BENEFICIOS (crear inline) ================== -->
            <section v-show="tab==='beneficios'" class="space-y-4">
              <div class="rounded-2xl border border-gray-200 bg-white p-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Crear beneficio</h4>
                <div class="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Nombre *</label>
                    <input v-model.trim="benForm.nombre" class="w-full bg-white border rounded px-3 py-2"
                           :class="benErrors.nombre ? 'border-red-400' : 'border-gray-300'"/>
                    <p v-if="benErrors.nombre" class="text-red-600 text-xs mt-1">{{ benErrors.nombre }}</p>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Tipo de descuento</label>
                    <select v-model="benForm.tipo_descuento" class="w-full bg-white border border-gray-300 rounded px-3 py-2">
                      <option value="">—</option>
                      <option value="porcentaje">Porcentaje</option>
                      <option value="monto">Monto</option>
                    </select>
                  </div>
                </div>
                <div class="grid sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Valor</label>
                    <input type="number" step="0.01" v-model.number="benForm.valor" :disabled="!benForm.tipo_descuento"
                           class="w-full bg-white border rounded px-3 py-2" :class="benErrors.valor ? 'border-red-400' : 'border-gray-300'"/>
                    <p v-if="benErrors.valor" class="text-red-600 text-xs mt-1">{{ benErrors.valor }}</p>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Unidad (opcional)</label>
                    <input type="number" v-model.number="benForm.unidad" :disabled="!benForm.tipo_descuento"
                           class="w-full bg-white border border-gray-300 rounded px-3 py-2"/>
                  </div>
                </div>
                <div class="mt-3">
                  <label class="block text-xs text-gray-600 mb-1">Descripción</label>
                  <textarea v-model="benForm.descripcion" rows="3" class="w-full bg-white border border-gray-300 rounded px-3 py-2"></textarea>
                </div>
                <div class="mt-3 flex items-center justify-end gap-2">
                  <button type="button" class="px-4 py-2 rounded bg-apolo-primary text-white hover:opacity-90"
                          :disabled="benSaving" @click="saveQuickBenefit">
                    {{ benSaving ? 'Guardando…' : 'Crear beneficio' }}
                  </button>
                </div>
              </div>
            </section>

            <!-- ================== TAB: ESQUEMA DE PRECIOS ================== -->
            <section v-show="tab==='precios'" class="space-y-4">
              <div class="rounded-2xl border border-gray-200 bg-white p-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Esquema de precios</h4>

                <div class="grid sm:grid-cols-5 gap-2 items-center">
                  <select v-model="priceForm.esquema"
                          class="bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30">
                    <option disabled value="">Esquema…</option>
                    <option value="individual">Individual</option>
                    <option value="grupal">Grupal</option>
                    <option value="empresa">Empresa</option>
                  </select>

                  <select v-model="priceForm.tipo"
                          class="bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30">
                    <option disabled value="">Periodicidad…</option>
                    <option value="mensual">Mensual</option>
                    <option value="semanal">Semanal</option>
                    <option value="sesiones">Sesiones</option>
                  </select>

                  <input v-model="priceForm.precio" inputmode="decimal" @input="moneyMask(priceForm,'precio')"
                         class="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
                         placeholder="Precio" />
                  <input v-model="priceForm.numero_visitas" type="number" min="0" step="1"
                         class="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
                         :placeholder="priceForm.tipo==='sesiones' ? '# visitas' : '# visitas (opcional)'" />

                  <button type="button" @click="agregarPrecio"
                          class="px-3 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90">
                    Agregar
                  </button>
                </div>

                <ul class="text-sm divide-y divide-gray-200 mt-3">
                  <li v-for="(p,idx) in preciosList" :key="p.__key" class="py-2 flex items-center justify-between">
                    <div class="text-gray-800">
                      {{ p.esquema }} · {{ p.tipo }}
                      <template v-if="p.tipo==='sesiones'"> — {{ Number(p.numero_visitas||0) }} visitas</template>
                      — {{ currency(p.precio) }}
                    </div>
                    <button class="text-blue-600 hover:text-blue-700" @click="eliminarPrecio(idx)">Eliminar</button>
                  </li>
                </ul>
              </div>
            </section>

            <!-- ================== TAB: RESTRICCIONES ================== -->
            <section v-show="tab==='restricciones'" class="space-y-4">
              <div class="rounded-2xl border border-gray-200 bg-white p-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Restricciones</h4>

                <div class="grid sm:grid-cols-4 gap-2 items-end">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Día</label>
                    <select v-model="restrForm.dia"
                            class="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30">
                      <option disabled value="">Seleccione…</option>
                      <option>Lunes</option><option>Martes</option><option>Miércoles</option>
                      <option>Jueves</option><option>Viernes</option><option>Sábado</option><option>Domingo</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Hora inicio</label>
                    <input v-model="restrForm.hora_inicio" type="time"
                           class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Hora fin</label>
                    <input v-model="restrForm.hora_fin" type="time"
                           class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30" />
                  </div>
                  <div class="flex justify-end">
                    <button type="button" @click="agregarRestr"
                            class="px-3 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90">
                      Agregar restricción
                    </button>
                  </div>
                </div>

                <ul class="text-sm divide-y divide-gray-200 mt-3">
                  <li v-for="(r,idx) in restrList" :key="r.__key" class="py-2 flex items-center justify-between">
                    <div class="text-gray-800">
                      {{ r.dia }} · {{ r.hora_inicio || '—' }} - {{ r.hora_fin || '—' }}
                    </div>
                    <button class="text-blue-600 hover:text-blue-700" @click="eliminarRestr(idx)">Eliminar</button>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <!-- ================== TOTALES (derecha) ================== -->
          <aside class="lg:col-span-1">
            <div class="rounded-2xl border border-gray-200 bg-white p-4 sticky top-4">
              <h4 class="text-sm font-medium text-gray-800 mb-3">Totales estimados</h4>
              <table class="w-full text-sm">
                <tbody>
                  <!-- Servicios -->
                  <tr v-for="r in resumenServicios" :key="`svc-${r.id}`" class="border-t">
                    <td class="py-1.5 pr-2">{{ r.nombre }}</td>
                    <td class="py-1.5 pl-2 text-right">{{ currency(r.precio) }}</td>
                  </tr>

                  <!-- Inscripción (placeholder si luego agregas) -->
                  <tr v-if="costoInscripcionNum > 0" class="border-t">
                    <td class="py-1.5 pr-2">Inscripción</td>
                    <td class="py-1.5 pl-2 text-right">{{ currency(costoInscripcionNum) }}</td>
                  </tr>

                  <!-- Precios -->
                  <tr v-for="pr in resumenPrecios" :key="`price-${pr.key}`" class="border-t">
                    <td class="py-1.5 pr-2">{{ pr.label }}</td>
                    <td class="py-1.5 pl-2 text-right">{{ currency(pr.precio) }}</td>
                  </tr>

                  <!-- Total -->
                  <tr class="border-t font-semibold">
                    <td class="py-2 pr-2">Total</td>
                    <td class="py-2 pl-2 text-right">{{ currency(totalEstimado) }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Botones -->
              <div class="mt-4 flex items-center justify-end gap-2">
                <button type="button" @click="onClose"
                        class="px-4 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90">
                  Cancelar
                </button>
                <button type="submit" :disabled="saving"
                        class="px-4 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90 disabled:opacity-60">
                  {{ saving ? 'Guardando…' : 'Guardar plan' }}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  preventa: false,
  desde: '',
  hasta: '',
  numero_sesiones: '',
})

/* tabs (subrayados) */
const tabs = [
  { key: 'basicos', label: 'Resumen' },
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
const serviciosSeleccionados = computed(() =>
  servicios.value.filter(s => svcState[s.id]?.checked)
)

/* beneficios selec */
const beneficiosChecks = ref([])              // [id]
const beneficiosDestino = reactive({})        // { [idBeneficio]: 'plan'|'servicio' }
const beneficiosServicio = reactive({})       // { [idBeneficio]: <idServicio> }

/* Esquema de Precios */
const priceForm = reactive({ esquema:'', tipo:'', precio:'', numero_visitas:0 })
const preciosList = ref([]) // [{ esquema, tipo, precio, numero_visitas, __key }]

/* Restricciones */
const restrForm = reactive({ dia:'', hora_inicio:'', hora_fin:'' })
const restrList = ref([]) // [{dia,hora_inicio,hora_fin,__key}]

/* ==== Totales (Servicios + Inscripción + Precios) ==== */
const costoInscripcionNum = computed(() => 0) // placeholder si luego agregas costo_inscripcion

const resumenServicios = computed(() =>
  serviciosSeleccionados.value.map(s => ({
    id: s.id, nombre: s.nombre, precio: Number(svcState[s.id]?.precio || 0)
  }))
)
const totalServicios = computed(() =>
  resumenServicios.value.reduce((a,b)=>a + Number(b.precio||0), 0)
)

const resumenPrecios = computed(() =>
  preciosList.value.map(p => ({
    key: p.__key,
    label: `${capitalize(p.esquema)} · ${capitalize(p.tipo)}${p.tipo==='sesiones' ? ` (${Number(p.numero_visitas||0)} visitas)` : ''}`,
    precio: Number(p.precio || 0)
  }))
)
const totalPrecios = computed(() =>
  resumenPrecios.value.reduce((acc, it) => acc + Number(it.precio || 0), 0)
)

const totalEstimado = computed(() =>
  totalServicios.value + Number(costoInscripcionNum.value || 0) + totalPrecios.value
)

/* ================= methods ================= */
function onClose () {
  emit('close')
  const hasHistory = window.history.length > 1
  try { hasHistory ? router.back() : router.push({ name: 'PlanesLista' }) } catch {}
}

function moneyMask(target, key){
  let v = (target[key] ?? '').toString().replace(/[^\d.]/g,'')
  const parts = v.split('.')
  if (parts.length > 2) v = parts.shift() + '.' + parts.join('')
  target[key] = v
}
function currency(v){
  if (v === '' || v === null || v === undefined) return '$0.00'
  const n = Number(v) || 0
  return n.toLocaleString('es-MX', { style:'currency', currency:'MXN' })
}
function capitalize(s){ return (s||'').charAt(0).toUpperCase() + (s||'').slice(1) }

/* ================= validation ================= */
function validate(){
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.nombre) errors.nombre = 'El nombre es obligatorio'
  if (!form.tipo_plan) errors.tipo_plan = 'Selecciona el tipo de plan'
  if (form.tipo_plan === 'sesiones' && !form.numero_sesiones) errors.numero_sesiones = 'Indica cuántas sesiones'
  return Object.keys(errors).length === 0
}

/* ================= save plan ================= */
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
      preventa: form.preventa,
      desde: form.desde || null,
      hasta: form.hasta || null,
      numero_sesiones: form.tipo_plan==='sesiones' ? (form.numero_sesiones || null) : null,
    }
    const { data: plan } = await api.planes.create(payloadPlan)

    // 2) Servicios del plan
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

    // 3) Beneficios del plan (o del servicio)
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
        precio: Number(p.precio || 0),
        numero_visitas: p.tipo === 'sesiones'
          ? Number(p.numero_visitas || form.numero_sesiones || 0)
          : Number(p.numero_visitas || 0),
      }
      if (payload.tipo === 'sesiones' && (!payload.numero_visitas || payload.numero_visitas <= 0)) {
        // omitimos precios de sesiones sin #visitas
        continue
      }
      await api.planes.precios.create(payload)
    }

    // 5) Restricciones
    for (const r of restrList.value){
      await api.planes.restricciones.create({
        plan: plan.id,
        dia: r.dia,
        hora_inicio: r.hora_inicio || null,
        hora_fin: r.hora_fin || null,
      })
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

/* ================== CREAR SERVICIO (inline) ================== */
const svcSaving = ref(false)
const svcErrors = reactive({})
const svcForm = reactive({ nombre:'', descripcion:'', icono:'' })

function validateSvc(){
  Object.keys(svcErrors).forEach(k => delete svcErrors[k])
  if (!svcForm.nombre?.trim()) svcErrors.nombre = 'El nombre es obligatorio'
  return Object.keys(svcErrors).length === 0
}
async function saveQuickService(){
  if (!validateSvc()) return
  svcSaving.value = true
  try{
    await ws.ensureEmpresaSet()
    const empresa = ws.empresaId
    await api.servicios.create({
      empresa,
      nombre: svcForm.nombre.trim(),
      descripcion: (svcForm.descripcion||'').trim(),
      icono: (svcForm.icono||'').trim()
    })
    // limpiar y volver a Resumen
    Object.assign(svcForm, { nombre:'', descripcion:'', icono:'' })
    loading.servicios = true
    await loadServicios()
    tab.value = 'basicos'
  } catch(e){
    alert(e?.response?.data?.detail || 'No se pudo crear el servicio')
  } finally { svcSaving.value = false }
}

/* ================== CREAR BENEFICIO (inline) ================== */
const benSaving = ref(false)
const benErrors = reactive({})
const benForm = reactive({ nombre:'', descripcion:'', tipo_descuento:'', valor:null, unidad:null })

function validateBen(){
  Object.keys(benErrors).forEach(k => delete benErrors[k])
  if(!benForm.nombre?.trim()) benErrors.nombre = 'El nombre es obligatorio'
  if(benForm.tipo_descuento && (benForm.valor === null || benForm.valor === '' || isNaN(benForm.valor))){
    benErrors.valor = 'Indica el valor del descuento'
  }
  return Object.keys(benErrors).length === 0
}
async function saveQuickBenefit(){
  if(!validateBen()) return
  benSaving.value = true
  try{
    await ws.ensureEmpresaSet()
    const empresa = ws.empresaId
    const payload = {
      empresa,
      nombre: benForm.nombre.trim(),
      descripcion: (benForm.descripcion||'').trim(),
      tipo_descuento: benForm.tipo_descuento || '',
      ...(benForm.tipo_descuento ? { valor: benForm.valor ?? null, unidad: benForm.unidad ?? 0 } : {})
    }
    await api.beneficios.create(payload)
    // limpiar y volver a Resumen
    Object.assign(benForm, { nombre:'', descripcion:'', tipo_descuento:'', valor:null, unidad:null })
    loading.beneficios = true
    await loadBeneficios()
    tab.value = 'basicos'
  } catch(e){
    alert(e?.response?.data?.detail || 'No se pudo crear el beneficio')
  } finally { benSaving.value = false }
}

/* ================== HANDLERS de Precios / Restricciones ================== */
function agregarPrecio(){
  if (!priceForm.esquema || !priceForm.tipo) return
  if (!priceForm.precio && priceForm.precio !== 0) return
  // validación mínima de sesiones
  if (priceForm.tipo === 'sesiones') {
    const n = Number(priceForm.numero_visitas || form.numero_sesiones || 0)
    if (!n || n <= 0) { alert('Para "sesiones", indica # de visitas'); return }
  }
  preciosList.value.push({
    __key: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    esquema: priceForm.esquema,
    tipo: priceForm.tipo,
    precio: Number(priceForm.precio || 0),
    numero_visitas: priceForm.tipo==='sesiones'
      ? Number(priceForm.numero_visitas || form.numero_sesiones || 0)
      : Number(priceForm.numero_visitas || 0)
  })
  priceForm.esquema = ''
  priceForm.tipo = ''
  priceForm.precio = ''
  priceForm.numero_visitas = 0
}
function eliminarPrecio(idx){
  preciosList.value.splice(idx, 1)
}

function agregarRestr(){
  if (!restrForm.dia) return
  restrList.value.push({
    __key: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    dia: restrForm.dia,
    hora_inicio: restrForm.hora_inicio || '',
    hora_fin: restrForm.hora_fin || ''
  })
  Object.assign(restrForm, { dia:'', hora_inicio:'', hora_fin:'' })
}
function eliminarRestr(idx){
  restrList.value.splice(idx, 1)
}
</script>
