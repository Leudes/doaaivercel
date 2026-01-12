module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  
  // Alteração aqui: Configuração do CORS
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: ['http://localhost:5173', 'http://localhost:1337', 'https://doaaivercel.vercel.app'], // Adicione as URLs do seu front e back
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    },
  },

  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];