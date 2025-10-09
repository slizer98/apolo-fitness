<template>
  <div class="rounded-2xl bg-white border border-gray-200 shadow-sm">
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-800">Información del plan</h3>
    </div>

    <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Tipo de plan -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">Tipo de plan</label>
        <select
          class="w-full rounded-lg border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
          v-model="local.tipo"
        >
          <option disabled value="">Selecciona un tipo</option>
          <option v-for="t in tiposOpciones" :key="t" :value="t">{{ t }}</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Este campo define qué precios se muestran en la sección de precios.</p>
      </div>

      <!-- (Opcional) Código o alias interno -->
      <div v-if="showCodigo">
        <label class="block text-sm text-gray-600 mb-1">Código interno (opcional)</label>
        <input
          type="text"
          class="w-full rounded-lg border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
          v-model.trim="local.codigo"
          placeholder="p. ej. PREMIUM_2025"
        />
      </div>
    </div>

    <div class="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
      <button
        class="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      <button
        class="px-3 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90"
        @click="save"
      >
        Guardar
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, toRefs } from 'vue'

const props = defineProps({
  /** v-model del plan. Espera al menos { tipo: string } */
  modelValue: { type: Object, default: () => ({ tipo: '' }) },
  /** catálogo de tipos (si no lo mandas, uso un default) */
  tipos: { type: Array, default: () => ['Estandar', 'Plus', 'Premium'] },
  /** mostrar o no el campo opcional de código */
  showCodigo: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const local = reactive({
  tipo: props.modelValue?.tipo || '',
  codigo: props.modelValue?.codigo || '',
})

watch(() => props.modelValue, (v) => {
  local.tipo = v?.tipo || ''
  local.codigo = v?.codigo || ''
}, { deep: true })

watch(local, () => {
  emit('update:modelValue', { ...props.modelValue, ...local })
}, { deep: true })

const tiposOpciones = props.tipos

function save () { emit('save', { ...local }) }
</script>
