// src/plugins/axios.js
import axios from 'axios'

// Crear una instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para añadir token de autenticación
axiosInstance.interceptors.request.use(
  config => {
    // Intentar obtener el token del store persistido
    try {
      const sessionData = localStorage.getItem('vue-app-session')
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        if (parsed && parsed.session && parsed.session.token) {
          config.headers.Authorization = `Bearer ${parsed.session.token}`
        }
      }
    } catch (error) {
      console.warn('Error al leer session data:', error)
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Puedes manejar errores globales aquí
    if (error.response) {
      // Error de respuesta del servidor
      console.error('Error de respuesta:', error.response.status, error.response.data)
    } else if (error.request) {
      // Error de red (no hubo respuesta)
      console.error('Error de red:', error.request)
    } else {
      // Error en la configuración
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance