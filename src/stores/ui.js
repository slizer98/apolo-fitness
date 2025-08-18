import { defineStore } from 'pinia'
import { ref } from 'vue'

let idSeq = 1

export const useUiStore = defineStore('ui', () => {
  // Toasts
  const toasts = ref([])
  function toast({ title, message = '', type = 'success', timeout = 3200 }) {
    const id = idSeq++
    toasts.value.push({ id, title, message, type })
    if (timeout) setTimeout(() => removeToast(id), timeout)
    return id
  }
  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  // Confirm (promise-based)
  const confirmState = ref({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'danger', // 'danger' | 'primary'
    _resolve: null,
  })
  function confirm(opts = {}) {
    return new Promise(resolve => {
      confirmState.value = {
        open: true,
        title: opts.title || '¿Estás seguro?',
        message: opts.message || '',
        confirmText: opts.confirmText || 'Sí',
        cancelText: opts.cancelText || 'No',
        variant: opts.variant || 'danger',
        _resolve: resolve,
      }
    })
  }
  function resolveConfirm(val) {
    if (confirmState.value._resolve) confirmState.value._resolve(val)
    confirmState.value.open = false
  }

  return { toasts, toast, removeToast, confirmState, confirm, resolveConfirm }
})
