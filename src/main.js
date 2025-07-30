import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import VueTippy  from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

const app = createApp(App)
const pinia = createPinia()
app.use(VueTippy, {
  directive: 'tippy',   // v-tippy
  component: 'Tippy',   // <Tippy>
  popperOptions: {      // Popper.js options
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
  },
  // tema personalizado vía clase
  defaultProps: {
    theme: 'apolo-theme',
    animation: 'scale',
    allowHTML: true,
  }
})
app.use(pinia)
app.use(router)

app.mount('#app')

