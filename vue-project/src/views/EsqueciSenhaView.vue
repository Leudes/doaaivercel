<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/services/api'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleRecuperar() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value) {
    errorMessage.value = 'Por favor, informe seu e-mail.'
    return
  }

  loading.value = true

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error?.message || 'Falha ao enviar e-mail de recuperação.')
    }

    successMessage.value = 'Sucesso! Verifique seu e-mail. Um link de redefinição foi enviado.'
    
    // Opcional: Redireciona para a tela de digitar a nova senha após 3 segundos
    // Caso o link do e-mail abra o site diretamente nessa página
    setTimeout(() => {
      router.push('/redefinir-senha') 
    }, 3000)

  } catch (err) {
    console.error('Erro:', err)
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Recuperar Senha</h1>
    
    <form @submit.prevent="handleRecuperar" class="Login">
      <h3>E-mail</h3>
      <input
        type="email"
        v-model="email"
        placeholder="Digite seu e-mail de cadastro"
        required
      />
      
      <p style="text-align: center; margin-top: 15px; color: #666; font-size: 14px;">
        Um link de redefinição será enviado para o seu e-mail.
      </p>

      <p v-if="errorMessage" style="color: red; margin-top: 10px; text-align: center;">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" style="color: green; margin-top: 10px; text-align: center; font-weight: bold;">
        {{ successMessage }}
      </p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Enviando...' : 'Receber Link' }}
      </button>
    </form>
  </main>
</template>