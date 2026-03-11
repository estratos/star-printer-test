import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const messages = {
  es: {
    welcome: 'Bienvenido a la aplicación de pruebas Star WebPRNT',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    counter: 'Contador',
    paperWidth: 'Ancho del Papel',
    print: 'Imprimir',
    printing: 'Imprimiendo...',
    status: 'Estado',
    success: 'Éxito',
    error: 'Error',
    history: 'Historial de Impresiones'
  },
  en: {
    welcome: 'Welcome to Star WebPRNT Test App',
    login: 'Login',
    logout: 'Logout',
    counter: 'Counter',
    paperWidth: 'Paper Width',
    print: 'Print',
    printing: 'Printing...',
    status: 'Status',
    success: 'Success',
    error: 'Error',
    history: 'Print History'
  }
}

const i18n = new VueI18n({
  locale: 'es', // Cambiado a español por defecto para esta app
  fallbackLocale: 'en',
  messages
})

export default i18n