<script setup>
import { useRouter } from 'vue-router'
import { API_URL } from '@/services/api'

const router = useRouter()

async function handleDoar() {
  const token = localStorage.getItem('jwt')
  
  if (!token) {
    router.push('/login')
    return
  }

  // Verificação rápida se é instituição (opcional repetir a chamada ou confiar no localStorage se você salvar o tipo lá)
  try {
    const res = await fetch(`${API_URL}/users/me?populate=instituicao`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const user = await res.json()
    
    if (user.instituicao) {
      alert('Instituições não podem realizar doações.')
    } else {
      router.push('/quero-doar')
    }
  } catch (error) {
    console.error('Erro ao validar usuário', error)
    router.push('/login')
  }
}
</script>

<template>
  <main>
    <h1>Compartilhar é um ato de amor. Doe, transforme vidas!</h1>
    
    <button @click="handleDoar" type="button">Quero Doar</button>
    
    <h2>O que você dá pode não mudar o mundo, mas pode mudar o mundo de alguém.</h2>

    <div class="container-cards">
      <div>
        <img src="@/assets/img/home/mao_heart.PNG" alt="mao-heart" />
        <h3>Quando você doa</h3>
        <p>Sua generosidade é o início de uma corrente de transformação</p>
      </div>

      <div>
        <img src="@/assets/img/home/received.PNG" alt="pessoa recebendo" />
        <h3>Quem precisa recebe</h3>
        <p>Sua doação é o abração que alguém esperava</p>
      </div>

      <div>
        <img src="@/assets/img/home/happy.PNG" alt="rosto feliz" />
        <h3>Todos saem felizes</h3>
        <p>A felicidade compartilhada é o maior presente de todos</p>
      </div>
    </div>

    <button @click="handleDoar" type="button">Quero Doar</button>

    <div id="quadrado-cringe">
      <h1>FAQ</h1>

      <h2>Como posso doar?</h2>
      <p>
        Basta clicar no botão "Quero doar" e você poderá fornecer todas as informações sobre sua doação.
      </p>

      <h2>As doações são seguras?</h2>
      <p>
        Sim! Trabalhamos com ONGs e instituições verificadas, e todas as transações são protegidas
        com criptografia para garantir sua segurança e privacidade.
      </p>

      <h2>Onde as doações são entregues?</h2>
      <p>
        Você pode encontrar o local dos itens nas especificações ou receber informações do próprio
        doador quando o endereço não é público.
      </p>

      <h2>Como saber sobre novas campanhas?</h2>
      <p>
        Por enquanto, as campanhas são publicadas apenas no site. Visite com frequência para não
        perder nenhuma novidade.
      </p>
    </div>
  </main>
</template>