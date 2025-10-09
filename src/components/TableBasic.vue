<template>
  <div class="space-y-3">
    <!-- Top bar -->
    <div v-if="showToolbar" class="flex flex-wrap items-center gap-2" :class="ui.topbar.bg">
      <!-- buscador -->
      <div class="relative">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2"
           :class="ui.topbar.icon"></i>
        <input
          v-model="globalFilter"
          placeholder="Buscar…"
          :class="ui.topbar.input"
          aria-label="Buscar en la tabla"
        />
      </div>

      <!-- page size -->
      <div class="ml-auto flex items-center gap-2 text-sm">
        <span :class="ui.topbar.label">Filas por página</span>
        <select v-model.number="pageSize" :class="ui.topbar.select" aria-label="Filas por página">
          <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div :class="ui.table.wrap">
      <table class="w-full text-sm">
        <thead :class="[ui.table.thead, stickyHeader ? ui.table.theadSticky : '']">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="ui.table.th"
              :colspan="header.colSpan"
              scope="col"
            >
              <template v-if="!header.isPlaceholder">
                <button
                  v-if="header.column.getCanSort()"
                  @click="header.column.toggleSorting(undefined)"
                  class="inline-flex items-center gap-1"
                  :class="ui.table.thBtn"
                  :aria-label="`Ordenar por ${header.column.id}`"
                >
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                  <span :class="ui.table.sortIcon">
                    {{
                      header.column.getIsSorted() === 'asc'
                        ? '▲'
                        : header.column.getIsSorted() === 'desc'
                        ? '▼'
                        : ''
                    }}
                  </span>
                </button>
                <span v-else>
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </span>
              </template>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :class="[ui.table.tr, dense ? 'py-1' : '']"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="[ui.table.td, dense ? 'py-1.5' : '']"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>

          <tr v-if="!table.getRowModel().rows.length">
            <td :colspan="columns.length" :class="ui.table.empty">Sin registros</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between text-sm">
      <div :class="ui.pag.label">
        Página <span :class="ui.pag.value">{{ pageIndex + 1 }}</span> de
        <span :class="ui.pag.value">{{ table.getPageCount() }}</span>
      </div>
      <div class="flex items-center gap-1">
        <button :class="ui.pag.btn" :disabled="!table.getCanPreviousPage()" @click="table.setPageIndex(0)" aria-label="Primera página">«</button>
        <button :class="ui.pag.btn" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()" aria-label="Página anterior">‹</button>
        <button :class="ui.pag.btn" :disabled="!table.getCanNextPage()" @click="table.nextPage()" aria-label="Página siguiente">›</button>
        <button :class="ui.pag.btn" :disabled="!table.getCanNextPage()" @click="table.setPageIndex(table.getPageCount()-1)" aria-label="Última página">»</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  FlexRender,
} from '@tanstack/vue-table'

const props = defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  initialPageSize: { type: Number, default: 10 },
  /** 'light' | 'dark' (default: 'light' para que coincida con la imagen) */
  variant: { type: String, default: 'light' },
  /** Mostrar/ocultar topbar (buscador + page size) */
  showToolbar: { type: Boolean, default: true },
  /** Header pegado */
  stickyHeader: { type: Boolean, default: true },
  /** Densidad de filas (más compacto) */
  dense: { type: Boolean, default: false },
  /** Opciones de tamaño de página */
  pageSizeOptions: { type: Array, default: () => [5, 10, 25, 50] },
})

/* THEME classes */
const ui = computed(() => {
  const light = {
    topbar: {
      bg: 'bg-white',
      input: 'bg-white border border-gray-300 text-gray-800 rounded px-9 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30',
      icon: 'text-gray-400',
      label: 'text-gray-500',
      select: 'bg-white border border-gray-300 text-gray-800 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30',
    },
    table: {
      wrap: 'overflow-x-auto border border-gray-200 rounded-2xl bg-white',
      thead: 'bg-gray-50',
      // header sticky + línea sutil (como divisor)
      theadSticky: 'sticky top-0 z-10 shadow-[inset_0_-1px_0_0_rgba(229,231,235,1)]',
      th: 'text-left font-medium text-gray-600 px-3 py-2 select-none',
      thBtn: 'hover:text-gray-900',
      sortIcon: 'text-[11px] text-gray-400',
      tr: 'border-t border-gray-100 hover:bg-gray-50/70',
      td: 'px-3 py-2 text-gray-800 align-middle',
      empty: 'px-3 py-6 text-center text-gray-500',
    },
    pag: {
      label: 'text-gray-500',
      value: 'text-gray-800',
      btn: 'px-2 py-1 rounded border border-gray-300 bg-white text-gray-800 disabled:opacity-50 hover:bg-gray-50',
    },
  }
  const dark = {
    topbar: {
      bg: 'bg-transparent',
      input: 'bg-gray-900 border border-gray-700 text-gray-200 rounded px-9 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
      icon: 'text-gray-400',
      label: 'text-gray-400',
      select: 'bg-gray-900 border border-gray-700 text-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
    },
    table: {
      wrap: 'overflow-x-auto border border-gray-800 rounded-xl',
      thead: 'bg-gray-900/60',
      theadSticky: 'sticky top-0 z-10',
      th: 'text-left font-normal text-gray-300 px-3 py-2 select-none',
      thBtn: 'hover:text-white',
      sortIcon: 'text-[11px] text-gray-400',
      tr: 'border-t border-gray-800/80 hover:bg-gray-900/40',
      td: 'px-3 py-2 text-gray-200',
      empty: 'px-3 py-6 text-center text-gray-400',
    },
    pag: {
      label: 'text-gray-400',
      value: 'text-gray-200',
      btn: 'px-2 py-1 rounded border border-gray-700 bg-gray-900/60 text-gray-200 disabled:opacity-50 hover:bg-gray-800',
    },
  }
  return props.variant === 'dark' ? dark : light
})

/* State */
const globalFilter = ref('')
const pageIndex = ref(0)
const pageSize = ref(props.initialPageSize)
const sorting = ref([])

/* Tabla */
const table = useVueTable({
  data: props.rows,
  columns: props.columns,
  state: {
    get sorting() { return sorting.value },
    get globalFilter() { return globalFilter.value },
    get pagination() { return { pageIndex: pageIndex.value, pageSize: pageSize.value } },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  onPaginationChange: (updater) => {
    const next = typeof updater === 'function'
      ? updater({ pageIndex: pageIndex.value, pageSize: pageSize.value })
      : updater
    pageIndex.value = next.pageIndex
    pageSize.value = next.pageSize
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  enableSortingRemoval: true,
  getColumnCanGlobalFilter: () => true,
})

/* Reset paginación cuando cambian los datos o el tamaño de página */
watch(() => props.rows, () => { pageIndex.value = 0 })
watch(pageSize, () => { pageIndex.value = 0 })
</script>

<style scoped>
/* icono del buscador (left padding ya considerado en input) */
:deep(input[placeholder="Buscar…"]) + .fa-magnifying-glass,
.fa-magnifying-glass {
  pointer-events: none;
}

/* mejora sutil de tabla para móviles (evita jitter del sticky) */
@media (max-width: 640px) {
  :deep(thead) { position: sticky; top: 0; }
}
</style>
