<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { API_URL, STRAPI_URL } from '@/services/api'

const route = useRoute()

// Estados da tela
const loading = ref(true)
const erro = ref(null)
const item = ref({
  nome: '',
  descricao: '',
  fotoUrl: '/img/itens/placeholder.png', // Imagem padrão
  doador: {
    nome: 'Anônimo',
    contato: 'Não informado'
  }
})

onMounted(async () => {
  try {
    // 1. Pega o ID da URL (ex: /itens/5 -> id = 5)
    const id = route.params.id
    if (!id) throw new Error('ID do item não encontrado.')

    // 2. Monta a query string do Strapi (igual ao seu HTML original)
    // Isso busca a foto e os dados do usuário dono do item
    const query = `populate[foto][fields]=url&populate[user][fields]=nome,sobrenome,telefone,email,username`
    
    const res = await fetch(`${API_URL}/solicitacaos/${id}?${query}`)
    
    if (!res.ok) throw new Error('Item não encontrado ou indisponível.')
    
    const json = await res.json()
    const dados = json.data.attributes

    // 3. Processa a imagem (Local vs Nuvem)
    let urlImagem = '/img/itens/placeholder.png'
    if (dados.foto && dados.foto.data) {
      const urlVindaDoBanco = dados.foto.data.attributes.url
      // Se a URL já começar com http (ex: Cloudinary), usa ela. Se não, adiciona o dominio do Strapi.
      urlImagem = urlVindaDoBanco.startsWith('http') 
        ? urlVindaDoBanco 
        : `${STRAPI_URL}${urlVindaDoBanco}`
    }

    // 4. Processa o Doador
    let nomeDoador = 'Anônimo'
    let contatoDoador = 'Não informado'
    
    if (dados.user && dados.user.data) {
      const userAttrs = dados.user.data.attributes
      nomeDoador = userAttrs.nome ? `${userAttrs.nome} ${userAttrs.sobrenome || ''}` : userAttrs.username
      contatoDoador = userAttrs.telefone || userAttrs.email
    }

    // 5. Atualiza o estado
    item.value = {
      nome: dados.nome,
      descricao: dados.descricao,
      fotoUrl: urlImagem,
      doador: {
        nome: nomeDoador,
        contato: contatoDoador
      }
    }

  } catch (error) {
    console.error(error)
    erro.value = 'Não foi possível carregar os detalhes deste item.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="detalhes-container">
    
    <div v-if="loading" class="loading-box">
      <p>Carregando detalhes do item...</p>
    </div>

    <div v-else-if="erro" class="error-box">
      <p>{{ erro }}</p>
      <RouterLink to="/itens"><button>Voltar para a lista</button></RouterLink>
    </div>

    <div v-else id="item-box" class="card-detalhe">
      <img :src="item.fotoUrl" :alt="item.nome" class="item-foto">
      
      <h1>{{ item.nome }}</h1>
      <p class="descricao">{{ item.descricao }}</p>
      
      <hr>
      
      <div class="info-doador">
        <h3>Informações do Doador</h3>
        <p><strong>Nome:</strong> {{ item.doador.nome }}</p>
        <p><strong>Contato:</strong> {{ item.doador.contato }}</p>
      </div>
    </div>

    <div v-if="!loading" class="actions">
      <RouterLink to="/itens">
        <button class="btn-voltar">Voltar para a lista</button>
      </RouterLink>
      </div>

  </main>
</template>

<style scoped>
.detalhes-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.card-detalhe {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.item-foto {
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px;
  object-fit: cover;
  margin-bottom: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.descricao {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}

hr {
  border: 0;
  border-top: 1px solid #eee;
  margin: 20px 0;
}

.info-doador {
  text-align: left;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.btn-voltar {
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-voltar:hover {
  background-color: #5a6268;
}
</style>