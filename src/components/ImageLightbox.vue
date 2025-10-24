<template>
  <teleport to="body">
    <div v-if="open && src" class="fixed inset-0 z-[300] select-none">
      <div class="absolute inset-0 bg-black/80" @click="close"></div>

      <div class="absolute inset-0 flex flex-col items-center justify-center p-4">
        <!-- Controles -->
        <div class="w-full max-w-[1200px] mb-3 flex items-center justify-end gap-2 text-white">
          <button class="ctl" @click.stop="zoomOut">−</button>
          <button class="ctl" @click.stop="resetView">100%</button>
          <button class="ctl" @click.stop="zoomIn">+</button>
          <button class="ctl" @click.stop="close">Cerrar</button>
        </div>

        <!-- Lienzo -->
        <div
          class="bg-black rounded-xl overflow-hidden shadow-xl relative"
          :style="wrapperStyle"
          @wheel.prevent="onWheel"
          @mousedown="onPointerDown"
          @mousemove="onPointerMove"
          @mouseup="onPointerUp"
          @mouseleave="onPointerUp"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend.passive="onTouchEnd"
          @dblclick="toggleZoom"
        >
          <img
            ref="imgEl"
            :src="src"
            alt="preview"
            class="max-w-none max-h-none object-contain"
            :style="imgStyle"
            draggable="false"
          />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  src:  { type: String, default: '' }
})
const emit = defineEmits(['update:open'])

const scale = ref(1)
const pos = ref({ x: 0, y: 0 })
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const posStart = ref({ x: 0, y: 0 })
const imgEl = ref(null)

const wrapperStyle = computed(() => ({
  width: 'min(95vw, 1200px)',
  height: 'min(90vh, 90vh)',
  cursor: scale.value > 1 ? (dragging.value ? 'grabbing' : 'grab') : 'default',
  display: 'grid',
  placeItems: 'center'
}))

const imgStyle = computed(() => ({
  transform: `translate(${pos.value.x}px, ${pos.value.y}px) scale(${scale.value})`,
  transition: dragging.value ? 'none' : 'transform 120ms ease',
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain' // clave para que NO recorte
}))

watch(() => props.open, (v) => { if (v) resetView() })

function close(){ emit('update:open', false) }

function resetView(){
  scale.value = 1
  pos.value = { x: 0, y: 0 }
}

function zoomIn(){ setScale(scale.value + 0.2) }
function zoomOut(){ setScale(scale.value - 0.2) }
function toggleZoom(){ setScale(scale.value === 1 ? 2 : 1) }

function setScale(val){
  const s = Math.max(0.5, Math.min(3, +val.toFixed(2)))
  // al cambiar escala, centra si estabas en pos > 0 para evitar “saltos” bruscos
  if (s === 1) pos.value = { x: 0, y: 0 }
  scale.value = s
}

function onWheel(e){
  const dir = e.deltaY > 0 ? -0.2 : 0.2
  setScale(scale.value + dir)
}

function onPointerDown(e){
  if (scale.value <= 1) return
  dragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  posStart.value = { ...pos.value }
}

function onPointerMove(e){
  if (!dragging.value) return
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  pos.value = { x: posStart.value.x + dx, y: posStart.value.y + dy }
}

function onPointerUp(){ dragging.value = false }

// Touch (pan simple)
function onTouchStart(e){
  if (scale.value <= 1) return
  const t = e.touches[0]
  dragging.value = true
  dragStart.value = { x: t.clientX, y: t.clientY }
  posStart.value = { ...pos.value }
}
function onTouchMove(e){
  if (!dragging.value) return
  const t = e.touches[0]
  const dx = t.clientX - dragStart.value.x
  const dy = t.clientY - dragStart.value.y
  pos.value = { x: posStart.value.x + dx, y: posStart.value.y + dy }
}
function onTouchEnd(){ dragging.value = false }
</script>

<style scoped>
.ctl{ @apply px-3 py-1 rounded bg-white/10 hover:bg-white/20; }
</style>
