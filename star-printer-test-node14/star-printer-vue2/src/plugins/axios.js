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
    try {
      const sessionData = localStorage.getItem('vue-app-session')
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        if (parsed && parsed.session && parsed.session.token) {
          config.headers.Authorization = `Bearer ${parsed.session.token}`
        }
      }
    } catch (error) {
      console.warn('Error reading session:', error)
    }
    return config
  },
  error => Promise.reject(error)
)

export default axiosInstance