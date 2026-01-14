<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { API_URL } from '@/services/api'

const isLoggedIn = ref(false)
const isInstituicao = ref(false)

onMounted(async () => {
  const token = localStorage.getItem('jwt')
  if (token) {
    isLoggedIn.value = true
    try {
      // Ajuste a URL da API conforme necessário
      const res = await fetch(`${API_URL}/users/me?populate=instituicao`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const user = await res.json()
      // Verifica se o campo instituicao existe e não é nulo
      isInstituicao.value = !!user.instituicao
    } catch (err) {
      console.error('Erro ao verificar usuário:', err)
    }
  }
})
</script>

<template>
  <header>
    <div class="logo">DoaAí</div>
    <nav>
      <ul>
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/sobre">Sobre</RouterLink></li>
        <li><RouterLink to="/itens">Itens</RouterLink></li>
        <li><RouterLink to="/campanhas">Campanhas</RouterLink></li>
        
        <li v-if="!isInstituicao">
          <RouterLink to="/quero-doar">Doar</RouterLink>
        </li>

        <li v-if="isLoggedIn">
          <RouterLink :to="isInstituicao ? '/perfil-instituicao' : '/perfil'">
            Seu Perfil
          </RouterLink>
        </li>
        <li v-else>
          <RouterLink to="/login">Login</RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>