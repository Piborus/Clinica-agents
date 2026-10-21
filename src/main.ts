import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@fontsource-variable/plus-jakarta-sans'
import './assets/styles.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const auth = useAuthStore()
await auth.initialize()
await router.isReady()
app.mount('#app')
