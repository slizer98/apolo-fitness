<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- Render dinámico de widgets según DB -->
      <component
        v-for="(w, i) in ui.dashboardWidgets"
        :key="i"
        :is="resolveWidget(w.name)"
        v-bind="w.props || {}"
        class="block"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUiConfigStore } from '@/stores/uiConfig'
import { useWorkspaceStore } from '@/stores/workspace'

// Widgets
import KpisWidget from '@/components/dashboard/widgets/KpisWidget.vue'
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget.vue'
import EntradasDelDiaWidget from '@/components/dashboard/widgets/EntradasDelDiaWidget.vue'
import PlanesVigentesWidget from '@/components/dashboard/widgets/PlanesVigentesWidget.vue'

const ui = useUiConfigStore()
const ws = useWorkspaceStore()

const WIDGETS = {
  kpis: KpisWidget,
  quickActions: QuickActionsWidget,
  entradasDelDia: EntradasDelDiaWidget,
  planesVigentes: PlanesVigentesWidget,
}

function resolveWidget(name) {
  return WIDGETS[name] || (() => null)
}

onMounted(async () => {
  await ws.ensureEmpresaSet()
  if (!ui.loaded) await ui.loadForActiveCompany()
})
</script>

<style scoped>
/* opcional */
</style>
