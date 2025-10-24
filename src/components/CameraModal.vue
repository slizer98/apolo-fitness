<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[220]">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="onClose"></div>

      <!-- modal -->
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="w-full max-w-[560px] md:max-w-[680px] rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- header -->
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
            <div class="font-semibold">Capturar foto</div>
            <button class="text-gray-500 hover:text-gray-700" @click="onClose" aria-label="Cerrar">✕</button>
          </div>

          <!-- body scrolleable -->
          <div class="px-4 pt-4 pb-2 space-y-4 overflow-auto">
            <!-- Controles -->
            <div class="flex flex-wrap items-center gap-2 justify-between">
              <div class="flex flex-wrap items-center gap-2">
                <button class="btn" @click="switchCamera" :disabled="!canSwitch">Cambiar cámara</button>
                <button class="btn" @click="toggleTorch" :disabled="!torchSupported">
                  {{ torchOn ? 'Apagar' : 'Encender' }} linterna
                </button>
                <label class="btn">
                  Subir desde galería
                  <input type="file" accept="image/*" class="hidden" @change="onPickFile" />
                </label>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <label class="text-xs text-gray-600">Calidad</label>
                  <input type="range" min="60" max="95" step="1" v-model.number="jpegQuality" />
                </div>

                <div class="flex items-center gap-2">
                  <label class="text-xs text-gray-600">Encuadre</label>
                  <select v-model="cropMode" class="border rounded-lg px-2 py-1 text-sm">
                    <option value="cover">Rellenar (recorte)</option>
                    <option value="contain">Ajustar (sin recorte)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Vista cámara / preview -->
            <div
              class="relative rounded-xl overflow-hidden bg-black mx-auto w-full max-h-[70vh] md:max-h-[60vh]"
              style="aspect-ratio: 1 / 1"
            >
              <!-- video (cuando no hay preview) -->
              <video
                v-show="!previewDataUrl"
                ref="videoEl"
                autoplay
                playsinline
                class="w-full h-full"
                :class="cropMode==='contain' ? 'object-contain' : 'object-cover'"
                :style="{ transform: facingMode==='user' ? 'scaleX(-1)' : 'none' }"
              ></video>

              <!-- preview -->
              <img
                v-if="previewDataUrl"
                :src="previewDataUrl"
                class="w-full h-full"
                :class="cropMode==='contain' ? 'object-contain' : 'object-cover'"
                alt="preview"
              />

              <!-- retícula opcional -->
              <div class="absolute inset-0 pointer-events-none">
                <div class="absolute inset-0 border-2 border-white/10 rounded-xl"></div>
                <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/10"></div>
                <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10"></div>
              </div>
            </div>

            <!-- hint / errores -->
            <div class="text-sm text-gray-500">{{ hint }}</div>
            <div v-if="errorMsg" class="text-sm text-rose-600">{{ errorMsg }}</div>
          </div>

          <!-- footer sticky -->
          <div class="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2 bg-white sticky bottom-0 shrink-0">
            <button v-if="previewDataUrl" class="btn-light" @click="retake">Tomar otra</button>
            <button v-else class="btn-primary" @click="capture" :disabled="!streamReady">Tomar foto</button>
            <button v-if="previewDataUrl" class="btn-primary" @click="save" :disabled="saving">
              {{ uploadDirect ? (saving ? 'Guardando…' : 'Usar esta foto') : 'Usar esta foto' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import api from '@/api/services'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Si true: sube directo a /clientes/{id}/avatar/; si false: sólo emite 'captured' */
  uploadDirect: { type: Boolean, default: true },
  /** Requerido sólo si uploadDirect=true */
  clienteId: { type: Number, default: 0 },
})
const emit = defineEmits(['update:open','saved','close','captured'])

const videoEl = ref(null)
const mediaStream = ref(null)
const facingMode = ref('user')
const canSwitch = ref(false)
const torchSupported = ref(false)
const torchOn = ref(false)
const streamReady = ref(false)

const previewDataUrl = ref(null)
const jpegQuality = ref(90)
const cropMode = ref('contain') // por defecto sin recorte
const saving = ref(false)
const errorMsg = ref('')

const hint = computed(() =>
  previewDataUrl.value ? 'Revisa la foto. Puedes tomar otra si quieres.' :
  streamReady.value ? 'Acomódate y toca "Tomar foto".' :
  'Inicializando cámara…'
)

watch(() => props.open, async (val) => {
  if (val) await start()
  else await stop()
})

onMounted(async () => { if (props.open) await start() })
onBeforeUnmount(stop)

