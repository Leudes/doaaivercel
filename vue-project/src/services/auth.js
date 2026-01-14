// src/services/auth.js
import { reactive } from 'vue'

export const authState = reactive({
  isAuthenticated: !!localStorage.getItem('jwt'), // Inicia verificando se já existe token
  
  login(token) {
    localStorage.setItem('jwt', token)
    this.isAuthenticated = true
  },
  
  logout() {
    localStorage.removeItem('jwt')
    this.isAuthenticated = false
  }
})