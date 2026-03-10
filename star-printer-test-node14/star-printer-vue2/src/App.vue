<script>
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import axios from './plugins/axios'
import { mapGetters, mapState } from 'vuex'

// NOTA IMPORTANTE: Las librerías de Star WebPRNT deben incluirse en public/index.html
// No se importan directamente en este archivo

export default {
  name: 'App',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data() {
    return {
      printerUrl: 'https://localhost:8001/StarWebPRNT/SendMessage',
      paperWidth: 'inch3',
      statusMessage: '',
      statusHeader: 'Status',
      statusVariant: 'info',
      loading: false,
      paperWidthOptions: [
        { value: 'inch2', text: '2 Inch (203dpi/384dot)' },
        { value: 'inch3', text: '3 Inch (203dpi/576dot) / 2 Inch (300dpi/576dot)' },
        { value: 'inch4', text: '4 Inch (203dpi/832dot)' }
      ]
    }
  },
  computed: {
    ...mapState({
      printHistory: state => state.printHistory || []
    }),
    ...mapGetters(['isAuthenticated']),
    idiomaActual() {
      return this.$i18n.locale === 'es' ? 'ES' : 'EN'
    }
  },
  mounted() {
    // Verificar que las librerías de Star estén disponibles
    this.checkStarLibraries()
    
    // Si no hay usuario autenticado, crear uno de prueba para la demo
    if (!this.isAuthenticated) {
      this.$store.dispatch('login', {
        email: 'test@example.com',
        name: 'Test User'
      })
    }
  },
  methods: {
    checkStarLibraries() {
      // Verificar si las librerías están disponibles globalmente
      if (typeof window.StarWebPrintBuilder === 'undefined' || typeof window.StarWebPrintTrader === 'undefined') {
        console.warn('Star WebPRNT libraries not loaded. Make sure to include them in public/index.html')
        this.statusMessage = 'Warning: Star WebPRNT libraries not detected. Please ensure they are properly loaded in public/index.html'
        this.statusVariant = 'warning'
        this.statusHeader = 'Warning'
      } else {
        console.log('Star WebPRNT libraries detected successfully')
      }
    },
    
    async sendPrintTest() {
      this.loading = true
      this.statusMessage = 'Sending print request...'
      this.statusVariant = 'info'
      this.statusHeader = 'Status'

      try {
        // Verificar que las librerías existen en el objeto window
        if (typeof window.StarWebPrintBuilder === 'undefined' || typeof window.StarWebPrintTrader === 'undefined') {
          throw new Error('Star WebPRNT libraries not loaded. Please check public/index.html')
        }

        const builder = new window.StarWebPrintBuilder()
        let request = ''

        // Build a simple test receipt
        request += builder.createInitializationElement()
        request += builder.createTextElement({ characterspace: 0 })

        // Center alignment for header
        request += builder.createAlignmentElement({ position: 'center' })
        request += builder.createTextElement({ 
          data: 'Star WebPRNT Test Print\n',
          emphasized: true
        })
        request += builder.createTextElement({ 
          data: 'Hello from Vue.js!\n' 
        })
        
        // Add timestamp
        const timestamp = new Date().toLocaleString()
        request += builder.createTextElement({ 
          data: timestamp + '\n' 
        })
        
        request += builder.createAlignmentElement({ position: 'left' })

        // Sample receipt items
        request += builder.createTextElement({ data: '\n' })
        request += builder.createTextElement({ data: 'Test Item               $10.00\n' })
        request += builder.createTextElement({ data: 'Another Item            $20.00\n' })
        request += builder.createTextElement({ 
          emphasized: true, 
          data: 'Total                  $30.00\n' 
        })
        request += builder.createTextElement({ data: '\n' })

        // Add barcode (example)
        request += builder.createBarcodeElement({
          data: '123456789012',
          symbology: 'code128',
          height: 60,
          width: 2
        })

        request += builder.createTextElement({ data: '\n\n' })
        request += builder.createCutPaperElement({ feed: true })

        // Crear y configurar el trader
        const trader = new window.StarWebPrintTrader({ 
          url: this.printerUrl,
          timeout: 30000 // 30 segundos timeout
        })

        // Configurar handlers
        trader.onReceive = (response) => {
          this.handlePrintResponse(response, request)
        }

        trader.onError = (error) => {
          this.handlePrintError(error)
        }

        // Enviar mensaje
        trader.sendMessage({ request })

        // Registrar en analytics (ejemplo con axios)
        this.logPrintAttempt(request.length)

      } catch (error) {
        this.handlePrintError(error)
      } finally {
        this.loading = false
      }
    },

    handlePrintResponse(response, requestData) {
      const success = response.traderSuccess === 'OK' || response.traderSuccess === true
      
      let msg = ''
      if (success) {
        msg = '✅ Print successful!\n'
        msg += `Status: ${response.traderStatus || 'OK'}`
        this.statusVariant = 'success'
        this.statusHeader = 'Success'
      } else {
        msg = '❌ Print failed\n'
        msg += `Status: ${response.traderStatus || 'Unknown error'}`
        this.statusVariant = 'danger'
        this.statusHeader = 'Error'
      }

      this.statusMessage = msg
      
      // Guardar en historial (Vuex)
      this.$store.dispatch('addPrintHistory', {
        success,
        message: msg,
        timestamp: new Date().toISOString(),
        printerUrl: this.printerUrl,
        requestSize: requestData.length
      })

      // Mostrar alerta con Bootstrap dialog (opcional)
      this.$bvToast.toast(msg, {
        title: success ? 'Print Success' : 'Print Error',
        variant: success ? 'success' : 'danger',
        solid: true
      })
    },

    handlePrintError(error) {
      console.error('Print error:', error)
      
      let errorMsg = 'Error: ' + error.message
      if (error.responseText) {
        errorMsg += '\nResponse: ' + error.responseText
      }
      if (error.status) {
        errorMsg += `\nStatus: ${error.status}`
      }

      this.statusMessage = errorMsg
      this.statusVariant = 'danger'
      this.statusHeader = 'Error'

      // Guardar error en historial
      this.$store.dispatch('addPrintHistory', {
        success: false,
        message: errorMsg,
        timestamp: new Date().toISOString(),
        printerUrl: this.printerUrl
      })

      // Mostrar toast de error
      this.$bvToast.toast(errorMsg, {
        title: 'Print Error',
        variant: 'danger',
        solid: true
      })
    },

    async logPrintAttempt(requestSize) {
      try {
        // Ejemplo de logging con axios
        await axios.post('/api/print-logs', {
          printerUrl: this.printerUrl,
          paperWidth: this.paperWidth,
          requestSize,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.log('Logging failed (non-critical):', error.message)
      }
    },

    cambiarIdioma() {
      this.$i18n.locale = this.$i18n.locale === 'es' ? 'en' : 'es'
    },

    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/')
    }
  }
}
</script>