<template>
  <div class="app">
    <!-- Bootstrap Navbar -->
    <b-navbar toggleable="lg" type="dark" variant="primary" class="mb-4">
      <b-navbar-brand href="#">
        <md-icon class="mr-2">print</md-icon>
        Star Micronics WebPRNT
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item @click="cambiarIdioma">
            <md-icon>language</md-icon>
            {{ idiomaActual }}
          </b-nav-item>
          <b-nav-item v-if="isAuthenticated" @click="logout">
            <md-icon>exit_to_app</md-icon>
            {{ $t("logout") }}
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <b-container>
      <!-- Material Card principal -->
      <md-card class="md-layout-item">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">{{ $t("welcome") }}</div>
            <div class="md-subhead">Star WebPRNT SDK Testing</div>
          </md-card-header-text>
          <md-card-media>
            <md-icon class="md-size-2x">print</md-icon>
          </md-card-media>
        </md-card-header>

        <md-card-content>
          <p class="mb-4">
            This is a simple Vue.js app to test printing with Star WebPRNT SDK.
          </p>

          <!-- Validación manual -->
          <div>
            <!-- Printer URL con validación manual -->
            <md-field :class="{ 'md-invalid': urlError }">
              <label>Printer URL</label>
              <md-input
                v-model="printerUrl"
                type="url"
                placeholder="http://localhost:8001/StarWebPRNT/SendMessage"
                @input="validateUrl"
                @blur="validateUrl"
              ></md-input>
              <span class="md-error" v-if="urlError">{{ urlError }}</span>
            </md-field>

            <!-- Paper Width Selector con Bootstrap -->
            <b-form-group :label="$t('paperWidth')" label-for="paperWidth">
              <b-form-select
                id="paperWidth"
                v-model="paperWidth"
                :options="paperWidthOptions"
                class="mb-3"
              ></b-form-select>
            </b-form-group>

            <!-- Botón de impresión con Material Design -->
            <md-button
              class="md-primary md-raised md-large"
              @click="sendPrintTest"
              :disabled="!printerUrl || urlError || loading"
            >
              <md-icon>print</md-icon>
              {{ loading ? "Printing..." : "Send Print Test" }}
            </md-button>
          </div>
        </md-card-content>
      </md-card>

      <!-- Status Card con Bootstrap -->
      <b-card
        v-if="statusMessage"
        :header="statusHeader"
        :bg-variant="statusVariant"
        text-variant="white"
        class="mt-4"
      >
        <b-card-text>
          <pre class="text-white">{{ statusMessage }}</pre>
          <div v-if="errorDetails" class="mt-2">
            <strong>Error Details:</strong>
            <pre class="text-white mt-1">{{ errorDetails }}</pre>
          </div>
        </b-card-text>
      </b-card>

      <!-- Historial de impresiones -->
      <b-card title="Print History" class="mt-4" v-if="printHistory.length > 0">
        <b-list-group>
          <b-list-group-item
            v-for="(item, index) in printHistory"
            :key="index"
            :variant="item.success ? 'success' : 'danger'"
          >
            <md-icon>{{ item.success ? "check_circle" : "error" }}</md-icon>
            {{ new Date(item.timestamp).toLocaleString() }} - 
            <span v-if="item.errorCode">[{{ item.errorCode }}] </span>
            {{ item.message }}
          </b-list-group-item>
        </b-list-group>
      </b-card>

      <!-- Guía de solución de problemas -->
      <b-card title="Troubleshooting Guide" class="mt-4" bg-variant="light">
        <b-list-group>
          <b-list-group-item>
            <strong>Error Code: 2F8C000000000000000000060000000000</strong>
            <p class="mt-2 mb-0">Este error puede indicar:</p>
            <ul class="mt-1">
              <li>La impresora no está conectada o encendida</li>
              <li>La URL de la impresora es incorrecta</li>
              <li>La impresora no soporta el formato de comando enviado</li>
              <li>Problema de conectividad de red</li>
            </ul>
          </b-list-group-item>
          <b-list-group-item>
            <strong>Soluciones recomendadas:</strong>
            <ol class="mt-1">
              <li>Verifica que la impresora esté encendida y conectada a la red</li>
              <li>Confirma la URL correcta de la impresora (usualmente http://[IP]:8001/StarWebPRNT/SendMessage)</li>
              <li>Prueba con http en lugar de https</li>
              <li>Verifica que el firewall no esté bloqueando el puerto 8001</li>
              <li>Reinicia la impresora y el servidor web</li>
            </ol>
          </b-list-group-item>
        </b-list-group>
      </b-card>
    </b-container>
  </div>
</template>

<script>
import { ValidationObserver, ValidationProvider } from "vee-validate";
import axios from "./plugins/axios";
import { mapGetters, mapState } from "vuex";

export default {
  name: "App",
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  data() {
    return {
      printerUrl: "http://localhost:8001/StarWebPRNT/SendMessage",
      paperWidth: "inch3",
      statusMessage: "",
      statusHeader: "Status",
      statusVariant: "info",
      loading: false,
      urlError: "",
      errorDetails: null,
      paperWidthOptions: [
        { value: "inch2", text: "2 Inch (203dpi/384dot)" },
        {
          value: "inch3",
          text: "3 Inch (203dpi/576dot) / 2 Inch (300dpi/576dot)",
        },
        { value: "inch4", text: "4 Inch (203dpi/832dot)" },
      ],
    };
  },
  computed: {
    ...mapState({
      printHistory: (state) => state.printHistory || [],
    }),
    ...mapGetters(["isAuthenticated"]),
    idiomaActual() {
      return this.$i18n.locale === "es" ? "ES" : "EN";
    },
  },
  mounted() {
    this.checkStarLibraries();

    if (!this.isAuthenticated) {
      this.$store.dispatch("login", {
        email: "test@example.com",
        name: "Test User",
      });
    }
  },
  methods: {
    checkStarLibraries() {
      if (
        typeof window.StarWebPrintBuilder === "undefined" ||
        typeof window.StarWebPrintTrader === "undefined"
      ) {
        console.warn("Star WebPRNT libraries not loaded");
        this.statusMessage =
          "Warning: Star WebPRNT libraries not detected. Please ensure they are loaded in public/index.html";
        this.statusVariant = "warning";
        this.statusHeader = "Warning";
      } else {
        console.log("Star WebPRNT libraries detected successfully");
      }
    },

    validateUrl() {
      if (!this.printerUrl || this.printerUrl.trim() === "") {
        this.urlError = "Printer URL is required";
        return false;
      }

      try {
        const url = new URL(this.printerUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          this.urlError = "URL must start with http:// or https://";
          return false;
        }
        this.urlError = "";
        return true;
      } catch {
        this.urlError =
          "Must be a valid URL (e.g., http://localhost:8001/...)";
        return false;
      }
    },

    interpretStarErrorCode(errorCode) {
      if (!errorCode || errorCode === "OK") return null;

      const errorMap = {
        "2F8C000000000000000000060000000000": {
          message: "Printer not connected or offline",
          suggestion: "Check printer connection and power. Verify the printer is on and connected to the network.",
        },
        "2F8C000000000000000000030000000000": {
          message: "Printer cover open",
          suggestion: "Close printer cover and try again.",
        },
        "2F8C000000000000000000050000000000": {
          message: "Out of paper",
          suggestion: "Load paper and try again.",
        },
        "2F8C000000000000000000080000000000": {
          message: "Printer buffer full",
          suggestion: "Wait a moment and try again.",
        },
        "2F8C000000000000000000040000000000": {
          message: "Printer offline",
          suggestion: "Check printer status and bring it online.",
        },
        "2F8C000000000000000000070000000000": {
          message: "Printer error - general",
          suggestion: "Check printer for paper jams or other mechanical issues.",
        },
      };

      return (
        errorMap[errorCode] || {
          message: "Unknown printer error",
          suggestion: "Check printer status and connection. Verify the printer model supports WebPRNT.",
        }
      );
    },

    async sendPrintTest() {
      if (!this.validateUrl()) {
        this.statusMessage = "Please enter a valid printer URL";
        this.statusVariant = "warning";
        this.statusHeader = "Validation Error";
        return;
      }

      this.loading = true;
      this.statusMessage = "Sending print request...";
      this.statusVariant = "info";
      this.statusHeader = "Status";
      this.errorDetails = null;

      try {
        if (
          typeof window.StarWebPrintBuilder === "undefined" ||
          typeof window.StarWebPrintTrader === "undefined"
        ) {
          throw new Error(
            "Star WebPRNT libraries not loaded. Please check public/index.html"
          );
        }

        const builder = new window.StarWebPrintBuilder();
        let request = "";

        // Construir recibo de prueba - versión simplificada para mejor compatibilidad
        request += builder.createInitializationElement();

        request += builder.createTextElement({
          data: "\n",
        });

        request += builder.createAlignmentElement({ position: "center" });
        request += builder.createTextElement({
          data: "STAR WEBPRNT TEST\n",
          emphasized: true,
        });
        request += builder.createTextElement({
          data: "================\n",
        });

        request += builder.createAlignmentElement({ position: "left" });
        request += builder.createTextElement({
          data: "\n",
        });

        request += builder.createTextElement({
          data: "Printer Test\n",
        });
        request += builder.createTextElement({
          data: "Date: " + new Date().toLocaleString() + "\n",
        });
        request += builder.createTextElement({
          data: "Paper Width: " + this.paperWidth + "\n",
        });
        request += builder.createTextElement({
          data: "Status: Test Print\n",
        });

        request += builder.createTextElement({
          data: "\n",
        });
        request += builder.createTextElement({
          data: "Thank you for using\n",
        });
        request += builder.createTextElement({
          data: "Star WebPRNT SDK\n",
        });

        request += builder.createTextElement({
          data: "\n",
        });

        request += builder.createCutPaperElement({ feed: true });

        console.log("Print request built:", request);

        const trader = new window.StarWebPrintTrader({
          url: this.printerUrl,
          timeout: 30000,
        });

        const printPromise = new Promise((resolve, reject) => {
          trader.onReceive = (response) => {
            console.log("Printer response:", response);
            resolve(response);
          };
          trader.onError = (error) => {
            console.error("Printer error:", error);
            reject(error);
          };
        });

        trader.sendMessage({ request });
        const response = await printPromise;
        this.handlePrintResponse(response, request);
      } catch (error) {
        this.handlePrintError(error);
      } finally {
        this.loading = false;
      }
    },

    handlePrintResponse(response, requestData) {
      const success =
        response.traderSuccess === "OK" || response.traderSuccess === true;

      let msg = "";
      let errorInfo = null;

      if (success) {
        msg = "✅ Print successful!\n";
        if (response.traderStatus) {
          msg += `Status: ${response.traderStatus}`;
        }
        this.statusVariant = "success";
        this.statusHeader = "Success";
      } else {
        msg = "❌ Print failed\n";
        
        if (response.traderStatus) {
          const errorCode = response.traderStatus;
          errorInfo = this.interpretStarErrorCode(errorCode);
          
          if (errorInfo) {
            msg += `Error: ${errorInfo.message}\n`;
            msg += `Code: ${errorCode}`;
            this.errorDetails = errorInfo.suggestion;
          } else {
            msg += `Status: ${errorCode}`;
          }
        } else {
          msg += "Unknown printer error";
        }
        
        this.statusVariant = "danger";
        this.statusHeader = "Error";
      }

      this.statusMessage = msg;

      this.$store.dispatch("addPrintHistory", {
        success,
        message: msg,
        errorCode: response.traderStatus,
        timestamp: new Date().toISOString(),
        printerUrl: this.printerUrl,
        requestSize: requestData.length,
      });

      if (this.$bvToast) {
        this.$bvToast.toast(msg, {
          title: success ? "Print Success" : "Print Error",
          variant: success ? "success" : "danger",
          solid: true,
        });
      }
    },

    handlePrintError(error) {
      console.error("Print error:", error);

      let errorMsg = "Error: " + (error.message || "Unknown error");
      if (error.responseText) {
        errorMsg += "\nResponse: " + error.responseText;
      }
      if (error.status) {
        errorMsg += `\nStatus: ${error.status}`;
      }

      this.statusMessage = errorMsg;
      this.statusVariant = "danger";
      this.statusHeader = "Error";

      this.$store.dispatch("addPrintHistory", {
        success: false,
        message: errorMsg,
        timestamp: new Date().toISOString(),
        printerUrl: this.printerUrl,
      });

      if (this.$bvToast) {
        this.$bvToast.toast(errorMsg, {
          title: "Print Error",
          variant: "danger",
          solid: true,
        });
      }
    },

    async logPrintAttempt(requestSize) {
      try {
        await axios
          .post("/api/print-logs", {
            printerUrl: this.printerUrl,
            paperWidth: this.paperWidth,
            requestSize,
            timestamp: new Date().toISOString(),
          })
          .catch(() => {});
      } catch (error) {
        console.log("Logging failed (non-critical):", error.message);
      }
    },

    cambiarIdioma() {
      this.$i18n.locale = this.$i18n.locale === "es" ? "en" : "es";
    },

    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/");
    },
  },
};
</script>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 2rem;
  font-family: "Arial", sans-serif;

  .md-card {
    width: 100%;
    margin: 0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .md-card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      
      .md-icon {
        color: #3f51b5;
      }
    }
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin-bottom: 0;
    font-size: 0.9rem;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 10px;
    border-radius: 4px;
    font-family: "Courier New", monospace;
  }

  .b-list-group-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 15px;

    .md-icon {
      margin-right: 10px;
      font-size: 20px;
      flex-shrink: 0;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 15px;
    }
  }

  // Estilos para las tarjetas de troubleshooting
  .card.bg-light {
    background-color: #f8f9fa !important;
    
    .list-group-item {
      background-color: transparent;
      border-color: #dee2e6;
      
      strong {
        color: #495057;
      }
      
      ul, ol {
        margin-bottom: 0;
        padding-left: 20px;
        
        li {
          margin-bottom: 5px;
          color: #6c757d;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

.md-button.md-primary.md-raised {
  width: 100%;
  margin: 1rem 0;
  padding: 12px 24px;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.text-white {
  color: #fff !important;
}

// Estilos para los diferentes tipos de cards de estado
.b-card {
  &[bg-variant="success"] {
    background-color: #28a745 !important;
  }
  
  &[bg-variant="danger"] {
    background-color: #dc3545 !important;
  }
  
  &[bg-variant="warning"] {
    background-color: #ffc107 !important;
  }
  
  &[bg-variant="info"] {
    background-color: #17a2b8 !important;
  }
}

// Animación de carga
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

.md-button.md-primary.md-raised:active:not(:disabled) {
  animation: pulse 0.3s ease;
}
</style>