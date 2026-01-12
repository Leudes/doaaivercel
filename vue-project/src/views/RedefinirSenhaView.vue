<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Variáveis do Formulário
const code = ref('')
const password = ref('')
const passwordConfirmation = ref('')

// Estados de Feedback
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  // Tenta preencher o código automaticamente se vier na URL (ex: ?code=xyz)
  if (route.query.code) {
    code.value = route.query.code
  }
})

async function handleRedefinir() {
  errorMessage.value = ''
  successMessage.value = ''

  // Validações
  if (!code.value || !password.value || !passwordConfirmation.value) {
    errorMessage.value = 'Por favor, preencha todos os campos.'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true

  try {
    const res = await fetch('http://localhost:1337/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.value,
        password: password.value,
        passwordConfirmation: passwordConfirmation.value,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error?.message || 'Falha ao redefinir senha.')
    }

    successMessage.value = 'Senha redefinida com sucesso! Redirecionando...'
    
    // Redireciona para o login após 2 segundos
    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (err) {
    console.error(err)
    errorMessage.value = 'Erro: ' + err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Redefinir Senha</h1>
    <p style="text-align: center; margin-bottom: 20px; color: #555;">
      Cole abaixo o código recebido no e-mail ou crie sua nova senha.
    </p>

    <form @submit.prevent="handleRedefinir" class="Login">
      <h3>Código de Verificação</h3>
      <input 
        type="text" 
        v-model="code" 
        placeholder="Cole o código do e-mail" 
        required 
      />

      <h3>Nova Senha</h3>
      <input 
        type="password" 
        v-model="password" 
        placeholder="Digite sua nova senha" 
        required 
      />

      <h3>Confirme a Nova Senha</h3>
      <input
        type="password"
        v-model="passwordConfirmation"
        placeholder="Confirme sua nova senha"
        required
      />

      <p v-if="errorMessage" style="color: red; text-align: center; margin-top: 10px;">{{ errorMessage }}</p>
      <p v-if="successMessage" style="color: green; text-align: center; margin-top: 10px; font-weight: bold;">{{ successMessage }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Salvando...' : 'Salvar Nova Senha' }}
      </button>
    </form>
  </main>
</template>