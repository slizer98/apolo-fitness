// src/rbac/usePerms.js
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { buildAbility, can as _can, canAny as _canAny, canAll as _canAll } from './permissions'

export function usePerms() {
  const ws = useWorkspaceStore()
  const ability = computed(() =>
    buildAbility({ role: ws.rol, isSuperuser: !!ws.isSuperuser })
  )
  const can     = (perm)        => _can(ability.value, perm)
  const canAny  = (perms = [])  => _canAny(ability.value, perms)
  const canAll  = (perms = [])  => _canAll(ability.value, perms)
  return { can, canAny, canAll }
}
