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

// Vee-Validate
import { ValidationProvider, ValidationObserver, extend, localize } from 'vee-validate'
import * as rules from 'vee-validate/dist/rules'
import es from 'vee-validate/dist/locale/es.json'
import en from 'vee-validate/dist/locale/en.json'

// Registrar TODAS las reglas de validación
Object.keys(rules).forEach(rule => {
  extend(rule, rules[rule])
})

// Configurar mensajes en español (opcional)
localize('es', es)
localize('en', en)

// Si quieres mensajes personalizados para 'url'
extend('url', {
  ...rules.url,
  message: 'The {_field_} field must be a valid URL'
})

// Registrar plugins
Vue.use(BootstrapVue)
Vue.use(VueMaterial)

// Registrar componentes globales de vee-validate
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')