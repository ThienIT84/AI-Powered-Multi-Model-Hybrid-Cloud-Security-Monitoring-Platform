import axios from 'axios'
import { useAuthStore } from '../store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await useAuthStore.getState().refreshToken()
        // Retry the original request
        return api(error.config)
      } catch (refreshError) {
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  },
}

export const alertService = {
  getAlerts: async (params?: any) => {
    const response = await api.get('/alerts', { params })
    return response.data
  },
  getAlertDetails: async (id: string) => {
    const response = await api.get(`/alerts/${id}`)
    return response.data
  },
}

export const systemService = {
  getStatus: async () => {
    const response = await api.get('/system/status')
    return response.data
  },
  getStats: async () => {
    const response = await api.get('/system/stats')
    return response.data
  },
}

export default api