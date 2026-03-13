# 📋 Documento de Instalación y Configuración
## Stack Vue 2 Legacy - Node 14 en Windows

---

## 📦 Requisitos Previos

### 1. Instalar Node 14 en Windows

**Opción A - Usando nvm-windows (Recomendado):**
```bash
# Descargar e instalar nvm-windows desde:
# https://github.com/coreybutler/nvm-windows/releases

# Una vez instalado, abrir PowerShell como ADMINISTRADOR
nvm install 14.21.3
nvm use 14.21.3
```

**Opción B - Instalación directa:**
- Descargar Node 14.21.3 desde: https://nodejs.org/download/release/v14.21.3/
- Ejecutar el instalador (node-v14.21.3-x64.msi)

**Verificar instalación:**
```bash
node --version  # Debe mostrar v14.21.3
npm --version   # Debe mostrar 6.14.18
```

### 2. Configurar Git (opcional pero recomendado)
```bash
git --version  # Verificar que Git esté instalado
```

---

## 🚀 Creación del Proyecto

### Paso 1: Instalar Vue CLI 4
```bash
npm install -g @vue/cli@4.5.15
vue --version  # Debe mostrar @vue/cli 4.5.15
```

### Paso 2: Crear nuevo proyecto
```bash
# Navegar al directorio donde quieres crear el proyecto
cd C:\proyectos

# Crear proyecto con configuración manual
vue create vue-app-ejemplo
```

**Seleccionar las siguientes opciones:**
```
? Please pick a preset: Manually select features
? Check the features needed: 
  (*) Babel
  (*) Router
  (*) Vuex
  (*) CSS Pre-processors
  (*) Linter / Formatter
  
? Use history mode for router? Yes
? Pick a CSS pre-processor: Sass/SCSS (with node-sass)
? Pick a linter / formatter: ESLint + Prettier
? Pick additional lint features: Lint on save
? Where do you prefer placing config? In dedicated config files
? Save this as a preset for future projects? No
```

### Paso 3: Navegar al proyecto
```bash
cd vue-app-ejemplo
```

---

## 📚 Instalación de Dependencias Específicas

### Paso 4: Instalar Bootstrap y Bootstrap-Vue
```bash
npm install bootstrap@4.4.1
npm install bootstrap-vue@2.21.2
```

### Paso 5: Instalar Vue Material
```bash
npm install vue-material@1.0.0-beta-15
```

### Paso 6: Instalar Kalendar-Vue
```bash
npm install kalendar-vue@1.0.12
```

### Paso 7: Instalar dependencias adicionales
```bash
npm install axios@0.19.2
npm install vee-validate@3.4.14
npm install vue-i18n@8.24.5
npm install vuex-persistedstate@4.1.0
```

### Paso 8: Instalar herramientas de desarrollo
```bash
# Cypress para testing E2E
npm install cypress@8.7.0 --save-dev
```

---

## 🔧 Configuración del Proyecto

### Paso 9: Configurar Bootstrap en el proyecto

**Editar `src/main.js`:**
```javascript
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Bootstrap y Bootstrap-Vue
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

### Paso 10: Configurar Vue Material

**Editar `src/main.js` (agregar estas líneas):**
```javascript
// Vue Material
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css' // Tema por defecto

Vue.use(VueMaterial)
```

### Paso 11: Configurar Vuex con persistencia

**Editar `src/store/index.js`:**
```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      key: 'vue-app-session',
      paths: ['user', 'session'] // Estados que persistirán
    })
  ],
  state: {
    user: null,
    session: null,
    contador: 0
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setSession(state, session) {
      state.session = session
    },
    incrementarContador(state) {
      state.contador++
    }
  },
  actions: {
    login({ commit }, userData) {
      commit('setUser', userData)
      commit('setSession', { token: 'abc123', timestamp: Date.now() })
    },
    logout({ commit }) {
      commit('setUser', null)
      commit('setSession', null)
    }
  },
  getters: {
    isAuthenticated: state => !!state.user && !!state.session,
    currentUser: state => state.user
  }
})
```

### Paso 12: Configurar Axios

**Crear archivo `src/plugins/axios.js`:**
```javascript
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para añadir token
axiosInstance.interceptors.request.use(
  config => {
    const session = JSON.parse(localStorage.getItem('vue-app-session'))
    if (session && session.session && session.session.token) {
      config.headers.Authorization = `Bearer ${session.session.token}`
    }
    return config
  },
  error => Promise.reject(error)
)

