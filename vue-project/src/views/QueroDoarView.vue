<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/services/api'

const router = useRouter()

// Variáveis do Formulário
const titulo = ref('')
const descricao = ref('')
const dataEntrega = ref('')
const selectedCategoria = ref('')
const selectedInstituicao = ref('')
const selectedFile = ref(null)
const fileName = ref('')
const isAnonimo = ref(false) // <--- NOVA VARIÁVEL AQUI

// Dados da API
const categorias = ref([])
const instituicoes = ref([])

// Estados
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// --- 1. Inicialização e Carregamento de Dados ---
onMounted(async () => {
  const token = localStorage.getItem('jwt')
  
  if (!token) {
    alert('Você precisa estar logado para acessar esta página.')
    router.push('/login')
    return
  }

  try {
    const userRes = await fetch(`${API_URL}/users/me?populate=instituicao`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const user = await userRes.json()

    if (user.instituicao) {
      alert('Instituições não podem oferecer doações.')
      router.push('/painel-instituicao')
      return
    }

    const catRes = await fetch(`${API_URL}/categorias`)
    const catData = await catRes.json()
    categorias.value = catData.data

    const instRes = await fetch(`${API_URL}/instituicaos?populate=users_permissions_user`)
    const instData = await instRes.json()
    instituicoes.value = instData.data

  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    errorMessage.value = 'Erro ao carregar formulário. Tente recarregar a página.'
  }
})

// --- 2. Lógica de Seleção de Arquivo ---
function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    fileName.value = file.name
  }
}

// --- 3. Envio do Formulário ---
async function handleSubmit() {
  const token = localStorage.getItem('jwt')
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    if (!selectedFile.value) throw new Error('Por favor, selecione uma foto.')

    // Passo A: Upload da Imagem
    const formData = new FormData()
    formData.append('files', selectedFile.value)

    const uploadRes = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    if (!uploadRes.ok) throw new Error('Falha no upload da imagem.')
    const uploadData = await uploadRes.json()
    const fotoId = uploadData[0].id

    const userRes = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const user = await userRes.json()

    // Passo B: Criação da Solicitação
    const novaSolicitacao = {
      data: {
        titulo: titulo.value,
        descricao: descricao.value,
        data_disponivel: dataEntrega.value,
        status: 'pendente',
        foto: fotoId,
        users_permissions_user: user.id,
        instituicao: selectedInstituicao.value,
        categoria: selectedCategoria.value,
        anonimo: isAnonimo.value // <--- ENVIANDO A OPÇÃO PARA O STRAPI
      }
    }

    const resCriar = await fetch(`${API_URL}/solicitacaos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(novaSolicitacao)
    })

    if (!resCriar.ok) throw new Error('Erro ao criar a solicitação.')

    successMessage.value = 'Proposta de doação enviada com sucesso!'
    
    setTimeout(() => {
      router.push('/perfil')
    }, 1500)

  } catch (error) {
    console.error('Erro:', error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main>
    <form @submit.prevent="handleSubmit" class="form-doacao">
      <h1>Oferecer um Item para Doação</h1>

      <div class="form-group">
        <label for="item-titulo">O que você quer doar?</label>
        <input
          type="text"
          id="item-titulo"
          v-model="titulo"
          class="form-input"
          placeholder="Ex: Cesta básica, roupas de inverno..."
          required
        />
      </div>

      <div class="form-group">
        <label for="select-categoria">Categoria do item</label>
        <select 
          id="select-categoria" 
          v-model="selectedCategoria" 
          class="form-select" 
          required
        >
          <option value="" disabled>Selecione uma categoria</option>
          <option 
            v-for="cat in categorias" 
            :key="cat.id" 
            :value="cat.id"
          >
            {{ cat.attributes.nome }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="item-foto">Foto do item</label>
        <div class="file-input-wrapper">
          <label for="item-foto" class="file-input-label">
            <span>Escolher arquivo...</span>
            <span class="file-input-filename" style="margin-left: 10px;">{{ fileName }}</span>
          </label>
          <input 
            type="file" 
            id="item-foto" 
            @change="handleFileChange" 
            required 
            accept="image/jpeg, image/png"
            style="display: none;" 
          />
        </div>
      </div>

      <div class="form-group">
        <label for="item-descricao">Descrição do item</label>
        <textarea
          id="item-descricao"
          v-model="descricao"
          class="form-textarea"
          placeholder="Descreva os itens, condição, quantidade, etc."
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="select-instituicao">Para qual instituição?</label>
        <select 
          id="select-instituicao" 
          v-model="selectedInstituicao" 
          class="form-select" 
          required
        >
          <option value="" disabled>Selecione uma instituição</option>
          <option 
            v-for="inst in instituicoes" 
            :key="inst.id" 
            :value="inst.id"
          >
            {{ inst.attributes.users_permissions_user?.data?.attributes?.nome || 'Instituição sem Nome' }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="item-data">Qual dia você gostaria de entregar?</label>
        <input 
          type="date" 
          id="item-data" 
          v-model="dataEntrega" 
          class="form-input" 
          required 
        />
      </div>

      <div class="form-group checkbox-group" style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
        <input 
          type="checkbox" 
          id="item-anonimo" 
          v-model="isAnonimo"
          style="width: 20px; height: 20px; cursor: pointer;"
        />
        <label for="item-anonimo" style="cursor: pointer; margin: 0;">Quero que essa doação seja anônima</label>
      </div>

      <p v-if="errorMessage" style="color: red; margin-bottom: 15px;">{{ errorMessage }}</p>
      <p v-if="successMessage" style="color: green; margin-bottom: 15px; font-weight: bold;">{{ successMessage }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Enviando...' : 'Enviar Proposta de Doação' }}
      </button>
    </form>
  </main>
</template>