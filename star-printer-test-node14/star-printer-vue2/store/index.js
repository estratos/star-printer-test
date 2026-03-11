import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      key: 'vue-app-session',
      paths: ['user', 'session', 'printHistory']
    })
  ],
  state: {
    user: null,
    session: null,
    contador: 0,
    printHistory: []
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
    },
    addPrintHistory(state, printJob) {
      state.printHistory.unshift(printJob) // Agregar al inicio
      // Mantener solo los últimos 20 registros
      if (state.printHistory.length > 20) {
        state.printHistory.pop()
      }
    },
    clearPrintHistory(state) {
      state.printHistory = []
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
    },
    addPrintHistory({ commit }, printJob) {
      commit('addPrintHistory', printJob)
    },
    clearPrintHistory({ commit }) {
      commit('clearPrintHistory')
    }
  },
  getters: {
    isAuthenticated: state => !!state.user && !!state.session,
    currentUser: state => state.user,
    recentPrintJobs: state => state.printHistory.slice(0, 5)
  }
})