export default axiosInstance
```

### Paso 13: Configurar Vee-Validate

**Editar `src/main.js`:**
```javascript
// Vee-Validate
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import * as rules from 'vee-validate/dist/rules'

// Registrar reglas de validación
Object.keys(rules).forEach(rule => {
  extend(rule, rules[rule])
})

// Registrar componentes
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)
```

### Paso 14: Configurar Vue I18n

**Crear archivo `src/i18n/index.js`:**
```javascript
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const messages = {
  es: {
    welcome: 'Bienvenido a la aplicación',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    counter: 'Contador'
  },
  en: {
    welcome: 'Welcome to the app',
    login: 'Login',
    logout: 'Logout',
    counter: 'Counter'
  }
}

const i18n = new VueI18n({
  locale: 'es', // Idioma por defecto
  fallbackLocale: 'en',
  messages
})

export default i18n
```

**Actualizar `src/main.js` para incluir i18n:**
```javascript
import i18n from './i18n'

// En la instancia de Vue:
new Vue({
  router,
  store,
  i18n,  // Añadir esta línea
  render: h => h(App)
}).$mount('#app')
```

---

## 🎨 Crear Componentes de Ejemplo

### Paso 15: Crear componente de Login

**Crear archivo `src/components/LoginForm.vue`:**
```vue
<template>
  <div class="login-container">
    <md-card>
      <md-card-header>
        <md-card-header-text>
          <div class="md-title">{{ $t('login') }}</div>
        </md-card-header-text>
      </md-card-header>

      <md-card-content>
        <ValidationObserver v-slot="{ invalid }">
          <form @submit.prevent="handleLogin">
            <!-- Email -->
            <ValidationProvider name="email" rules="required|email" v-slot="{ errors }">
              <md-field :class="{'md-invalid': errors.length}">
                <label>Email</label>
                <md-input v-model="form.email" type="email"></md-input>
                <span class="md-error">{{ errors[0] }}</span>
              </md-field>
            </ValidationProvider>

            <!-- Password -->
            <ValidationProvider name="password" rules="required|min:6" v-slot="{ errors }">
              <md-field :class="{'md-invalid': errors.length}">
                <label>Password</label>
                <md-input v-model="form.password" type="password"></md-input>
                <span class="md-error">{{ errors[0] }}</span>
              </md-field>
            </ValidationProvider>

            <md-button 
              type="submit" 
              class="md-primary md-raised" 
              :disabled="invalid"
            >
              {{ $t('login') }}
            </md-button>
          </form>
        </ValidationObserver>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate'

