// src/services/auth.js
import { reactive } from 'vue'

export const authState = reactive({
  isAuthenticated: !!localStorage.getItem('jwt'),
  // Verifica se existe o flag 'isInstitution' salvo como string 'true'
  isInstitution: localStorage.getItem('isInstitution') === 'true', 
  
  login(token, isInstitution) {
    localStorage.setItem('jwt', token)
    // Salvamos como string porque localStorage só aceita texto
    localStorage.setItem('isInstitution', isInstitution)
    
    this.isAuthenticated = true
    this.isInstitution = isInstitution
  },
  
  logout() {
    localStorage.removeItem('jwt')
    localStorage.removeItem('isInstitution')
    
    this.isAuthenticated = false
    this.isInstitution = false
  }
})