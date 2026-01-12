<script setup>
// Esta página é estática por natureza.
// Não é necessário buscar dados externos a menos que você queira gerenciar
// os textos "Missão/Visão" pelo painel administrativo.
</script>

<template>
  <main>
    <section>
      <h1>Sobre o DoaAí</h1>
      <p>
        O <strong>DoaAí</strong> é uma plataforma pensada para aproximar doadores de instituições
        que precisam de apoio. Nosso objetivo é facilitar o processo de doação e promover o bem,
        conectando quem quer ajudar com quem realmente precisa.
      </p>
      <p>
        Aqui, pessoas físicas podem doar itens que não usam mais, e instituições podem recebê-los
        com segurança, transparência e organização.
      </p>
      <p>Acreditamos que pequenas ações podem gerar grandes impactos — e cada doação conta!</p>
    </section>

    <section>
      <h2>Como funciona?</h2>
      <ul>
        <li>Usuários se cadastram e disponibilizam itens para doação.</li>
        <li>Instituições recebem e analisam as ofertas disponíveis.</li>
        <li>Campanhas e iniciativas podem ser organizadas dentro da própria plataforma.</li>
      </ul>
    </section>

    <section>
      <h2>Nossa missão</h2>
      <p>
        Criar uma rede solidária e eficiente para o reaproveitamento de recursos, incentivando a
        generosidade e fortalecendo o trabalho de instituições sociais.
      </p>
    </section>
  </main>
</template>

<style scoped>
/* Pequeno ajuste para garantir que as seções tenham respiro */
section {
  max-width: 800px;
  margin-bottom: 40px;
  text-align: left; /* Melhora a leitura de textos longos */
}

h1, h2 {
  color: var(--primary-color);
  margin-bottom: 15px;
}

ul {
  list-style-type: disc;
  margin-left: 20px;
  margin-bottom: 15px;
}

li {
  margin-bottom: 10px;
  font-size: 16px;
}
</style>