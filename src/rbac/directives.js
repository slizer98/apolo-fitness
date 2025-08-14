// src/rbac/directives.js
import { usePerms } from './usePerms'

export function registerRBAC(app){
  // v-can="'perm:clave'"
  app.directive('can', {
    mounted(el, binding){
      const { can } = usePerms()
      const ok = can(String(binding.value || ''))
      if (!ok) el.remove()
    }
  })

  // v-can-any="['perm:a','perm:b']"
  app.directive('can-any', {
    mounted(el, binding){
      const { canAny } = usePerms()
      const ok = canAny(Array.isArray(binding.value) ? binding.value : [])
      if (!ok) el.remove()
    }
  })

  // v-candisable="'perm:clave'" -> deshabilita en lugar de ocultar
  app.directive('candisable', {
    mounted(el, binding){
      const { can } = usePerms()
      const ok = can(String(binding.value || ''))
      if (!ok) {
        el.setAttribute('disabled', 'true')
        el.classList.add('opacity-50','pointer-events-none')
      }
    }
  })
}