async function start(){
  errorMsg.value = ''
  streamReady.value = false
  previewDataUrl.value = null

  try {
    const constraints = {
      audio: false,
      video: { facingMode: { ideal: facingMode.value }, width: { ideal: 1920 }, height: { ideal: 1080 } }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaStream.value = stream
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      await videoEl.value.play()
    }
    canSwitch.value = await hasMultipleCameras()
    torchSupported.value = supportsTorch(stream)
    streamReady.value = true
  } catch (err) {
    errorMsg.value = 'No fue posible acceder a la cámara. Puedes subir una imagen desde la galería.'
    console.error(err)
  }
}

async function stop(){
  try { if (mediaStream.value) mediaStream.value.getTracks().forEach(t => t.stop()) } catch {}
  mediaStream.value = null
  torchOn.value = false
  streamReady.value = false
}

async function hasMultipleCameras(){
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(d => d.kind === 'videoinput').length > 1
  } catch { return false }
}
function supportsTorch(stream){
  try {
    const caps = stream.getVideoTracks()[0]?.getCapabilities?.()
    return !!(caps && 'torch' in caps)
  } catch { return false }
}
async function toggleTorch(){
  if (!mediaStream.value) return
  try {
    const track = mediaStream.value.getVideoTracks()[0]
    await track.applyConstraints({ advanced: [{ torch: !torchOn.value }] })
    torchOn.value = !torchOn.value
  } catch (e) { console.warn('Torch no soportado', e) }
}
async function switchCamera(){
  facingMode.value = (facingMode.value === 'user' ? 'environment' : 'user')
  await stop(); await start()
}

function capture(){
  if (!videoEl.value) return
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')

  const vw = videoEl.value.videoWidth
  const vh = videoEl.value.videoHeight
  if (!vw || !vh) return

  ctx.save()
  if (cropMode.value === 'contain') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, size, size) }
  if (facingMode.value === 'user') { ctx.translate(size, 0); ctx.scale(-1, 1) }

  if (cropMode.value === 'cover') {
    const videoAspect = vw / vh
    const canvasAspect = 1
    let sx, sy, sw, sh
    if (videoAspect >= canvasAspect) {
      sh = vh; sw = vh * canvasAspect; sx = (vw - sw) / 2; sy = 0
    } else {
      sw = vw; sh = vw / canvasAspect; sx = 0; sy = (vh - sh) / 2
    }
    ctx.drawImage(videoEl.value, sx, sy, sw, sh, 0, 0, size, size)
  } else {
    const scale = Math.min(size / vw, size / vh)
    const dw = Math.round(vw * scale)
    const dh = Math.round(vh * scale)
    const dx = Math.round((size - dw) / 2)
    const dy = Math.round((size - dh) / 2)
    ctx.drawImage(videoEl.value, 0, 0, vw, vh, dx, dy, dw, dh)
  }
  ctx.restore()

  const q = Math.min(0.95, Math.max(0.6, jpegQuality.value / 100))
  previewDataUrl.value = canvas.toDataURL('image/jpeg', q)
}

function retake(){ previewDataUrl.value = null; errorMsg.value = '' }

function onPickFile(e){
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { previewDataUrl.value = reader.result }
  reader.readAsDataURL(file)
}

async function save(){
  if (!previewDataUrl.value) return

  // MODO MEMORIA: no sube; emite y cierra
  if (!props.uploadDirect) {
    const file = await dataURLtoFile(previewDataUrl.value, 'avatar.jpg')
    emit('captured', { file, dataUrl: previewDataUrl.value })
    onClose()
    return
  }

  // MODO DIRECTO: sube a backend
  if (!props.clienteId) return
  saving.value = true
  try {
    const blob = await dataURLtoBlob(previewDataUrl.value)
    const file = new File([blob], `avatar_${props.clienteId}.jpg`, { type: 'image/jpeg' })
    await api.clientes.setAvatar(props.clienteId, file)
    emit('saved')
    onClose()
  } catch (err) {
    console.error(err)
    errorMsg.value = 'No se pudo guardar la foto. Intenta de nuevo.'
  } finally {
    saving.value = false
  }
}

function onClose(){
  emit('update:open', false)
  emit('close')
  stop()
}

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1]); let n = bstr.length
  const u8 = new Uint8Array(n)
  while (n--) u8[n] = bstr.charCodeAt(n)
  return new Blob([u8], { type: mime })
}
async function dataURLtoFile (dataUrl, filename = 'avatar.jpg') {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}
</script>

<style scoped>
.btn { @apply px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm; }
.btn-light { @apply px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm; }
.btn-primary { @apply px-3 py-2 rounded-xl bg-[#1a5eff] text-white text-sm hover:opacity-90; }
</style>
