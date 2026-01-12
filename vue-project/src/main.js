import './assets/style.css' // Seu CSS Global

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // <--- Importante: Importar o router

const app = createApp(App)

app.use(router) // <--- Importante: Dizer para o Vue usar o router
app.mount('#app')