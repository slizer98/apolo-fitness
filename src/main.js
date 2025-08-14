import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import VueTippy  from 'vue-tippy'
import { useAuthStore } from "@/stores/auth";
import 'tippy.js/dist/tippy.css'
import { registerRBAC } from '@/rbac/directives'

import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/eb-garamond/400.css';       
import '@fontsource/eb-garamond/400-italic.css';
import '@fontsource/eb-garamond/700.css';  

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
registerRBAC(app)
useAuthStore().init();

app.mount('#app')