export default {
  name: 'LoginForm',
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    handleLogin() {
      this.$store.dispatch('login', {
        email: this.form.email,
        name: 'Usuario Ejemplo'
      })
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped lang="scss">
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
}
</style>
```

### Paso 16: Crear componente de Dashboard con Kalendar

**Crear archivo `src/components/Dashboard.vue`:**
```vue
<template>
  <div class="dashboard">
    <!-- Bootstrap Navbar -->
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">Vue App Stack</b-navbar-brand>
      
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="#" @click="cambiarIdioma">🌐 {{ idiomaActual }}</b-nav-item>
          <b-nav-item @click="logout">{{ $t('logout') }}</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <div class="container mt-4">
      <div class="row">
        <div class="col-md-4">
          <!-- Material Card -->
          <md-card>
            <md-card-header>
              <md-card-header-text>
                <div class="md-title">{{ $t('counter') }}</div>
              </md-card-header-text>
            </md-card-header>
            
            <md-card-content>
              <p>Valor: {{ contador }}</p>
              <md-button class="md-primary" @click="incrementar">
                Incrementar +1
              </md-button>
            </md-card-content>
          </md-card>
        </div>
        
        <div class="col-md-8">
          <!-- Bootstrap Card con Kalendar -->
          <b-card title="Calendario de Eventos">
            <kalendar
              :events="eventos"
              config="month"
              @event-selected="handleEventSelected"
            />
          </b-card>
        </div>
      </div>

      <!-- Sección de pruebas con Axios -->
      <div class="row mt-4">
        <div class="col-12">
          <b-card title="Datos de API (Ejemplo)">
            <b-button variant="primary" @click="cargarDatos">
              Cargar Datos de Ejemplo
            </b-button>
            <pre v-if="apiData" class="mt-3">{{ apiData }}</pre>
          </b-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../plugins/axios'
import Kalendar from 'kalendar-vue'

export default {
  name: 'Dashboard',
  components: {
    Kalendar
  },
  data() {
    return {
      eventos: [
        {
          id: 1,
          title: 'Evento de prueba',
          start: new Date(),
          end: new Date(new Date().setHours(new Date().getHours() + 2))
        }
      ],
      apiData: null
    }
  },
  computed: {
    contador() {
      return this.$store.state.contador
    },
    usuario() {
      return this.$store.getters.currentUser
    },
    idiomaActual() {
      return this.$i18n.locale === 'es' ? 'ES' : 'EN'
    }
  },
  methods: {
    incrementar() {
      this.$store.commit('incrementarContador')
    },
    async cargarDatos() {
      try {
        // Ejemplo de llamada a API pública
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
        this.apiData = response.data
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    },
    cambiarIdioma() {
      this.$i18n.locale = this.$i18n.locale === 'es' ? 'en' : 'es'
    },
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/')
    },
    handleEventSelected(event) {
      alert(`Evento seleccionado: ${event.title}`)
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
}
</style>
```

---

## 🗺️ Configurar Rutas

### Paso 17: Actualizar `src/router/index.js`
```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import Dashboard from '@/components/Dashboard.vue'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginForm,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Guard de navegación para autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/')
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
```

---

## 🎯 Actualizar App.vue

### Paso 18: Modificar `src/App.vue`
```vue
<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
#app {
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// Estilos globales personalizados
body {
  margin: 0;
  padding: 0;
}
</style>
```

---

## 🧪 Configurar Cypress para Testing

### Paso 19: Inicializar y configurar Cypress
```bash
# Abrir Cypress por primera vez (crea estructura de carpetas)
npx cypress open

# Esto creará la carpeta cypress/ en la raíz del proyecto
```

### Paso 20: Crear test de ejemplo

**Crear archivo `cypress/integration/login.spec.js`:**
```javascript
describe('Página de Login', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('debe mostrar el formulario de login', () => {
    cy.get('.login-container').should('be.visible')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
  })

  it('debe validar campos vacíos', () => {
    cy.get('button[type="submit"]').click()
    cy.get('.md-error').should('have.length.at.least', 2)
  })

  it('debe permitir login con credenciales válidas', () => {
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

---

## 📝 Scripts package.json

### Paso 21: Verificar scripts en `package.json`
```json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint",
    "test:e2e": "cypress open"
  }
}
```

---

## 🚀 Ejecutar la Aplicación

### Paso 22: Iniciar el servidor de desarrollo
```bash
# Desde la raíz del proyecto
npm run serve
```npm run serve

La aplicación estará disponible en: http://localhost:8080

### Paso 23: Ejecutar tests (opcional)
```bash
# Para abrir Cypress
npm run test:e2e
```

---

## 📁 Estructura Final del Proyecto

```
vue-app-ejemplo/
├── node_modules/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── LoginForm.vue
│   │   └── Dashboard.vue
│   ├── plugins/
│   │   └── axios.js
│   ├── i18n/
│   │   └── index.js
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   └── index.js
│   ├── App.vue
│   └── main.js
├── cypress/
│   ├── integration/
│   │   └── login.spec.js
│   └── ...
├── .gitignore
├── babel.config.js
├── package.json
└── README.md
```

---

## ⚠️ Solución de Problemas Comunes

### Error con node-sass
```bash
# Si hay problemas con node-sass, reinstalar:
npm uninstall node-sass
npm install node-sass@4.14.1
```

### Error de dependencias de Bootstrap-Vue
```bash
# Asegurar compatibilidad:
npm install bootstrap-vue@2.21.2 --save-exact
```

### Error con Vue Material y Vue 2
```bash
# Verificar versión:
npm list vue-material
# Debe ser 1.0.0-beta-15
```

### Cypress en Windows
```bash
# Si Cypress no abre, instalar dependencias:
npm install --global windows-build-tools
```

---

## ✅ Verificación Final

Para confirmar que todo funciona correctamente:

1. **Login**: http://localhost:8080
   - Email: cualquier email válido
   - Password: mínimo 6 caracteres

2. **Dashboard**: http://localhost:8080/dashboard
   - Ver el contador funcionando
   - Ver el calendario
   - Probar cambio de idioma
   - Probar carga de datos con Axios
   - Verificar persistencia (recargar página mantiene sesión)

3. **Persistencia**: Cerrar y abrir el navegador - la sesión debe mantenerse

---

## 📚 Recursos Adicionales

- Documentación Vue 2: https://v2.vuejs.org/
- BootstrapVue: https://bootstrap-vue.org/
- Vue Material: https://vuematerial.io/
- Vee-Validate v3: https://vee-validate.logaretm.com/v3/
- Vue I18n v8: https://kazupon.github.io/vue-i18n/
