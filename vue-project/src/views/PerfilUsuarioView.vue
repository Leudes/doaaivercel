<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL, STRAPI_URL } from '@/services/api'

const router = useRouter()


// Estado do Usuário
const usuario = ref({
  id: null,
  nome: '',
  sobrenome: '',
  email: '',
  telefone: '',
  fotoUrl: '/img/perfil/placeholder.png' // Caminho local ou placeholder
})

// Estado da Interface
const isEditing = ref(false)
const loading = ref(true)
const uploadingPhoto = ref(false)

// Formulário de Edição
const form = ref({
  nome: '',
  sobrenome: '',
  telefone: ''
})

onMounted(async () => {
  const token = localStorage.getItem('jwt')

  if (!token) {
    alert('Você precisa estar logado para acessar o perfil.')
    router.push('/login')
    return
  }

  try {
    // Busca dados do usuário + foto + tipo (instituição)
    const res = await fetch(`${API_URL}/users/me?populate=*`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (!res.ok) throw new Error('Erro ao buscar perfil')
    
    const data = await res.json()

    // Redireciona se for instituição
    if (data.instituicao) {
      router.push('/painel-instituicao') // Redireciona para o painel correto
      return
    }

    // Popula o estado
    usuario.value = {
      id: data.id,
      nome: data.nome || '',
      sobrenome: data.sobrenome || '',
      email: data.email || '',
      telefone: data.telefone || '',
      fotoUrl: data.foto_perfil?.url 
        ? `${STRAPI_URL}${data.foto_perfil.url}` 
        : '/img/perfil/placeholder.png' // Certifique-se de ter essa imagem em public/img/perfil/
    }

  } catch (error) {
    console.error(error)
    localStorage.removeItem('jwt')
    router.push('/login')
  } finally {
    loading.value = false
  }
})

// --- Ações ---

function ativarEdicao() {
  // Copia dados atuais para o formulário
  form.value = {
    nome: usuario.value.nome,
    sobrenome: usuario.value.sobrenome,
    telefone: usuario.value.telefone
  }
  isEditing.value = true
}

function cancelarEdicao() {
  isEditing.value = false
}

async function salvarEdicao() {
  const token = localStorage.getItem('jwt')
  try {
    await fetch(`${API_URL}/users/${usuario.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form.value),
    })

    // Atualiza dados na tela sem precisar recarregar
    usuario.value.nome = form.value.nome
    usuario.value.sobrenome = form.value.sobrenome
    usuario.value.telefone = form.value.telefone
    
    isEditing.value = false
    alert('Dados atualizados com sucesso!')

  } catch (err) {
    console.error('Erro ao salvar:', err)
    alert('Erro ao salvar as alterações.')
  }
}

async function handleFotoUpload(event) {
  const arquivo = event.target.files[0]
  if (!arquivo) return

  const token = localStorage.getItem('jwt')
  uploadingPhoto.value = true

  try {
    // 1. Upload da imagem
    const formData = new FormData()
    formData.append('files', arquivo)

    const resUpload = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const result = await resUpload.json()
    const fotoId = result[0].id
    const novaUrl = `${STRAPI_URL}${result[0].url}`

    // 2. Atualizar usuário com ID da imagem
    await fetch(`${API_URL}/users/${usuario.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ foto_perfil: fotoId }),
    })

    // Atualiza a imagem na tela
    usuario.value.fotoUrl = novaUrl
    alert('Foto de perfil atualizada!')

  } catch (err) {
    console.error('Erro no upload:', err)
    alert('Erro ao atualizar a foto.')
  } finally {
    uploadingPhoto.value = false
  }
}

function handleSair() {
  localStorage.removeItem('jwt')
  // Pequeno hack para limpar estados globais se houver, ou apenas redirecionar
  window.location.href = '/login' 
}

function navegarPara(rota) {
  router.push(rota)
}
</script>

<template>
  <main>
    <div v-if="loading">Carregando perfil...</div>

    <div v-else class="perfil-container">
      <div class="esquerda">
        <h2>Seu Perfil:</h2>
        
        <div style="position: relative; display: inline-block;">
          <img 
            id="perfil-foto" 
            :src="usuario.fotoUrl" 
            class="foto-perfil" 
            :style="{ opacity: uploadingPhoto ? 0.5 : 1 }"
          />
          <label for="upload-foto" class="edita-foto" title="Alterar foto">&#9998;</label>
          <input 
            type="file" 
            id="upload-foto" 
            style="display: none" 
            accept="image/*" 
            @change="handleFotoUpload"
          />
          <span v-if="uploadingPhoto" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold;">...</span>
        </div>

        <div id="dados-container">
          <div v-if="!isEditing" id="view-mode">
            <p><strong>Nome:</strong> <span id="perfil-nome">{{ usuario.nome }} {{ usuario.sobrenome }}</span></p>
            <p><strong>Email:</strong> <span id="perfil-email">{{ usuario.email }}</span></p>
            <p><strong>Telefone:</strong> <span id="perfil-telefone">{{ usuario.telefone }}</span></p>
            
            <button @click="ativarEdicao" id="botao-editar" class="botao-editar" style="margin-top: 20px;">
              Editar
            </button>
          </div>

          <div v-else id="edit-mode" style="text-align: left; max-width: 300px; margin: 0 auto;">
            <p>Nome:</p> 
            <input type="text" v-model="form.nome" class="edit-form-input" />
            
            <p>Sobrenome:</p> 
            <input type="text" v-model="form.sobrenome" class="edit-form-input" />
            
            <p>Telefone:</p> 
            <input type="text" v-model="form.telefone" class="edit-form-input" />
            
            <div class="edit-form-actions">
              <button @click="salvarEdicao" id="botao-salvar" class="botao-confirmar">Salvar</button>
              <button @click="cancelarEdicao" id="botao-cancelar" class="botao-sair" style="background-color: #888">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="direita">
        <button class="botao-menu" @click="navegarPara('/minhas-doacoes')">
          Minhas Doações
        </button>
        
        <button class="botao-menu" @click="navegarPara('/itens')">
          Itens Oferecidos
        </button>
        
        <button class="botao-menu" @click="navegarPara('/campanhas')">
          Campanhas
        </button>
    

        <button @click="handleSair" id="botao-sair" class="botao-sair" style="margin-top: 20px;">
          Sair
        </button>
      </div>
    </div>
  </main>
</template>