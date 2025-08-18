<template>
  <div class="p-4 text-white">
    <h1 class="text-2xl font-light mb-4">Mi perfil</h1>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- Columna izquierda: resumen -->
      <section class="lg:col-span-1 space-y-4">
        <!-- Tarjeta: contexto -->
        <div class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
          <h3 class="text-sm text-gray-300 mb-3">Contexto activo</h3>
          <ul class="text-sm space-y-1">
            <li><span class="text-gray-400">Empresa:</span> {{ me.empresa_activa?.nombre || '—' }}</li>
            <li><span class="text-gray-400">Sucursal:</span> {{ me.sucursal_activa?.nombre || '—' }}</li>
            <li><span class="text-gray-400">Rol:</span> {{ me.rol_activo || '—' }}</li>
          </ul>
          <div v-if="me.ultimo_acceso" class="text-[12px] text-gray-400 mt-3">
            Último acceso: {{ formatDateTime(me.ultimo_acceso) }}
          </div>
        </div>

        <!-- Tarjeta: asignaciones -->
        <div class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
          <h3 class="text-sm text-gray-300 mb-3">Mis asignaciones</h3>
          <div v-if="!me.asignaciones?.length" class="text-gray-400 text-sm">Sin asignaciones</div>
          <ul class="space-y-2" v-else>
            <li v-for="a in me.asignaciones" :key="a.id"
                class="rounded-lg border border-gray-800 bg-black/30 p-2">
              <div class="flex items-center justify-between">
                <div class="text-sm">
                  <div class="font-medium">{{ a.empresa_nombre }} — {{ a.sucursal_nombre }}</div>
                  <div class="text-gray-400">Rol: {{ a.rol }}</div>
                </div>
                <span class="text-[11px] px-2 py-0.5 rounded-full"
                      :class="a.is_active ? 'bg-green-600/20 border border-green-700/50 text-green-200'
                                          : 'bg-gray-700/40 border border-gray-700 text-gray-300'">
                  {{ a.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div v-if="a.permisos" class="mt-2 flex flex-wrap gap-1">
                <span v-for="(val,key) in a.permisos" :key="key"
                      class="text-[11px] px-2 py-0.5 rounded-full"
                      :class="val ? 'bg-green-600/20 border border-green-700/50 text-green-200' : 'bg-gray-700/40 border border-gray-700 text-gray-300'">
                  {{ key }} {{ val ? '✔' : '—' }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Columna derecha: formularios -->
      <section class="lg:col-span-2 space-y-4">

        <!-- Editar datos -->
        <div class="rounded-2xl bg-gray-900/60 border border-gray-800">
          <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 class="text-lg">Datos del perfil</h3>
            <button
              :disabled="savingProfile"
              @click="saveProfile"
              class="px-4 py-2 rounded-lg bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ savingProfile ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>

          <div class="p-4 space-y-4">
            <!-- fila 1 -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Usuario</label>
                <input disabled v-model="form.username" class="w-full bg-gray-950/60 border border-gray-800 rounded px-3 py-2 text-gray-400" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Email</label>
                <input v-model.trim="form.email" type="email" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
                <p v-if="errors.email" class="text-red-400 text-xs mt-1">{{ errors.email }}</p>
              </div>
            </div>

            <!-- fila 2 -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Nombre</label>
                <input v-model.trim="form.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Apellido</label>
                <input v-model.trim="form.apellido" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
            </div>

            <!-- fila 3 -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Teléfono</label>
                <input v-model.trim="form.telefono" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Cargo</label>
                <input v-model.trim="form.cargo" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
            </div>

            <!-- fila 4 -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Días de trabajo</label>
                <input v-model.trim="form.dias_trabajo" placeholder="Lun-Vie" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-400 mb-1">Entrada</label>
                  <input v-model="form.horario_entrada" type="time" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-1">Salida</label>
                  <input v-model="form.horario_salida" type="time" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
                </div>
              </div>
            </div>

            <!-- fila 5 -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Fecha de contratación</label>
                <input v-model="form.fecha_contratacion" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Fecha de nacimiento</label>
                <input v-model="form.fecha_nacimiento" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
            </div>

            <!-- fila 6 -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Código postal</label>
                <input v-model.trim="form.codigo_postal" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">No. seguro</label>
                <input v-model.trim="form.numero_seguro" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
            </div>

            <!-- fila 7 -->
            <div>
              <label class="block text-xs text-gray-400 mb-1">Domicilio</label>
              <textarea v-model.trim="form.domicilio" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
            </div>

            <div>
              <label class="block text-xs text-gray-400 mb-1">Notas</label>
              <textarea v-model.trim="form.notas" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
            </div>
          </div>
        </div>

        <!-- Seguridad -->
        <div class="rounded-2xl bg-gray-900/60 border border-gray-800">
          <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 class="text-lg">Seguridad</h3>
            <button
              :disabled="savingPassword"
              @click="changePassword"
              class="px-4 py-2 rounded-lg bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ savingPassword ? 'Actualizando…' : 'Cambiar contraseña' }}
            </button>
          </div>

          <div class="p-4 space-y-4">
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Nueva contraseña</label>
                <input v-model="pwd.new1" type="password" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
                <p v-if="errors.pwd1" class="text-red-400 text-xs mt-1">{{ errors.pwd1 }}</p>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Confirmar contraseña</label>
                <input v-model="pwd.new2" type="password" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
                <p v-if="errors.pwd2" class="text-red-400 text-xs mt-1">{{ errors.pwd2 }}</p>
              </div>
            </div>
            <p class="text-[12px] text-gray-400">Mínimo 8 caracteres. (Por ahora no se solicita contraseña actual)</p>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/services'
import { useUiStore } from '@/stores/ui'
import { useWorkspaceStore } from '@/stores/workspace'

const ui = useUiStore()
const ws = useWorkspaceStore()

const me = ref({
  id: null,
  username: '',
  email: '',
  nombre: '',
  apellido: '',
  telefono: '',
  cargo: '',
  dias_trabajo: '',
  horario_entrada: null,
  horario_salida: null,
  fecha_contratacion: null,
  fecha_nacimiento: null,
  codigo_postal: '',
  numero_seguro: '',
  domicilio: '',
  notas: '',
  ultimo_acceso: null,
  asignaciones: [],
  empresa_activa: null,
  sucursal_activa: null,
  rol_activo: null,
})

const form = ref({ ...me.value })
const errors = ref({ email: null, pwd1: null, pwd2: null })
const savingProfile = ref(false)

const pwd = ref({ new1: '', new2: '' })
const savingPassword = ref(false)

onMounted(load)

async function load(){
  try{
    const { data } = await api.accounts.perfil()
    me.value = data || {}
    form.value = {
      id: me.value.id,
      username: me.value.username || '',
      email: me.value.email || '',
      nombre: me.value.nombre || me.value.first_name || '',
      apellido: me.value.apellido || me.value.last_name || '',
      telefono: me.value.telefono || '',
      cargo: me.value.cargo || '',
      dias_trabajo: me.value.dias_trabajo || '',
      horario_entrada: me.value.horario_entrada || '',
      horario_salida: me.value.horario_salida || '',
      fecha_contratacion: me.value.fecha_contratacion || '',
      fecha_nacimiento: me.value.fecha_nacimiento || '',
      codigo_postal: me.value.codigo_postal || '',
      numero_seguro: me.value.numero_seguro || '',
      domicilio: me.value.domicilio || '',
      notas: me.value.notas || '',
    }
  } catch (e){
    ui.toast({ type:'error', title:'No se pudo cargar el perfil', message: e.response?.data?.detail || 'Error' })
  }
}

function validEmail(v){
  return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

async function saveProfile(){
  // Validación mínima
  errors.value.email = null
  if(!validEmail(form.value.email)) {
    errors.value.email = 'Email inválido'
    return
  }

  savingProfile.value = true
  try{
    const payload = {
      email: form.value.email?.trim() || '',
      nombre: form.value.nombre?.trim() || '',
      apellido: form.value.apellido?.trim() || '',
      telefono: form.value.telefono?.trim() || '',
      cargo: form.value.cargo?.trim() || '',
      dias_trabajo: form.value.dias_trabajo?.trim() || '',
      horario_entrada: form.value.horario_entrada || null,
      horario_salida: form.value.horario_salida || null,
      fecha_contratacion: form.value.fecha_contratacion || null,
      fecha_nacimiento: form.value.fecha_nacimiento || null,
      codigo_postal: form.value.codigo_postal?.trim() || '',
      numero_seguro: form.value.numero_seguro?.trim() || '',
      domicilio: form.value.domicilio?.trim() || '',
      notas: form.value.notas?.trim() || '',
    }
    await api.accounts.usuarios.patch(me.value.id, payload)
    ui.toast({ type:'success', title:'Perfil actualizado' })
    await load()
  } catch (e){
    ui.toast({ type:'error', title:'No se pudo guardar', message: e.response?.data?.detail || 'Error' })
  } finally {
    savingProfile.value = false
  }
}

async function changePassword(){
  errors.value.pwd1 = null
  errors.value.pwd2 = null

  if(!pwd.value.new1 || pwd.value.new1.length < 8){
    errors.value.pwd1 = 'Mínimo 8 caracteres'
    return
  }
  if(pwd.value.new1 !== pwd.value.new2){
    errors.value.pwd2 = 'Las contraseñas no coinciden'
    return
  }

  savingPassword.value = true
  try{
    await api.accounts.usuarios.patch(me.value.id, { new_password: pwd.value.new1 })
    ui.toast({ type:'success', title:'Contraseña actualizada' })
    pwd.value = { new1: '', new2: '' }
  } catch (e){
    ui.toast({ type:'error', title:'No se pudo actualizar la contraseña', message: e.response?.data?.detail || 'Error' })
  } finally {
    savingPassword.value = false
  }
}

function formatDateTime(s){
  try {
    const d = new Date(s)
    return d.toLocaleString('es-MX')
  } catch { return s }
}
</script>
