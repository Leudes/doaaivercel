<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = 'http://localhost:1337/api'

// Listas de Solicitações por Status
const pendentes = ref([])
const aceitas = ref([])
const realizadas = ref([])
const recusadas = ref([])

// Estado da Instituição
const instituicaoId = ref(null)
const loading = ref(true)

// --- Funções Auxiliares ---

function getFotoUrl(item) {
  const url = item.attributes.foto?.data?.attributes?.url
  return url ? `http://localhost:1337${url}` : 'https://via.placeholder.com/100'
}

function formatarData(dataString) {
  if (!dataString) return '--/--/----'
  return new Date(dataString).toLocaleDateString('pt-BR')
}

// --- Carregamento de Dados ---

async function fetchPorStatus(status) {
  const token = localStorage.getItem('jwt')
  try {
    // Busca filtrando por Instituição E Status
    const res = await fetch(
      `${API_URL}/solicitacaos?filters[instituicao][id][$eq]=${instituicaoId.value}&filters[status][$eq]=${status}&populate=foto,users_permissions_user,categoria`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const { data } = await res.json()
    return data || []
  } catch (error) {
    console.error(`Erro ao carregar status ${status}:`, error)
    return []
  }
}

async function carregarPainel() {
  loading.value = true
  
  // Executa as 4 requisições em paralelo para ser mais rápido
  const [dataPend, dataAceitas, dataRealizadas, dataRecusadas] = await Promise.all([
    fetchPorStatus('pendente'),
    fetchPorStatus('aceito'),
    fetchPorStatus('doado'),
    fetchPorStatus('recusado')
  ])

  pendentes.value = dataPend
  aceitas.value = dataAceitas
  realizadas.value = dataRealizadas
  recusadas.value = dataRecusadas
  
  loading.value = false
}

// --- Ações (Aceitar, Recusar, Confirmar) ---

async function atualizarStatus(idSolicitacao, novoStatus) {
  const token = localStorage.getItem('jwt')
  if (!confirm('Tem certeza que deseja alterar o status desta doação?')) return

  try {
    const res = await fetch(`${API_URL}/solicitacaos/${idSolicitacao}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ data: { status: novoStatus } }),
    })

    if (!res.ok) throw new Error('Falha ao atualizar')

    // Recarrega o painel para mover o card de coluna
    await carregarPainel()
    alert('Status atualizado com sucesso!')

  } catch (error) {
    console.error(error)
    alert('Erro ao atualizar solicitação.')
  }
}

// --- Inicialização ---

onMounted(async () => {
  const token = localStorage.getItem('jwt')
  
  if (!token) {
    alert('Faça login como instituição para acessar.')
    router.push('/login')
    return
  }

  try {
    // Verifica usuário e pega ID da instituição
    const userRes = await fetch(`${API_URL}/users/me?populate=instituicao`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const userData = await userRes.json()
    
    // Se não tiver instituição vinculada, chuta para o perfil comum
    if (!userData.instituicao) {
      alert('Esta área é restrita para Instituições.')
      router.push('/perfil')
      return
    }

    instituicaoId.value = userData.instituicao.id
    
    // Carrega os cards
    await carregarPainel()

  } catch (err) {
    console.error('Erro de autenticação:', err)
    router.push('/login')
  }
})
</script>

<template>
  <main>
    <h1>Painel da Instituição</h1>

    <div v-if="loading" style="text-align: center; margin-top: 20px;">
        <p>Carregando solicitações...</p>
    </div>

    <div v-else class="painel-grid">
      
      <div class="painel-coluna">
        <h2>Pendentes</h2>
        <div v-if="pendentes.length === 0"><p>Nenhuma solicitação pendente.</p></div>
        
        <div v-for="item in pendentes" :key="item.id" class="solicitacao-card">
          <img :src="getFotoUrl(item)" alt="Foto do item" />
          <div>
            <h3>{{ item.attributes.titulo }}</h3>
            <p><strong>Doador:</strong> {{ item.attributes.users_permissions_user?.data?.attributes?.nome || 'Anônimo' }}</p>
            <p><strong>Disponível:</strong> {{ formatarData(item.attributes.data_disponivel) }}</p>
            <p>{{ item.attributes.descricao }}</p>
            
            <div class="solicitacao-actions">
              <button @click="atualizarStatus(item.id, 'aceito')">Aceitar</button>
              <button 
                @click="atualizarStatus(item.id, 'recusado')" 
                style="background-color: #888;"
              >
                Recusar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="painel-coluna">
        <h2>Aceitas</h2>
        <div v-if="aceitas.length === 0"><p>Nenhuma doação aguardando entrega.</p></div>

        <div v-for="item in aceitas" :key="item.id" class="solicitacao-card">
          <img :src="getFotoUrl(item)" alt="Foto do item" />
          <div>
            <h3>{{ item.attributes.titulo }}</h3>
            <p><strong>Doador:</strong> {{ item.attributes.users_permissions_user?.data?.attributes?.nome }}</p>
            <p><strong>Contato:</strong> {{ item.attributes.users_permissions_user?.data?.attributes?.telefone || 'Sem telefone' }}</p>
            
            <div class="solicitacao-actions">
              <button 
                class="botao-confirmar" 
                @click="atualizarStatus(item.id, 'doado')"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="painel-coluna">
        <h2>Realizadas</h2>
        <div v-if="realizadas.length === 0"><p>Nenhuma doação finalizada ainda.</p></div>

        <div v-for="item in realizadas" :key="item.id" class="solicitacao-card">
          <img :src="getFotoUrl(item)" alt="Foto do item" />
          <div>
            <h3>{{ item.attributes.titulo }}</h3>
            <p><strong>Doador:</strong> {{ item.attributes.users_permissions_user?.data?.attributes?.nome }}</p>
            <p style="color: green; font-weight: bold;">Concluído</p>
          </div>
        </div>
      </div>

      <div class="painel-coluna">
        <h2>Recusadas</h2>
        <div v-if="recusadas.length === 0"><p>Nenhuma solicitação recusada.</p></div>

        <div v-for="item in recusadas" :key="item.id" class="solicitacao-card">
          <img :src="getFotoUrl(item)" alt="Foto do item" style="filter: grayscale(100%);" />
          <div>
            <h3>{{ item.attributes.titulo }}</h3>
            <p><strong>Doador:</strong> {{ item.attributes.users_permissions_user?.data?.attributes?.nome }}</p>
            <p style="color: red;">Recusado</p>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>