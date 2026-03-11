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
            {{ new Date(item.timestamp).toLocaleString() }} - {{ item.message }}
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

      // Validación básica de URL
      try {
        const url = new URL(this.printerUrl);
        // Aceptar http y https
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

    async sendPrintTest() {
      // Validar URL antes de enviar
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

      try {
        // Verificar librerías
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

        // Construir recibo de prueba
        request += builder.createInitializationElement();
        request += builder.createTextElement({ characterspace: 0 });

        // Encabezado centrado
        request += builder.createAlignmentElement({ position: "center" });
        request += builder.createTextElement({
          data: "Star WebPRNT Test Print\n",
          emphasized: true,
        });
        request += builder.createTextElement({
          data: "Hello from Vue.js!\n",
        });

        // Timestamp
        const timestamp = new Date().toLocaleString();
        request += builder.createTextElement({
          data: timestamp + "\n",
        });

        request += builder.createAlignmentElement({ position: "left" });

        // Items del recibo
        request += builder.createTextElement({ data: "\n" });
        request += builder.createTextElement({
          data: "Test Item               $10.00\n",
        });
        request += builder.createTextElement({
          data: "Another Item            $20.00\n",
        });
        request += builder.createTextElement({
          emphasized: true,
          data: "Total                  $30.00\n",
        });
        request += builder.createTextElement({ data: "\n" });

        // Código de barras (opcional, con manejo de errores)
        try {
          request += builder.createBarcodeElement({
            data: "123456789012",
            symbology: "code128",
            height: 60,
            width: 2,
            hri: true,
          });
        } catch (barcodeError) {
          console.warn("Barcode not supported:", barcodeError);
          request += builder.createTextElement({
            data: "Barcode: 123456789012\n",
          });
        }

        request += builder.createTextElement({ data: "\n\n" });
        request += builder.createCutPaperElement({ feed: true });

        // Crear trader y enviar
        const trader = new window.StarWebPrintTrader({
          url: this.printerUrl,
          timeout: 30000,
        });

        // Promesa para manejar la respuesta
        const printPromise = new Promise((resolve, reject) => {
          trader.onReceive = (response) => {
            resolve(response);
          };
          trader.onError = (error) => {
            reject(error);
          };
        });

        trader.sendMessage({ request });
        const response = await printPromise;
        this.handlePrintResponse(response, request);

        // Logging no crítico
        this.logPrintAttempt(request.length);
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
      if (success) {
        msg = "✅ Print successful!\n";
        msg += `Status: ${response.traderStatus || "OK"}`;
        this.statusVariant = "success";
        this.statusHeader = "Success";
      } else {
        msg = "❌ Print failed\n";
        msg += `Status: ${response.traderStatus || "Unknown error"}`;
        this.statusVariant = "danger";
        this.statusHeader = "Error";
      }

      this.statusMessage = msg;

      // Guardar en historial
      this.$store.dispatch("addPrintHistory", {
        success,
        message: msg,
        timestamp: new Date().toISOString(),
        printerUrl: this.printerUrl,
        requestSize: requestData.length,
      });

      // Mostrar toast si está disponible
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

      // Guardar error en historial
      this.$store.dispatch("addPrintHistory", {
        success: false,
        message: errorMsg,
        timestamp: new Date().toISOString(),
        printerUrl: this.printerUrl,
      });

      // Mostrar toast si está disponible
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
          .catch(() => {
            // Ignorar errores de logging
          });
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

  .md-card {
    width: 100%;
    margin: 0;

    .md-card-header {
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
  }

  .b-list-group-item {
    display: flex;
    align-items: center;

    .md-icon {
      margin-right: 10px;
      font-size: 20px;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 15px;
    }
  }
}

.md-button.md-primary.md-raised {
  width: 100%;
  margin: 1rem 0;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.text-white {
  color: #fff !important;
}
</style>