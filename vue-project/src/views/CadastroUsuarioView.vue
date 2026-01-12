<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Variáveis reativas do formulário
const nome = ref('')
const sobrenome = ref('')
const email = ref('')
const telefone = ref('')
const senha = ref('')
const aceitouTermos = ref(false)

// Estados de controle
const loading = ref(false)
const errorMessage = ref('')

async function handleCadastro() {
  errorMessage.value = ''

  // Validação básica manual
  if (!nome.value || !sobrenome.value || !email.value || !senha.value || !telefone.value) {
    errorMessage.value = 'Por favor, preencha todos os campos obrigatórios.'
    return
  }

  if (!aceitouTermos.value) {
    errorMessage.value = 'Você precisa concordar com as políticas de dados.'
    return
  }

  loading.value = true

  // Gera um username único (requisito do Strapi) baseado no nome
  const username = `${nome.value.toLowerCase()}_${sobrenome.value.toLowerCase()}`.replace(/\s+/g, '_')

  try {
    const response = await fetch('http://localhost:1337/api/auth/local/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email.value,
        password: senha.value,
        nome: nome.value,
        sobrenome: sobrenome.value,
        telefone: telefone.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro desconhecido no cadastro.')
    }

    // Sucesso!
    alert('Cadastro realizado com sucesso! Por favor, faça o login.')
    router.push('/login')

  } catch (error) {
    console.error('Ocorreu um erro no cadastro:', error)
    errorMessage.value = `Erro no cadastro: ${error.message}`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Cadastro de Usuário</h1>
    
    <form @submit.prevent="handleCadastro" class="Login">
      <h3>Nome:</h3>
      <input 
        type="text" 
        v-model="nome" 
        placeholder="Seu primeiro nome"
        required 
      />

      <h3>Sobrenome:</h3>
      <input 
        type="text" 
        v-model="sobrenome" 
        placeholder="Seu sobrenome"
        required 
      />

      <h3>E-mail:</h3>
      <input 
        type="email" 
        v-model="email" 
        placeholder="exemplo@email.com"
        required 
      />

      <h3>Telefone:</h3>
      <input 
        type="text" 
        v-model="telefone" 
        placeholder="(XX) 9XXXX-XXXX"
        required 
      />

      <h3>Senha:</h3>
      <input 
        type="password" 
        v-model="senha" 
        placeholder="Crie uma senha segura"
        required 
      /> 
      
      <br />
      
      <div class="checkbox-container">
        <input 
          type="checkbox" 
          id="termos-cadastro" 
          v-model="aceitouTermos" 
          required 
        />
        <label for="termos-cadastro" style="margin-left: 8px;">
          Você concorda com as políticas de dados
        </label>
      </div>

      <p v-if="errorMessage" style="color: red; margin-bottom: 15px;">{{ errorMessage }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Enviando...' : 'Enviar' }}
      </button>
    </form>
  </main>
</template>