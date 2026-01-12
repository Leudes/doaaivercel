<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL, STRAPI_URL } from '@/services/api'

const router = useRouter()


// Estado
const doacoes = ref([])
const loading = ref(true)
const isInstituicao = ref(false)
const tituloPagina = ref('Veja aqui as suas últimas doações')
const nomeColunaDestino = ref('Organização')

// --- Funções Auxiliares ---

function formatarData(dataString) {
  if (!dataString) return '--/--/----'
  return new Date(dataString).toLocaleDateString('pt-BR')
}

function getFotoUrl(item) {
  const url = item.attributes.foto?.data?.attributes?.url
  return url ? `${STRAPI_URL}${url}` : 'https://via.placeholder.com/60'
}

function getNomeCategoria(item) {
  return item.attributes.categoria?.data?.attributes?.nome || 'N/A'
}

function getStatus(status) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pendente'
}

// Retorna o nome da Instituição (se eu sou doador) ou do Doador (se eu sou instituição)
function getNomeOutroLado(item) {
  if (isInstituicao.value) {
    // Sou instituição, quero ver o nome do Doador
    const doador = item.attributes.users_permissions_user?.data?.attributes
    return doador?.nome || doador?.username || 'Doador não informado'
  } else {
    // Sou doador, quero ver o nome da Instituição
    const inst = item.attributes.instituicao?.data?.attributes
    // No Strapi, a instituição geralmente tem um user vinculado ou um campo nome direto
    // Adaptando para sua estrutura onde a instituição tem relação com user:
    return inst?.users_permissions_user?.data?.attributes?.nome || inst?.nome || 'Instituição não informada'
  }
}

// --- Inicialização ---

onMounted(async () => {
  const token = localStorage.getItem('jwt')

  if (!token) {
    alert('Você precisa estar logado para ver suas doações.')
    router.push('/login')
    return
  }

  try {
    // 1. Identificar quem é o usuário
    const resUser = await fetch(`${API_URL}/users/me?populate=instituicao`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (!resUser.ok) throw new Error('Sessão inválida')
    
    const user = await resUser.json()
    isInstituicao.value = !!user.instituicao

    // 2. Ajustar textos da interface
    if (isInstituicao.value) {
      tituloPagina.value = 'Doações recebidas pela sua instituição'
      nomeColunaDestino.value = 'Doador'
    }

    // 3. Montar a Query correta para o Strapi
    // Populate traz: foto, dados do doador, dados da instituição e categoria
    let url = `${API_URL}/solicitacaos?populate=foto,users_permissions_user,instituicao.users_permissions_user,categoria`
    
    if (isInstituicao.value) {
      // Filtra onde a instituição é a minha
      url += `&filters[instituicao][id][$eq]=${user.instituicao.id}`
    } else {
      // Filtra onde o criador (doador) sou eu
      url += `&filters[users_permissions_user][id][$eq]=${user.id}`
    }

    // 4. Buscar Doações
    const resDoacoes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const dataDoacoes = await resDoacoes.json()
    doacoes.value = dataDoacoes.data || []

  } catch (error) {
    console.error('Erro ao carregar doações:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main>
    <h1>{{ tituloPagina }}</h1>

    <div class="tabela-container">
      <table class="tabela-doacoes">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Item</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>{{ nomeColunaDestino }}</th> <th>Status</th>
          </tr>
        </thead>
        <tbody>
          
          <tr v-if="loading">
            <td colspan="6">Carregando histórico...</td>
          </tr>

          <tr v-else-if="doacoes.length === 0">
            <td colspan="6">Nenhuma doação registrada até o momento.</td>
          </tr>

          <tr v-else v-for="doacao in doacoes" :key="doacao.id">
            <td>
              <img 
                :src="getFotoUrl(doacao)" 
                alt="Foto do item" 
                style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" 
              />
            </td>
            <td>{{ doacao.attributes.titulo || 'Sem título' }}</td>
            <td>{{ getNomeCategoria(doacao) }}</td>
            <td>{{ formatarData(doacao.attributes.data_disponivel) }}</td>
            <td>{{ getNomeOutroLado(doacao) }}</td>
            <td class="status">{{ getStatus(doacao.attributes.status) }}</td>
          </tr>

        </tbody>
      </table>
    </div>
    
    <div style="margin-top: 20px;">
       <button @click="router.push('/perfil')" class="botao-sair" style="width: auto;">Voltar ao Perfil</button>
    </div>
  </main>
</template>