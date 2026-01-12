<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { API_URL, STRAPI_URL} from '@/services/api'

const campanhas = ref([])
const loading = ref(true)
const error = ref(null)



async function fetchCampanhas() {
  loading.value = true
  try {
    // Busca campanhas e popula a foto
    const res = await fetch(`${API_URL}/campanhas?populate=foto`)
    
    if (!res.ok) throw new Error('Erro ao carregar campanhas')
    
    const { data } = await res.json()
    
    // Transforma os dados do Strapi para o formato que usamos no template
    campanhas.value = data.map(item => {
      const attrs = item.attributes
      const fotoUrl = attrs.foto?.data?.attributes?.url 
        ? `${STRAPI_URL}${attrs.foto.data.attributes.url}`
        : 'https://via.placeholder.com/100' // Imagem padrão se não houver foto

      return {
        id: item.id,
        titulo: attrs.titulo || 'Campanha sem título',
        local: attrs.local_arrecadacao || 'Local não informado',
        // Formata a data para ficar bonitinha (opcional, pode vir formatada do back também)
        periodo: `${formatarData(attrs.data_inicio)} – ${formatarData(attrs.data_fim)}`,
        imagem: fotoUrl,
        // Cria o objeto de rota para passar o ID correto
        rota: { name: 'campanha-detalhes', params: { id: item.id } }
      }
    })

  } catch (err) {
    console.error('Erro:', err)
    error.value = 'Não foi possível carregar as campanhas no momento.'
  } finally {
    loading.value = false
  }
}

// Função auxiliar simples para formatar data (YYYY-MM-DD -> DD/MM/YYYY)
function formatarData(dataString) {
  if (!dataString) return '...'
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

onMounted(() => {
  fetchCampanhas()
})
</script>

<template>
  <main>
    <h1>Campanhas</h1>

    <div v-if="loading" style="margin-top: 20px;">
      <p>Carregando campanhas...</p>
    </div>

    <div v-else-if="error" style="margin-top: 20px; color: red;">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="campanhas.length === 0" style="margin-top: 20px;">
      <p>Nenhuma campanha ativa encontrada.</p>
    </div>

    <div 
      v-else
      v-for="campanha in campanhas" 
      :key="campanha.id" 
      class="campanha-card"
    >
      <RouterLink :to="campanha.rota">
        <img :src="campanha.imagem" :alt="campanha.titulo" />
      </RouterLink>

      <div class="campanha-info">
        <RouterLink :to="campanha.rota">
          <h2>{{ campanha.titulo }}</h2>
        </RouterLink>

        <p>Local de arrecadação: {{ campanha.local }}</p>
        <p>Data: {{ campanha.periodo }}</p>
      </div>
    </div>
  </main>
</template>