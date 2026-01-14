<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router' // 1. Importar o roteador
import { API_URL, STRAPI_URL } from '@/services/api'

const router = useRouter() // 2. Instanciar o roteador

const itens = ref([])
const categorias = ref([])
const selectedCategory = ref('all')
const loading = ref(false)

// --- Função de Navegação ---
function verDetalhes(id) {
  // Navega para a rota configurada anteriormente (/itens/:id)
  router.push(`/itens/${id}`)
}

// --- Funções Auxiliares ---
function getFotoUrl(item) {
  const url = item.attributes.foto?.data?.attributes?.url
  // Verifica se é link externo (Cloudinary) ou local (precisa do STRAPI_URL)
  if (url) {
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`
  }
  return 'https://via.placeholder.com/300'
}

function getNomeDoador(item) {
  const doador = item.attributes.users_permissions_user?.data?.attributes
  return doador?.nome || doador?.username || 'Anônimo'
}

function getNomeInstituicao(item) {
  const instUser = item.attributes.instituicao?.data?.attributes?.users_permissions_user?.data?.attributes
  return instUser?.nome || 'Não informada'
}

function getContatoInstituicao(item) {
  const instUser = item.attributes.instituicao?.data?.attributes?.users_permissions_user?.data?.attributes
  return instUser?.telefone || instUser?.email || 'Não informado'
}

function getNomeCategoria(item) {
  return item.attributes.categoria?.data?.attributes?.nome || 'Não informada'
}

// --- Lógica de Busca ---
async function fetchCategorias() {
  try {
    const res = await fetch(`${API_URL}/categorias`)
    const { data } = await res.json()
    categorias.value = data
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
}

async function fetchItens() {
  loading.value = true
  itens.value = [] 

  let url = `${API_URL}/solicitacaos?filters[status][$eq]=aceito&populate=foto,users_permissions_user,instituicao.users_permissions_user,categoria`

  if (selectedCategory.value !== 'all') {
    url += `&filters[categoria][id][$eq]=${selectedCategory.value}`
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Erro na API')
    const { data } = await response.json()
    itens.value = data
  } catch (error) {
    console.error('Erro ao buscar itens:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategorias()
  fetchItens()
})
</script>

<template>
  <main>
    <div class="page-header-controls">
      <h1>Itens Disponíveis para Doação</h1>
      
      <div class="form-group" style="max-width: 300px; text-align: left;">
        <label for="filtro-categoria" style="font-weight: bold; font-size: 16px;">
          Filtrar por Categoria:
        </label>
        <select 
          id="filtro-categoria" 
          class="form-select" 
          v-model="selectedCategory" 
          @change="fetchItens"
        >
          <option value="all">Todas as Categorias</option>
          <option 
            v-for="cat in categorias" 
            :key="cat.id" 
            :value="cat.id"
          >
            {{ cat.attributes.nome }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" style="margin: 40px;">
      <p>Carregando itens...</p>
    </div>

    <div v-else-if="itens.length === 0" style="margin: 40px;">
      <p>Nenhum item encontrado para esta categoria.</p>
    </div>

    <div v-else class="itens-grid-container" id="itens-grid-container">
      <div 
        v-for="item in itens" 
        :key="item.id" 
        class="item-card clickable-card"
        @click="verDetalhes(item.id)"
        title="Clique para ver detalhes"
      >
        <div class="item-image-wrapper">
          <img :src="getFotoUrl(item)" :alt="item.attributes.titulo || 'Item'" />
          <div class="item-description-overlay">
            <p>Clique para ver detalhes</p>
          </div>
        </div>
        
        <div class="item-card-info">
          <h3>{{ item.attributes.titulo || 'Item sem título' }}</h3>
          <p><strong>Categoria:</strong> {{ getNomeCategoria(item) }}</p>
          <p><strong>Instituição:</strong> {{ getNomeInstituicao(item) }}</p>
          <p><strong>Doador:</strong> {{ getNomeDoador(item) }}</p>
          <p><strong>Contato para Entrega:</strong> {{ getContatoInstituicao(item) }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Adicione isso para melhorar a experiência do usuário */
.clickable-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-card:hover {
  transform: translateY(-5px); /* Efeito de "levantar" o card */
  box-shadow: 0 10px 20px rgba(0,0,0,0.15); /* Sombra mais forte */
}

.clickable-card:active {
  transform: scale(0.98); /* Efeito de clique */
}
</style>