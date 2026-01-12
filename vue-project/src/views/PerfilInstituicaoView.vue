<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL, STRAPI_URL } from '@/services/api'

const router = useRouter()


// Estados de Dados
const usuario = ref({})      // Dados da tabela User (Nome, Email, Telefone)
const instituicao = ref({})  // Dados da tabela Instituicao (CNPJ, Endereço, Descrição)
const fotoUrl = ref('/img/placeholder.png')

// Estados da Interface
const loading = ref(true)
const isEditing = ref(false)
const uploadingPhoto = ref(false)

// Formulário de Edição (Agrupa dados de ambas as tabelas)
const form = ref({
  nome: '',
  telefone: '',
  cnpj: '',
  endereco: '',
  descricao: ''
})

onMounted(async () => {
  const token = localStorage.getItem('jwt')
  if (!token) {
    alert('Sessão expirada.')
    router.push('/login')
    return
  }

  try {
    // Busca dados do usuário + instituição + foto
    const res = await fetch(`${API_URL}/users/me?populate=instituicao,foto_perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (!res.ok) throw new Error('Erro ao carregar dados.')
    
    const data = await res.json()

    // Validação de Tipo de Usuário
    if (!data.instituicao) {
      alert('Apenas instituições acessam esta página.')
      router.push('/perfil')
      return
    }

    // Popula estados
    usuario.value = data
    instituicao.value = data.instituicao
    
    if (data.foto_perfil?.url) {
      fotoUrl.value = `${STRAPI_URL}${data.foto_perfil.url}`
    }

  } catch (error) {
    console.error('Erro:', error)
    localStorage.removeItem('jwt')
    router.push('/login')
  } finally {
    loading.value = false
  }
})

// --- Lógica de Edição ---

function ativarEdicao() {
  // Prepara o formulário com os dados atuais
  form.value = {
    nome: usuario.value.nome,
    telefone: usuario.value.telefone,
    cnpj: instituicao.value.CNPJ,
    endereco: instituicao.value.endereco,
    descricao: instituicao.value.descricao
  }
  isEditing.value = true
}

async function salvarEdicao() {
  const token = localStorage.getItem('jwt')
  try {
    // 1. Atualiza dados do Usuário (Nome, Telefone)
    await fetch(`${API_URL}/users/${usuario.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome: form.value.nome,
        telefone: form.value.telefone,
      }),
    })

    // 2. Atualiza dados da Instituição (CNPJ, Endereço, Descrição)
    await fetch(`${API_URL}/instituicaos/${instituicao.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          CNPJ: form.value.cnpj,
          endereco: form.value.endereco,
          descricao: form.value.descricao,
        },
      }),
    })

    // Atualiza a tela com os novos dados
    usuario.value.nome = form.value.nome
    usuario.value.telefone = form.value.telefone
    instituicao.value.CNPJ = form.value.cnpj
    instituicao.value.endereco = form.value.endereco
    instituicao.value.descricao = form.value.descricao

    isEditing.value = false
    alert('Informações atualizadas com sucesso!')

  } catch (error) {
    console.error('Erro ao salvar:', error)
    alert('Ocorreu um erro ao salvar as informações.')
  }
}

// --- Upload de Foto ---

async function handleFotoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const token = localStorage.getItem('jwt')
  uploadingPhoto.value = true

  try {
    const formData = new FormData()
    formData.append('files', file)

    const uploadRes = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!uploadRes.ok) throw new Error('Erro no upload')
    
    const result = await uploadRes.json()
    const fotoId = result[0].id
    const novaUrl = `${STRAPI_URL}${result[0].url}`

    // Vincula a foto ao usuário
    await fetch(`${API_URL}/users/${usuario.value.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ foto_perfil: fotoId }),
    })

    fotoUrl.value = novaUrl
    alert('Foto atualizada!')

  } catch (error) {
    alert('Falha ao atualizar foto: ' + error.message)
  } finally {
    uploadingPhoto.value = false
  }
}

function handleSair() {
  localStorage.removeItem('jwt')
  window.location.href = '/login'
}
</script>

<template>
  <main>
    <div v-if="loading">Carregando perfil da instituição...</div>

    <div v-else class="perfil-container">
      <div class="esquerda">
        <h2 id="instituicao-nome">{{ usuario.nome }}</h2>
        
        <div style="position: relative; display: inline-block;">
          <img 
            id="instituicao-foto" 
            :src="fotoUrl" 
            class="foto-perfil" 
            :style="{ opacity: uploadingPhoto ? 0.5 : 1 }"
          />
          <label for="upload-foto" class="edita-foto">&#9998;</label>
          <input 
            type="file" 
            id="upload-foto" 
            style="display: none" 
            accept="image/jpeg, image/png"
            @change="handleFotoUpload"
          />
        </div>

        <div id="dados-container">
          <div v-if="!isEditing">
            <p><strong>CNPJ:</strong> {{ instituicao.CNPJ }}</p>
            <p><strong>Email:</strong> {{ usuario.email }}</p>
            <p><strong>Telefone:</strong> {{ usuario.telefone }}</p>
            <p><strong>Endereço:</strong> {{ instituicao.endereco }}</p>
            
            <h3>Sobre a Instituição:</h3>
            <p style="text-align: justify;">{{ instituicao.descricao }}</p>
            
            <button @click="ativarEdicao" class="botao-editar" style="margin-top: 20px;">
              Editar Informações
            </button>
          </div>

          <div v-else class="edit-form-container" style="text-align: left;">
            <p><strong>Nome:</strong></p>
            <input v-model="form.nome" class="edit-form-input" />
            
            <p><strong>CNPJ:</strong></p>
            <input v-model="form.cnpj" class="edit-form-input" />
            
            <p><strong>Email:</strong> {{ usuario.email }} (Não editável)</p>
            
            <p><strong>Telefone:</strong></p>
            <input v-model="form.telefone" class="edit-form-input" />
            
            <p><strong>Endereço:</strong></p>
            <input v-model="form.endereco" class="edit-form-input" />
            
            <h3>Sobre a Instituição:</h3>
            <textarea v-model="form.descricao" class="edit-form-textarea"></textarea>
            
            <div class="edit-form-actions">
              <button @click="salvarEdicao" class="botao-confirmar">Salvar</button>
              <button @click="isEditing = false" id="cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="direita">
        <button class="botao-menu" @click="router.push('/campanhas')">
          Ver Campanhas
        </button>
        
        <button class="botao-menu" @click="router.push('/painel-instituicao')">
          Painel de Doações
        </button>
        
        <button class="botao-menu" @click="router.push('/itens')">
          Itens Registrados
        </button>
        
        <button @click="handleSair" class="botao-sair">
          Sair
        </button>
      </div>
    </div>
  </main>
</template>