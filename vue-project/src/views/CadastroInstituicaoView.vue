<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/services/api'

const router = useRouter()

// Campos do Formulário
const nomeInstituicao = ref('')
const cnpj = ref('')
const telefone = ref('')
const endereco = ref('')
const descricao = ref('')
const email = ref('')
const senha = ref('')
const aceitouTermos = ref(false)

// Estados de UI
const loading = ref(false)
const errorMessage = ref('')

async function handleCadastroInstituicao() {
  errorMessage.value = ''

  // Validação básica
  if (!nomeInstituicao.value || !cnpj.value || !email.value || !senha.value) {
    errorMessage.value = 'Preencha os campos obrigatórios.'
    return
  }

  if (!aceitouTermos.value) {
    errorMessage.value = 'Você precisa concordar com as políticas de dados.'
    return
  }

  loading.value = true

  // Gera username baseado no nome (Regra do seu sistema atual)
  const username = nomeInstituicao.value.toLowerCase().replace(/\s+/g, '_')

  try {
    // --- PASSO 1: Criar o Usuário (Auth) ---
    const resUser = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        email: email.value,
        password: senha.value,
        nome: nomeInstituicao.value,
        telefone: telefone.value,
      }),
    })

    const userData = await resUser.json()
    
    if (!resUser.ok) {
      throw new Error(userData.error?.message || 'Erro ao criar usuário de login.')
    }

    const jwt = userData.jwt
    const userId = userData.user.id

    // --- PASSO 2: Criar a Instituição vinculada ao Usuário ---
    const resInst = await fetch(`${API_URL}/instituicaos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`, // Importante: Usa o token recém-criado
      },
      body: JSON.stringify({
        data: {
          nome: nomeInstituicao.value,
          CNPJ: cnpj.value,
          telefone: telefone.value,
          endereco: endereco.value,
          descricao: descricao.value,
          // Vincula a instituição ao ID do usuário criado no passo 1
          users_permissions_user: userId,
        },
      }),
    })

    const instData = await resInst.json()

    if (!resInst.ok) {
      throw new Error(instData.error?.message || 'Erro ao criar perfil da instituição.')
    }

    // Sucesso total
    alert('Instituição cadastrada com sucesso! Faça login para continuar.')
    router.push('/login')

  } catch (err) {
    console.error('Erro no cadastro:', err)
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Cadastro de Instituição</h1>
    
    <form @submit.prevent="handleCadastroInstituicao" class="Login">
      <h3>Nome da Instituição:</h3>
      <input 
        type="text" 
        v-model="nomeInstituicao" 
        required 
      />

      <h3>CNPJ:</h3>
      <input 
        type="text" 
        v-model="cnpj" 
        required 
      />

      <h3>Telefone:</h3>
      <input 
        type="text" 
        v-model="telefone" 
        required 
      />

      <h3>Endereço:</h3>
      <input 
        type="text" 
        v-model="endereco" 
        required 
      />

      <h3>Descrição:</h3>
      <textarea 
        id="descricao-instituicao" 
        v-model="descricao" 
        class="form-textarea"
        required
      ></textarea>

      <hr style="width: 100%; margin: 20px 0; border: 0; border-top: 1px solid #ccc;" />

      <h3>Email de Login:</h3>
      <input 
        type="email" 
        v-model="email" 
        required 
      />

      <h3>Senha:</h3>
      <input 
        type="password" 
        v-model="senha" 
        required 
      />

      <div class="checkbox-container">
        <input 
          type="checkbox" 
          id="termos-instituicao" 
          v-model="aceitouTermos" 
          required 
        />
        <label for="termos-instituicao">Você concorda com as políticas de dados</label>
      </div>

      <p v-if="errorMessage" style="color: red; margin-bottom: 10px;">{{ errorMessage }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Cadastrando...' : 'Cadastrar Instituição' }}
      </button>
    </form>
  </main>
</template>