<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const campanha = ref(null)

// URL da API (ajuste conforme seu Strapi)
const API_URL = 'http://localhost:1337/api'

async function fetchCampanhaDetalhes() {
  const id = route.params.id // Pega o ID da URL (ex: /campanha/1)
  
  try {
    // Tenta buscar do Strapi
    // O populate='*' traz a imagem e outros campos relacionados
    const res = await fetch(`${API_URL}/campanhas/${id}?populate=*`)
    
    if (!res.ok) throw new Error('Falha na API')
    
    const { data } = await res.json()
    
    // Formata os dados vindos do Strapi
    campanha.value = {
      titulo: data.attributes.titulo,
      descricao: data.attributes.descricao,
      local: data.attributes.local_arrecadacao || 'Local não informado',
      periodo: `${data.attributes.data_inicio} – ${data.attributes.data_fim}`,
      imagem: data.attributes.foto?.data?.attributes?.url 
        ? `http://localhost:1337${data.attributes.foto.data.attributes.url}`
        : 'https://via.placeholder.com/800x400'
    }

  } catch (error) {
    console.warn('API não disponível ou erro ao buscar. Usando dados estáticos de exemplo (Projeto Mãe).')
    
    // --- DADOS DE EXEMPLO (PROJETO MÃE) ---
    // Isso garante que sua página funcione visualmente enquanto o Strapi não conecta
    campanha.value = {
      titulo: 'Projeto Mãe',
      descricao: 'O Projeto Mãe é uma iniciativa voltada para a arrecadação de itens essenciais para mães em situação de vulnerabilidade. A campanha busca mobilizar a comunidade para doar fraldas, roupas infantis, produtos de higiene e alimentos não perecíveis.',
      local: 'Casa do Cego Aderaldo - Rua Exemplo, 123 - Fortaleza, CE',
      periodo: '25/02/2025 – 25/07/2025',
      imagem: 'https://i.ibb.co/N6YF8fcw/maes.png'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCampanhaDetalhes()
})
</script>

<template>
  <main>
    <div v-if="loading">
      <p>Carregando campanha...</p>
    </div>

    <div v-else-if="campanha" class="campanha-detalhe-container">
      <h1>Campanha: {{ campanha.titulo }}</h1>
      
      <img 
        :src="campanha.imagem" 
        :alt="campanha.titulo" 
        class="campanha-destaque-img"
      />

      <section>
        <h2>Descrição da Campanha</h2>
        <p>{{ campanha.descricao }}</p>
      </section>

      <section>
        <h2>Local de Arrecadação</h2>
        <p>{{ campanha.local }}</p>
      </section>

      <section>
        <h2>Período</h2>
        <p>{{ campanha.periodo }}</p>
      </section>

      <section>
        <h2>Como posso ajudar?</h2>
        <p>
          Você pode doar clicando em “Itens” no menu e escolhendo o que deseja oferecer. Toda ajuda
          é bem-vinda e fará a diferença na vida de muitas famílias.
        </p>
      </section>
    </div>

    <div v-else>
      <p>Campanha não encontrada.</p>
    </div>
  </main>
</template>

<style scoped>
/* Estilo específico apenas para esta página, se necessário */
.campanha-detalhe-container {
  max-width: 800px;
  width: 100%;
}

.campanha-destaque-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

section {
  margin-bottom: 30px;
  text-align: left; /* Mantém o texto alinhado à esquerda para leitura melhor */
}

h2 {
  color: var(--primary-color); /* Usa a variável do seu CSS global */
  margin-bottom: 10px;
}
</style>