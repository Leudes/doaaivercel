<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL, STRAPI_URL } from '@/services/api'
import { authState } from '@/services/auth'

const router = useRouter()

// Estado do Usuário
const usuario = ref({
  id: null,
  nome: '',
  sobrenome: '',
  email: '',
  telefone: '',
  fotoUrl: '/img/perfil/placeholder.png' // Imagem padrão caso não tenha foto
})

// Estados da Tela
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

  // 1. Verificação básica de token
  if (!token) {
    router.push('/login')
    return
  }

  try {
    // 2. Busca unificada com populate=* (Mais seguro contra erros de digitação)
    const res = await fetch(`${API_URL}/users/me?populate=*`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // 3. Se der erro de autenticação (401), aí sim limpamos o token
    if (res.status === 401 || res.status === 403) {
      throw new Error('UNAUTHORIZED')
    }

    if (!res.ok) throw new Error('Erro na conexão com o servidor')
    
    const data = await res.json()

    // 4. Se for instituição, manda pro painel correto
    if (data.instituicao) {
      router.replace('/perfil-instituicao') // Use replace para não poluir o histórico
      return
    }

    // 5. Montagem segura da URL da imagem
    let urlFoto = '/img/perfil/placeholder.png'
    
    if (data.foto_perfil && data.foto_perfil.url) {
      // Verifica se a URL já vem completa (Cloudinary/AWS) ou se precisa do domínio (Local/Upload padrão)
      if (data.foto_perfil.url.startsWith('http')) {
        urlFoto = data.foto_perfil.url
      } else {
        urlFoto = `${STRAPI_URL}${data.foto_perfil.url}`
      }
    }

    // 6. Preenche os dados
    usuario.value = {
      id: data.id,
      nome: data.nome || '',
      sobrenome: data.sobrenome || '',
      email: data.email || '',
      telefone: data.telefone || '',
      fotoUrl: urlFoto
    }

  } catch (error) {
    console.error("Erro no perfil:", error)
    
    // Só desloga se for erro de Token inválido
    if (error.message === 'UNAUTHORIZED') {
      localStorage.removeItem('jwt')
      router.push('/login')
    }
    // Se for outro erro (Network error), mantemos o usuário na tela para tentar de novo
  } finally {
    loading.value = false
  }
})

// --- Funções de Ação ---

function ativarEdicao() {
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
    const res = await fetch(`${API_URL}/users/${usuario.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form.value),
    })

    if (!res.ok) throw new Error('Erro ao atualizar')

    // Atualiza visualmente
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
    // 1. Enviar a imagem para o Strapi (Upload)
    // IMPORTANTE: Não defina Content-Type aqui, o navegador faz sozinho para FormData
    const formData = new FormData()
    formData.append('files', arquivo)

    const resUpload = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!resUpload.ok) throw new Error('Falha no upload da imagem')

    const result = await resUpload.json()
    const fotoId = result[0].id
    
    // Monta a nova URL imediatamente para feedback visual
    const novaUrlRelativa = result[0].url
    const novaUrlCompleta = novaUrlRelativa.startsWith('http') 
      ? novaUrlRelativa 
      : `${STRAPI_URL}${novaUrlRelativa}`

    // 2. Vincular a imagem ao Usuário
    const resUser = await fetch(`${API_URL}/users/${usuario.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ foto_perfil: fotoId }),
    })

    if (!resUser.ok) throw new Error('Falha ao vincular imagem ao perfil')

    usuario.value.fotoUrl = novaUrlCompleta
    alert('Foto de perfil atualizada!')

  } catch (err) {
    console.error('Erro no upload:', err)
    alert('Erro ao atualizar a foto. Verifique o tamanho do arquivo.')
  } finally {
    uploadingPhoto.value = false
  }
}

function handleSair() {
  localStorage.removeItem('jwt')
  authState.logout()
  router.push('/login')
}

function navegarPara(rota) {
  router.push(rota)
}
</script>

<template>
  <main>
    <div v-if="loading" style="margin-top: 50px;">Carregando perfil...</div>

    <div v-else class="perfil-container">
      <div class="esquerda">
        <h2>Seu Perfil:</h2>
        
        <div style="position: relative; display: inline-block;">
          <img 
            id="perfil-foto" 
            :src="usuario.fotoUrl" 
            class="foto-perfil" 
            :style="{ opacity: uploadingPhoto ? 0.5 : 1 }"
            alt="Foto de perfil"
          />
          <label for="upload-foto" class="edita-foto" title="Alterar foto">&#9998;</label>
          <input 
            type="file" 
            id="upload-foto" 
            style="display: none" 
            accept="image/*" 
            @change="handleFotoUpload"
          />
          <span v-if="uploadingPhoto" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: #e91e63;">...</span>
        </div>

        <div id="dados-container">
          <div v-if="!isEditing" id="view-mode">
            <p><strong>Nome:</strong> <span id="perfil-nome">{{ usuario.nome }} {{ usuario.sobrenome }}</span></p>
            <p><strong>Email:</strong> <span id="perfil-email">{{ usuario.email }}</span></p>
            <p><strong>Telefone:</strong> <span id="perfil-telefone">{{ usuario.telefone }}</span></p>
            
            <button @click="ativarEdicao" id="botao-editar" class="botao-menu" style="margin-top: 20px; justify-content: center;">
              Editar Dados
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
              <button @click="salvarEdicao" id="botao-salvar" class="botao-confirmar" style="background-color: #4caf50; color: white; border: none; border-radius: 5px;">Salvar</button>
              <button @click="cancelarEdicao" id="botao-cancelar" class="botao-sair" style="background-color: #888; color: white; border: none; border-radius: 5px;">Cancelar</button>
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