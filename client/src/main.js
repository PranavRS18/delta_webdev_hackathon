import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './routes.js'
import App from './App.vue'

createApp(App).use(router).use(createPinia()).mount('#app')

