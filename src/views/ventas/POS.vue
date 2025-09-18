<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/services'

// Estado
const loading = ref(false)
const q = ref('')              // búsqueda texto/código barras
const productos = ref([])
const almacenes = ref([])
const selectedAlmacen = ref(null)
const selectedCliente = ref(null) // asume id de usuario/cliente
const metodoPago = ref('efectivo')
const codigoDesc = ref('')
const codigoInfo = ref(null)  // respuesta validar

// Carrito
const cart = reactive([]) // { tipo:'producto'|'plan', id, nombre, precio_unit, cantidad, productoId?, planId? }

const subtotal = computed(() => cart.reduce((s, it) => s + (Number(it.precio_unit) * it.cantidad), 0))
const descuento = computed(() => {
  if (!codigoInfo?.value || !codigoInfo.value.valid) return 0
  // si validamos con total, ya viene "total_final", pero recalculamos por seguridad
  const t = subtotal.value
  const d = Number(codigoInfo.value.descuento || 0)
  if (codigoInfo.value.tipo === 'porcentaje') return (t * d) / 100
  return Math.min(d, t)
})
const total = computed(() => Math.max(0, (subtotal.value - descuento.value)))

function addProducto(p){
  const idx = cart.findIndex(x => x.tipo==='producto' && x.id===p.id)
  if (idx>=0) cart[idx].cantidad += 1
  else cart.push({ tipo:'producto', id:p.id, nombre:p.nombre, precio_unit:Number(p.precio||0), cantidad:1, productoId:p.id })
}
function removeAt(i){ cart.splice(i,1) }
function inc(i){ cart[i].cantidad += 1 }
function dec(i){ cart[i].cantidad = Math.max(1, cart[i].cantidad-1) }

async function buscar(){
  loading.value = true
  try{
    const { data } = await api.inventario.productos.list({ search:q.value, page_size:50 })
    productos.value = data?.results || data || []
    // si viene con lector y solo 1 coincidencia -> agregar
    if (q.value && productos.value.length===1) {
      addProducto(productos.value[0])
      q.value = ''
    }
  } finally { loading.value = false }
}

async function cargarAlmacenes(){
  const { data } = await api.inventario.almacenes.list({ page_size:100 })
  almacenes.value = data?.results || data || []
  if (!selectedAlmacen.value && almacenes.value.length) selectedAlmacen.value = String(almacenes.value[0].id)
}

async function validarCodigo(){
  if (!codigoDesc.value) { codigoInfo.value = null; return }
  const params = { codigo: codigoDesc.value, total: subtotal.value }
  // si manejas empresa en header, no es necesario; si no, agrega empresa aquí:
  // params.empresa = store.workspace.empresaId
  const { data } = await api.ventas.codigos.validar(params)
  codigoInfo.value = data
}

async function checkout(){
  if (!cart.length) return alert('Agrega artículos')
  if (!selectedCliente.value) return alert('Selecciona cliente')

  const items = cart.map(it => ({
    producto: it.tipo==='producto' ? it.productoId : null,
    plan:     it.tipo==='plan'     ? it.planId     : null,
    cantidad: it.cantidad,
    precio_unit: it.precio_unit,
  }))

  const payload = {
    // si manejas empresa en header, no es necesario mandar empresa
    // empresa: store.workspace.empresaId,
    cliente: selectedCliente.value,
    metodo_pago: metodoPago.value,
    almacen: selectedAlmacen.value,
    codigo_descuento: codigoDesc.value || null,
    items,
  }

  loading.value = true
  try{
    const { data } = await api.ventas.ventas.posCheckout(payload)
    // success
    alert(`Venta #${data.venta_id} creada. Total ${data.total}`)
    cart.splice(0, cart.length)
    codigoDesc.value = ''
    codigoInfo.value = null
  } catch (e){
    const msg = e?.response?.data?.detail || 'No se pudo completar la venta'
    alert(msg)
  } finally { loading.value = false }
}

onMounted(() => {
  cargarAlmacenes()
})
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex flex-col md:flex-row gap-3 items-stretch">
      <div class="flex-1 flex items-center gap-2">
        <input v-model="q" @keyup.enter="buscar" type="text" placeholder="Buscar o escanear código…"
               class="w-full border rounded-lg px-3 py-2" />
        <button @click="buscar" class="px-3 py-2 rounded-lg border">Buscar</button>
      </div>
      <div class="flex items-center gap-2">
        <select v-model="selectedAlmacen" class="border rounded-lg px-3 py-2">
          <option v-for="a in almacenes" :key="a.id" :value="String(a.id)">{{ a.nombre }}</option>
        </select>
        <select v-model="metodoPago" class="border rounded-lg px-3 py-2">
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="mixto">Mixto</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Lista productos -->
      <div class="md:col-span-2 border rounded-xl p-3 ">
        <div class="text-sm text-gray-500 mb-2">Resultados</div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="p in productos" :key="p.id" class="border rounded-lg p-3 hover:shadow cursor-pointer" @click="addProducto(p)">
            <div class="font-medium">{{ p.nombre }}</div>
            <div class="text-xs text-gray-500">{{ p.categoria_nombre }}</div>
            <div class="mt-2 text-right font-semibold">$ {{ Number(p.precio||0).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- Carrito -->
      <div class="border rounded-xl p-3 flex flex-col">
        <div class="font-semibold mb-2">Carrito</div>
        <div class="flex-1 overflow-auto divide-y">
          <div v-for="(it,i) in cart" :key="i" class="py-2">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="font-medium">{{ it.nombre }}</div>
                <div class="text-xs text-gray-500">$ {{ Number(it.precio_unit).toFixed(2) }} c/u</div>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-2 py-1 border rounded" @click="dec(i)">-</button>
                <div class="w-8 text-center">{{ it.cantidad }}</div>
                <button class="px-2 py-1 border rounded" @click="inc(i)">+</button>
                <div class="w-20 text-right font-semibold">$ {{ (it.precio_unit*it.cantidad).toFixed(2) }}</div>
                <button class="px-2 py-1 border rounded text-red-600" @click="removeAt(i)">✕</button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 space-y-2">
          <div class="flex gap-2">
            <input v-model="codigoDesc" @change="validarCodigo" placeholder="Código de descuento" class="flex-1 border rounded-lg px-3 py-2" />
            <button @click="validarCodigo" class="px-3 py-2 border rounded-lg">Validar</button>
          </div>
          <div v-if="codigoInfo && !codigoInfo.valid" class="text-xs text-red-600">{{ codigoInfo.reason || 'Código no válido' }}</div>
          <div class="text-sm space-y-1">
            <div class="flex justify-between"><span>Subtotal</span><span>$ {{ subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between" v-if="descuento>0"><span>Descuento</span><span>− $ {{ descuento.toFixed(2) }}</span></div>
            <div class="flex justify-between font-semibold text-lg"><span>Total</span><span>$ {{ total.toFixed(2) }}</span></div>
          </div>
          <div class="flex gap-2">
            <input v-model.number="selectedCliente" type="number" placeholder="ID cliente" class="flex-1 border rounded-lg px-3 py-2" />
            <button :disabled="loading" @click="checkout" class="px-4 py-2 rounded-lg text-white" :class="loading?'bg-gray-400':'bg-black'">Cobrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/***** Ajusta a tu paleta (usa las mismas clases que productos-lista) *****/
</style>