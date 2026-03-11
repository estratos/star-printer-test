import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'

// Bootstrap y Bootstrap-Vue
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import BootstrapVue from 'bootstrap-vue'

// Vue Material
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

// Vee-Validate - SOLO los componentes, sin reglas
import { ValidationProvider, ValidationObserver } from 'vee-validate'

// Registrar plugins
Vue.use(BootstrapVue)
Vue.use(VueMaterial)

// Registrar componentes globales de vee-validate (solo los wrappers)
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')