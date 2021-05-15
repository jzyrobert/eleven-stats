import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from "primevue/config"
import "primevue/resources/themes/saga-blue/theme.css"       //theme
import "primevue/resources/primevue.min.css"                 //core css
import "primeicons/primeicons.css"                           //icons
import 'primeflex/primeflex.css';

createApp(App).use(PrimeVue).mount('#app')
