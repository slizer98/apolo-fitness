<template>
  <div class="space-y-3">
    <!-- Top bar -->
    <div class="flex flex-wrap items-center gap-2">
      <input
        v-model="globalFilter"
        placeholder="Buscar…"
        class="bg-gray-900 border border-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
      />
      <div class="ml-auto flex items-center gap-2 text-sm">
        <span class="text-gray-400">Filas por página</span>
        <select v-model.number="pageSize" class="bg-gray-900 border border-gray-700 text-gray-200 rounded px-2 py-1">
          <option v-for="n in [5,10,25,50]" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto border border-gray-800 rounded-xl">
      <table class="w-full text-sm">
        <thead class="bg-gray-900/60">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="text-left font-normal text-gray-300 px-3 py-2 select-none"
              :colspan="header.colSpan"
            >
              <template v-if="!header.isPlaceholder">
                <button
                  v-if="header.column.getCanSort()"
                  @click="header.column.toggleSorting(undefined)"
                  class="inline-flex items-center gap-1 hover:text-white"
                >
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                  <span class="text-[11px] text-gray-400">
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
            class="border-t border-gray-800/80 hover:bg-gray-900/40"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-3 py-2 text-gray-200"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>

          <tr v-if="!table.getRowModel().rows.length">
            <td :colspan="columns.length" class="px-3 py-6 text-center text-gray-400">Sin registros</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between text-sm">
      <div class="text-gray-400">
        Página <span class="text-gray-200">{{ pageIndex + 1 }}</span> de
        <span class="text-gray-200">{{ table.getPageCount() }}</span>
      </div>
      <div class="flex items-center gap-1">
        <button class="btn" :disabled="!table.getCanPreviousPage()" @click="table.setPageIndex(0)">«</button>
        <button class="btn" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">‹</button>
        <button class="btn" :disabled="!table.getCanNextPage()" @click="table.nextPage()">›</button>
        <button class="btn" :disabled="!table.getCanNextPage()" @click="table.setPageIndex(table.getPageCount()-1)">»</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  FlexRender, // <- componente correcto para Vue
} from '@tanstack/vue-table'

const props = defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true }, // [{ accessorKey, header, cell?, enableSorting? }]
  initialPageSize: { type: Number, default: 5 },
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
.btn {
  @apply px-2 py-1 rounded border border-gray-700 bg-gray-900/60 text-gray-200 disabled:opacity-50 hover:bg-gray-800;
}
</style>
