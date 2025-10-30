<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEditing ? titleEdit : titleCreate }}
        </h3>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          @click="handleClose"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <form class="space-y-4 p-5" @submit.prevent="handleSubmit">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium text-gray-600">Nombre *</label>
            <input
              v-model.trim="localForm.nombre"
              type="text"
              class="w-full rounded-lg border px-3 py-2 text-gray-900 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/40"
              :class="errors?.nombre ? 'border-red-400' : 'border-gray-300'"
              placeholder="Nombre del servicio"
            />
            <p v-if="errors?.nombre" class="mt-1 text-xs text-red-600">{{ errors.nombre }}</p>
          </div>

          <div v-if="showIcon" class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium text-gray-600">Icono (opcional)</label>
            <div class="flex items-center gap-2">
              <input
                v-model.trim="localForm.icono"
                type="text"
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="lucide:dumbbell"
                readonly
                @focus="showIconPicker = true"
              />
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
                @click="showIconPicker = true"
              >
                Elegir…
              </button>
            </div>
            <div v-if="localForm.icono" class="mt-2 flex items-center gap-2 text-gray-700">
              <Icon :icon="localForm.icono" class="h-5 w-5" />
              <span class="text-xs">{{ localForm.icono }}</span>
              <button
                type="button"
                class="text-xs text-gray-500 hover:text-gray-700"
                @click="localForm.icono = ''"
              >
                Quitar
              </button>
            </div>
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium text-gray-600">Descripción</label>
            <textarea
              v-model="localForm.descripcion"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/40"
              placeholder="Descripción breve"
            ></textarea>
          </div>
        </div>

        <div v-if="showIsActive" class="flex items-center gap-2">
          <input
            id="servicio-modal-active"
            v-model="localForm.is_active"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-apolo-primary focus:ring-apolo-primary"
          />
          <label for="servicio-modal-active" class="text-sm text-gray-700">Activo</label>
        </div>

        <p v-if="errors?.general" class="text-sm text-red-600">{{ errors.general }}</p>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            @click="handleClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-lg bg-apolo-primary px-4 py-2 font-medium text-white transition hover:bg-apolo-secondary disabled:opacity-60"
            :disabled="saving"
          >
            {{ saving ? 'Guardando…' : (isEditing ? 'Guardar cambios' : 'Crear servicio') }}
          </button>
        </div>
      </form>
    </div>

    <IconPicker v-if="showIcon && showIconPicker" @close="showIconPicker = false" @select="onIconSelect" />
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import { Icon } from '@iconify/vue'
import IconPicker from '@/components/IconPicker.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  initialData: {
    type: Object,
    default: () => ({ nombre: '', descripcion: '', icono: '', is_active: true }),
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  showIcon: { type: Boolean, default: true },
  showIsActive: { type: Boolean, default: false },
  titleCreate: { type: String, default: 'Nuevo servicio' },
  titleEdit: { type: String, default: 'Editar servicio' },
})

const emit = defineEmits(['close', 'submit', 'update:open'])

const localForm = reactive({
  id: null,
  nombre: '',
  descripcion: '',
  icono: '',
  is_active: true,
})

const showIconPicker = ref(false)

function syncForm(source = props.initialData) {
  localForm.id = source?.id ?? null
  localForm.nombre = source?.nombre ?? ''
  localForm.descripcion = source?.descripcion ?? ''
  localForm.icono = source?.icono ?? ''
  localForm.is_active = source?.is_active ?? true
}

watch(
  () => props.initialData,
  (val) => {
    if (props.open) syncForm(val)
  },
  { deep: true }
)

watch(
  () => props.open,
  (val) => {
    if (val) {
      syncForm()
    } else {
      showIconPicker.value = false
    }
  }
)

function handleClose() {
  emit('close')
  emit('update:open', false)
}

function handleSubmit() {
  emit('submit', { ...localForm })
}

function onIconSelect(name) {
  localForm.icono = name
  showIconPicker.value = false
}
</script>
