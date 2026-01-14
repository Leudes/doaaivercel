<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { API_URL } from '@/services/api'
import { authState } from '@/services/auth'

const router = useRouter()

// Variáveis reativas para o formulário
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  // Limpa erros anteriores
  errorMessage.value = ''
  
  if (!email.value || !password.value) {
    errorMessage.value = 'Preencha todos os campos.'
    return
  }

  loading.value = true

  try {
    // 1. Tenta fazer o login
    const res = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email.value, password: password.value }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error?.message || 'Falha no login ou credenciais inválidas.')
    }

    // 2. Salva o token
    localStorage.setItem('jwt', data.jwt)
    authState.login(data.jwt)

    // 3. Busca os dados do usuário para saber se é Instituição
    // O populate=instituicao é essencial para sua lógica de redirecionamento
    const meRes = await fetch(`${API_URL}/users/me?populate=instituicao`, {
      headers: { Authorization: `Bearer ${data.jwt}` },
    })
    
    const meData = await meRes.json()

    // 4. Redirecionamento condicional
    // Como o Header não atualiza sozinho sem um gerenciador de estado (Pinia), 
    // forçamos uma atualização rápida ou apenas navegamos.
    
    if (meData.instituicao) {
      router.push('/perfil-instituicao') // Rota que criaremos futuramente
    } else {
      router.push('/perfil') // Rota de perfil de usuário comum
    }
    
   

  } catch (err) {
    console.error('Erro no login:', err)
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

// Funções de navegação para os botões de cadastro
function irParaCadastroUsuario() {
  router.push('/cadastro')
}

function irParaCadastroInstituicao() {
  router.push('/cadastro-instituicao')
}
</script>

<template>
  <main>
    <h1>Login</h1>
    
    <form @submit.prevent="handleLogin" class="Login">
      <h3>E-mail</h3>
      <input 
        type="email" 
        v-model="email" 
        placeholder="Digite o seu email aqui:" 
        required 
      />

      <h3>Senha</h3>
      <div class="senha_email">
        <input 
          type="password" 
          v-model="password" 
          placeholder="Digite sua senha aqui:" 
          required 
        />
        <RouterLink to="/esqueci-senha">Esqueci a senha</RouterLink>
      </div>

      <p v-if="errorMessage" style="color: red; margin-top: 10px;">{{ errorMessage }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <div class="signup-section">
      <h2>Não tem conta?</h2>
      <div class="signup-buttons">
        <button 
          @click="irParaCadastroUsuario" 
          class="botao-secundario"
        >
          Cadastrar Usuário
        </button>
        
        <button 
          @click="irParaCadastroInstituicao" 
          class="botao-secundario"
        >
          Cadastrar Instituição
        </button>
      </div>
    </div>
  </main>
</template>